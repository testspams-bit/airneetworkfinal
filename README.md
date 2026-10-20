# AIR NEETwork

A NEET mentorship website built with React, TypeScript, Vite, Tailwind CSS, and Express.

## Features

- Student and mentor sign-in with Supabase Auth. Phone OTP is the default; email/password and Google sign-in can also be enabled.
- NEET timer, diagnostic calculator, mentor information, booking, and contact flows.
- Optional Gemini-powered support chat through the server-side `/api/chat` endpoint.

## Getting started

Requirements: Node.js and npm.

```bash
git clone https://github.com/testspams-bit/air.neetorifinal.git
cd air.neetorifinal
npm install
cp .env.example .env.local
```

Add the values for the services you plan to use to `.env.local`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

- Supabase variables enable authentication. Use a publishable/anon key, never a service-role key in the browser.
- `GEMINI_API_KEY` enables the support chat. Keep it server-side and do not rename it with a `VITE_` prefix. The chat is unavailable without it.
- Supabase providers and redirect URLs need to be configured in the Supabase dashboard; see [Supabase authentication setup](resources/SUPABASE_AUTH_SETUP.md).
- For Gemini setup and deployment notes, see [AI chat setup](resources/AI_CHAT_SETUP.md).

The app’s `.gitignore` excludes `.env.local` and other `.env*` files except `.env.example`. The template also lists `APP_URL` for hosting environments; the current app code does not read it directly.

## Run locally

```bash
npm run dev
```

Vite serves the development app at `http://localhost:3000`. Its development middleware also handles `/api/chat`.

## Build and run in production

Set the `VITE_SUPABASE_*` values before building. Provide `GEMINI_API_KEY` in the server environment if you want the AI support chat.

```bash
npm run build
npm run start
```

The Express server serves the built app from `dist/public` and listens on `PORT` (default `3000`).

## Checks

```bash
npm run lint
```

This runs TypeScript’s no-emit check.

## Authentication note

The selected Student/Mentor role is stored in Supabase user metadata. Treat it as a user selection, not an authorization boundary; enforce mentor privileges with server-side policies before exposing protected data or tools.
