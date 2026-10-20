import React from 'react';
import { Logo } from './Logo.tsx';
import { ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  theme: 'dark' | 'light';
  onOpenBooking: () => void;
}

export const Hero: React.FC<HeroProps> = ({ theme, onOpenBooking }) => {
  const isDark = theme === 'dark';

  return (
    <section className="relative pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Top Header Split: Massive Editorial Typographic Headline + Graphic Asset Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch mb-16">
          {/* Left Column: Bold Editorial Headline (Inspired by your reference) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* Brand Logo Container */}
              <div className="mb-8 inline-block">
                <Logo theme={theme} size="md" showTagline={false} />
              </div>

              {/* Sub-kicker in monospace */}
              <div
                className={`text-xs font-mono font-bold tracking-widest uppercase mb-4 ${
                  isDark ? 'text-[#CCFF00]' : 'text-[#0066FF]'
                }`}
              >
                1-on-1 Strategic Mentorship · Class 11, 12 & Droppers
              </div>

              {/* Massive Bold Headline mimicking reference screenshot layout */}
              <h1
                className={`text-4xl sm:text-6xl xl:text-7xl font-extrabold tracking-tighter uppercase leading-[0.95] mb-6 ${
                  isDark ? 'text-white' : 'text-slate-950'
                }`}
              >
                Cracking NEET <br />
                Gets Better <br />
                When You Have <br />
                <span className={isDark ? 'text-[#CCFF00]' : 'text-[#0066FF]'}>
                  An AIR Mentor
                </span>{' '}
                <br />
                <span className={isDark ? 'text-[#CCFF00]' : 'text-[#0066FF]'}>
                  To Talk To.
                </span>
              </h1>
            </div>

            {/* Subtext and Action Buttons */}
            <div>
              <p
                className={`text-base sm:text-lg max-w-xl leading-relaxed mb-8 ${
                  isDark ? 'text-zinc-400' : 'text-slate-600'
                }`}
              >
                Stop drowning in generic coaching lectures. Get paired 1-on-1 with All India Rankers
                from AIIMS and top medical colleges who diagnose your mock paper negative marks, fix
                numerical traps, and build your exact rank roadmap.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={onOpenBooking}
                  className={`w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-mono font-bold tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-3 active:scale-95 shadow-lg ${
                    isDark
                      ? 'bg-[#CCFF00] text-black hover:bg-[#b8e600] shadow-[#CCFF00]/20'
                      : 'bg-[#0066FF] text-white hover:bg-[#0052cc] shadow-[#0066FF]/25'
                  }`}
                >
                  <span>Book Free Strategy Call</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="#mentors"
                  className={`w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-mono font-semibold uppercase tracking-wider transition-all flex items-center justify-center border ${
                    isDark
                      ? 'border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-600 bg-zinc-900/50'
                      : 'border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-400 bg-white'
                  }`}
                >
                  View Ranker Roster
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: High-Impact Graphic Wireframe Card (Directly faithful to screenshot) */}
          <div className="lg:col-span-5 flex flex-col">
            <div
              className={`h-full min-h-[380px] rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden transition-all border ${
                isDark
                  ? 'bg-[#CCFF00] text-black border-black/20 shadow-2xl'
                  : 'bg-slate-50 border-slate-200 text-slate-900 shadow-lg'
              }`}
            >
              {/* Top info row */}
              <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider">
                <span>[ ALL INDIA RANK FRAMEWORK ]</span>
                <span>NEET UG</span>
              </div>

              {/* Center Geometric Wireframe Illustration (matching reference) */}
              <div className="my-auto py-8 relative flex items-center justify-center">
                <div
                  className={`w-48 h-48 sm:w-56 sm:h-56 relative border transition-transform hover:rotate-3 duration-300 ${
                    isDark ? 'border-black' : 'border-[#0066FF]'
                  }`}
                >
                  {/* Diagonal cross */}
                  <div
                    className={`absolute inset-0 border-t ${
                      isDark ? 'border-black' : 'border-[#0066FF]'
                    }`}
                    style={{
                      transform: 'rotate(45deg)',
                      transformOrigin: 'top left',
                      width: '141.4%',
                    }}
                  />
                  <div
                    className={`absolute inset-0 border-t ${
                      isDark ? 'border-black' : 'border-[#0066FF]'
                    }`}
                    style={{
                      transform: 'rotate(-45deg)',
                      transformOrigin: 'top right',
                      width: '141.4%',
                    }}
                  />

                  {/* Rotated inner solid dark box */}
                  <div
                    className={`absolute inset-4 transition-transform duration-500 hover:scale-105 flex items-center justify-center ${
                      isDark ? 'bg-black text-[#CCFF00]' : 'bg-[#0066FF] text-white'
                    }`}
                    style={{ transform: 'rotate(-8deg)' }}
                  >
                    <div className="text-center font-mono p-3">
                      <div className="text-2xl sm:text-3xl font-extrabold tracking-tighter">
                        680+
                      </div>
                      <div className="text-[10px] uppercase tracking-widest font-bold">
                        AIR CUTOFF TARGET
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Wireframe Caption (matching screenshot: 'A MARK FOR THE COMMONS') */}
              <div className="flex items-center justify-between border-t pt-4 text-[11px] font-mono tracking-widest uppercase border-black/20">
                <span>AIIMS · MAMC · VMMC</span>
                <span className="font-bold underline">A MARK FOR ALL INDIA RANK</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quantified Proof Strip */}
        <div
          className={`rounded-2xl p-6 sm:p-8 border transition-all ${
            isDark
              ? 'bg-zinc-950/80 border-zinc-800 text-white'
              : 'bg-white border-slate-200 text-slate-900 shadow-sm'
          }`}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-zinc-800 dark:divide-zinc-800">
            <div className="pt-3 md:pt-0">
              <div
                className={`text-3xl sm:text-4xl font-extrabold tracking-tight font-mono mb-1 ${
                  isDark ? 'text-[#CCFF00]' : 'text-[#0066FF]'
                }`}
              >
                685+
              </div>
              <div className={`text-xs uppercase tracking-wider font-mono ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Avg. Mentor Score
              </div>
            </div>

            <div className="pt-3 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono mb-1">
                1-on-1
              </div>
              <div className={`text-xs uppercase tracking-wider font-mono ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Weekly Video Audits
              </div>
            </div>

            <div className="pt-3 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono mb-1 text-emerald-400">
                +115
              </div>
              <div className={`text-xs uppercase tracking-wider font-mono ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Avg. Mock Jump in 90D
              </div>
            </div>

            <div className="pt-3 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono mb-1">
                TOP 500
              </div>
              <div className={`text-xs uppercase tracking-wider font-mono ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                All India Rankers Only
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
