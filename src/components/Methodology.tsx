import React from 'react';
import { Target, FileSearch, CalendarCheck2, ArrowUpRight } from 'lucide-react';
import { BrandName } from './BrandName.tsx';

interface MethodologyProps {
  theme: 'dark' | 'light';
  onOpenBooking: () => void;
}

export const Methodology: React.FC<MethodologyProps> = ({ theme, onOpenBooking }) => {
  const isDark = theme === 'dark';

  const steps = [
    {
      num: '01',
      title: 'Dedicated AIR Ranker Pairing',
      icon: Target,
      highlight: 'Mentors Who Conquered The Exact Syllabus',
      description:
        'Paired 1-on-1 with an MBBS student from AIIMS, MAMC, or top central GMC who cleared NEET with an AIR under 1000. No generic sales counselors—only mentors who personally mastered the 700+ cutoff thresholds.',
    },
    {
      num: '02',
      title: 'Weekly Error-Log & Negative Mark Audit',
      icon: FileSearch,
      highlight: 'Eliminating The 40-60 Marks Lost To Silly Traps',
      description:
        'Every Sunday mock exam is reviewed question-by-question. Your mentor pinpoints calculation slips, conceptual confusion in Physics numericals, and trick options in Biology so you never bleed negative marks twice.',
    },
    {
      num: '03',
      title: 'Daily Chapter Micro-Roadmaps',
      icon: CalendarCheck2,
      highlight: 'NCERT Line-By-Line & High-Yield PYQs',
      description:
        'Stop feeling buried by massive coaching booklets. Your mentor structures realistic daily schedules, prioritizing high-weightage chapters and active recall intervals tailored to your specific speed.',
    },
  ];

  return (
    <section id="strategy" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-16">
          <div
            className={`text-xs font-mono font-bold tracking-widest uppercase mb-3 ${
              isDark ? 'text-[#CCFF00]' : 'text-[#0066FF]'
            }`}
          >
            [ THE AIR NEETWORK BLUEPRINT ]
          </div>
          <h2
            className={`text-3xl sm:text-5xl font-extrabold tracking-tight uppercase leading-[1.05] mb-4 ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}
          >
            Coaching Teaches Theory.{' '}
            <span className={isDark ? 'text-zinc-500' : 'text-slate-400'}>
              We Teach You How To Score.
            </span>
          </h2>
          <p className={`text-base leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
            Most aspirants study 10+ hours a day but plateau around 480–550 marks. <BrandName theme={theme} className="text-base font-semibold" /> bridges
            the gap through battle-tested strategy directly from those who cracked it.
          </p>
        </div>

        {/* 3 Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className={`p-8 rounded-2xl flex flex-col justify-between transition-all duration-200 border ${
                  isDark
                    ? 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <span
                      className={`text-xs font-mono font-bold tracking-wider px-2.5 py-1 rounded ${
                        isDark
                          ? 'bg-zinc-900 text-[#CCFF00] border border-zinc-800'
                          : 'bg-slate-100 text-[#0066FF]'
                      }`}
                    >
                      PILLAR {step.num}
                    </span>
                    <Icon className={`w-5 h-5 ${isDark ? 'text-[#CCFF00]' : 'text-[#0066FF]'}`} />
                  </div>

                  <h3
                    className={`text-xl font-bold tracking-tight mb-2 ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {step.title}
                  </h3>

                  <div
                    className={`text-xs font-mono font-medium mb-4 ${
                      isDark ? 'text-emerald-400' : 'text-emerald-600'
                    }`}
                  >
                    {step.highlight}
                  </div>

                  <p
                    className={`text-sm leading-relaxed ${
                      isDark ? 'text-zinc-400' : 'text-slate-600'
                    }`}
                  >
                    {step.description}
                  </p>
                </div>

                <div className={`pt-6 mt-6 border-t ${isDark ? 'border-zinc-800' : 'border-slate-100'}`}>
                  <button
                    onClick={onOpenBooking}
                    className={`text-xs font-mono font-semibold flex items-center gap-1 transition-colors ${
                      isDark
                        ? 'text-[#CCFF00] hover:underline'
                        : 'text-[#0066FF] hover:underline'
                    }`}
                  >
                    <span>Request Strategy Blueprint</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
