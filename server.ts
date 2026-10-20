import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateChatReply, type ChatTurn } from './server/chatService.ts';

const app = express();
const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(projectRoot, 'dist', 'public');

app.use(express.json({ limit: '16kb' }));

app.post('/api/chat', async (req, res) => {
  const messages = req.body?.messages as ChatTurn[] | undefined;
  if (!Array.isArray(messages) || messages.length === 0 || messages.some((message) => typeof message.text !== 'string' || message.text.length > 2000)) {
    res.status(400).json({ error: 'Please send a valid message.' });
    return;
  }

  try {
    const reply = await generateChatReply(messages);
    res.json({ reply });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI chat request failed.';
    res.status(message.includes('not configured') ? 503 : 500).json({ error: message });
  }
});

app.use(express.static(distPath));
app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`AIR NEETwork server listening on ${port}`));
