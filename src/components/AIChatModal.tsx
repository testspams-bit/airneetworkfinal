import { FormEvent, useRef, useEffect, useState } from 'react';
import { Bot, LoaderCircle, Send, X } from 'lucide-react';

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
}

type ChatMessage = { role: 'user' | 'assistant'; text: string };

export const AIChatModal = ({ isOpen, onClose, theme }: AIChatModalProps) => {
  const isDark = theme === 'dark';
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', text: 'Hi! How can I help with NEET mentorship?' },
  ]);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || isSending) return;

    const conversation = [...messages, { role: 'user' as const, text }];
    setMessages(conversation);
    setDraft('');
    setError('');
    setIsSending(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversation.slice(-12) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'The AI assistant is unavailable.');
      setMessages((current) => [...current, { role: 'assistant', text: result.reply }]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not send your message.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-end bg-black/30 p-4 sm:items-end sm:bg-transparent"
      onClick={onClose}
    >
      <section
        aria-label="Chat with AI"
        className={`flex h-[min(34rem,calc(100dvh-2rem))] w-full max-w-sm flex-col overflow-hidden rounded-2xl border shadow-2xl ${isDark ? 'border-zinc-700 bg-[#111114] text-white' : 'border-slate-200 bg-white text-slate-900'}`}
        onClick={(event) => event.stopPropagation()}
      >
        <header className={`flex items-center justify-between border-b px-4 py-3 ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Bot className={`h-4 w-4 ${isDark ? 'text-[#CCFF00]' : 'text-[#0066FF]'}`} />
            AIR NEETwork AI
          </div>
          <button type="button" onClick={onClose} aria-label="Close chat" className={`rounded-lg p-1.5 ${isDark ? 'text-zinc-400 hover:bg-zinc-800' : 'text-slate-500 hover:bg-slate-100'}`}>
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <p className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${message.role === 'user' ? isDark ? 'bg-[#CCFF00] text-black' : 'bg-[#0066FF] text-white' : isDark ? 'bg-zinc-900 text-zinc-100' : 'bg-slate-100 text-slate-800'}`}>
                {message.text}
              </p>
            </div>
          ))}
          {isSending && <div className="flex items-center gap-2 text-xs text-zinc-500"><LoaderCircle className="h-3.5 w-3.5 animate-spin" /> Thinking…</div>}
          {error && <p role="alert" className="text-xs text-rose-500">{error}</p>}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className={`flex items-center gap-2 border-t p-3 ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask a question…"
            aria-label="Message the AI assistant"
            className={`min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm outline-none ${isDark ? 'border-zinc-800 bg-zinc-900 text-white focus:border-[#CCFF00]' : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-[#0066FF]'}`}
          />
          <button type="submit" disabled={isSending || !draft.trim()} aria-label="Send message" className={`rounded-xl p-2.5 disabled:opacity-40 ${isDark ? 'bg-[#CCFF00] text-black' : 'bg-[#0066FF] text-white'}`}>
            <Send className="h-4 w-4" />
          </button>
        </form>
      </section>
    </div>
  );
};
