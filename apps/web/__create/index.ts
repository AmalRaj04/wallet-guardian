import { AsyncLocalStorage } from 'node:async_hooks';
import nodeConsole from 'node:console';
import { skipCSRFCheck } from '@auth/core';
import Credentials from '@auth/core/providers/credentials';
import { authHandler, initAuthConfig } from '@hono/auth-js';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { hash, verify } from 'argon2';
import { Hono } from 'hono';
import { contextStorage, getContext } from 'hono/context-storage';
import { cors } from 'hono/cors';
import { proxy } from 'hono/proxy';
import { requestId } from 'hono/request-id';
import { createHonoServer } from 'react-router-hono-server/node';
import { serializeError } from 'serialize-error';
import ws from 'ws';
import NeonAdapter from './adapter';
import { getHTMLForErrorPage } from './get-html-for-error-page';
import { isAuthAction } from './is-auth-action';
import { API_BASENAME, api } from './route-builder';
neonConfig.webSocketConstructor = ws;

const als = new AsyncLocalStorage<{ requestId: string }>();

for (const method of ['log', 'info', 'warn', 'error', 'debug'] as const) {
  const original = nodeConsole[method].bind(console);

  console[method] = (...args: unknown[]) => {
    const requestId = als.getStore()?.requestId;
    if (requestId) {
      original(`[traceId:${requestId}]`, ...args);
    } else {
      original(...args);
    }
  };
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = NeonAdapter(pool);

const app = new Hono();

app.use('*', requestId());

app.use('*', (c, next) => {
  const requestId = c.get('requestId');
  return als.run({ requestId }, () => next());
});

app.use(contextStorage());

app.onError((err, c) => {
  if (c.req.method !== 'GET') {
    return c.json(
      {
        error: 'An error occurred in your app',
        details: serializeError(err),
      },
      500
    );
  }
  return c.html(getHTMLForErrorPage(err), 200);
});

if (process.env.CORS_ORIGINS) {
  app.use(
    '/*',
    cors({
      origin: process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()),
    })
  );
}

// Debug middleware for auth routes — gated by AUTH_DEBUG to avoid noisy logs
// in normal development runs. Keep this before initAuthConfig so it can
// optionally inspect the request without consuming the body.
if (process.env.AUTH_DEBUG === 'true') {
  app.use('/api/auth/*', async (c, next) => {
    try {
      // Keep logs concise: single line per request with method/path and
      // whether cookies are present.
      const hasCookie = !!c.req.header('cookie');
      console.info('[AUTH DEBUG]', c.req.method, c.req.path, hasCookie ? 'cookie' : 'no-cookie');

      if (isAuthAction(c.req.path)) {
        return authHandler()(c, next);
      }
      return next();
    } catch (err) {
      console.error('[AUTH DEBUG] middleware error:', serializeError(err));
      return c.json({ error: 'auth debug error' }, 500);
    }
  });
}

if (process.env.AUTH_SECRET) {
  app.use(
    '*',
    initAuthConfig((c) => ({
      secret: c.env.AUTH_SECRET,
      pages: {
        signIn: '/account/signin',
        signOut: '/account/logout',
      },
      skipCSRFCheck,
      session: {
        strategy: 'jwt',
      },
      callbacks: {
        session({ session, token }) {
          if (token.sub) {
            session.user.id = token.sub;
          }
          return session;
        },
      },
      cookies: {
        csrfToken: {
          options: {
            secure: true,
            sameSite: 'none',
          },
        },
        sessionToken: {
          options: {
            secure: true,
            sameSite: 'none',
          },
        },
        callbackUrl: {
          options: {
            secure: true,
            sameSite: 'none',
          },
        },
      },
      providers: [
        Credentials({
          id: 'credentials-signin',
          name: 'Credentials Sign in',
          credentials: {
            email: {
              label: 'Email',
              type: 'email',
            },
            password: {
              label: 'Password',
              type: 'password',
            },
          },
          authorize: async (credentials) => {
            const { email, password } = credentials;
            if (!email || !password) {
              return null;
            }
            if (typeof email !== 'string' || typeof password !== 'string') {
              return null;
            }

            // logic to verify if user exists
            const user = await adapter.getUserByEmail(email);
            if (!user) {
              return null;
            }
            const matchingAccount = user.accounts.find(
              (account) => account.provider === 'credentials'
            );
            const accountPassword = matchingAccount?.password;
            if (!accountPassword) {
              return null;
            }

            const isValid = await verify(accountPassword, password);
            if (!isValid) {
              return null;
            }

            // return user object with the their profile data
            return user;
          },
        }),
        Credentials({
          id: 'credentials-signup',
          name: 'Credentials Sign up',
          credentials: {
            email: {
              label: 'Email',
              type: 'email',
            },
            password: {
              label: 'Password',
              type: 'password',
            },
          },
          authorize: async (credentials) => {
            const { email, password } = credentials;
            if (!email || !password) {
              return null;
            }
            if (typeof email !== 'string' || typeof password !== 'string') {
              return null;
            }

            // logic to verify if user exists
            const user = await adapter.getUserByEmail(email);
            if (!user) {
              const newUser = await adapter.createUser({
                id: crypto.randomUUID(),
                emailVerified: null,
                email,
              });
              await adapter.linkAccount({
                extraData: {
                  password: await hash(password),
                },
                type: 'credentials',
                userId: newUser.id,
                providerAccountId: newUser.id,
                provider: 'credentials',
              });
              return newUser;
            }
            return null;
          },
        }),
      ],
    }))
  );
}
app.all('/integrations/:path{.+}', async (c, next) => {
  const queryParams = c.req.query();
  const url = `${process.env.NEXT_PUBLIC_CREATE_BASE_URL ?? 'https://www.create.xyz'}/integrations/${c.req.param('path')}${Object.keys(queryParams).length > 0 ? `?${new URLSearchParams(queryParams).toString()}` : ''}`;

  return proxy(url, {
    method: c.req.method,
    body: c.req.raw.body ?? null,
    // @ts-ignore - this key is accepted even if types not aware and is
    // required for streaming integrations
    duplex: 'half',
    redirect: 'manual',
    headers: {
      ...c.req.header(),
      'X-Forwarded-For': process.env.NEXT_PUBLIC_CREATE_HOST,
      'x-createxyz-host': process.env.NEXT_PUBLIC_CREATE_HOST,
      Host: process.env.NEXT_PUBLIC_CREATE_HOST,
      'x-createxyz-project-group-id': process.env.NEXT_PUBLIC_PROJECT_GROUP_ID,
    },
  });
});

// Temporary explicit AI proxy endpoint to ensure /api/ai works during dev.
// This bypasses the dynamic route registration when the router doesn't pick up
// the TS route file.
app.post('/api/ai', async (c) => {
  const url = process.env.GROQ_API_URL;
  const key = process.env.GROQ_API_KEY;
  if (!url || !key) {
    console.error('[AI proxy] missing env GROQ_API_URL or GROQ_API_KEY');
    return c.json({ error: 'GROQ_API_URL or GROQ_API_KEY not configured on server' }, 500);
  }

  try {
    // Read the request body as text up-front so we can reuse it for a
    // fallback attempt if needed. Reusing a stream after it's been
    // consumed causes "body locked" errors from undici.
    const bodyStr = await c.req.text();
    const preview = bodyStr ? bodyStr.slice(0, 200) : '[no body]';
    console.info('[AI proxy] forwarding request to upstream', { url, previewLength: bodyStr ? String(bodyStr).length : 0 });
    // When forwarding a readable body through Node's undici-backed fetch,
    // RequestInit must include the `duplex` option (e.g. 'half'). Without it
    // undici throws: "RequestInit: duplex option is required when sending a body.".
    // Only set duplex when we actually have a body to forward.
    // Prepare the body we'll forward. The client sends an OpenAI-like
    // payload (e.g. { messages: [...], stream: true }). The GROQ
    // Responses endpoint expects an `input` field (string) and a
    // `model`. Convert if necessary and prefer forwarding to the
    // /responses path when appropriate.
    let forwardBody = bodyStr || null;
    let targetUrl = url;
    try {
      if (bodyStr) {
        const parsed = JSON.parse(bodyStr);
        // If client used `messages`, convert to `input` for GROQ
        if (Array.isArray(parsed.messages)) {
          const input = parsed.messages.map((m: any) => m.content).join('\n');
          const model = process.env.GROQ_MODEL || parsed.model || 'openai/gpt-oss-20b';
          const out: any = { input, model };
          if (parsed.stream !== undefined) out.stream = parsed.stream;
          // preserve top-level fields that GROQ may accept (like temperature)
          for (const k of ['temperature', 'top_p', 'max_tokens']) {
            if (parsed[k] !== undefined) out[k] = parsed[k];
          }
          forwardBody = JSON.stringify(out);
          // Prefer the /responses path for GROQ
          if (targetUrl.endsWith('/openai/v1')) {
            targetUrl = targetUrl.replace(/\/+$/, '') + '/responses';
          }
        }
      }
    } catch (err) {
      console.warn('[AI proxy] failed to parse/transform request body', err);
    }

    // `duplex` is required by undici when sending a body stream. Cast the
    // options to `any` to avoid TypeScript's RequestInit mismatch while
    // preserving the runtime behavior.
    const upstream = await fetch(targetUrl, ({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: forwardBody || null,
      // only set duplex when there's a body
      duplex: forwardBody ? 'half' : undefined,
    } as any));

    // Collect headers to return (skip hop-by-hop)
    const headers: Record<string, string> = {};
    upstream.headers.forEach((value, key) => {
      if (['transfer-encoding', 'connection', 'keep-alive', 'upgrade'].includes(key.toLowerCase())) return;
      headers[key] = value;
    });

    console.info('[AI proxy] upstream status=%d', upstream.status);

    if (!upstream.ok) {
      // Read upstream error body (may be small HTML or JSON) and surface it
      const upstreamText = await upstream.text();
      console.error('[AI proxy] upstream error body:', upstreamText.slice(0, 1000));

      // Heuristic fallback: if the configured GROQ URL points at
      // /openai/v1 (missing the /responses suffix), try the common
      // '/openai/v1/responses' path and return that if it succeeds.
      try {
        if (url.endsWith('/openai/v1') && upstreamText.includes('Unknown request URL')) {
          const fallbackUrl = url.replace(/\/+$/, '') + '/responses';
          console.info('[AI proxy] trying fallback GROQ URL', fallbackUrl);
          const fallback = await fetch(fallbackUrl, ({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${key}`,
            },
            body: bodyStr || null,
            duplex: bodyStr ? 'half' : undefined,
          } as any));

          if (fallback.ok) {
            const fheaders: Record<string, string> = {};
            fallback.headers.forEach((v, k) => {
              if (['transfer-encoding', 'connection', 'keep-alive', 'upgrade'].includes(k.toLowerCase())) return;
              fheaders[k] = v;
            });
            console.info('[AI proxy] fallback succeeded');
            return new Response(fallback.body, { status: fallback.status, headers: fheaders });
          }
          const fallbackText = await fallback.text();
          console.error('[AI proxy] fallback error body:', fallbackText.slice(0, 1000));
          return c.json({ error: 'AI upstream error (fallback attempted)', status: fallback.status, body: fallbackText }, 502);
        }
      } catch (err) {
        console.error('[AI proxy] fallback attempt failed:', serializeError(err));
      }

      return c.json(
        {
          error: 'AI upstream error',
          status: upstream.status,
          body: upstreamText,
        },
        502
      );
    }

    return new Response(upstream.body, { status: upstream.status, headers });
  } catch (err) {
    console.error('[AI proxy] error:', serializeError(err));
    return c.json({ error: 'AI proxy error', details: serializeError(err) }, 500);
  }
});

// Note: auth debug middleware is declared earlier (so it doesn't consume the
// body stream). This spot is intentionally left empty to avoid registering a
// second middleware that would interfere with @auth/core.
app.route(API_BASENAME, api);

export default await createHonoServer({
  app,
  defaultLogger: false,
});
