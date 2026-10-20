import React from 'react';
import { Award, GraduationCap, CheckCircle2 } from 'lucide-react';
import { BrandName } from './BrandName.tsx';

interface MentorSpotlightProps {
  theme: 'dark' | 'light';
  onSelectMentor: (mentorName: string) => void;
}

export const MentorSpotlight: React.FC<MentorSpotlightProps> = ({
  theme,
  onSelectMentor,
}) => {
  const isDark = theme === 'dark';

  const mentors = [
    {
      name: 'Aryan Sharma',
      rank: 'AIR 48',
      score: '710/720',
      college: 'AIIMS New Delhi',
      year: 'MBBS 2nd Year',
      focus: 'Physics Numericals & Speed Accuracy',
      bio: 'Cracked NEET in his first attempt from home without mega-coaching. Specializes in turning Physics into a 160+ scoring engine through timed question sets.',
    },
    {
      name: 'Sneha Patel',
      rank: 'AIR 112',
      score: '700/720',
      college: 'VMMC & Safdarjung Hospital',
      year: 'MBBS 2nd Year',
      focus: 'NCERT Biology Active Recall & Mnemonics',
      bio: 'Scored a perfect 360/360 in Biology. Guides aspirants through 4-stage active NCERT line extraction and eliminating assertion-reason confusion.',
    },
    {
      name: 'Rohan Verma',
      rank: 'AIR 184',
      score: '695/720',
      college: 'Maulana Azad Medical College (MAMC)',
      year: 'MBBS 3rd Year',
      focus: 'Organic Chemistry & Negative Mark Reduction',
      bio: 'Overcame a 510 baseline in mock exams to achieve 695 in NEET UG. Teaches the exact error-log matrix used to eliminate 40+ negative marks in final months.',
    },
  ];

  return (
    <section id="mentors" className="py-24 relative border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div
              className={`text-xs font-mono font-bold tracking-widest uppercase mb-3 ${
                isDark ? 'text-[#CCFF00]' : 'text-[#0066FF]'
              }`}
            >
              [ VERIFIED AIR MENTORS ]
            </div>
            <h2
              className={`text-3xl sm:text-5xl font-extrabold tracking-tight uppercase leading-[1.05] ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
            >
              Guided by Those Who've <br />
              Walked The Stage.
            </h2>
          </div>
          <p
            className={`max-w-md text-sm leading-relaxed ${
              isDark ? 'text-zinc-400' : 'text-slate-600'
            }`}
          >
            Every mentor in <BrandName theme={theme} className="text-sm font-semibold" /> is personally vetted, holds an All India Rank under 1000,
            and maintains active medical student credentials at top institutions.
          </p>
        </div>

        {/* Mentor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mentors.map((mentor) => (
            <div
              key={mentor.name}
              className={`p-8 rounded-2xl flex flex-col justify-between transition-all border ${
                isDark
                  ? 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div>
                {/* Clean unboxed rank metadata (Zero pill rule) */}
                <div
                  className={`flex items-center gap-2 text-xs font-mono font-semibold mb-3 ${
                    isDark ? 'text-[#CCFF00]' : 'text-[#0066FF]'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>{mentor.rank}</span>
                  <span aria-hidden="true">·</span>
                  <span>NEET {mentor.score}</span>
                </div>

                <h3
                  className={`text-xl font-bold tracking-tight mb-1 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {mentor.name}
                </h3>

                {/* College & Program metadata */}
                <div
                  className={`flex items-center gap-2 text-xs mb-4 ${
                    isDark ? 'text-zinc-400' : 'text-slate-500'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>{mentor.college}</span>
                  <span aria-hidden="true">·</span>
                  <span>{mentor.year}</span>
                </div>

                <div
                  className={`text-xs font-medium px-3 py-2 rounded-lg mb-4 ${
                    isDark
                      ? 'bg-zinc-900 border border-zinc-800 text-zinc-300'
                      : 'bg-slate-50 border border-slate-100 text-slate-700'
                  }`}
                >
                  <span className="font-semibold text-emerald-500">Focus:</span> {mentor.focus}
                </div>

                <p
                  className={`text-sm leading-relaxed ${
                    isDark ? 'text-zinc-400' : 'text-slate-600'
                  }`}
                >
                  {mentor.bio}
                </p>
              </div>

              <div className={`pt-6 mt-6 border-t ${isDark ? 'border-zinc-800' : 'border-slate-100'}`}>
                <button
                  onClick={() => onSelectMentor(mentor.name)}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    isDark
                      ? 'bg-zinc-900 text-[#CCFF00] border border-[#CCFF00]/30 hover:bg-[#CCFF00] hover:text-black'
                      : 'bg-[#0066FF] text-white hover:bg-[#0052cc]'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Request Session with {mentor.name.split(' ')[0]}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
