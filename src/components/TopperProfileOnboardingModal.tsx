import React, { useState } from 'react';
import {
  Trophy,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  GraduationCap,
  Award,
  BookOpen,
  School,
  Clock,
  Layers,
  HelpCircle,
} from 'lucide-react';
import {
  type TopperProfile,
  type Gender,
  type LanguageOption,
  type CoachingMode,
  type MonthlyAvailability,
} from '../types/topper.ts';
import {
  saveTopperProfile,
  loadMonthlyAvailability,
  saveMonthlyAvailability,
} from '../utils/topperStorage.ts';
import { TopperMonthlySlotManager } from './TopperMonthlySlotManager.tsx';

interface TopperProfileOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (profile: TopperProfile) => void;
  initialProfile: TopperProfile;
  theme: 'dark' | 'light';
}

const POPULAR_COLLEGES = [
  'AIIMS New Delhi',
  'MAMC New Delhi',
  'VMMC & Safdarjung Hospital',
  'JIPMER Puducherry',
  'AFMC Pune',
  'King George’s Medical University (KGMU)',
  'SMS Medical College Jaipur',
  'Grant Medical College Mumbai',
  'Madras Medical College Chennai',
];

export const TopperProfileOnboardingModal: React.FC<TopperProfileOnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialProfile,
  theme,
}) => {
  const isDark = theme === 'dark';
  const [step, setStep] = useState<1 | 2>(1);

  // Form states matching all 11 required fields
  const [name, setName] = useState(initialProfile.name || '');
  const [gender, setGender] = useState<Gender>(initialProfile.gender || 'Male');
  const [yearOfNeet, setYearOfNeet] = useState(initialProfile.yearOfNeet || '2024');
  const [numberOfAttempts, setNumberOfAttempts] = useState(initialProfile.numberOfAttempts || '1st Attempt');
  const [language, setLanguage] = useState<LanguageOption>(initialProfile.language || 'Both');
  const [currentCollege, setCurrentCollege] = useState(initialProfile.currentCollege || 'AIIMS New Delhi');
  const [airRank, setAirRank] = useState(initialProfile.airRank || '');
  const [coachingMode, setCoachingMode] = useState<CoachingMode>(initialProfile.coachingMode || 'Classroom / Offline');
  const [coachingName, setCoachingName] = useState(initialProfile.coachingName || 'Allen Kota');

  // Subject-wise marks
  const [physicsMarks, setPhysicsMarks] = useState<number>(initialProfile.subjectWiseMarks?.physics ?? 175);
  const [chemistryMarks, setChemistryMarks] = useState<number>(initialProfile.subjectWiseMarks?.chemistry ?? 175);
  const [biologyMarks, setBiologyMarks] = useState<number>(initialProfile.subjectWiseMarks?.biology ?? 350);

  const [validationError, setValidationError] = useState<string | null>(null);

  // Monthly availability for step 2
  const [availability, setAvailability] = useState<MonthlyAvailability>(() =>
    loadMonthlyAvailability(initialProfile.id)
  );

  if (!isOpen) return null;

  // Auto-calculated total marks from subject-wise marks
  const calculatedTotalMarks = Number(physicsMarks || 0) + Number(chemistryMarks || 0) + Number(biologyMarks || 0);

  const validateStep1 = () => {
    if (!name.trim()) {
      setValidationError('Please enter your full name.');
      return false;
    }
    if (!airRank.trim()) {
      setValidationError('Please specify your NEET All India Rank (AIR).');
      return false;
    }
    if (!currentCollege.trim()) {
      setValidationError('Please specify your current MBBS Medical College.');
      return false;
    }
    if (physicsMarks < 0 || physicsMarks > 180) {
      setValidationError('Physics marks must be between 0 and 180.');
      return false;
    }
    if (chemistryMarks < 0 || chemistryMarks > 180) {
      setValidationError('Chemistry marks must be between 0 and 180.');
      return false;
    }
    if (biologyMarks < 0 || biologyMarks > 360) {
      setValidationError('Biology marks must be between 0 and 360.');
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleProceedToSlots = () => {
    if (!validateStep1()) return;
    setStep(2);
  };

  const handleFinalFinish = () => {
    const updatedProfile: TopperProfile = {
      ...initialProfile,
      name: name.trim(),
      gender,
      yearOfNeet,
      numberOfAttempts,
      language,
      currentCollege: currentCollege.trim(),
      airRank: airRank.trim(),
      totalMarks: calculatedTotalMarks,
      coachingMode,
      coachingName: coachingName.trim(),
      subjectWiseMarks: {
        physics: Number(physicsMarks),
        chemistry: Number(chemistryMarks),
        biology: Number(biologyMarks),
      },
      isProfileComplete: true,
    };

    saveTopperProfile(updatedProfile);
    saveMonthlyAvailability(availability);
    onComplete(updatedProfile);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border p-5 sm:p-8 shadow-2xl relative transition-all my-auto ${
          isDark
            ? 'bg-[#0f0f13] border-zinc-800 text-white shadow-black/80'
            : 'bg-white border-slate-200 text-slate-900 shadow-xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Step Progress */}
        <div className="flex items-center justify-between pb-5 border-b border-zinc-800/80 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-tr from-purple-600 to-amber-500 text-black font-black">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest font-bold text-[#CCFF00]">
                Welcome Topper · AIR NEETwork Mentor Onboarding
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                {step === 1 ? 'Step 1 of 2: Your NEET & College Profile' : 'Step 2 of 2: Free Slots for Next Month'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDark
                ? 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                : 'border-slate-200 bg-slate-100 text-slate-500 hover:text-slate-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps Navigation Bar */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div
            className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
              step === 1
                ? isDark
                  ? 'bg-purple-950/40 border-purple-500 text-white'
                  : 'bg-blue-50 border-blue-500 text-blue-900'
                : isDark
                ? 'bg-zinc-900/40 border-zinc-800 text-zinc-400'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                step === 1 ? 'bg-purple-500 text-white' : 'bg-zinc-700 text-zinc-300'
              }`}
            >
              1
            </span>
            <div className="text-left">
              <div className="text-xs font-bold font-mono uppercase">NEET Score & Details</div>
              <div className="text-[10px] opacity-70">11 Required Info Fields</div>
            </div>
          </div>

          <div
            className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
              step === 2
                ? isDark
                  ? 'bg-emerald-950/40 border-emerald-500 text-white'
                  : 'bg-emerald-50 border-emerald-500 text-emerald-900'
                : isDark
                ? 'bg-zinc-900/40 border-zinc-800 text-zinc-400'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                step === 2 ? 'bg-emerald-500 text-black' : 'bg-zinc-700 text-zinc-300'
              }`}
            >
              2
            </span>
            <div className="text-left">
              <div className="text-xs font-bold font-mono uppercase">Monthly Free Slots</div>
              <div className="text-[10px] opacity-70">Next 30 Days Availability</div>
            </div>
          </div>
        </div>

        {validationError && (
          <div className="p-3 mb-5 rounded-xl border border-red-500/50 bg-red-950/30 text-red-300 text-xs font-mono">
            ⚠️ {validationError}
          </div>
        )}

        {/* STEP 1: All 11 Required Fields */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Field 1: Name */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  1. Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Akshat Sharma"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#CCFF00] ${
                    isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {/* Field 2: Gender */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  2. Gender *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Male', 'Female', 'Other'] as Gender[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                        gender === g
                          ? isDark
                            ? 'bg-[#CCFF00] text-black border-[#CCFF00]'
                            : 'bg-[#0066FF] text-white border-[#0066FF]'
                          : isDark
                          ? 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                          : 'bg-slate-50 border-slate-300 text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 3: Year of NEET */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  3. Year of NEET *
                </label>
                <select
                  value={yearOfNeet}
                  onChange={(e) => setYearOfNeet(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#CCFF00] ${
                    isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="2025">NEET 2025</option>
                  <option value="2024">NEET 2024</option>
                  <option value="2023">NEET 2023</option>
                  <option value="2022">NEET 2022</option>
                  <option value="2021">NEET 2021</option>
                </select>
              </div>

              {/* Field 4: Number of Attempts */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  4. Number of Attempts *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['1st Attempt', '2nd Attempt', '3rd+ Attempt'].map((att) => (
                    <button
                      key={att}
                      type="button"
                      onClick={() => setNumberOfAttempts(att)}
                      className={`py-2 px-2 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer text-center ${
                        numberOfAttempts === att
                          ? isDark
                            ? 'bg-purple-500 text-white border-purple-400'
                            : 'bg-purple-600 text-white border-purple-600'
                          : isDark
                          ? 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                          : 'bg-slate-50 border-slate-300 text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {att}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 5: Language (H/E, both) */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  5. Mentoring Language (H / E / Both) *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { code: 'H', label: 'Hindi (H)' },
                    { code: 'E', label: 'English (E)' },
                    { code: 'Both', label: 'Both (H / E)' },
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setLanguage(lang.code as LanguageOption)}
                      className={`py-2 px-2 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer text-center ${
                        language === lang.code
                          ? isDark
                            ? 'bg-sky-500 text-black border-sky-400 font-black'
                            : 'bg-sky-600 text-white border-sky-600'
                          : isDark
                          ? 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                          : 'bg-slate-50 border-slate-300 text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 6: AIR (All India Rank) */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  6. All India Rank (AIR) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-mono font-bold text-[#CCFF00]">
                    AIR
                  </span>
                  <input
                    type="text"
                    value={airRank}
                    onChange={(e) => setAirRank(e.target.value.replace(/^air\s*/i, ''))}
                    placeholder="e.g. 42 or 285"
                    className={`w-full pl-13 pr-4 py-2.5 rounded-xl border text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#CCFF00] ${
                      isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Field 7: Current Medical College */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                7. Current MBBS Medical College *
              </label>
              <input
                type="text"
                value={currentCollege}
                onChange={(e) => setCurrentCollege(e.target.value)}
                placeholder="e.g. AIIMS New Delhi"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#CCFF00] mb-2 ${
                  isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_COLLEGES.slice(0, 5).map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setCurrentCollege(col)}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-md border border-zinc-700/60 text-zinc-400 hover:text-white hover:border-zinc-500 cursor-pointer"
                  >
                    + {col}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 8 & 9: Coaching Mode & Coaching Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  8. Coaching Mode *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Self-Study', 'Classroom / Offline', 'Online', 'Hybrid'] as CoachingMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setCoachingMode(mode)}
                      className={`py-2 px-2 rounded-xl border text-[11px] font-mono font-bold transition-all cursor-pointer text-center ${
                        coachingMode === mode
                          ? isDark
                            ? 'bg-purple-500 text-white border-purple-400'
                            : 'bg-purple-600 text-white border-purple-600'
                          : isDark
                          ? 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                          : 'bg-slate-50 border-slate-300 text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  9. Coaching Name / Institute *
                </label>
                <input
                  type="text"
                  value={coachingName}
                  onChange={(e) => setCoachingName(e.target.value)}
                  placeholder="e.g. Allen Kota, Aakash, PW, Self"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#CCFF00] ${
                    isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            {/* Field 10 & 11: Subject-Wise Marks & Auto Total Marks */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border ${
                isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-100/70 border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#CCFF00]">
                  10. Subject-Wise Marks & 11. Total Marks (out of 720)
                </span>
                <div className="px-3 py-1 rounded-xl bg-purple-500/20 border border-purple-400/50 text-purple-300 font-mono text-xs font-black">
                  Total: {calculatedTotalMarks} / 720
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                    Physics (Max 180)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="180"
                    value={physicsMarks}
                    onChange={(e) => setPhysicsMarks(Number(e.target.value))}
                    className={`w-full px-3 py-2 rounded-xl border text-sm font-mono font-bold ${
                      isDark ? 'bg-black border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                    Chemistry (Max 180)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="180"
                    value={chemistryMarks}
                    onChange={(e) => setChemistryMarks(Number(e.target.value))}
                    className={`w-full px-3 py-2 rounded-xl border text-sm font-mono font-bold ${
                      isDark ? 'bg-black border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                    Biology / Bio (Max 360)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="360"
                    value={biologyMarks}
                    onChange={(e) => setBiologyMarks(Number(e.target.value))}
                    className={`w-full px-3 py-2 rounded-xl border text-sm font-mono font-bold ${
                      isDark ? 'bg-black border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions for Step 1 */}
            <div className="flex items-center justify-end pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={handleProceedToSlots}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg active:scale-95 ${
                  isDark
                    ? 'bg-[#CCFF00] text-black hover:bg-[#d8ff33]'
                    : 'bg-[#0066FF] text-white hover:bg-[#0052cc]'
                }`}
              >
                <span>Proceed to Free Slots Setup</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Monthly Free Slots Availability Mechanism */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Profile Details</span>
              </button>

              <span className="text-xs font-mono text-[#CCFF00]">
                Configure when aspirants can request 1-on-1 strategy calls
              </span>
            </div>

            <TopperMonthlySlotManager
              availability={availability}
              onSave={(updated) => setAvailability(updated)}
              theme={theme}
            />

            {/* Final Submission Action */}
            <div className="flex items-center justify-between pt-5 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`px-4 py-2.5 rounded-xl border text-xs font-mono transition-colors cursor-pointer ${
                  isDark ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                ← Back
              </button>

              <button
                type="button"
                onClick={handleFinalFinish}
                className={`flex items-center gap-2 px-8 py-3.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-xl active:scale-95 ${
                  isDark
                    ? 'bg-[#CCFF00] text-black hover:bg-[#d8ff33]'
                    : 'bg-[#0066FF] text-white hover:bg-[#0052cc]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Onboarding & Enter Dashboard</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
