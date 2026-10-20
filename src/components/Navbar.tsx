import React from 'react';
import { Logo } from './Logo.tsx';

interface NavbarProps {
  theme: 'dark' | 'light';
  onToggleTheme: (theme: 'dark' | 'light') => void;
  onOpenBooking: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  onOpenBooking,
}) => {
  const isDark = theme === 'dark';

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-200 backdrop-blur-md ${
        isDark
          ? 'bg-[#080808]/95 text-white'
          : 'bg-white/95 text-slate-900 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Logo linking to homepage */}
        <a
          href="/"
          className="flex items-center shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00] rounded-xl"
          aria-label="Air NEETwork"
        >
          <Logo theme={theme} size="sm" />
        </a>

        {/* Zone 2: 4 clean single-line nav links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a
            href="#strategy"
            className={`whitespace-nowrap transition-colors ${
              isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            The Strategy
          </a>
          <a
            href="#mentors"
            className={`whitespace-nowrap transition-colors ${
              isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            AIR Mentors
          </a>
          <a
            href="#diagnostic"
            className={`whitespace-nowrap transition-colors ${
              isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Gap Diagnostic
          </a>
          <a
            href="#dispatch"
            className={`whitespace-nowrap transition-colors ${
              isDark ? 'text-zinc-400 hover:text-[#CCFF00]' : 'text-slate-600 hover:text-[#0066FF]'
            }`}
          >
            AIR Dispatch
          </a>
        </nav>

        {/* Zone 3: Theme Switcher & Primary Action */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Theme Switcher Segmented Control */}
          <div
            className={`flex items-center p-1 rounded-lg text-xs font-semibold border ${
              isDark
                ? 'bg-zinc-900 border-zinc-800 text-zinc-300'
                : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <button
              onClick={() => onToggleTheme('dark')}
              className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap font-mono ${
                isDark
                  ? 'bg-black text-[#CCFF00] border border-[#CCFF00]/40 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Brutalist Dark theme (from your uploaded reference)"
            >
              Dark / Volt
            </button>
            <button
              onClick={() => onToggleTheme('light')}
              className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap font-mono ${
                !isDark
                  ? 'bg-white text-[#0066FF] shadow-sm font-bold border border-slate-200'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Clean White theme (crisp white background, less blue)"
            >
              Clean White
            </button>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={onOpenBooking}
            className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap shrink-0 shadow-sm font-mono ${
              isDark
                ? 'bg-[#CCFF00] text-black hover:bg-[#b8e600] active:scale-95'
                : 'bg-[#0066FF] text-white hover:bg-[#0052cc] active:scale-95 shadow-[#0066FF]/20 shadow-md'
            }`}
          >
            Book Strategy Call
          </button>
        </div>
      </div>
    </header>
  );
};
