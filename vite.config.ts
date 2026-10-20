import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import type { Plugin } from 'vite';
import { generateChatReply, type ChatTurn } from './server/chatService.ts';

const aiChatApi = (): Plugin => ({
  name: 'air-neetwork-ai-chat',
  configureServer(server) {
    server.middlewares.use('/api/chat', (req, res, next) => {
      if (req.method !== 'POST') return next();

      let body = '';
      req.on('data', (chunk: Buffer) => {
        body += chunk.toString();
        if (body.length > 16_000) {
          res.statusCode = 413;
          res.end(JSON.stringify({ error: 'Message is too long.' }));
          req.destroy();
        }
      });

      req.on('end', async () => {
        try {
          const parsed = JSON.parse(body) as { messages?: ChatTurn[] };
          if (!Array.isArray(parsed.messages) || parsed.messages.length === 0 || parsed.messages.some((message) => typeof message.text !== 'string' || message.text.length > 2000)) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Please send a valid message.' }));
            return;
          }

          const reply = await generateChatReply(parsed.messages);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ reply }));
        } catch (error) {
          const message = error instanceof Error ? error.message : 'AI chat request failed.';
          res.statusCode = message.includes('not configured') ? 503 : 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: message }));
        }
      });
    });
  },
});

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));
  return {
    base: process.env.BASE_PATH || '/',
    plugins: [react(), tailwindcss(), aiChatApi()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      port: Number(process.env.PORT || 3000),
      strictPort: true,
      host: '0.0.0.0',
      allowedHosts: true,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    preview: {
      port: Number(process.env.PORT || 3000),
      host: '0.0.0.0',
      allowedHosts: true,
    },
    build: {
      outDir: path.resolve(import.meta.dirname, 'dist/public'),
      emptyOutDir: true,
    },
  };
});
