import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { BrandName } from './BrandName.tsx';

interface DispatchSectionProps {
  theme: 'dark' | 'light';
  onOpenBooking: () => void;
}

export const DispatchSection: React.FC<DispatchSectionProps> = ({ theme, onOpenBooking }) => {
  const isDark = theme === 'dark';
  const [contact, setContact] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contact.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <section id="dispatch" className="py-24 border-t transition-colors border-zinc-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
          {/* Big Editorial Headline mirroring screenshot: KEEP THE THREAD. -> KEEP THE RANK. */}
          <div className="lg:col-span-6">
            <h2
              className={`text-5xl sm:text-7xl font-extrabold tracking-tighter uppercase leading-[0.9] ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
            >
              KEEP THE <br />
              <span className={isDark ? 'text-[#CCFF00]' : 'text-[#0066FF]'}>
                RANK.
              </span>
            </h2>
          </div>

          {/* Right Side Minimalist Input matching reference */}
          <div className="lg:col-span-6">
            <p
              className={`text-base sm:text-lg mb-8 leading-relaxed max-w-lg ${
                isDark ? 'text-zinc-400' : 'text-slate-600'
              }`}
            >
              One considered strategy breakdown every Sunday. The high-yield NCERT traps and Physics
              error patterns, without the feed-shaped coaching anxiety.
            </p>

            {!subscribed ? (
              <form onSubmit={handleSubmit} className="flex items-center gap-4 border-b pb-3 max-w-lg transition-colors border-zinc-700">
                <input
                  type="text"
                  required
                  placeholder="your@whatsapp.number or email"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className={`w-full bg-transparent text-sm font-mono focus:outline-none ${
                    isDark
                      ? 'text-white placeholder-zinc-600 focus:placeholder-zinc-400'
                      : 'text-slate-900 placeholder-slate-400 focus:placeholder-slate-600'
                  }`}
                />
                <button
                  type="submit"
                  className={`text-xs font-mono font-bold uppercase tracking-widest whitespace-nowrap transition-transform active:scale-95 ${
                    isDark
                      ? 'text-[#CCFF00] hover:text-[#b8e600]'
                      : 'text-[#0066FF] hover:text-[#0052cc]'
                  }`}
                >
                  ADD ME &rarr;
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 py-3">
                <Check className="w-4 h-4" />
                <span className="flex items-center gap-1">
                  <span>You're in the</span>
                  <BrandName theme={theme} className="text-xs" />
                  <span>weekly rank list. Welcome.</span>
                </span>
              </div>
            )}

            <div className="mt-4 flex items-center gap-4 text-xs font-mono text-zinc-500">
              <span>Class 11 / 12 / Droppers</span>
              <span>·</span>
              <button
                type="button"
                onClick={onOpenBooking}
                className="underline hover:text-white transition-colors"
              >
                Or request 1-on-1 mentor session directly
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
