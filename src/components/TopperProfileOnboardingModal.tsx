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
  Search,
  ChevronDown,
  User,
  Phone,
  Camera,
  Check,
  Zap,
} from 'lucide-react';
import {
  type TopperProfile,
  type Gender,
  type LanguageOption,
  type CoachingMode,
  type MonthlyAvailability,
  calculateSessionRateByAir,
} from '../types/topper.ts';
import {
  saveTopperProfile,
  loadMonthlyAvailability,
  saveMonthlyAvailability,
  TOP_COACHING_INSTITUTES,
  AVATAR_PRESETS,
  STANDARD_SLOTS,
  getNextMonthDays,
  getAllRegisteredToppers,
  isSameTopper,
} from '../utils/topperStorage.ts';

interface TopperProfileOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (profile: TopperProfile) => void;
  onBackToSignUp?: () => void;
  initialProfile: TopperProfile;
  theme: 'dark' | 'light';
}

const POPULAR_COLLEGES = [
  'AIIMS New Delhi',
  'Maulana Azad Medical College (MAMC), New Delhi',
  'VMMC & Safdarjung Hospital, New Delhi',
  'King George’s Medical University (KGMU), Lucknow',
  'JIPMER Puducherry',
  'AFMC Pune',
  'SMS Medical College, Jaipur',
  'Grant Medical College, Mumbai',
  'Madras Medical College, Chennai',
  'Government Medical College (GMC) Chandigarh',
];

const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const TopperProfileOnboardingModal: React.FC<TopperProfileOnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  onBackToSignUp,
  initialProfile,
  theme,
}) => {
  const isDark = theme === 'dark';
  // 3 Distinct sequential pages
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // PAGE 1: Personal Details
  const [name, setName] = useState(initialProfile.name || '');
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatarUrl || AVATAR_PRESETS[0].url);
  const [gender, setGender] = useState<Gender>(initialProfile.gender || 'Male');
  const [currentCollege, setCurrentCollege] = useState(initialProfile.currentCollege || 'AIIMS New Delhi');
  const [language, setLanguage] = useState<LanguageOption>(initialProfile.language || 'Both');
  const [phone, setPhone] = useState(initialProfile.phone || '');

  // PAGE 2: Mentoring & NEET Credentials
  const [airRank, setAirRank] = useState(initialProfile.airRank || '48');
  const [yearOfNeet, setYearOfNeet] = useState(initialProfile.yearOfNeet || '2024');
  const [numberOfAttempts, setNumberOfAttempts] = useState(initialProfile.numberOfAttempts || '1st Attempt');
  const [coachingMode, setCoachingMode] = useState<CoachingMode>(initialProfile.coachingMode || 'Classroom / Offline');
  
  // Searchable Coaching Dropdown
  const [coachingSearch, setCoachingSearch] = useState('');
  const [selectedCoaching, setSelectedCoaching] = useState(
    TOP_COACHING_INSTITUTES.includes(initialProfile.coachingName)
      ? initialProfile.coachingName
      : initialProfile.coachingName ? 'Other (Enter Custom Institute)' : TOP_COACHING_INSTITUTES[0]
  );
  const [customCoachingName, setCustomCoachingName] = useState(
    !TOP_COACHING_INSTITUTES.includes(initialProfile.coachingName) && initialProfile.coachingName
      ? initialProfile.coachingName
      : ''
  );
  const [isCoachingDropdownOpen, setIsCoachingDropdownOpen] = useState(false);

  // Subject-wise marks
  const [physicsMarks, setPhysicsMarks] = useState<number>(initialProfile.subjectWiseMarks?.physics ?? 175);
  const [chemistryMarks, setChemistryMarks] = useState<number>(initialProfile.subjectWiseMarks?.chemistry ?? 175);
  const [biologyMarks, setBiologyMarks] = useState<number>(initialProfile.subjectWiseMarks?.biology ?? 360);
  const [bio, setBio] = useState(initialProfile.bio || '');

  // PAGE 3: Simplified Monthly Slot Availability
  // We allow an intuitive weekly pattern + date overrides instead of a complex matrix
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Wed', 'Fri', 'Sat', 'Sun']);
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>(['e1', 'e2', 'n1']); // Evening & Night default
  const [disabledDates, setDisabledDates] = useState<Set<string>>(new Set());

  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real-time calculated rate based on AIR
  const calculatedRate = calculateSessionRateByAir(airRank);
  const calculatedTotalMarks = Number(physicsMarks || 0) + Number(chemistryMarks || 0) + Number(biologyMarks || 0);

  // Filter coaching institutes based on search query
  const filteredInstitutes = TOP_COACHING_INSTITUTES.filter((inst) =>
    inst.toLowerCase().includes(coachingSearch.toLowerCase())
  );

  // Check if name or initialProfile matches an existing verified card in the database
  const matchedVerifiedCard = React.useMemo(() => {
    const all = getAllRegisteredToppers();
    return all.find((t) => isSameTopper(t, { name, email: initialProfile.email, id: initialProfile.id }));
  }, [name, initialProfile]);

  const validatePage1 = () => {
    if (!name.trim()) {
      setValidationError('Please enter your full legal name.');
      return false;
    }
    if (!currentCollege.trim()) {
      setValidationError('Please specify your current Medical College (MBBS institution).');
      return false;
    }
    setValidationError(null);
    return true;
  };

  const validatePage2 = () => {
    if (!airRank.trim()) {
      setValidationError('Please specify your NEET All India Rank (AIR).');
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
    if (selectedCoaching === 'Other (Enter Custom Institute)' && !customCoachingName.trim()) {
      setValidationError('Please enter your custom coaching institute name.');
      return false;
    }
    setValidationError(null);
    return true;
  };

  // Build finalized MonthlyAvailability structure from the simplified weekly pattern
  const buildFinalizedAvailability = (): MonthlyAvailability => {
    const rawDays = getNextMonthDays();
    const daysRecord: Record<string, any> = {};

    rawDays.forEach((day) => {
      const isDayActive = selectedDays.includes(day.dayOfWeek);
      const isDateDisabled = disabledDates.has(day.dateStr);

      daysRecord[day.dateStr] = {
        ...day,
        enabledSlots: isDayActive && !isDateDisabled ? [...selectedSlotIds] : [],
      };
    });

    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(now.getMonth() + 1);
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return {
      topperId: initialProfile.id,
      monthName: `${monthNames[now.getMonth()]} – ${monthNames[nextMonth.getMonth()]} ${nextMonth.getFullYear()}`,
      days: daysRecord,
      updatedAt: new Date().toISOString(),
    };
  };

  // Count active slots in next 30 days
  const activeDaysList = getNextMonthDays();
  const totalActiveSlots = activeDaysList.reduce((acc, day) => {
    if (selectedDays.includes(day.dayOfWeek) && !disabledDates.has(day.dateStr)) {
      return acc + selectedSlotIds.length;
    }
    return acc;
  }, 0);

  const handleFinalFinish = () => {
    const finalCoachingName =
      selectedCoaching === 'Other (Enter Custom Institute)'
        ? customCoachingName.trim()
        : selectedCoaching;

    const updatedProfile: TopperProfile = {
      ...initialProfile,
      name: name.trim(),
      avatarUrl,
      gender,
      yearOfNeet,
      numberOfAttempts,
      language,
      currentCollege: currentCollege.trim(),
      airRank: airRank.trim(),
      totalMarks: calculatedTotalMarks,
      coachingMode,
      coachingName: finalCoachingName,
      subjectWiseMarks: {
        physics: Number(physicsMarks),
        chemistry: Number(chemistryMarks),
        biology: Number(biologyMarks),
      },
      phone: phone.trim(),
      bio: bio.trim() || `NEET ${yearOfNeet} Ranker at ${currentCollege}. Mentors aspirants on strategic speed, high-yield chapters, and negative marking elimination.`,
      sessionRate: calculatedRate.rate,
      sessionRateDisplay: calculatedRate.display,
      isProfileComplete: true,
    };

    saveTopperProfile(updatedProfile);
    const availability = buildFinalizedAvailability();
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
        className={`w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl border p-5 sm:p-8 shadow-2xl relative transition-all my-auto ${
          isDark
            ? 'bg-[#0f0f13] border-zinc-800 text-white shadow-black/80'
            : 'bg-white border-slate-200 text-slate-900 shadow-xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-tr from-blue-600 to-sky-400 text-white font-black shadow-sm">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <div
                className={`text-[10px] font-mono uppercase tracking-widest font-bold ${
                  isDark ? 'text-[#3B82F6]' : 'text-[#0066FF]'
                }`}
              >
                AIR NEETwork · Ranker Onboarding
              </div>
              <h2
                className={`text-xl sm:text-2xl font-black tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {step === 1 && 'Page 1 of 3: Personal & College Details'}
                {step === 2 && 'Page 2 of 3: NEET Credentials & Honorarium'}
                {step === 3 && 'Page 3 of 3: Monthly Free Slots Availability'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {step === 1 && onBackToSignUp && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBackToSignUp();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                  isDark
                    ? 'border-zinc-700 bg-zinc-800/80 text-zinc-300 hover:text-white'
                    : 'border-slate-300 bg-slate-100 text-slate-700 hover:text-slate-900'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Back to Sign Up</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isDark
                  ? 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                  : 'border-slate-200 bg-slate-100 text-slate-500 hover:text-slate-900'
              }`}
              title="Close modal"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3-Step Wizard Navigation Indicator */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
          {[
            { num: 1, label: 'Personal & College', desc: 'Identity & MBBS Info' },
            { num: 2, label: 'NEET Credentials', desc: 'AIR, Marks & Coaching' },
            { num: 3, label: 'Monthly Slots', desc: 'Next Month Schedule' },
          ].map((s) => {
            const isActive = step === s.num;
            const isCompleted = step > s.num;

            return (
              <div
                key={s.num}
                className={`p-2.5 sm:p-3 rounded-xl border flex items-center gap-2 sm:gap-3 transition-all ${
                  isActive
                    ? isDark
                      ? 'bg-amber-400/10 border-amber-400 text-amber-300'
                      : 'bg-blue-50 border-[#0066FF] text-[#0066FF]'
                    : isCompleted
                    ? isDark
                      ? 'bg-emerald-950/20 border-emerald-500/50 text-emerald-300'
                      : 'bg-emerald-50 border-emerald-400 text-emerald-800'
                    : isDark
                    ? 'bg-zinc-900/40 border-zinc-800 text-zinc-500'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono shrink-0 ${
                    isActive
                      ? isDark
                        ? 'bg-amber-400 text-black'
                        : 'bg-[#0066FF] text-white'
                      : isCompleted
                      ? 'bg-emerald-500 text-black'
                      : isDark
                      ? 'bg-zinc-800 text-zinc-400'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.num}
                </div>
                <div className="truncate text-left">
                  <div
                    className={`text-xs font-bold font-mono truncate ${
                      isActive
                        ? isDark ? 'text-amber-300' : 'text-[#0066FF]'
                        : isCompleted
                        ? isDark ? 'text-emerald-300' : 'text-emerald-800'
                        : isDark ? 'text-zinc-300' : 'text-slate-700'
                    }`}
                  >
                    {s.label}
                  </div>
                  <div
                    className={`hidden sm:block text-[10px] truncate ${
                      isDark ? 'text-zinc-400' : 'text-slate-500'
                    }`}
                  >
                    {s.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {validationError && (
          <div className="p-3 mb-5 rounded-xl border border-red-500/50 bg-red-950/30 text-red-400 text-xs font-mono">
            ⚠️ {validationError}
          </div>
        )}

        {/* ================= PAGE 1: PERSONAL DETAILS ================= */}
        {step === 1 && (
          <div className="space-y-5">
            {/* Field 1: Full Legal Name */}
            <div>
              <label
                className={`block text-xs font-mono font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? 'text-zinc-300' : 'text-slate-700'
                }`}
              >
                1. Full Legal Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Aryan Sharma"
                required
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none transition-all ${
                  isDark
                    ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500 focus:border-[#3B82F6]'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-[#0066FF]'
                }`}
              />

              {/* Verified AIR card detected notification & 1-click sync */}
              {matchedVerifiedCard && (
                <div
                  className={`mt-2.5 p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all ${
                    isDark
                      ? 'bg-emerald-950/25 border-emerald-500/40 text-emerald-200'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs">
                      <strong>Verified AIR Card Linked:</strong> {matchedVerifiedCard.name} (AIR {matchedVerifiedCard.airRank} · {matchedVerifiedCard.currentCollege})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 uppercase tracking-wider font-bold">
                      Zero Duplicates
                    </span>
                    {matchedVerifiedCard.name !== name && (
                      <button
                        type="button"
                        onClick={() => {
                          setName(matchedVerifiedCard.name);
                          if (matchedVerifiedCard.avatarUrl) setAvatarUrl(matchedVerifiedCard.avatarUrl);
                          if (matchedVerifiedCard.currentCollege) setCurrentCollege(matchedVerifiedCard.currentCollege);
                          if (matchedVerifiedCard.airRank) setAirRank(matchedVerifiedCard.airRank);
                          if (matchedVerifiedCard.subjectWiseMarks) {
                            setPhysicsMarks(matchedVerifiedCard.subjectWiseMarks.physics);
                            setChemistryMarks(matchedVerifiedCard.subjectWiseMarks.chemistry);
                            setBiologyMarks(matchedVerifiedCard.subjectWiseMarks.biology);
                          }
                          if (matchedVerifiedCard.coachingName) {
                            setSelectedCoaching(
                              TOP_COACHING_INSTITUTES.includes(matchedVerifiedCard.coachingName)
                                ? matchedVerifiedCard.coachingName
                                : 'Other (Enter Custom Institute)'
                            );
                            if (!TOP_COACHING_INSTITUTES.includes(matchedVerifiedCard.coachingName)) {
                              setCustomCoachingName(matchedVerifiedCard.coachingName);
                            }
                          }
                        }}
                        className="text-[11px] font-bold underline cursor-pointer hover:opacity-80"
                      >
                        Auto-fill Verified Details
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Field 2: Profile Picture / Avatar Presets */}
            <div>
              <label
                className={`block text-xs font-mono font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? 'text-zinc-300' : 'text-slate-700'
                }`}
              >
                2. Profile Picture / Avatar *
              </label>

              {/* Verified Sourced Photo Preview if active */}
              {avatarUrl && !AVATAR_PRESETS.some((preset) => preset.url === avatarUrl) && (
                <div
                  className={`mb-3.5 p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                    isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={avatarUrl}
                      alt="Verified profile avatar"
                      className="w-12 h-12 rounded-xl object-cover object-top border-2 border-emerald-500 shadow-sm"
                    />
                    <div>
                      <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified Photograph Active
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        Your official photograph from the cards is preserved. You can keep this or select an avatar below.
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 uppercase tracking-wider font-bold shrink-0">
                    Preserved
                  </span>
                </div>
              )}

              <p className={`text-xs mb-3 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                Choose an official medical avatar to display on your mentor spotlight card.
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {AVATAR_PRESETS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setAvatarUrl(av.url)}
                    className={`relative rounded-2xl p-1 border-2 transition-all cursor-pointer overflow-hidden group ${
                      avatarUrl === av.url
                        ? isDark
                          ? 'border-[#3B82F6] scale-105 shadow-md shadow-[#3B82F6]/20'
                          : 'border-[#0066FF] scale-105 shadow-md shadow-[#0066FF]/20'
                        : isDark
                        ? 'border-zinc-800 hover:border-zinc-600'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <img
                      src={av.url}
                      alt={av.label}
                      className="w-full aspect-square object-cover rounded-xl"
                    />
                    {avatarUrl === av.url && (
                      <div className="absolute top-1 right-1 bg-[#3B82F6] text-white p-0.5 rounded-full">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Field 3: Gender */}
              <div>
                <label
                  className={`block text-xs font-mono font-bold uppercase tracking-wider mb-1.5 ${
                    isDark ? 'text-zinc-300' : 'text-slate-700'
                  }`}
                >
                  3. Gender *
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
                            ? 'bg-[#3B82F6] text-white border-[#3B82F6]'
                            : 'bg-[#0066FF] text-white border-[#0066FF]'
                          : isDark
                          ? 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                          : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 4: Mentoring Language */}
              <div>
                <label
                  className={`block text-xs font-mono font-bold uppercase tracking-wider mb-1.5 ${
                    isDark ? 'text-zinc-300' : 'text-slate-700'
                  }`}
                >
                  4. Mentoring Language *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 'Both' as LanguageOption, label: 'Both (H & E)' },
                    { val: 'E' as LanguageOption, label: 'English Only' },
                    { val: 'H' as LanguageOption, label: 'Hindi Only' },
                  ].map((l) => (
                    <button
                      key={l.val}
                      type="button"
                      onClick={() => setLanguage(l.val)}
                      className={`py-2 px-2 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                        language === l.val
                          ? isDark
                            ? 'bg-[#3B82F6] text-white border-[#3B82F6]'
                            : 'bg-[#0066FF] text-white border-[#0066FF]'
                          : isDark
                          ? 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                          : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Field 5: Current Medical College (MBBS Institution) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  className={`block text-xs font-mono font-bold uppercase tracking-wider ${
                    isDark ? 'text-zinc-300' : 'text-slate-700'
                  }`}
                >
                  5. Current Medical College (MBBS Institution) *
                </label>
                <span className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Type manually or pick from popular institutions
                </span>
              </div>
              <input
                type="text"
                value={currentCollege}
                onChange={(e) => setCurrentCollege(e.target.value)}
                placeholder="e.g. AIIMS New Delhi / Maulana Azad Medical College"
                required
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none transition-all mb-2 ${
                  isDark
                    ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500 focus:border-[#3B82F6]'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-[#0066FF]'
                }`}
              />

              {/* Quick Suggestion Chips */}
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_COLLEGES.slice(0, 5).map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setCurrentCollege(col)}
                    className={`text-[10px] font-mono px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                      currentCollege === col
                        ? isDark
                          ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-bold'
                          : 'bg-blue-100 border-[#0066FF] text-[#0066FF] font-bold'
                        : isDark
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    + {col.split('(')[0].trim()}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 6: WhatsApp / Contact Number */}
            <div>
              <label
                className={`block text-xs font-mono font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? 'text-zinc-300' : 'text-slate-700'
                }`}
              >
                6. Contact Phone / WhatsApp Number (For Session Confirmations)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none transition-all ${
                  isDark
                    ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500 focus:border-[#3B82F6]'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-[#0066FF]'
                }`}
              />
              <p className={`text-[11px] mt-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Used strictly for session dispatch reminders and student meet coordination.
              </p>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (validatePage1()) setStep(2);
                }}
                className={`px-6 py-3 rounded-xl font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 ${
                  isDark
                    ? 'bg-[#3B82F6] text-white hover:bg-[#2563EB]'
                    : 'bg-[#0066FF] text-white hover:bg-[#0052cc]'
                }`}
              >
                <span>Continue to Page 2 (NEET Credentials)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= PAGE 2: MENTORING & NEET CREDENTIALS ================= */}
        {step === 2 && (
          <div className="space-y-5">
            {/* Field 7: All India Rank (AIR) + Live Calculated Session Fee Callout */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                isDark
                  ? 'bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border-amber-400/40'
                  : 'bg-amber-50/80 border-amber-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <label
                    className={`block text-xs font-mono font-bold uppercase tracking-wider mb-1 ${
                      isDark ? 'text-amber-300' : 'text-amber-950'
                    }`}
                  >
                    7. All India Rank (AIR in NEET UG) *
                  </label>
                  <p className={`text-xs ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
                    Enter your numeric rank. Session rates are strictly determined by this rank bracket.
                  </p>
                </div>

                <div
                  className={`px-3 py-1.5 rounded-xl border font-mono text-center shrink-0 ${
                    isDark
                      ? 'bg-black/60 border-amber-400/50 text-amber-300'
                      : 'bg-white border-amber-400 text-amber-900 shadow-sm'
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold text-zinc-400">Fixed Rate</div>
                  <div className="text-base font-black text-[#60A5FA]">{calculatedRate.display}</div>
                  <div className="text-[9px] opacity-75">/ 1-on-1 session</div>
                </div>
              </div>

              <input
                type="text"
                value={airRank}
                onChange={(e) => setAirRank(e.target.value)}
                placeholder="e.g. 48 or 112"
                required
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono font-bold focus:outline-none transition-all ${
                  isDark
                    ? 'bg-zinc-900 border-zinc-700 text-white focus:border-amber-400'
                    : 'bg-white border-amber-300 text-slate-900 focus:border-amber-500'
                }`}
              />

              {/* Bracket explanation */}
              <div
                className={`mt-2 text-[11px] font-mono flex items-center justify-between ${
                  isDark ? 'text-zinc-400' : 'text-slate-600'
                }`}
              >
                <span>AIR 1–10: ₹1,500/₹1,999</span>
                <span>AIR 10–100: ₹1,299</span>
                <span>AIR 100–500: ₹1,199</span>
                <span>AIR 500–1000: ₹1,000</span>
                <span>&gt;1000: ₹900</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Field 8: Year of NEET */}
              <div>
                <label
                  className={`block text-xs font-mono font-bold uppercase tracking-wider mb-1.5 ${
                    isDark ? 'text-zinc-300' : 'text-slate-700'
                  }`}
                >
                  8. Year of NEET *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['2024', '2023', '2022', '2021'].map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setYearOfNeet(y)}
                      className={`py-2 px-2 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                        yearOfNeet === y
                          ? isDark
                            ? 'bg-[#3B82F6] text-white border-[#3B82F6]'
                            : 'bg-[#0066FF] text-white border-[#0066FF]'
                          : isDark
                          ? 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                          : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 9: Number of Attempts */}
              <div>
                <label
                  className={`block text-xs font-mono font-bold uppercase tracking-wider mb-1.5 ${
                    isDark ? 'text-zinc-300' : 'text-slate-700'
                  }`}
                >
                  9. Number of Attempts *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['1st Attempt', '2nd Attempt', '3rd+ Attempt'].map((att) => (
                    <button
                      key={att}
                      type="button"
                      onClick={() => setNumberOfAttempts(att)}
                      className={`py-2 px-1 text-center rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                        numberOfAttempts === att
                          ? isDark
                            ? 'bg-[#3B82F6] text-white border-[#3B82F6]'
                            : 'bg-[#0066FF] text-white border-[#0066FF]'
                          : isDark
                          ? 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                          : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {att}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Field 10: Subject-Wise Marks Breakdown */}
            <div
              className={`p-4 rounded-2xl border ${
                isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <label
                  className={`block text-xs font-mono font-bold uppercase tracking-wider ${
                    isDark ? 'text-zinc-300' : 'text-slate-700'
                  }`}
                >
                  10. Subject-Wise Marks Breakdown *
                </label>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  Total: {calculatedTotalMarks} / 720
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className={`block text-[11px] font-mono mb-1 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                    Physics (/180)
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={180}
                    value={physicsMarks}
                    onChange={(e) => setPhysicsMarks(Number(e.target.value))}
                    className={`w-full px-3 py-2 rounded-xl border text-sm font-mono font-bold focus:outline-none ${
                      isDark
                        ? 'bg-zinc-900 border-zinc-700 text-white focus:border-[#3B82F6]'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-[#0066FF]'
                    }`}
                  />
                </div>

                <div>
                  <span className={`block text-[11px] font-mono mb-1 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                    Chemistry (/180)
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={180}
                    value={chemistryMarks}
                    onChange={(e) => setChemistryMarks(Number(e.target.value))}
                    className={`w-full px-3 py-2 rounded-xl border text-sm font-mono font-bold focus:outline-none ${
                      isDark
                        ? 'bg-zinc-900 border-zinc-700 text-white focus:border-[#3B82F6]'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-[#0066FF]'
                    }`}
                  />
                </div>

                <div>
                  <span className={`block text-[11px] font-mono mb-1 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                    Biology (/360)
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={360}
                    value={biologyMarks}
                    onChange={(e) => setBiologyMarks(Number(e.target.value))}
                    className={`w-full px-3 py-2 rounded-xl border text-sm font-mono font-bold focus:outline-none ${
                      isDark
                        ? 'bg-zinc-900 border-zinc-700 text-white focus:border-[#3B82F6]'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-[#0066FF]'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Field 11: Coaching Mode & Searchable Top 10 Institutes */}
            <div className="space-y-3">
              <div>
                <label
                  className={`block text-xs font-mono font-bold uppercase tracking-wider mb-1.5 ${
                    isDark ? 'text-zinc-300' : 'text-slate-700'
                  }`}
                >
                  11. Coaching Preparation Mode *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Classroom / Offline', 'Online', 'Self-Study', 'Hybrid'] as CoachingMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setCoachingMode(mode)}
                      className={`py-2 px-2 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                        coachingMode === mode
                          ? isDark
                            ? 'bg-[#3B82F6] text-white border-[#3B82F6]'
                            : 'bg-[#0066FF] text-white border-[#0066FF]'
                          : isDark
                          ? 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                          : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Coaching Institute Name: Searchable Dropdown with Top 10 + Other */}
              <div className="relative">
                <label
                  className={`block text-xs font-mono font-bold uppercase tracking-wider mb-1.5 ${
                    isDark ? 'text-zinc-300' : 'text-slate-700'
                  }`}
                >
                  Coaching Institute Name (Top 10 Institutes or Other) *
                </label>

                {/* Dropdown Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsCoachingDropdownOpen(!isCoachingDropdownOpen)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium flex items-center justify-between text-left transition-all cursor-pointer ${
                    isDark
                      ? 'bg-zinc-900 border-zinc-700 text-white hover:border-zinc-500'
                      : 'bg-white border-slate-300 text-slate-900 hover:border-slate-400'
                  }`}
                >
                  <span className="truncate">{selectedCoaching || 'Select Coaching Institute'}</span>
                  <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isCoachingDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu with Search */}
                {isCoachingDropdownOpen && (
                  <div
                    className={`absolute z-30 left-0 right-0 mt-1.5 p-2 rounded-2xl border shadow-2xl backdrop-blur-xl ${
                      isDark ? 'bg-[#18181b] border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    {/* Search Input */}
                    <div className="relative mb-2">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-400" />
                      <input
                        type="text"
                        value={coachingSearch}
                        onChange={(e) => setCoachingSearch(e.target.value)}
                        placeholder="Search institute (Allen, Aakash, PW...)"
                        className={`w-full pl-8 pr-3 py-1.5 rounded-xl border text-xs font-mono focus:outline-none ${
                          isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>

                    <div className="max-h-52 overflow-y-auto space-y-1">
                      {filteredInstitutes.map((inst) => (
                        <button
                          key={inst}
                          type="button"
                          onClick={() => {
                            setSelectedCoaching(inst);
                            setIsCoachingDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 rounded-xl text-xs text-left font-medium flex items-center justify-between transition-colors cursor-pointer ${
                            selectedCoaching === inst
                              ? isDark ? 'bg-amber-400/20 text-amber-300 font-bold' : 'bg-blue-50 text-[#0066FF] font-bold'
                              : isDark ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span className="truncate">{inst}</span>
                          {selectedCoaching === inst && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* If 'Other' selected, show custom institute input */}
                {selectedCoaching === 'Other (Enter Custom Institute)' && (
                  <div className="mt-2.5">
                    <input
                      type="text"
                      value={customCoachingName}
                      onChange={(e) => setCustomCoachingName(e.target.value)}
                      placeholder="Enter the name of your Coaching Institute / City"
                      required
                      className={`w-full px-4 py-2 rounded-xl border text-sm font-medium focus:outline-none ${
                        isDark
                          ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500 focus:border-[#3B82F6]'
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-[#0066FF]'
                      }`}
                    />
                  </div>
                )}
              </div>

              {/* Mentoring Bio */}
              <div>
                <label
                  className={`block text-xs font-mono font-bold uppercase tracking-wider mb-1.5 ${
                    isDark ? 'text-zinc-300' : 'text-slate-700'
                  }`}
                >
                  Mentoring Focus & Bio (Shown on Your Card)
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. Scored 175/180 in Physics. Specializes in solving mechanics numericals under timed pressure, active NCERT revision, and eliminating silly mistakes."
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs leading-relaxed focus:outline-none transition-all ${
                    isDark
                      ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500 focus:border-[#3B82F6]'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-[#0066FF]'
                  }`}
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`px-4 py-2.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isDark
                    ? 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white'
                    : 'border-slate-300 bg-slate-100 text-slate-700 hover:text-slate-900'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Page 1</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (validatePage2()) setStep(3);
                }}
                className={`px-6 py-3 rounded-xl font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 ${
                  isDark
                    ? 'bg-[#3B82F6] text-white hover:bg-[#2563EB]'
                    : 'bg-[#0066FF] text-white hover:bg-[#0052cc]'
                }`}
              >
                <span>Continue to Page 3 (Free Slots)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= PAGE 3: SIMPLIFIED MONTHLY SLOTS ================= */}
        {step === 3 && (
          <div className="space-y-6">
            <div
              className={`p-4 rounded-2xl border ${
                isDark ? 'bg-amber-950/20 border-amber-500/40 text-amber-200' : 'bg-amber-50 border-amber-300 text-amber-950'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Zap className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <h4 className="font-bold text-xs font-mono uppercase tracking-wider">
                      Simplified 1-Click Monthly Availability
                    </h4>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                      Select your weekly routine pattern. The system automatically creates your 30-day calendar.
                    </p>
                  </div>
                </div>

                <div
                  className={`px-3 py-1.5 rounded-xl border font-mono text-center shrink-0 ${
                    isDark ? 'bg-black/60 border-amber-400 text-amber-300' : 'bg-white border-amber-400 text-amber-900 shadow-sm'
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold text-zinc-400">Total Active Slots</div>
                  <div className="text-xl font-black text-[#60A5FA]">{totalActiveSlots} Slots</div>
                  <div className="text-[9px] opacity-75">Next 30 Days</div>
                </div>
              </div>
            </div>

            {/* Quick 1-Click Schedule Presets */}
            <div>
              <label
                className={`block text-xs font-mono font-bold uppercase tracking-wider mb-2 ${
                  isDark ? 'text-zinc-300' : 'text-slate-700'
                }`}
              >
                Quick Availability Presets (Click to apply)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    name: '⚡ Weekday Evenings',
                    desc: 'Mon–Fri: 6:00 PM – 10:00 PM',
                    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                    slots: ['e1', 'e2', 'n1'],
                  },
                  {
                    name: '🎯 Weekends High-Yield',
                    desc: 'Sat & Sun: Morning + Evening',
                    days: ['Sat', 'Sun'],
                    slots: ['m1', 'e1', 'e2', 'n1'],
                  },
                  {
                    name: '🌟 Flexible Evenings',
                    desc: 'All 7 Days: 7:30 PM – 10:00 PM',
                    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    slots: ['e2', 'n1'],
                  },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setSelectedDays(preset.days);
                      setSelectedSlotIds(preset.slots);
                      setDisabledDates(new Set());
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isDark
                        ? 'bg-zinc-900/60 border-zinc-800 hover:border-amber-400 hover:bg-zinc-800/80'
                        : 'bg-white border-slate-200 hover:border-[#0066FF] hover:bg-slate-50 shadow-xs'
                    }`}
                  >
                    <div className="text-xs font-bold font-mono text-[#60A5FA]">{preset.name}</div>
                    <div className={`text-[11px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      {preset.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Days Selection */}
            <div>
              <label
                className={`block text-xs font-mono font-bold uppercase tracking-wider mb-2 ${
                  isDark ? 'text-zinc-300' : 'text-slate-700'
                }`}
              >
                1. Select Days You Can Mentor Every Week
              </label>
              <div className="grid grid-cols-7 gap-2">
                {WEEKDAY_NAMES.map((d) => {
                  const isSelected = selectedDays.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedDays(selectedDays.filter((x) => x !== d));
                        } else {
                          setSelectedDays([...selectedDays, d]);
                        }
                      }}
                      className={`py-3 px-1 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer text-center ${
                        isSelected
                          ? isDark
                            ? 'bg-[#3B82F6] text-white border-[#3B82F6] shadow-sm'
                            : 'bg-[#0066FF] text-white border-[#0066FF] shadow-sm'
                          : isDark
                          ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          : 'bg-slate-100 border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Daily Time Windows */}
            <div>
              <label
                className={`block text-xs font-mono font-bold uppercase tracking-wider mb-2 ${
                  isDark ? 'text-zinc-300' : 'text-slate-700'
                }`}
              >
                2. Select Preferred Time Windows (Hourly 1-on-1 Slots)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STANDARD_SLOTS.map((slot) => {
                  const isSelected = selectedSlotIds.includes(slot.id);
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedSlotIds(selectedSlotIds.filter((id) => id !== slot.id));
                        } else {
                          setSelectedSlotIds([...selectedSlotIds, slot.id]);
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-mono font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? isDark
                            ? 'bg-amber-400/20 text-amber-300 border-amber-400'
                            : 'bg-blue-50 text-[#0066FF] border-[#0066FF]'
                          : isDark
                          ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span className="truncate">{slot.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1 text-[#60A5FA]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Next 30 Days Quick Exceptions Toggler */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  className={`block text-xs font-mono font-bold uppercase tracking-wider ${
                    isDark ? 'text-zinc-300' : 'text-slate-700'
                  }`}
                >
                  3. Month Preview & Day-Off Overrides
                </label>
                <span className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Click any date to mark as Day-Off (Hospital Duty / College Exams)
                </span>
              </div>

              <div
                className={`p-3 rounded-2xl border max-h-44 overflow-y-auto ${
                  isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 text-center">
                  {activeDaysList.map((day) => {
                    const isWeeklyActive = selectedDays.includes(day.dayOfWeek);
                    const isTurnedOff = disabledDates.has(day.dateStr);
                    const isEnabled = isWeeklyActive && !isTurnedOff;

                    return (
                      <button
                        key={day.dateStr}
                        type="button"
                        onClick={() => {
                          const updated = new Set(disabledDates);
                          if (isTurnedOff) {
                            updated.delete(day.dateStr);
                          } else {
                            updated.add(day.dateStr);
                          }
                          setDisabledDates(updated);
                        }}
                        className={`p-1.5 rounded-lg border text-[10px] font-mono font-bold transition-all cursor-pointer ${
                          isEnabled
                            ? isDark
                              ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                              : 'bg-emerald-50 border-emerald-500 text-emerald-800'
                            : isDark
                            ? 'bg-zinc-900 border-zinc-800 text-zinc-600 line-through'
                            : 'bg-slate-200 border-slate-300 text-slate-400 line-through'
                        }`}
                        title={isEnabled ? `${day.displayDate}: Active` : `${day.displayDate}: Off`}
                      >
                        <div>{day.dayOfWeek}</div>
                        <div>{day.displayDate.split(' ')[0]}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Finalize Button */}
            <div className="pt-4 flex items-center justify-between border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setStep(2)}
                className={`px-4 py-2.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isDark
                    ? 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white'
                    : 'border-slate-300 bg-slate-100 text-slate-700 hover:text-slate-900'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Page 2</span>
              </button>

              <button
                type="button"
                onClick={handleFinalFinish}
                className={`px-6 py-3.5 rounded-xl font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
                  isDark
                    ? 'bg-[#3B82F6] text-white hover:bg-[#2563EB]'
                    : 'bg-[#0066FF] text-white hover:bg-[#0052cc]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Onboarding & Go to Dashboard</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
