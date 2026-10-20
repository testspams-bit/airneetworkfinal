import { useState, type CSSProperties } from 'react';
import { Bot, Mail, MessageCircle, Phone, X } from 'lucide-react';

interface SupportAgentIconProps {
  theme: 'dark' | 'light';
  onOpenAIChat: () => void;
}

const actions = [
  { label: 'Chatbot', Icon: Bot, top: -204, kind: 'chatbot' },
  { label: 'WhatsApp', Icon: MessageCircle, top: -152, kind: 'whatsapp' },
  { label: 'Email', Icon: Mail, top: -100, kind: 'email' },
  { label: 'Call', Icon: Phone, top: -48, kind: 'call' },
] as const;

export const SupportAgentIcon = ({ theme, onOpenAIChat }: SupportAgentIconProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isDark = theme === 'dark';
  const actionStyle = `support-action absolute grid h-10 w-10 place-items-center rounded-full border shadow-lg transition-all duration-200 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
    isDark
      ? 'border-zinc-700 bg-[#17171b] text-white hover:bg-zinc-800 focus-visible:outline-[#CCFF00]'
      : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50 focus-visible:outline-[#0066FF]'
  }`;

  return (
    <div className="support-launcher fixed right-6 bottom-6 z-[45] h-12 w-12">
      {actions.map(({ label, Icon, top, kind }, index) => (
        <div
          key={kind}
          className={`support-action-wrap group absolute h-10 w-10 ${isOpen ? 'support-action-wrap--open' : ''}`}
          style={{ left: 4, top, '--action-delay': `${(isOpen ? index : actions.length - 1 - index) * 45}ms` } as CSSProperties}
          aria-hidden={!isOpen}
        >
          {kind === 'chatbot' ? (
            <button
              type="button"
              className={actionStyle}
              onClick={() => { setIsOpen(false); onOpenAIChat(); }}
              aria-label="Open Chatbot"
              tabIndex={isOpen ? 0 : -1}
            >
              <Icon className={`h-5 w-5 ${isDark ? 'text-[#CCFF00]' : 'text-[#0066FF]'}`} aria-hidden="true" />
            </button>
          ) : (
            <a
              className={actionStyle}
              href={kind === 'whatsapp'
                ? 'https://wa.me/919876543210?text=Hello%20AIR%20NEETwork,%20I%20would%20like%20to%20inquire%20about%20NEET%20mentorship.'
                : kind === 'email' ? 'mailto:csebks@gmail.com' : 'tel:+919876543210'}
              target={kind === 'whatsapp' ? '_blank' : undefined}
              rel={kind === 'whatsapp' ? 'noopener noreferrer' : undefined}
              aria-label={kind === 'whatsapp' ? 'WhatsApp' : kind === 'email' ? 'Email' : 'Call'}
              tabIndex={isOpen ? 0 : -1}
            >
              <Icon className={`h-5 w-5 ${kind === 'whatsapp' ? 'text-[#25D366]' : isDark ? 'text-[#CCFF00]' : 'text-[#0066FF]'}`} aria-hidden="true" />
            </a>
          )}
          <span
            className={`support-action-label pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium opacity-0 shadow-md transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 ${isDark ? 'border-zinc-700 bg-[#17171b] text-white' : 'border-slate-200 bg-white text-slate-900'}`}
          >
            {label}
          </span>
        </div>
      ))}

      <button
        type="button"
        className={`support-agent support-agent--${theme} relative z-10 cursor-pointer transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${isDark ? 'focus-visible:outline-[#CCFF00]' : 'focus-visible:outline-[#0066FF]'}`}
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Close contact options' : 'Open contact options'}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="support-agent__grain" aria-hidden="true" />
        {isOpen ? (
          <X className="relative z-[1] h-6 w-6" aria-hidden="true" />
        ) : (
          <svg className="support-agent__portrait" viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <path d="M8.5 24v-4a15.5 15.5 0 0 1 31 0v4" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
            <circle cx="24" cy="20.5" r="6.5" fill="currentColor" />
            <path d="M12.5 39c1-6.2 5-9.3 11.5-9.3s10.5 3.1 11.5 9.3" fill="currentColor" />
            <rect x="6.5" y="21" width="6" height="12" rx="3" fill="currentColor" />
            <rect x="35.5" y="21" width="6" height="12" rx="3" fill="currentColor" />
            <path d="M38.5 31.5v1.2a5.3 5.3 0 0 1-5.3 5.3h-2.4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="29.5" cy="38" r="1.4" fill="currentColor" />
          </svg>
        )}
      </button>
    </div>
  );
};
