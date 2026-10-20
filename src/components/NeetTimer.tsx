import React, { useState, useEffect } from 'react';
import { Flame, GraduationCap, UsersRound, HandHeart, X } from 'lucide-react';

interface NeetTimerProps {
  theme?: 'dark' | 'light';
  variant?: 'banner' | 'inline' | 'compact';
  onJoinAsMentor?: () => void;
  onTopperPortal?: () => void;
  onWorkAsMentor?: () => void;
  onJoinCommunity?: () => void;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  targetYear: number;
}

export function getNextNeetDate(): { target: Date; targetYear: number } {
  const now = new Date();
  const currentYear = now.getFullYear();

  // NEET UG is traditionally held on the 1st Sunday of May at 14:00 (2:00 PM) IST (08:30 UTC)
  const getFirstSundayOfMay = (year: number) => {
    const d = new Date(Date.UTC(year, 4, 1, 8, 30, 0));
    const dayOfWeek = d.getUTCDay();
    const offset = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    d.setUTCDate(1 + offset);
    return d;
  };

  let target = getFirstSundayOfMay(currentYear);
  let targetYear = currentYear;

  if (now.getTime() >= target.getTime()) {
    targetYear = currentYear + 1;
    target = getFirstSundayOfMay(targetYear);
  }

  return { target, targetYear };
}

function calculateTimeRemaining(): TimeRemaining {
  const { target, targetYear } = getNextNeetDate();
  const now = new Date();
  const diff = Math.max(0, target.getTime() - now.getTime());

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  return { days, hours, minutes, targetYear };
}

export const NeetTimer: React.FC<NeetTimerProps> = ({
  theme = 'dark',
  variant = 'banner',
  onJoinAsMentor,
  onTopperPortal,
  onWorkAsMentor,
  onJoinCommunity,
}) => {
  const isDark = theme === 'dark';
  const [time, setTime] = useState<TimeRemaining>(calculateTimeRemaining);
  const [isPledgeOpen, setIsPledgeOpen] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTime(calculateTimeRemaining());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isPledgeOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsPledgeOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isPledgeOpen]);

  const format2Digits = (num: number) => String(num).padStart(2, '0');

  if (variant === 'inline') {
    return (
      <div className="inline-flex items-center gap-1.5 font-mono font-bold">
        <span>{time.days} Days</span>
        <span className="opacity-60">:</span>
        <span>{format2Digits(time.hours)} Hours</span>
        <span className="opacity-60">:</span>
        <span>{format2Digits(time.minutes)} Minutes</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap items-center gap-2 select-none">
        <div
          role="region"
          aria-label="NEET UG countdown"
          className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-mono font-bold shadow-xs backdrop-blur-md ${
            isDark
              ? 'border-red-500/30 bg-red-950/70 text-white'
              : 'border-red-300 bg-white/90 text-red-950'
          }`}
        >
          <Flame className="h-3.5 w-3.5 shrink-0 fill-current text-red-500" />
          <span className={isDark ? 'text-red-200' : 'text-red-900'}>
            NEET &apos;{String(time.targetYear).slice(-2)}
          </span>
          <span className="opacity-40">·</span>
          <span className={isDark ? 'text-amber-300' : 'text-red-700'}>
            {time.days} days
          </span>
        </div>

        <button
          type="button"
          onClick={onJoinAsMentor || onTopperPortal || onWorkAsMentor}
          className={`group inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 font-mono text-xs font-bold transition-all duration-200 active:scale-95 ${
            isDark
              ? 'border-amber-400/40 bg-amber-400/10 text-amber-300 hover:border-amber-400 hover:bg-amber-400/15'
              : 'border-amber-300 bg-amber-50 text-amber-950 hover:border-amber-400 hover:bg-amber-100'
          }`}
          title="Join us as mentor — Register or log in to the mentor portal"
          aria-label="Join us as mentor"
        >
          <GraduationCap className="h-4 w-4 shrink-0" />
          <span className="whitespace-nowrap">Join as mentor</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-2 pb-1.5 flex items-center justify-between gap-2.5 sm:gap-4 select-none">
      {/* Extreme Left: Desktop Timer Box */}
      <div
        role="region"
        aria-label="NEET UG Countdown Urgency Timer"
        className={`hidden sm:inline-flex items-center gap-3 rounded-2xl border backdrop-blur-md px-3.5 py-1.5 text-xs transition-all shadow-xs shrink-0 ${
          isDark
            ? 'bg-red-950/25 border-red-500/30 text-white'
            : 'bg-red-100/50 border-red-300 text-red-950'
        }`}
      >
        {/* NEET UG Title with Flame icon (No dot) */}
        <div className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1.5 font-mono font-bold uppercase tracking-wider text-[11px] ${
              isDark ? 'text-red-200' : 'text-red-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5 fill-current text-red-500 shrink-0" />
            <span>NEET &apos;{String(time.targetYear).slice(-2)}</span>
          </span>
        </div>

        {/* Days : Hours : Minutes Countdown Format */}
        <div className="flex items-center">
          <div
            className={`flex items-center gap-1.5 font-mono font-bold tracking-tight text-xs sm:text-sm px-2 py-0.5 rounded-xl border ${
              isDark
                ? 'bg-black/30 border-white/10 text-white'
                : 'bg-white/80 border-red-200 text-slate-900 shadow-xs'
            }`}
          >
            <div className="flex items-baseline gap-1">
              <span
                className={`text-sm sm:text-base font-black ${
                  isDark ? 'text-amber-300' : 'text-red-700'
                }`}
              >
                {time.days}
              </span>
              <span className="text-[10px] font-sans font-bold tracking-wider opacity-80">
                d
              </span>
            </div>

            <span className="opacity-50">:</span>

            <div className="flex items-baseline gap-1">
              <span className="text-sm sm:text-base font-black">
                {format2Digits(time.hours)}
              </span>
              <span className="text-[10px] font-sans font-bold tracking-wider opacity-80">
                h
              </span>
            </div>

            <span className="opacity-50">:</span>

            <div className="flex items-baseline gap-1">
              <span className="text-sm sm:text-base font-black">
                {format2Digits(time.minutes)}
              </span>
              <span className="text-[10px] font-sans font-bold tracking-wider opacity-80">
                m
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Extreme Left: Mobile Timer Box */}
      <div
        role="region"
        aria-label="NEET UG Countdown Urgency Timer"
        className={`flex sm:hidden items-center gap-1.5 rounded-xl border backdrop-blur-md px-2.5 py-1 text-xs transition-all shadow-xs min-w-0 shrink ${
          isDark
            ? 'bg-red-950/25 border-red-500/30 text-white'
            : 'bg-red-100/50 border-red-300 text-red-950'
        }`}
      >
        <div className="flex items-center gap-1 min-w-0">
          <Flame className="w-3.5 h-3.5 fill-current text-red-500 shrink-0" />
          <span
            className={`font-mono font-bold uppercase tracking-wider text-[10px] truncate ${
              isDark ? 'text-red-200' : 'text-red-900'
            }`}
          >
            NEET &apos;{String(time.targetYear).slice(-2)}
          </span>
        </div>

        <div
          className={`flex items-center gap-1 font-mono font-bold text-[11px] px-2 py-0.5 rounded-lg border shrink-0 ${
            isDark
              ? 'bg-black/30 border-white/10 text-white'
              : 'bg-white/80 border-red-200 text-slate-900'
          }`}
        >
          <span className={isDark ? 'text-amber-300 font-black' : 'text-red-700 font-black'}>
            {time.days}d
          </span>
          <span className="opacity-40">:</span>
          <span>{format2Digits(time.hours)}h</span>
          <span className="opacity-40">:</span>
          <span>{format2Digits(time.minutes)}m</span>
        </div>
      </div>

      {/* Community, pledge and mentor actions sit to the right of the countdown. */}
      <div className="flex items-center justify-end gap-1.5 sm:gap-2 min-w-0">
        <button
          type="button"
          onClick={onJoinCommunity}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 sm:px-3 py-1.5 font-mono text-[10px] sm:text-xs font-bold transition-all duration-200 active:scale-95 ${
            isDark
              ? 'border-white/15 bg-white/[0.04] text-zinc-200 hover:border-amber-300/60 hover:text-amber-200 hover:shadow-[0_0_14px_rgba(251,191,36,0.15)]'
              : 'border-slate-300 bg-white/80 text-slate-700 hover:border-blue-300 hover:text-blue-700'
          }`}
          aria-label="Join the AIR NEETwork community"
        >
          <UsersRound className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden md:inline whitespace-nowrap">Join community</span>
        </button>
        <button
          type="button"
          onClick={() => setIsPledgeOpen(true)}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 sm:px-3 py-1.5 font-mono text-[10px] sm:text-xs font-bold transition-all duration-200 active:scale-95 ${
            isDark
              ? 'border-[#CCFF00]/45 bg-[#CCFF00]/10 text-[#CCFF00] hover:border-[#CCFF00] hover:bg-[#CCFF00]/15 hover:shadow-[0_0_16px_rgba(204,255,0,0.18)]'
              : 'border-blue-300 bg-blue-50 text-blue-800 hover:border-blue-400 hover:bg-blue-100'
          }`}
          aria-label="Take the NEET pledge"
        >
          <HandHeart className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden md:inline whitespace-nowrap">Take NEET pledge</span>
        </button>
        <button
          type="button"
          onClick={onJoinAsMentor || onTopperPortal || onWorkAsMentor}
          className={`group inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-2xl border font-mono text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 shadow-xs ${
            isDark
              ? 'bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border-amber-400/40 text-amber-300 hover:border-amber-400 hover:bg-amber-400/15 hover:shadow-[0_0_16px_rgba(251,191,36,0.25)]'
              : 'bg-gradient-to-r from-amber-50 to-amber-100/60 border-amber-300 text-amber-950 hover:bg-amber-100 hover:border-amber-400 shadow-xs'
          }`}
          title="Join us as mentor — Register or log in to the mentor portal"
          aria-label="Join us as mentor"
        >
          {/* Circular Mentor Emblem */}
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 ${
              isDark
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                : 'bg-amber-200/70 text-amber-900 border border-amber-300'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
          </span>

          {/* Label: "Join us as mentor" */}
          <span className="tracking-wide font-black whitespace-nowrap">
            <span className="hidden xs:inline">Join us as mentor</span>
            <span className="inline xs:hidden">Join as mentor</span>
          </span>
        </button>
      </div>

      {isPledgeOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setIsPledgeOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="neet-pledge-title"
            className={`relative w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
              isDark ? 'border-zinc-700 bg-[#111114] text-white' : 'border-slate-200 bg-white text-slate-900'
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsPledgeOpen(false)}
              aria-label="Close pledge"
              className={`absolute right-4 top-4 rounded-lg p-1.5 ${isDark ? 'text-zinc-400 hover:bg-zinc-800 hover:text-white' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#CCFF00]/10 text-[#CCFF00]">
              <HandHeart className="h-6 w-6" />
            </div>
            <p className={`mb-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] ${isDark ? 'text-[#CCFF00]' : 'text-blue-700'}`}>AIR NEETwork</p>
            <h2 id="neet-pledge-title" className="mb-3 text-2xl font-black">My NEET pledge</h2>
            <p className={`mb-6 text-sm leading-relaxed ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
              I pledge to show up consistently, learn from every mistake, and prepare with honesty and care for my wellbeing. My progress is built one focused day at a time.
            </p>
            <button
              type="button"
              onClick={() => setIsPledgeOpen(false)}
              className="w-full rounded-xl bg-[#CCFF00] px-4 py-3 font-mono text-sm font-black text-black transition hover:bg-[#d8ff33] active:scale-[0.99]"
            >
              I take the pledge
            </button>
          </section>
        </div>
      )}
    </div>
  );
};
