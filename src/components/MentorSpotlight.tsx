import React, { useState, useEffect } from 'react';
import { GraduationCap, CheckCircle2, Info, ShieldCheck } from 'lucide-react';
import { BrandName } from './BrandName.tsx';
import { getAllRegisteredToppers, AVATAR_PRESETS } from '../utils/topperStorage.ts';
import { calculateSessionRateByAir, type TopperProfile } from '../types/topper.ts';

interface MentorSpotlightProps {
  theme: 'dark' | 'light';
  onSelectMentor: (mentorName: string) => void;
}

export const MentorSpotlight: React.FC<MentorSpotlightProps> = ({
  theme,
  onSelectMentor,
}) => {
  const isDark = theme === 'dark';
  const [toppers, setToppers] = useState<TopperProfile[]>(() => getAllRegisteredToppers());

  useEffect(() => {
    const handleUpdate = () => {
      setToppers(getAllRegisteredToppers());
    };

    window.addEventListener('airneet_toppers_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('airneet_toppers_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return (
    <section id="mentors" className={`py-12 sm:py-20 relative border-t ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
      <div className="max-w-[1560px] mx-auto px-4 sm:px-8 md:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div
              className={`text-xs font-mono font-bold tracking-widest uppercase mb-3 ${
                isDark ? 'text-[#CCFF00]' : 'text-[#0066FF]'
              }`}
            >
              [ VERIFIED AIR MENTORS · TOP RANKERS ]
            </div>
            <h2
              className={`text-3xl sm:text-5xl font-extrabold tracking-tight uppercase leading-[1.05] ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Guided by Those Who&apos;ve <br />
              Walked The Stage.
            </h2>
          </div>
          <p
            className={`max-w-md text-sm leading-relaxed ${
              isDark ? 'text-zinc-300' : 'text-slate-700'
            }`}
          >
            Every mentor in <BrandName theme={theme} className="text-sm font-semibold" /> is personally vetted, holds an All India Rank,
            and maintains active medical student credentials at top institutions.
          </p>
        </div>

        {/* Founder Recommendation Advisory Banner */}
        <div
          className={`mb-10 p-4 sm:p-5 rounded-2xl border transition-all ${
            isDark
              ? 'bg-amber-950/25 border-amber-500/40 text-amber-200'
              : 'bg-amber-50 border-amber-300 text-amber-950 shadow-xs'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <Info className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2">
                <span className="text-amber-500 dark:text-amber-400 font-black">[ ADVISORY ]</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-800 dark:text-amber-300 font-sans font-bold">
                  Matched by Weak Spot
                </span>
              </div>
              <p className={`text-xs sm:text-sm font-medium leading-relaxed ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                <strong>We recommend matching mentors by your specific subject bottleneck, not just single-digit rank.</strong>{' '}
                A mentor who cracked your exact weak spot (e.g. Organic reaction mechanisms or physics rotational numericals)
                will transform your NEET score far more effectively.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Topper Cards Grid — 70% Photo Area & 30% Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
          {toppers.map((mentor) => {
            const rateInfo = calculateSessionRateByAir(mentor.airRank);
            const avatar = mentor.avatarUrl || AVATAR_PRESETS[0].url;

            return (
              <div
                key={mentor.id || mentor.name}
                className={`rounded-3xl overflow-hidden flex flex-col group transition-all duration-300 hover:-translate-y-1.5 border ${
                  isDark
                    ? 'bg-[#121217] border-zinc-800 hover:border-zinc-700 shadow-xl shadow-black/50'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-md hover:shadow-xl'
                }`}
              >
                {/* 70% Photo Area */}
                <div className="relative w-full aspect-[4/5] overflow-hidden bg-zinc-950">
                  <img
                    src={avatar}
                    alt={mentor.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* Top floating badges: AIR Rank + Fixed Rate */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-black font-mono font-black text-xs shadow-lg shadow-amber-400/20 tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                      AIR {mentor.airRank}
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-[#CCFF00] font-mono text-xs font-black shadow-md">
                      {rateInfo.display}
                    </span>
                  </div>
                </div>

                {/* Details Area: ONLY Name, AIR, Marks, College */}
                <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 gap-4">
                  <div className="space-y-2.5">
                    {/* Name */}
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
                        Name
                      </div>
                      <h3 className={`text-lg sm:text-xl font-black tracking-tight leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {mentor.name}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                      {/* AIR */}
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
                          AIR
                        </div>
                        <div className="text-sm font-mono font-black text-amber-500 dark:text-amber-400">
                          AIR {mentor.airRank}
                        </div>
                      </div>

                      {/* Marks */}
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
                          Marks
                        </div>
                        <div className="text-sm font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                          {mentor.totalMarks}/720
                        </div>
                      </div>
                    </div>

                    {/* College */}
                    <div className="pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold flex items-center gap-1">
                        <GraduationCap className="w-3 h-3 text-amber-500" />
                        <span>College</span>
                      </div>
                      <div className={`text-xs sm:text-sm font-semibold leading-snug line-clamp-2 mt-0.5 ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                        {mentor.currentCollege}
                      </div>
                    </div>
                  </div>

                  {/* Booking CTA Button */}
                  <div className={`pt-3 border-t ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
                    <button
                      type="button"
                      onClick={() => onSelectMentor(mentor.name)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 ${
                        isDark
                          ? 'bg-[#CCFF00] text-black hover:bg-[#d8ff33] shadow-[#CCFF00]/10'
                          : 'bg-[#0066FF] text-white hover:bg-[#0052cc] shadow-[#0066FF]/20'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Book Strategy Session</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
