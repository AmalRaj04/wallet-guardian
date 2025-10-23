import { NextResponse } from 'next/server';
import { getServerConfig } from '@/lib/config';

// Proxy POST to the GROQ API and stream the response back to the client.
export async function POST(req: Request) {
  try {
    // Read request body once so it can be reused safely for fallback
    // attempts without re-consuming a locked stream.
    const bodyStr = await req.text();

    const cfg = getServerConfig();

    // Transform OpenAI-style payloads (messages array) into GROQ
    // Responses payload (input + model) and prefer /responses endpoint.
    let forwardBody = bodyStr || null;
    let targetUrl = cfg.GROQ_API_URL;
    try {
      if (bodyStr) {
        const parsed = JSON.parse(bodyStr);
        if (Array.isArray(parsed.messages)) {
          const input = parsed.messages.map((m: any) => m.content).join('\n');
          const model = process.env.GROQ_MODEL || parsed.model || 'openai/gpt-oss-20b';
          const out: any = { input, model };
          if (parsed.stream !== undefined) out.stream = parsed.stream;
          for (const k of ['temperature', 'top_p', 'max_tokens']) {
            if (parsed[k] !== undefined) out[k] = parsed[k];
          }
          forwardBody = JSON.stringify(out);
          if (targetUrl.endsWith('/openai/v1')) {
            targetUrl = targetUrl.replace(/\/+$/, '') + '/responses';
          }
        }
      }
    } catch (err) {
      // if parsing fails, just send original bodyStr and let upstream handle it
    }

    // When sending a body through Node's undici-backed fetch, `duplex` is
    // required. Cast the options to `any` to avoid TypeScript complaining
    // about the non-standard property while preserving runtime behavior.
    const upstream = await fetch(targetUrl, ({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.GROQ_API_KEY}`,
      },
      body: forwardBody || null,
      duplex: forwardBody ? 'half' : undefined,
    } as any));

    // Stream the upstream response body and headers through to the client.
    const headers: Record<string, string> = {};
    upstream.headers.forEach((value, key) => {
      // Skip hop-by-hop headers
      if (['transfer-encoding', 'connection', 'keep-alive', 'upgrade'].includes(key.toLowerCase())) return;
      headers[key] = value;
    });

    if (!upstream.ok) {
      const upstreamText = await upstream.text();

      // Heuristic fallback: some GROQ docs expect the path to be
      // '/openai/v1/responses' — if our configured URL ends with
      // '/openai/v1' and upstream reports unknown URL, try the
      // '/responses' suffix and return that result if successful.
      try {
        if (cfg.GROQ_API_URL.endsWith('/openai/v1') && upstreamText.includes('Unknown request URL')) {
          const fallbackUrl = cfg.GROQ_API_URL.replace(/\/+$/, '') + '/responses';
          const fallback = await fetch(fallbackUrl, ({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${cfg.GROQ_API_KEY}`,
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
            return new Response(fallback.body, { status: fallback.status, headers: fheaders });
          }

          const fallbackText = await fallback.text();
          return NextResponse.json({ error: 'AI upstream error (fallback attempted)', status: fallback.status, body: fallbackText }, { status: 502 });
        }
      } catch (err) {
        // ignore fallback errors and return original upstream text
      }

      return NextResponse.json({ error: 'AI upstream error', status: upstream.status, body: upstreamText }, { status: 502 });
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (err) {
    const message = (err as Error)?.message ?? 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
