# apps/web — local development

This folder contains the web frontend and dev server.

Environment
- Copy `.env.example` -> `.env.local` and fill in secret values (do NOT commit `.env.local`).
- Required envs include: `GROQ_API_URL`, `GROQ_API_KEY`, `AUTH_SECRET`, `DATABASE_URL` (if using DB), and `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` for client wallet connections.

Start the dev server from the repo root:

1. cd apps/web
2. npm install
3. npm run dev

If you see auth-related errors, ensure `AUTH_SECRET` and `AUTH_URL` are set correctly in `.env.local`.
