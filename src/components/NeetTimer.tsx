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
          className="inline-flex items-center gap-1.5 px-0 py-1 text-xs font-mono font-bold bg-transparent border-0"
        >
          <Flame className="h-3.5 w-3.5 shrink-0 fill-current text-red-500" />
          <span className={isDark ? 'text-red-300' : 'text-red-700'}>
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
          className={`group inline-flex items-center gap-1.5 px-1 py-1 font-mono text-xs font-bold transition-colors cursor-pointer bg-transparent border-0 ${
            isDark
              ? 'text-amber-300 hover:text-amber-200'
              : 'text-amber-800 hover:text-amber-950'
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
    <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-8 md:px-10 pt-2 pb-1.5 flex items-center justify-between gap-2.5 sm:gap-4 select-none">
      {/* Extreme Left: Desktop Timer Box (No border, no background color) */}
      <div
        role="region"
        aria-label="NEET UG Countdown Urgency Timer"
        className="hidden sm:inline-flex items-center gap-2.5 px-0 py-1 text-xs transition-all shrink-0 bg-transparent border-0"
      >
        {/* NEET UG Title with Flame icon */}
        <div className="flex items-center gap-1.5">
          <span
            className={`flex items-center gap-1.5 font-mono font-bold uppercase tracking-wider text-[11px] ${
              isDark ? 'text-red-400' : 'text-red-700'
            }`}
          >
            <Flame className="w-3.5 h-3.5 fill-current text-red-500 shrink-0" />
            <span>NEET &apos;{String(time.targetYear).slice(-2)}</span>
          </span>
        </div>

        {/* Days : Hours : Minutes Countdown Format */}
        <div className="flex items-center">
          <div
            className={`flex items-center gap-1.5 font-mono font-bold tracking-tight text-xs sm:text-sm px-0 py-0.5 bg-transparent border-0 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            <div className="flex items-baseline gap-0.5">
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

            <div className="flex items-baseline gap-0.5">
              <span className="text-sm sm:text-base font-black">
                {format2Digits(time.hours)}
              </span>
              <span className="text-[10px] font-sans font-bold tracking-wider opacity-80">
                h
              </span>
            </div>

            <span className="opacity-50">:</span>

            <div className="flex items-baseline gap-0.5">
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

      {/* Extreme Left: Mobile Timer Box (No border, no background color) */}
      <div
        role="region"
        aria-label="NEET UG Countdown Urgency Timer"
        className="flex sm:hidden items-center gap-1.5 px-0 py-1 text-xs transition-all min-w-0 shrink bg-transparent border-0"
      >
        <div className="flex items-center gap-1 min-w-0">
          <Flame className="w-3.5 h-3.5 fill-current text-red-500 shrink-0" />
          <span
            className={`font-mono font-bold uppercase tracking-wider text-[10px] truncate ${
              isDark ? 'text-red-400' : 'text-red-700'
            }`}
          >
            NEET &apos;{String(time.targetYear).slice(-2)}
          </span>
        </div>

        <div
          className={`flex items-center gap-1 font-mono font-bold text-[11px] px-0 py-0.5 shrink-0 bg-transparent border-0 ${
            isDark ? 'text-white' : 'text-slate-900'
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

      {/* Community, pledge and mentor actions (No border, no background color) */}
      <div className="flex items-center justify-end gap-1 sm:gap-2.5 min-w-0">
        <button
          type="button"
          onClick={onJoinCommunity}
          className={`inline-flex items-center gap-1.5 px-2 py-1 font-mono text-[10px] sm:text-xs font-bold transition-colors cursor-pointer bg-transparent border-0 ${
            isDark
              ? 'text-zinc-400 hover:text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          aria-label="Join the AIR NEETwork community"
        >
          <UsersRound className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden md:inline whitespace-nowrap">Join community</span>
        </button>
        <button
          type="button"
          onClick={() => setIsPledgeOpen(true)}
          className={`inline-flex items-center gap-1.5 px-2 py-1 font-mono text-[10px] sm:text-xs font-bold transition-colors cursor-pointer bg-transparent border-0 ${
            isDark
              ? 'text-[#60A5FA] hover:text-[#93c5fd]'
              : 'text-[#0066FF] hover:text-[#0052cc]'
          }`}
          aria-label="Take the NEET pledge"
        >
          <HandHeart className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden md:inline whitespace-nowrap">Take NEET pledge</span>
        </button>
        <button
          type="button"
          onClick={onJoinAsMentor || onTopperPortal || onWorkAsMentor}
          className={`group inline-flex items-center gap-1.5 sm:gap-2 px-2 py-1 font-mono text-xs font-bold transition-colors cursor-pointer bg-transparent border-0 ${
            isDark
              ? 'text-amber-300 hover:text-amber-200'
              : 'text-amber-800 hover:text-amber-950'
          }`}
          title="Join us as mentor — Register or log in to the mentor portal"
          aria-label="Join us as mentor"
        >
          {/* Circular Mentor Emblem */}
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 ${
              isDark
                ? 'bg-amber-400/20 text-amber-300'
                : 'bg-amber-200/80 text-amber-900'
            }`}
          >
            <GraduationCap className="w-3 h-3" />
          </span>

          {/* Label: "Join us as mentor" */}
          <span className="tracking-wide font-black whitespace-nowrap">
            <span className="hidden xs:inline">Join as mentor</span>
            <span className="inline xs:hidden">Join</span>
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
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#3B82F6]/10 text-[#60A5FA]">
              <HandHeart className="h-6 w-6" />
            </div>
            <p className={`mb-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] ${isDark ? 'text-[#60A5FA]' : 'text-blue-700'}`}>AIR NEETwork</p>
            <h2 id="neet-pledge-title" className="mb-3 text-2xl font-black">My NEET pledge</h2>
            <p className={`mb-6 text-sm leading-relaxed ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
              I pledge to show up consistently, learn from every mistake, and prepare with honesty and care for my wellbeing. My progress is built one focused day at a time.
            </p>
            <button
              type="button"
              onClick={() => setIsPledgeOpen(false)}
              className="w-full rounded-xl bg-[#3B82F6] px-4 py-3 font-mono text-sm font-black text-white transition hover:bg-[#2563EB] active:scale-[0.99]"
            >
              I take the pledge
            </button>
          </section>
        </div>
      )}
    </div>
  );
};
