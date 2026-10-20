# AI support chat setup

The support toolbar's AI chat sends messages to a server endpoint. Keep the Gemini API key on the server; do not expose it as a `VITE_` variable.

1. Add your Gemini API key to `.env.local`:

   ```env
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY
   ```

2. Restart the development server with `pnpm dev`.
3. For production, build the site with `pnpm build` and start the Express app with `pnpm start`. Set `GEMINI_API_KEY` in the production server environment.

If no key is configured, the chat panel reports that AI chat is unavailable.
