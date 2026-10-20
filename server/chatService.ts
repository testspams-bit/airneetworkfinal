import { GoogleGenAI } from '@google/genai';

export interface ChatTurn {
  role: 'user' | 'assistant';
  text: string;
}

export async function generateChatReply(messages: ChatTurn[]) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('AI chat is not configured. Add GEMINI_API_KEY to the server environment.');

  const conversation = messages
    .filter((message) => message.role === 'user' || message.role === 'assistant')
    .slice(-12)
    .map((message) => `${message.role === 'user' ? 'Visitor' : 'Assistant'}: ${message.text}`)
    .join('\n');

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `You are the AIR NEETwork support assistant. Help visitors with NEET mentorship, student support, and contacting the team. Be concise, friendly, and do not invent guarantees or admissions outcomes.\n\nConversation:\n${conversation}\nAssistant:`,
  });

  return response.text?.trim() || 'I could not prepare a reply. Please try again.';
}
