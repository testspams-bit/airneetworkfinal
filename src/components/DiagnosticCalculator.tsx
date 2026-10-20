import React, { useState } from 'react';
import { TrendingUp, ArrowRight } from 'lucide-react';

interface DiagnosticCalculatorProps {
  theme: 'dark' | 'light';
  onOpenBooking: () => void;
}

export const DiagnosticCalculator: React.FC<DiagnosticCalculatorProps> = ({
  theme,
  onOpenBooking,
}) => {
  const isDark = theme === 'dark';

  const [currentScore, setCurrentScore] = useState<number>(510);
  const [targetCollege, setTargetCollege] = useState<'aiims' | 'top-gmc' | 'state-gmc'>('top-gmc');

  const targets = {
    'aiims': { name: 'AIIMS New Delhi / JIPMER Tier-1', cutoff: 705 },
    'top-gmc': { name: 'Top 15 Central GMCs (MAMC, VMMC, KGMU)', cutoff: 660 },
    'state-gmc': { name: 'State Government Medical College Seat', cutoff: 615 },
  };

  const selectedTarget = targets[targetCollege];
  const gap = Math.max(0, selectedTarget.cutoff - currentScore);
  const negativeMarkSavings = Math.min(gap, Math.round(gap * 0.35));
  const conceptualBoost = gap - negativeMarkSavings;

  return (
    <section id="diagnostic" className="py-24 relative border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-16">
          <div
            className={`text-xs font-mono font-bold tracking-widest uppercase mb-3 ${
              isDark ? 'text-[#CCFF00]' : 'text-[#0066FF]'
            }`}
          >
            [ AIR SCORE GAP DIAGNOSTIC ]
          </div>
          <h2
            className={`text-3xl sm:text-5xl font-extrabold tracking-tight uppercase leading-[1.05] mb-4 ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}
          >
            Where Are Your Marks Leaking?
          </h2>
          <p className={`text-base leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
            Move the slider to your current mock score average. See how an AIR mentor dissects your
            path to a government medical college seat into negative mark elimination and physics numericals.
          </p>
        </div>

        <div
          className={`max-w-5xl rounded-3xl p-6 sm:p-10 border transition-all ${
            isDark
              ? 'bg-zinc-950 border-zinc-800 shadow-2xl'
              : 'bg-white border-slate-200 shadow-md'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Input Controls */}
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label
                    className={`text-xs font-mono font-bold uppercase tracking-wider ${
                      isDark ? 'text-zinc-300' : 'text-slate-700'
                    }`}
                  >
                    Current Mock Score
                  </label>
                  <span
                    className={`text-2xl font-extrabold font-mono ${
                      isDark ? 'text-[#CCFF00]' : 'text-[#0066FF]'
                    }`}
                  >
                    {currentScore}{' '}
                    <span className="text-xs font-sans text-zinc-500 font-normal">/ 720</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="350"
                  max="680"
                  step="5"
                  value={currentScore}
                  onChange={(e) => setCurrentScore(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#CCFF00]"
                />
                <div className="flex justify-between text-[11px] text-zinc-500 mt-2 font-mono">
                  <span>350</span>
                  <span>500</span>
                  <span>600</span>
                  <span>680</span>
                </div>
              </div>

              <div>
                <label
                  className={`block text-xs font-mono font-bold uppercase tracking-wider mb-3 ${
                    isDark ? 'text-zinc-300' : 'text-slate-700'
                  }`}
                >
                  Target Medical Institution
                </label>
                <div className="space-y-2.5">
                  {(Object.keys(targets) as Array<keyof typeof targets>).map((key) => {
                    const item = targets[key];
                    const isSelected = targetCollege === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setTargetCollege(key)}
                        className={`w-full p-3.5 rounded-xl text-left text-xs font-mono flex items-center justify-between transition-all border ${
                          isSelected
                            ? isDark
                              ? 'bg-[#CCFF00]/10 border-[#CCFF00] text-[#CCFF00] font-bold'
                              : 'bg-[#0066FF]/10 border-[#0066FF] text-[#0066FF] font-bold'
                            : isDark
                            ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span>{item.name}</span>
                        <span className="font-bold">{item.cutoff}+</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Diagnostic Output Card */}
            <div
              className={`p-8 rounded-2xl border flex flex-col justify-between ${
                isDark
                  ? 'bg-zinc-900 border-zinc-800'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <div
                  className={`flex items-center gap-2 text-xs font-mono font-semibold mb-4 ${
                    isDark ? 'text-[#CCFF00]' : 'text-[#0066FF]'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>AIR STRATEGY BREAKDOWN</span>
                </div>

                <div className="mb-6">
                  <div className="text-4xl sm:text-5xl font-extrabold tracking-tight font-mono mb-1">
                    +{gap}{' '}
                    <span className="text-sm font-sans font-normal text-zinc-500">marks gap</span>
                  </div>
                  <div className="text-xs text-zinc-400">
                    Required for admission in {selectedTarget.name}
                  </div>
                </div>

                <div className="space-y-3 mb-8 text-xs font-mono">
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isDark
                        ? 'bg-black/50 border-zinc-800'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <span className={isDark ? 'text-zinc-300' : 'text-slate-700'}>
                      Negative Mark Elimination (Silly Errors)
                    </span>
                    <span className="font-bold text-emerald-400">+{negativeMarkSavings} Marks</span>
                  </div>

                  <div
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isDark
                        ? 'bg-black/50 border-zinc-800'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <span className={isDark ? 'text-zinc-300' : 'text-slate-700'}>
                      Physics & Chem Numericals Mastery
                    </span>
                    <span className={`font-bold ${isDark ? 'text-[#CCFF00]' : 'text-[#0066FF]'}`}>
                      +{conceptualBoost} Marks
                    </span>
                  </div>

                  <div
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isDark
                        ? 'bg-black/50 border-zinc-800'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <span className={isDark ? 'text-zinc-300' : 'text-slate-700'}>
                      Recommended Mentoring Frequency
                    </span>
                    <span className="font-bold">2 Audits / Wk</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onOpenBooking}
                className={`w-full py-3.5 rounded-xl font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  isDark
                    ? 'bg-[#CCFF00] text-black hover:bg-[#b8e600]'
                    : 'bg-[#0066FF] text-white hover:bg-[#0052cc]'
                }`}
              >
                <span>Audit My Paper With An AIR Mentor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
