import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  BarChart3,
  User,
  CreditCard,
  Video,
  FileText,
  Target,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sparkles,
  BookOpen,
  ArrowRight,
  Search,
  Download,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Trophy,
  Award,
  GraduationCap,
  ChevronRight,
  ExternalLink,
  Edit3,
  Save,
  Check,
  X,
  Flame,
  HelpCircle,
  School,
  Share2,
  Filter,
  Plus,
  CheckSquare,
  ShieldCheck,
  Zap,
  Star,
  MessageSquare,
  PhoneCall,
} from 'lucide-react';
import {
  type AspirantProfile,
  type AspirantAssessment,
  type PaymentTransaction,
  type SessionRecordingItem,
  type MentorStudyPlan,
  type DailyNeetQuestion,
  type MockTestResult,
} from '../types/aspirant.ts';
import {
  loadAspirantProfile,
  saveAspirantProfile,
  loadAspirantAssessment,
  saveAspirantAssessment,
  addMockTestToAssessment,
  loadAspirantPayments,
  loadMentorStudyPlan,
  togglePlanChapter,
  loadSolvedQuestions,
  markQuestionSolved,
  getAspirantStreak,
  incrementAspirantStreak,
  DEFAULT_RECORDINGS,
  DAILY_NEET_QUESTIONS_BANK,
} from '../utils/aspirantStorage.ts';
import { Logo } from './Logo.tsx';

interface AspirantDashboardProps {
  theme: 'dark' | 'light';
  userId?: string;
  userEmail?: string;
  userName?: string;
  initialTab?: AspirantTab;
  autoEditProfile?: boolean;
  onSignOut: () => void;
  onSwitchToHome: () => void;
  onBookMoreSessions?: () => void;
  onOpenSyllabusTracker?: () => void;
  onExploreMentors?: () => void;
}

export type AspirantTab =
  | 'assessment'
  | 'mentorship'
  | 'profile'
  | 'payments'
  | 'recordings'
  | 'plan'
  | 'daily_question';

export const AspirantDashboard: React.FC<AspirantDashboardProps> = ({
  theme,
  userId,
  userEmail,
  userName,
  initialTab = 'assessment',
  autoEditProfile = false,
  onSignOut,
  onSwitchToHome,
  onBookMoreSessions,
  onOpenSyllabusTracker,
  onExploreMentors,
}) => {
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<AspirantTab>(autoEditProfile ? 'profile' : initialTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core Data States - loaded per user ID/email
  const [profile, setProfile] = useState<AspirantProfile>(() =>
    loadAspirantProfile(userEmail, userName, userId)
  );
  const [assessment, setAssessment] = useState<AspirantAssessment>(() =>
    loadAspirantAssessment(userEmail, userId)
  );
  const [payments] = useState<PaymentTransaction[]>(() =>
    loadAspirantPayments()
  );
  const [recordings] = useState<SessionRecordingItem[]>(DEFAULT_RECORDINGS);
  const [studyPlan, setStudyPlan] = useState<MentorStudyPlan>(() =>
    loadMentorStudyPlan()
  );
  const [streak, setStreak] = useState<number>(() => getAspirantStreak());
  const [solvedQuestions, setSolvedQuestions] = useState<string[]>(() =>
    loadSolvedQuestions()
  );

  // Profile Edit State - automatically opens in edit mode on first registration
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(
    Boolean(autoEditProfile || (!profile.isProfileComplete && initialTab === 'profile'))
  );
  const [editProfileForm, setEditProfileForm] = useState<AspirantProfile>(profile);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // When autoEditProfile becomes true, switch to profile tab in edit mode
  useEffect(() => {
    if (autoEditProfile) {
      setActiveTab('profile');
      setIsEditingProfile(true);
    }
  }, [autoEditProfile]);

  // Keep editProfileForm in sync with profile and user credentials
  useEffect(() => {
    const loaded = loadAspirantProfile(userEmail, userName, userId);
    setProfile(loaded);
    setEditProfileForm(loaded);
  }, [userEmail, userName, userId]);

  // New Mock Test Logging Modal State
  const [isLogMockOpen, setIsLogMockOpen] = useState(false);
  const [mockName, setMockName] = useState('');
  const [mockPhysics, setMockPhysics] = useState<number>(130);
  const [mockChemistry, setMockChemistry] = useState<number>(145);
  const [mockBiology, setMockBiology] = useState<number>(310);
  const [mockNegative, setMockNegative] = useState<number>(24);

  // Recordings & Transcripts Player State
  const [selectedRecordingId, setSelectedRecordingId] = useState<string>(
    recordings[0]?.id || ''
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(35); // 0-100%
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [transcriptSearch, setTranscriptSearch] = useState('');

  // Daily Question (OQAD) State
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);
  const [questionSubjectFilter, setQuestionSubjectFilter] = useState<'All' | 'Biology' | 'Physics' | 'Chemistry'>('All');
  const [questionTimerSeconds, setQuestionTimerSeconds] = useState(60);

  // Invoice Receipt Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<PaymentTransaction | null>(null);

  // Active Recording
  const activeRecording = useMemo(() => {
    return recordings.find((r) => r.id === selectedRecordingId) || recordings[0];
  }, [recordings, selectedRecordingId]);

  // Filtered Daily Questions
  const filteredQuestions = useMemo(() => {
    if (questionSubjectFilter === 'All') return DAILY_NEET_QUESTIONS_BANK;
    return DAILY_NEET_QUESTIONS_BANK.filter((q) => q.subject === questionSubjectFilter);
  }, [questionSubjectFilter]);

  const currentDailyQuestion = filteredQuestions[selectedQuestionIndex] || filteredQuestions[0];

  // Question Timer countdown
  useEffect(() => {
    if (activeTab !== 'daily_question' || hasSubmittedAnswer) return;
    const timer = setInterval(() => {
      setQuestionTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeTab, hasSubmittedAnswer]);

  // When switching daily question, reset option & timer
  const handleSelectQuestion = (index: number) => {
    setSelectedQuestionIndex(index);
    setSelectedOption(null);
    setHasSubmittedAnswer(false);
    setQuestionTimerSeconds(60);
  };

  const handleAnswerSubmit = () => {
    if (selectedOption === null || hasSubmittedAnswer) return;
    setHasSubmittedAnswer(true);
    if (selectedOption === currentDailyQuestion.correctAnswer) {
      const updated = markQuestionSolved(currentDailyQuestion.id);
      setSolvedQuestions(updated);
      const newStreak = incrementAspirantStreak();
      setStreak(newStreak);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { ...editProfileForm, isProfileComplete: true };
    saveAspirantProfile(updated, userEmail, userId);
    setProfile(updated);
    setIsEditingProfile(false);
    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 3500);
  };

  const handleToggleChapter = (chapterId: string) => {
    const updated = togglePlanChapter(chapterId);
    setStudyPlan(updated);
  };

  const handleAddMockTest = (e: React.FormEvent) => {
    e.preventDefault();
    const total = mockPhysics + mockChemistry + mockBiology;
    let rank = 'AIR 8,000+';
    if (total >= 690) rank = 'AIR 1 – 250';
    else if (total >= 660) rank = 'AIR 250 – 1,200';
    else if (total >= 620) rank = 'AIR 1,200 – 3,500';
    else if (total >= 580) rank = 'AIR 3,500 – 6,500';
    else if (total >= 530) rank = 'AIR 6,500 – 12,000';

    const newResult: MockTestResult = {
      id: `mock_${Date.now()}`,
      testName: mockName.trim() || `Full Syllabus Mock ${assessment.recentMockTests.length + 1}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      physicsScore: mockPhysics,
      chemistryScore: mockChemistry,
      biologyScore: mockBiology,
      totalScore: total,
      predictedAir: rank,
      percentile: parseFloat(((total / 720) * 100).toFixed(1)),
      negativeMarks: mockNegative,
    };

    const updatedAssessment = addMockTestToAssessment(newResult, userEmail, userId);
    setAssessment(updatedAssessment);
    setIsLogMockOpen(false);
    setMockName('');
  };

  // Filtered Transcripts
  const filteredTranscriptLines = useMemo(() => {
    if (!activeRecording?.transcript) return [];
    if (!transcriptSearch.trim()) return activeRecording.transcript;
    const query = transcriptSearch.toLowerCase();
    return activeRecording.transcript.filter(
      (line) =>
        line.text.toLowerCase().includes(query) ||
        line.speaker.toLowerCase().includes(query) ||
        line.timestamp.includes(query)
    );
  }, [activeRecording, transcriptSearch]);

  // High-yield syllabus progress
  const checklistStats = useMemo(() => {
    const total = studyPlan.highYieldChecklist.length;
    const completed = studyPlan.highYieldChecklist.filter((c) => c.completed).length;
    const percent = Math.round((completed / total) * 100) || 0;
    return { total, completed, percent };
  }, [studyPlan]);

  const navTabs = [
    { id: 'assessment' as AspirantTab, label: 'Assessment Results', icon: BarChart3 },
    { id: 'mentorship' as AspirantTab, label: '1-on-1 AIR Mentorship', icon: Sparkles, badge: 'Popular' },
    { id: 'plan' as AspirantTab, label: 'Plan Prepared', icon: FileText },
    { id: 'daily_question' as AspirantTab, label: 'Daily Question (OQAD)', icon: Target },
    { id: 'profile' as AspirantTab, label: 'My Profile', icon: User },
    { id: 'payments' as AspirantTab, label: 'Payment Status', icon: CreditCard },
    { id: 'recordings' as AspirantTab, label: 'Recordings & Transcripts', icon: Video },
  ];

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isDark ? 'bg-[#09090b] text-zinc-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top Bar Contract (Workspace Canvas) */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 transition-all ${
          isDark
            ? 'bg-[#0e0e12]/90 border-zinc-800/80 text-white'
            : 'bg-white/90 border-slate-200/90 text-slate-900 shadow-xs'
        }`}
      >
        {/* Left: Brand & Contextual Breadcrumb */}
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <button
            type="button"
            onClick={onSwitchToHome}
            className="flex items-center gap-2 cursor-pointer focus:outline-none"
            title="Return to AIR NEETwork Homepage"
          >
            <Logo theme={theme} size="sm" />
          </button>

          <div className="hidden md:flex items-center gap-2 text-sm font-mono text-zinc-400">
            <span className="text-zinc-500">/</span>
            <span className="font-semibold text-emerald-400">Aspirant Portal</span>
            <span className="text-zinc-500">/</span>
            <span className="text-zinc-200 truncate capitalize">
              {activeTab.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Center: Quick Target Pill Indicator */}
        <div className="hidden lg:flex items-center gap-3 text-sm font-mono">
          <div
            className={`px-3.5 py-1.5 rounded-full border flex items-center gap-2 ${
              isDark
                ? 'bg-zinc-900/80 border-zinc-700 text-zinc-300'
                : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <GraduationCap className="w-4.5 h-4.5 text-emerald-400" />
            <span>Target: {profile.dreamCollege}</span>
            <span className="text-zinc-400">·</span>
            <span className="tabular-nums font-bold text-emerald-400">
              {profile.targetScore}+
            </span>
          </div>

          <div
            className={`px-3.5 py-1.5 rounded-full border flex items-center gap-2 ${
              isDark
                ? 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <Flame className="w-4.5 h-4.5 text-amber-500 fill-amber-500" />
            <span className="tabular-nums font-bold">{streak} Day Streak</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onBookMoreSessions && (
            <button
              type="button"
              onClick={onBookMoreSessions}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-sm font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-black hover:brightness-110 shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4.5 h-4.5 shrink-0" />
              <span className="hidden sm:inline">Book AIR Mentor (₹499)</span>
              <span className="sm:hidden">Book Mentor</span>
            </button>
          )}

          <button
            type="button"
            onClick={onSwitchToHome}
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold border transition-colors cursor-pointer ${
              isDark
                ? 'border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:text-white hover:bg-zinc-800'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            Home
          </button>

          <button
            type="button"
            onClick={onSignOut}
            className={`px-3.5 py-2 rounded-xl text-sm font-mono font-semibold border transition-colors cursor-pointer ${
              isDark
                ? 'border-red-950/60 bg-red-950/20 text-red-300 hover:bg-red-950/40'
                : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            Sign out
          </button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-xl border cursor-pointer ${
              isDark ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-white'
            }`}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <LayoutDashboard className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Workspace: Sidebar + Content Viewport */}
      <div className="flex-1 max-w-[1560px] w-full mx-auto flex flex-col md:flex-row">
        {/* Left Sidebar Navigation */}
        <aside
          className={`w-full md:w-64 lg:w-72 border-r p-4 sm:p-5 flex flex-col justify-between shrink-0 transition-all ${
            mobileMenuOpen ? 'block' : 'hidden md:flex'
          } ${
            isDark
              ? 'bg-[#0c0c0f] border-zinc-800/80 text-zinc-300'
              : 'bg-white border-slate-200 text-slate-700'
          }`}
        >
          <div className="space-y-6">
            {/* Student Mini Profile Card */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                isDark
                  ? 'bg-zinc-900/70 border-zinc-800'
                  : 'bg-slate-50 border-slate-200/90'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-emerald-500/40 shrink-0 bg-emerald-950/50 flex items-center justify-center font-bold text-lg text-emerald-400">
                  {profile.fullName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm truncate text-white dark:text-zinc-100">
                    {profile.fullName}
                  </div>
                  <div className="text-[11px] font-mono text-zinc-400 truncate">
                    NEET {profile.neetTargetYear} · {profile.category}
                  </div>
                </div>
              </div>

              {/* Plan & Mentor Status Badge */}
              <div
                className={`pt-2.5 border-t text-[11px] font-mono flex items-center justify-between ${
                  isDark ? 'border-zinc-800 text-zinc-400' : 'border-slate-200 text-slate-500'
                }`}
              >
                <span>Plan Status:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckSquare className="w-3 h-3 text-emerald-400" />
                  Free 65-Ch Tracker
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="space-y-1.5" aria-label="Aspirant Dashboard Tabs">
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold px-3 py-1">
                Aspirant Modules
              </div>
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer text-left select-none ${
                      isActive
                        ? isDark
                          ? 'bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30 shadow-xs'
                          : 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 shadow-xs'
                        : isDark
                        ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/40 border border-transparent'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-5 h-5 shrink-0 ${
                          isActive ? 'text-emerald-400' : 'text-zinc-400'
                        }`}
                      />
                      <span className="whitespace-nowrap">{tab.label}</span>
                    </div>
                    {tab.id === 'mentorship' && (
                      <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        AIR 100
                      </span>
                    )}
                    {tab.id === 'daily_question' && (
                      <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                        OQAD
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* High-Converting AIR Mentorship Promotion in Sidebar */}
          <div className="pt-5 mt-5 border-t border-zinc-800/80">
            <div
              className={`p-4 rounded-2xl border text-xs relative overflow-hidden ${
                isDark
                  ? 'bg-gradient-to-b from-emerald-950/40 via-zinc-900/90 to-zinc-950 border-emerald-500/30'
                  : 'bg-gradient-to-b from-emerald-50 via-white to-slate-50 border-emerald-200 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-emerald-400 mb-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>AIR &lt; 100 1-on-1 Mentorship</span>
              </div>
              <p className="text-[11px] text-zinc-400 mb-3 leading-relaxed">
                Don&apos;t just track chapters—let AIIMS Delhi &amp; MAMC toppers audit your errors and formulate your 680+ strategy.
              </p>
              <div className="space-y-2">
                {onBookMoreSessions && (
                  <button
                    type="button"
                    onClick={onBookMoreSessions}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold font-mono uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-400 text-black hover:brightness-110 transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    Book Call (From ₹499)
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('mentorship');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full py-1.5 px-3 rounded-xl text-[11px] font-mono font-medium border text-center transition-all cursor-pointer ${
                    isDark
                      ? 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:text-white hover:bg-zinc-800'
                      : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Compare Mentorship Plans →
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Content Viewport */}
        <main className="flex-1 p-4 sm:p-7 md:p-9 overflow-y-auto space-y-8">
          {/* PERSISTENT SYLLABUS TRACKER & AIR MENTORSHIP BRIDGE BANNER */}
          <div
            className={`p-5 sm:p-6 rounded-3xl border relative overflow-hidden transition-all ${
              isDark
                ? 'bg-gradient-to-r from-blue-950/40 via-zinc-900/90 to-emerald-950/30 border-emerald-500/30 shadow-lg'
                : 'bg-gradient-to-r from-blue-50 via-white to-emerald-50 border-emerald-200 shadow-sm'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2.5 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <CheckSquare className="w-3 h-3 text-emerald-400" />
                    Free Syllabus Tracker Active (65 Chapters)
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-blue-500/15 text-blue-400 border border-blue-500/30">
                    <Sparkles className="w-2.5 h-2.5" /> AIR 1–100 Ranker Program
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white dark:text-zinc-100">
                  Turn Your Chapter Tracking into a 680+ NEET Score
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 dark:text-zinc-300 leading-relaxed">
                  Tracking chapters is step 1. But self-study alone leaves 35+ marks on the table in negative markings and false confidence. Get 1-on-1 mentorship from verified AIR &lt; 100 Rankers (AIIMS New Delhi &amp; MAMC) who audit your tracker, eliminate tricky NCERT traps, and hold you accountable.
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] font-mono text-zinc-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" /> AIIMS Delhi &amp; MAMC Mentors
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" /> Negative Mark Liquidation (-30 Marks)
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" /> 1-on-1 Google Meet Sessions
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 min-w-[220px]">
                {onBookMoreSessions && (
                  <button
                    type="button"
                    onClick={onBookMoreSessions}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-black hover:brightness-110 shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Book 1-on-1 Call (₹499)</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveTab('mentorship')}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    activeTab === 'mentorship'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : isDark
                      ? 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800'
                      : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <span>Explore Mentorship Plans</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                {onOpenSyllabusTracker && (
                  <button
                    type="button"
                    onClick={onOpenSyllabusTracker}
                    className={`w-full py-2 px-4 rounded-xl text-[11px] font-mono text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isDark ? 'hover:bg-zinc-800/50' : 'hover:bg-slate-100'
                    }`}
                  >
                    <CheckSquare className="w-3 h-3 text-emerald-400" />
                    <span>Open 65-Chapter Tracker</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* TAB 1: ASSESSMENT RESULTS */}
          {activeTab === 'assessment' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Header Title with Log Mock Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
                <div>
                  <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                    NEET Performance Diagnostics
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Assessment & Mock Results
                  </h1>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsLogMockOpen(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer shadow-sm border ${
                      isDark
                        ? 'bg-emerald-500 text-black border-emerald-400 hover:bg-emerald-400'
                        : 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log New Mock Test</span>
                  </button>
                </div>
              </div>

              {/* KPI Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  className={`p-5 rounded-2xl border transition-all ${
                    isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="text-xs font-mono text-zinc-400 mb-1">Current Mock Average</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold font-mono tabular-nums text-white dark:text-zinc-100">
                      {assessment.currentScore}
                    </span>
                    <span className="text-xs text-zinc-500">/ 720</span>
                  </div>
                  <div className="mt-2 text-xs text-emerald-400 font-mono flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+38 marks over last 3 tests</span>
                  </div>
                </div>

                <div
                  className={`p-5 rounded-2xl border transition-all ${
                    isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="text-xs font-mono text-zinc-400 mb-1">Target Score Goal</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold font-mono tabular-nums text-emerald-400">
                      {profile.targetScore}
                    </span>
                    <span className="text-xs text-zinc-500">/ 720</span>
                  </div>
                  <div className="mt-2 text-xs text-zinc-400 font-mono">
                    Score Gap:{' '}
                    <span className="font-bold text-amber-400 tabular-nums">
                      {Math.max(0, profile.targetScore - assessment.currentScore)} marks
                    </span>
                  </div>
                </div>

                <div
                  className={`p-5 rounded-2xl border transition-all ${
                    isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="text-xs font-mono text-zinc-400 mb-1">AIR Prediction Model</div>
                  <div className="text-xl font-bold font-mono text-white dark:text-zinc-100">
                    {assessment.predictedAir}
                  </div>
                  <div className="mt-2 text-xs text-zinc-400 font-mono">
                    Based on 2024–2025 cutoff data
                  </div>
                </div>

                <div
                  className={`p-5 rounded-2xl border transition-all ${
                    isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="text-xs font-mono text-zinc-400 mb-1">Negative Marks Leaked</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold font-mono tabular-nums text-red-400">
                      -{assessment.negativeMarksLost}
                    </span>
                    <span className="text-xs text-zinc-500">marks</span>
                  </div>
                  <div className="mt-2 text-xs text-zinc-400 font-mono">
                    Accuracy: <span className="text-emerald-400 font-bold tabular-nums">{assessment.accuracyRate}%</span>
                  </div>
                </div>
              </div>

              {/* Mentorship Bridge Callout for Score Gap & Negative Marks */}
              <div
                className={`p-5 sm:p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-5 ${
                  isDark
                    ? 'bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-blue-950/30 border-emerald-500/40'
                    : 'bg-gradient-to-r from-emerald-50 via-white to-blue-50 border-emerald-200 shadow-sm'
                }`}
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> AIR Diagnostic Insight
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      Score Gap to {profile.dreamCollege}: {Math.max(0, profile.targetScore - assessment.currentScore)} Marks
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold">
                    Turn Your {assessment.currentScore}/720 Benchmark into {profile.targetScore}+ with an AIR &lt; 100 Ranker
                  </h3>
                  <p className="text-xs text-zinc-300 dark:text-zinc-400 leading-relaxed">
                    You lost <strong className="text-red-400 font-mono">-{assessment.negativeMarksLost} marks</strong> to negative marking in recent tests. Our AIIMS New Delhi &amp; MAMC mentors audit your test error logs to eliminate those mistakes and construct a custom 60-day comeback plan.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                  {onBookMoreSessions && (
                    <button
                      type="button"
                      onClick={onBookMoreSessions}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-400 text-black hover:brightness-110 transition shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Book Diagnostic Audit (₹499)</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveTab('mentorship')}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold border transition cursor-pointer text-center ${
                      isDark
                        ? 'border-zinc-700 bg-zinc-900/80 text-zinc-300 hover:text-white'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    View All AIR Mentors →
                  </button>
                </div>
              </div>

              {/* Subject Breakdown Grid */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold tracking-tight">Subject-Wise Diagnostics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Physics Card */}
                  <div
                    className={`p-6 rounded-2xl border space-y-4 ${
                      isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                      <div className="font-bold text-base">Physics</div>
                      <div className="text-xs font-mono font-bold text-amber-400 tabular-nums">
                        {assessment.physics.score} / {assessment.physics.maxScore}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-zinc-400 font-mono">
                        <span>Accuracy Rate</span>
                        <span className="font-bold text-white tabular-nums">{assessment.physics.accuracy}%</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-400 h-full rounded-full"
                          style={{ width: `${assessment.physics.accuracy}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-xs space-y-1.5 pt-2">
                      <div className="font-mono text-zinc-400 text-[11px] uppercase tracking-wider">
                        High Priority Fixes:
                      </div>
                      {assessment.physics.weakChapters.map((ch, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-zinc-300">
                          <span className="text-red-400 text-xs">·</span>
                          <span>{ch}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chemistry Card */}
                  <div
                    className={`p-6 rounded-2xl border space-y-4 ${
                      isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                      <div className="font-bold text-base">Chemistry</div>
                      <div className="text-xs font-mono font-bold text-sky-400 tabular-nums">
                        {assessment.chemistry.score} / {assessment.chemistry.maxScore}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-zinc-400 font-mono">
                        <span>Accuracy Rate</span>
                        <span className="font-bold text-white tabular-nums">{assessment.chemistry.accuracy}%</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-sky-400 h-full rounded-full"
                          style={{ width: `${assessment.chemistry.accuracy}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-xs space-y-1.5 pt-2">
                      <div className="font-mono text-zinc-400 text-[11px] uppercase tracking-wider">
                        High Priority Fixes:
                      </div>
                      {assessment.chemistry.weakChapters.map((ch, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-zinc-300">
                          <span className="text-red-400 text-xs">·</span>
                          <span>{ch}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Biology Card */}
                  <div
                    className={`p-6 rounded-2xl border space-y-4 ${
                      isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                      <div className="font-bold text-base">Biology</div>
                      <div className="text-xs font-mono font-bold text-emerald-400 tabular-nums">
                        {assessment.biology.score} / {assessment.biology.maxScore}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-zinc-400 font-mono">
                        <span>Accuracy Rate</span>
                        <span className="font-bold text-white tabular-nums">{assessment.biology.accuracy}%</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-400 h-full rounded-full"
                          style={{ width: `${assessment.biology.accuracy}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-xs space-y-1.5 pt-2">
                      <div className="font-mono text-zinc-400 text-[11px] uppercase tracking-wider">
                        High Priority Fixes:
                      </div>
                      {assessment.biology.weakChapters.map((ch, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-zinc-300">
                          <span className="text-red-400 text-xs">·</span>
                          <span>{ch}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Mock Test History Table */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold tracking-tight">Recent Mock Tests Logged</h2>
                <div
                  className={`rounded-2xl border overflow-x-auto ${
                    isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr
                        className={`border-b text-zinc-400 font-mono uppercase text-[10px] tracking-wider ${
                          isDark ? 'border-zinc-800 bg-zinc-900/80' : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <th className="py-3 px-4">Test Name</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4 text-right">Physics</th>
                        <th className="py-3 px-4 text-right">Chemistry</th>
                        <th className="py-3 px-4 text-right">Biology</th>
                        <th className="py-3 px-4 text-right">Total Score</th>
                        <th className="py-3 px-4 text-right">Predicted AIR</th>
                        <th className="py-3 px-4 text-right">Negatives</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-mono">
                      {assessment.recentMockTests.map((t) => (
                        <tr
                          key={t.id}
                          className={`transition-colors ${
                            isDark ? 'hover:bg-zinc-800/30' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-3 px-4 font-sans font-medium text-zinc-200">
                            {t.testName}
                          </td>
                          <td className="py-3 px-4 text-zinc-400">{t.date}</td>
                          <td className="py-3 px-4 text-right tabular-nums text-amber-400">
                            {t.physicsScore}
                          </td>
                          <td className="py-3 px-4 text-right tabular-nums text-sky-400">
                            {t.chemistryScore}
                          </td>
                          <td className="py-3 px-4 text-right tabular-nums text-emerald-400">
                            {t.biologyScore}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-white tabular-nums">
                            {t.totalScore} / 720
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-emerald-400">
                            {t.predictedAir}
                          </td>
                          <td className="py-3 px-4 text-right text-red-400 tabular-nums">
                            -{t.negativeMarks}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mentor Audit Remarks */}
              <div
                className={`p-6 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-100/60 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>AIR Mentor Diagnostic Audit Observations</span>
                </div>
                <div className="space-y-2 text-xs leading-relaxed text-zinc-300">
                  {assessment.mentorAuditNotes.map((note, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-mono">0{idx + 1}.</span>
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: 1-ON-1 AIR MENTORSHIP PROGRAM */}
          {activeTab === 'mentorship' && (
            <div className="space-y-10 animate-in fade-in duration-200">
              {/* Mentorship Header & Value Proposition */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-800/80">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Personalized 1-on-1 Guidance · AIR Top 100</span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                    Convert Your Syllabus into 680+ NEET Marks
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
                    Self-study tracking lets you know what is left. Our AIR Top 100 mentors from AIIMS Delhi, MAMC, and VMMC guide you through how to master it under real exam pressure—cutting 25–40 negative marks and building weekly custom milestones.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  {onOpenSyllabusTracker && (
                    <button
                      type="button"
                      onClick={onOpenSyllabusTracker}
                      className={`px-3.5 py-2 rounded-xl text-xs font-mono font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isDark
                          ? 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Back to Tracker</span>
                    </button>
                  )}
                  {onBookMoreSessions && (
                    <button
                      type="button"
                      onClick={onBookMoreSessions}
                      className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-400 text-black hover:brightness-110 shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Book AIR Mentor Call</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 4 Core Value Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  className={`p-5 rounded-2xl border space-y-2 ${
                    isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm">AIIMS &amp; MAMC Toppers</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    100% verified All India Rankers currently enrolled in India&apos;s premier medical colleges.
                  </p>
                </div>

                <div
                  className={`p-5 rounded-2xl border space-y-2 ${
                    isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                    <Target className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm">Negative Mark Audit</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Line-by-line review of your mock mistakes to eliminate 25–40 marks lost to silly errors and traps.
                  </p>
                </div>

                <div
                  className={`p-5 rounded-2xl border space-y-2 ${
                    isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm">Custom Weekly Timetable</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Tailored revision cycles matched directly with your 65-Chapter Syllabus Tracker progress.
                  </p>
                </div>

                <div
                  className={`p-5 rounded-2xl border space-y-2 ${
                    isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Video className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm">1-on-1 Meet &amp; WhatsApp</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Direct private video consultations and WhatsApp doubt solving. No bots or recorded generic videos.
                  </p>
                </div>
              </div>

              {/* Mentorship Tiers & Pricing */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                      Choose Your Program
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                      Mentorship Tiers &amp; Booking
                    </h2>
                  </div>
                  <span className="text-xs font-mono text-zinc-400">
                    Flexible options · Verified AIR Toppers · 100% Satisfaction Guarantee
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Tier 1: Single Diagnostic Strategy Call */}
                  <div
                    className={`p-6 sm:p-7 rounded-3xl border flex flex-col justify-between transition-all ${
                      isDark
                        ? 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                        : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase font-bold text-zinc-400 tracking-wider">
                          Entry / Baseline
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
                          Single Session
                        </span>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold">1-on-1 Diagnostic Call</h3>
                        <p className="text-xs text-zinc-400 mt-1">
                          Audit your syllabus tracker, mock errors, and get an immediate 30-day action plan.
                        </p>
                      </div>

                      <div className="flex items-baseline gap-1.5 pt-2">
                        <span className="text-3xl font-black font-mono tabular-nums text-white dark:text-zinc-100">
                          ₹499
                        </span>
                        <span className="text-xs text-zinc-400 line-through">₹1,499</span>
                        <span className="text-[10px] font-mono text-emerald-400 ml-1">67% OFF</span>
                      </div>

                      <ul className="space-y-2.5 text-xs text-zinc-300 pt-3 border-t border-zinc-800/80">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>45-Minute 1-on-1 Video Strategy Call</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>Syllabus Tracker retention audit (Block A/B/C)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>Mock paper error log &amp; negative mark analysis</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>Personalized 30-day catch-up timetable</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>Call recording &amp; action checklist uploaded to portal</span>
                        </li>
                      </ul>
                    </div>

                    <div className="pt-6 mt-6 border-t border-zinc-800/80">
                      {onBookMoreSessions && (
                        <button
                          type="button"
                          onClick={onBookMoreSessions}
                          className={`w-full py-2.5 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                            isDark
                              ? 'border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700'
                              : 'border-slate-300 bg-slate-900 text-white hover:bg-slate-800'
                          }`}
                        >
                          Book Strategy Call (₹499)
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tier 2: 30-Day Intensive (Highlighted) */}
                  <div
                    className={`p-6 sm:p-7 rounded-3xl border relative flex flex-col justify-between transition-all ${
                      isDark
                        ? 'bg-gradient-to-b from-emerald-950/40 via-zinc-900/90 to-zinc-950 border-emerald-500/50 shadow-xl'
                        : 'bg-gradient-to-b from-emerald-50 via-white to-slate-50 border-emerald-300 shadow-md'
                    }`}
                  >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-emerald-500 text-black shadow-sm flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Most Popular
                    </div>

                    <div className="space-y-4 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase font-bold text-emerald-400 tracking-wider">
                          High-Yield Mentorship
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                          4 Calls + WhatsApp
                        </span>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold">30-Day Score Acceleration</h3>
                        <p className="text-xs text-zinc-300 dark:text-zinc-400 mt-1">
                          Dedicated AIR Topper mentor guiding your daily revision, mock tests, and doubts.
                        </p>
                      </div>

                      <div className="flex items-baseline gap-1.5 pt-2">
                        <span className="text-3xl font-black font-mono tabular-nums text-emerald-400">
                          ₹2,999
                        </span>
                        <span className="text-xs text-zinc-400 line-through">₹5,999</span>
                        <span className="text-[10px] font-mono text-emerald-400 ml-1">50% OFF</span>
                      </div>

                      <ul className="space-y-2.5 text-xs text-zinc-200 dark:text-zinc-300 pt-3 border-t border-zinc-800/80">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span><strong>4 Weekly 1-on-1 Google Meet calls</strong> (45–60 min each)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span><strong>Direct WhatsApp Doubt Solving</strong> with your AIR Mentor</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>Weekly Syllabus Tracker check-in &amp; target adjustment</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>Comprehensive error log inspection before major tests</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>High-yield Physics &amp; Chemistry NCERT formula cheat sheets</span>
                        </li>
                      </ul>
                    </div>

                    <div className="pt-6 mt-6 border-t border-zinc-800/80">
                      {onBookMoreSessions && (
                        <button
                          type="button"
                          onClick={onBookMoreSessions}
                          className="w-full py-2.5 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-black hover:brightness-110 shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Enroll in 30-Day Plan (₹2,999)</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tier 3: AIR 100 Comprehensive Season */}
                  <div
                    className={`p-6 sm:p-7 rounded-3xl border flex flex-col justify-between transition-all ${
                      isDark
                        ? 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                        : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase font-bold text-purple-400 tracking-wider">
                          Full Season Package
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Until NEET Day
                        </span>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold">AIR 100 Comprehensive</h3>
                        <p className="text-xs text-zinc-400 mt-1">
                          End-to-end ranker mentorship with AIIMS New Delhi topper until you sit for the exam.
                        </p>
                      </div>

                      <div className="flex items-baseline gap-1.5 pt-2">
                        <span className="text-3xl font-black font-mono tabular-nums text-white dark:text-zinc-100">
                          ₹6,999
                        </span>
                        <span className="text-xs text-zinc-400 line-through">₹14,999</span>
                        <span className="text-[10px] font-mono text-purple-400 ml-1">53% OFF</span>
                      </div>

                      <ul className="space-y-2.5 text-xs text-zinc-300 pt-3 border-t border-zinc-800/80">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                          <span><strong>12 One-on-One deep dive video sessions</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                          <span>Dedicated AIIMS New Delhi / MAMC mentor pairing</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                          <span>Unlimited 24/7 priority WhatsApp doubt solving</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                          <span>Exam hall strategy: time boxing, stamina &amp; panic control</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                          <span>Bi-weekly parent-mentor alignment &amp; score trajectory review</span>
                        </li>
                      </ul>
                    </div>

                    <div className="pt-6 mt-6 border-t border-zinc-800/80">
                      {onBookMoreSessions && (
                        <button
                          type="button"
                          onClick={onBookMoreSessions}
                          className={`w-full py-2.5 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                            isDark
                              ? 'border-purple-500/50 bg-purple-950/40 text-purple-200 hover:bg-purple-900/50'
                              : 'border-purple-300 bg-purple-50 text-purple-900 hover:bg-purple-100'
                          }`}
                        >
                          Enroll Full Season (₹6,999)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Verified Mentors Spotlight */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                      Verified Ranker Faculty
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                      Mentors Available For You
                    </h2>
                  </div>
                  <span className="text-xs font-mono text-zinc-400">
                    Active medical students · 100% Verified scorecards
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Mentor 1 */}
                  <div
                    className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                      isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-purple-500/15 text-purple-300 border border-purple-500/30">
                          AIR 04
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-400">710 / 720</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden border border-purple-500/40 bg-zinc-800 shrink-0">
                          <img
                            src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"
                            alt="Ayush Bhalotia"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-white dark:text-zinc-100 truncate">
                            Ayush Bhalotia
                          </h4>
                          <div className="text-[11px] text-zinc-400 truncate flex items-center gap-1">
                            <School className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>AIIMS New Delhi</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-300 dark:text-zinc-400 leading-relaxed bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-800/80">
                        <strong className="text-emerald-400">Specialty:</strong> Physics 180/180 Master, PYQ Pattern Decoding &amp; Numerical Speed Drills.
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-zinc-800/80">
                      {onBookMoreSessions && (
                        <button
                          type="button"
                          onClick={onBookMoreSessions}
                          className="w-full py-2 px-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-emerald-500 text-black hover:bg-emerald-400 transition cursor-pointer"
                        >
                          Book 1-on-1 Call
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Mentor 2 */}
                  <div
                    className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                      isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-purple-500/15 text-purple-300 border border-purple-500/30">
                          AIR 77
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-400">700 / 720</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden border border-purple-500/40 bg-zinc-800 shrink-0">
                          <img
                            src="https://images.unsplash.com/photo-1594824813571-638f02614d3f?w=150&auto=format&fit=crop&q=80"
                            alt="Soumya Bhadole"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-white dark:text-zinc-100 truncate">
                            Soumya Bhadole
                          </h4>
                          <div className="text-[11px] text-zinc-400 truncate flex items-center gap-1">
                            <School className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>AIIMS New Delhi</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-300 dark:text-zinc-400 leading-relaxed bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-800/80">
                        <strong className="text-emerald-400">Specialty:</strong> NCERT Biology Active Recall, Assertion-Reason Traps &amp; Zero Negative Marks.
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-zinc-800/80">
                      {onBookMoreSessions && (
                        <button
                          type="button"
                          onClick={onBookMoreSessions}
                          className="w-full py-2 px-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-emerald-500 text-black hover:bg-emerald-400 transition cursor-pointer"
                        >
                          Book 1-on-1 Call
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Mentor 3 */}
                  <div
                    className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                      isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-500/15 text-blue-300 border border-blue-500/30">
                          AIR 142
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-400">695 / 720</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden border border-blue-500/40 bg-zinc-800 shrink-0">
                          <img
                            src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80"
                            alt="Chaithra"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-white dark:text-zinc-100 truncate">
                            Chaithra
                          </h4>
                          <div className="text-[11px] text-zinc-400 truncate flex items-center gap-1">
                            <School className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>MAMC New Delhi</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-300 dark:text-zinc-400 leading-relaxed bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-800/80">
                        <strong className="text-emerald-400">Specialty:</strong> Physical &amp; Organic Chemistry Mechanisms, Speed Calculation &amp; Stamina.
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-zinc-800/80">
                      {onBookMoreSessions && (
                        <button
                          type="button"
                          onClick={onBookMoreSessions}
                          className="w-full py-2 px-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-emerald-500 text-black hover:bg-emerald-400 transition cursor-pointer"
                        >
                          Book 1-on-1 Call
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Mentor 4 */}
                  <div
                    className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                      isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-500/15 text-blue-300 border border-blue-500/30">
                          AIR 200
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-400">686 / 720</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden border border-blue-500/40 bg-zinc-800 shrink-0">
                          <img
                            src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80"
                            alt="Ayush Prasad"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-white dark:text-zinc-100 truncate">
                            Ayush Prasad
                          </h4>
                          <div className="text-[11px] text-zinc-400 truncate flex items-center gap-1">
                            <School className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>UCMS Delhi</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-300 dark:text-zinc-400 leading-relaxed bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-800/80">
                        <strong className="text-emerald-400">Specialty:</strong> High-Yield Formulas, Negative Mark Elimination &amp; Mock Exam Allocation.
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-zinc-800/80">
                      {onBookMoreSessions && (
                        <button
                          type="button"
                          onClick={onBookMoreSessions}
                          className="w-full py-2 px-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-emerald-500 text-black hover:bg-emerald-400 transition cursor-pointer"
                        >
                          Book 1-on-1 Call
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Comparison Matrix: Free Tracker Alone vs AIR Mentorship Guided */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                      The Ranker Difference
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                      Free Syllabus Tracker vs. AIR 1-on-1 Mentorship
                    </h2>
                  </div>
                </div>

                <div
                  className={`rounded-2xl border overflow-x-auto ${
                    isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr
                        className={`border-b text-zinc-400 font-mono uppercase text-[10px] tracking-wider ${
                          isDark ? 'border-zinc-800 bg-zinc-900/80' : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <th className="py-3.5 px-4">Feature / Dimension</th>
                        <th className="py-3.5 px-4 text-center">Free Syllabus Tracker (Current)</th>
                        <th className="py-3.5 px-4 text-center text-emerald-400 font-bold">
                          AIR &lt; 100 1-on-1 Mentorship
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      <tr className={isDark ? 'hover:bg-zinc-800/20' : 'hover:bg-slate-50'}>
                        <td className="py-3 px-4 font-semibold text-zinc-200">
                          65-Chapter NEET UG Checklists
                        </td>
                        <td className="py-3 px-4 text-center text-zinc-400">
                          Included (Self-recorded checkmarks)
                        </td>
                        <td className="py-3 px-4 text-center text-emerald-400 font-semibold">
                          Topper verifies depth &amp; tests active recall
                        </td>
                      </tr>
                      <tr className={isDark ? 'hover:bg-zinc-800/20' : 'hover:bg-slate-50'}>
                        <td className="py-3 px-4 font-semibold text-zinc-200">
                          High-Yield Block Prioritization
                        </td>
                        <td className="py-3 px-4 text-center text-zinc-400">
                          Static Block A/B/C breakdown
                        </td>
                        <td className="py-3 px-4 text-center text-emerald-400 font-semibold">
                          Customized to your exact scoring weaknesses
                        </td>
                      </tr>
                      <tr className={isDark ? 'hover:bg-zinc-800/20' : 'hover:bg-slate-50'}>
                        <td className="py-3 px-4 font-semibold text-zinc-200">
                          Mock Test Error Log Analysis
                        </td>
                        <td className="py-3 px-4 text-center text-zinc-400">
                          Self-log scores only
                        </td>
                        <td className="py-3 px-4 text-center text-emerald-400 font-semibold">
                          Topper isolates why you picked incorrect options
                        </td>
                      </tr>
                      <tr className={isDark ? 'hover:bg-zinc-800/20' : 'hover:bg-slate-50'}>
                        <td className="py-3 px-4 font-semibold text-zinc-200">
                          Negative Marking Eradication (-30 Marks)
                        </td>
                        <td className="py-3 px-4 text-center text-red-400">
                          Trial and error (35+ marks leaked)
                        </td>
                        <td className="py-3 px-4 text-center text-emerald-400 font-semibold">
                          Elimination rules &amp; question-skipping criteria
                        </td>
                      </tr>
                      <tr className={isDark ? 'hover:bg-zinc-800/20' : 'hover:bg-slate-50'}>
                        <td className="py-3 px-4 font-semibold text-zinc-200">
                          1-on-1 Live Video Consultations
                        </td>
                        <td className="py-3 px-4 text-center text-zinc-500">—</td>
                        <td className="py-3 px-4 text-center text-emerald-400 font-semibold">
                          Weekly Google Meet calls with AIIMS rankers
                        </td>
                      </tr>
                      <tr className={isDark ? 'hover:bg-zinc-800/20' : 'hover:bg-slate-50'}>
                        <td className="py-3 px-4 font-semibold text-zinc-200">
                          Direct WhatsApp Mentor Access
                        </td>
                        <td className="py-3 px-4 text-center text-zinc-500">—</td>
                        <td className="py-3 px-4 text-center text-emerald-400 font-semibold">
                          Direct priority doubt chat with your mentor
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Quick-Start Callout */}
              <div
                className={`p-6 sm:p-8 rounded-3xl border text-center space-y-4 ${
                  isDark
                    ? 'bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-teal-950/40 border-emerald-500/40'
                    : 'bg-gradient-to-r from-emerald-50 via-white to-teal-50 border-emerald-200'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 max-w-xl mx-auto">
                  <h3 className="text-xl sm:text-2xl font-black">
                    Start with a 1-on-1 Strategy Call Today
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Test out the mentorship with a single 45-minute diagnostic session for just ₹499. If you don&apos;t get immediate clarity on your negative marks and revision roadmap, 100% money-back guarantee.
                  </p>
                </div>
                {onBookMoreSessions && (
                  <button
                    type="button"
                    onClick={onBookMoreSessions}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-400 text-black hover:brightness-110 shadow-lg active:scale-95 transition cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Book Strategy Call (₹499)</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ASPIRANT PROFILE ("this profile") */}
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
                <div>
                  <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                    Aspirant Academic Identity
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    My Profile & Settings
                  </h1>
                </div>

                <div>
                  {!isEditingProfile ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEditProfileForm(profile);
                        setIsEditingProfile(true);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer border ${
                        isDark
                          ? 'border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800'
                          : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2 rounded-xl text-xs font-mono text-zinc-400 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {profileSaveSuccess && (
                <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-mono">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Profile updated successfully! Persistent across your sessions.</span>
                </div>
              )}

              {/* First-time registration or incomplete profile guidance banner */}
              {(!profile.isProfileComplete || autoEditProfile) && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-teal-950/50 to-blue-950/60 border border-emerald-500/40 text-emerald-200 text-xs space-y-2 mb-6 shadow-md backdrop-blur-sm">
                  <div className="flex items-center gap-2 font-bold font-mono text-sm text-emerald-300">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Welcome to your personalized Aspirant Dashboard!</span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed font-sans">
                    Please fill in your preparation details below (Target NEET Year, Category, Current Mock Benchmark, Target Score, Dream Medical College, and Coaching). Your assigned AIR ranker mentors will use this diagnostic information to personalize your 1-on-1 strategy sessions and custom timetable.
                  </p>
                </div>
              )}

              {/* View / Edit Mode */}
              {!isEditingProfile ? (
                <div className="space-y-6">
                  {/* Profile Header Card */}
                  <div
                    className={`p-6 sm:p-8 rounded-3xl border ${
                      isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                      <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shrink-0">
                        <div className="w-full h-full rounded-[22px] bg-[#0c0c0f] flex items-center justify-center font-black text-3xl text-emerald-400">
                          {profile.fullName.charAt(0)}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-white dark:text-zinc-100">
                          {profile.fullName}
                        </h2>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-mono">
                          <span>{profile.email}</span>
                          <span>·</span>
                          <span>{profile.phone}</span>
                          <span>·</span>
                          <span className="text-emerald-400">{profile.category}</span>
                        </div>
                        <p className="text-xs text-zinc-300 max-w-2xl pt-2 leading-relaxed">
                          {profile.bio}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Academic Details 2-Column Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div
                      className={`p-6 rounded-2xl border space-y-4 ${
                        isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-slate-200'
                      }`}
                    >
                      <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-emerald-400">
                        Exam Goals & College Target
                      </h3>
                      <div className="space-y-3 text-xs">
                        <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                          <span className="text-zinc-400">Target NEET Year:</span>
                          <span className="font-mono font-bold text-white">NEET {profile.neetTargetYear}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                          <span className="text-zinc-400">Dream Medical College:</span>
                          <span className="font-bold text-emerald-400">{profile.dreamCollege}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                          <span className="text-zinc-400">Target Score Goal:</span>
                          <span className="font-mono font-bold text-white tabular-nums">
                            {profile.targetScore} / 720
                          </span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                          <span className="text-zinc-400">Current Mock Benchmark:</span>
                          <span className="font-mono font-bold text-amber-400 tabular-nums">
                            {profile.currentMockScore} / 720
                          </span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-zinc-400">Daily Self-Study Hours:</span>
                          <span className="font-mono font-bold text-white tabular-nums">
                            {profile.dailyStudyHours} Hours/day
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`p-6 rounded-2xl border space-y-4 ${
                        isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-slate-200'
                      }`}
                    >
                      <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-emerald-400">
                        Mentorship & Subject Allocation
                      </h3>
                      <div className="space-y-3 text-xs">
                        <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                          <span className="text-zinc-400">Current Coaching:</span>
                          <span className="font-medium text-white">{profile.coachingInstitute}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                          <span className="text-zinc-400">Strongest Subject:</span>
                          <span className="font-bold text-emerald-400">{profile.strongSubject}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                          <span className="text-zinc-400">Primary Bottleneck:</span>
                          <span className="font-bold text-red-400">{profile.weakSubject}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                          <span className="text-zinc-400">Assigned 1-on-1 AIR Mentor:</span>
                          <span className="font-bold text-white">
                            {profile.assignedMentorName} ({profile.assignedMentorAir})
                          </span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-zinc-400">Mentor College:</span>
                          <span className="font-mono text-zinc-300">{profile.assignedMentorCollege}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Profile Edit Form */
                <form
                  onSubmit={handleSaveProfile}
                  className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
                    isDark ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-slate-200 shadow-md'
                  }`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                    <div>
                      <label className="block font-mono text-zinc-400 mb-1.5 font-bold">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={editProfileForm.fullName}
                        onChange={(e) =>
                          setEditProfileForm({ ...editProfileForm, fullName: e.target.value })
                        }
                        required
                        className={`w-full px-3.5 py-2.5 rounded-xl border font-sans text-sm ${
                          isDark
                            ? 'bg-zinc-950 border-zinc-700 text-white'
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-zinc-400 mb-1.5 font-bold">
                        Phone / WhatsApp
                      </label>
                      <input
                        type="text"
                        value={editProfileForm.phone}
                        onChange={(e) =>
                          setEditProfileForm({ ...editProfileForm, phone: e.target.value })
                        }
                        className={`w-full px-3.5 py-2.5 rounded-xl border font-sans text-sm ${
                          isDark
                            ? 'bg-zinc-950 border-zinc-700 text-white'
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-zinc-400 mb-1.5 font-bold">
                        Target NEET Year
                      </label>
                      <select
                        value={editProfileForm.neetTargetYear}
                        onChange={(e) =>
                          setEditProfileForm({
                            ...editProfileForm,
                            neetTargetYear: e.target.value as any,
                          })
                        }
                        className={`w-full px-3.5 py-2.5 rounded-xl border font-sans text-sm ${
                          isDark
                            ? 'bg-zinc-950 border-zinc-700 text-white'
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value="2025">NEET UG 2025</option>
                        <option value="2026">NEET UG 2026</option>
                        <option value="2027">NEET UG 2027</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-mono text-zinc-400 mb-1.5 font-bold">
                        Category / Status
                      </label>
                      <select
                        value={editProfileForm.category}
                        onChange={(e) =>
                          setEditProfileForm({
                            ...editProfileForm,
                            category: e.target.value as any,
                          })
                        }
                        className={`w-full px-3.5 py-2.5 rounded-xl border font-sans text-sm ${
                          isDark
                            ? 'bg-zinc-950 border-zinc-700 text-white'
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value="Class 12th">Class 12th Regular</option>
                        <option value="1st Year Dropper">1st Year Dropper / Repeater</option>
                        <option value="2nd Year Dropper">2nd Year Dropper</option>
                        <option value="Class 11th Foundation">Class 11th Foundation</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-mono text-zinc-400 mb-1.5 font-bold">
                        Dream Medical College
                      </label>
                      <input
                        type="text"
                        value={editProfileForm.dreamCollege}
                        onChange={(e) =>
                          setEditProfileForm({ ...editProfileForm, dreamCollege: e.target.value })
                        }
                        placeholder="e.g. AIIMS New Delhi / MAMC"
                        className={`w-full px-3.5 py-2.5 rounded-xl border font-sans text-sm ${
                          isDark
                            ? 'bg-zinc-950 border-zinc-700 text-white'
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-zinc-400 mb-1.5 font-bold">
                        Target Score (Out of 720)
                      </label>
                      <input
                        type="number"
                        min="300"
                        max="720"
                        value={editProfileForm.targetScore}
                        onChange={(e) =>
                          setEditProfileForm({
                            ...editProfileForm,
                            targetScore: parseInt(e.target.value, 10) || 680,
                          })
                        }
                        className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-sm ${
                          isDark
                            ? 'bg-zinc-950 border-zinc-700 text-white'
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-zinc-400 mb-1.5 font-bold">
                        Coaching Institute / School
                      </label>
                      <input
                        type="text"
                        value={editProfileForm.coachingInstitute}
                        onChange={(e) =>
                          setEditProfileForm({
                            ...editProfileForm,
                            coachingInstitute: e.target.value,
                          })
                        }
                        placeholder="e.g. Allen Kota / PW / Self Study"
                        className={`w-full px-3.5 py-2.5 rounded-xl border font-sans text-sm ${
                          isDark
                            ? 'bg-zinc-950 border-zinc-700 text-white'
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-zinc-400 mb-1.5 font-bold">
                        Daily Self-Study Hours
                      </label>
                      <input
                        type="number"
                        min="2"
                        max="18"
                        value={editProfileForm.dailyStudyHours}
                        onChange={(e) =>
                          setEditProfileForm({
                            ...editProfileForm,
                            dailyStudyHours: parseInt(e.target.value, 10) || 8,
                          })
                        }
                        className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-sm ${
                          isDark
                            ? 'bg-zinc-950 border-zinc-700 text-white'
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-mono text-zinc-400 mb-1.5 font-bold">
                        Aspirant Goal & Preparation Notes
                      </label>
                      <textarea
                        rows={3}
                        value={editProfileForm.bio}
                        onChange={(e) =>
                          setEditProfileForm({ ...editProfileForm, bio: e.target.value })
                        }
                        className={`w-full px-3.5 py-2.5 rounded-xl border font-sans text-sm leading-relaxed ${
                          isDark
                            ? 'bg-zinc-950 border-zinc-700 text-white'
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2 rounded-xl text-xs font-mono text-zinc-400 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer shadow-md ${
                        isDark
                          ? 'bg-[#3B82F6] text-white hover:bg-[#2563EB]'
                          : 'bg-[#0066FF] text-white hover:bg-[#0052cc]'
                      }`}
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: PAYMENT STATUS */}
          {activeTab === 'payments' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
                <div>
                  <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                    Billing & Subscriptions
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Payment Status & Active Tiers
                  </h1>
                </div>

                {onBookMoreSessions && (
                  <button
                    type="button"
                    onClick={onBookMoreSessions}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer shadow-sm border ${
                      isDark
                        ? 'bg-[#3B82F6] text-white border-[#3B82F6]/60 hover:bg-[#2563EB]'
                        : 'bg-[#0066FF] text-white border-[#0066FF]/60 hover:bg-[#0052cc]'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Book Strategy Call</span>
                  </button>
                )}
              </div>

              {/* Active Plan Spotlight Card */}
              <div
                className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden ${
                  isDark
                    ? 'bg-gradient-to-br from-purple-950/40 via-zinc-900/80 to-zinc-950 border-purple-500/30'
                    : 'bg-gradient-to-br from-purple-50 via-white to-slate-50 border-purple-200 shadow-sm'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      <span>Current Active Membership</span>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">
                      Purple Tier 1-on-1 Mentorship (AIR 1–100 / 200)
                    </h2>
                    <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
                      Assigned AIR Topper: <strong className="text-white">{profile.assignedMentorName}</strong> ({profile.assignedMentorAir}). Includes comprehensive negative marking audits, error log audits, and weekly tactical roadmaps.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 shrink-0">
                    <div className="space-y-1">
                      <div className="text-[11px] font-mono text-zinc-400">Sessions Balance</div>
                      <div className="text-2xl font-extrabold font-mono tabular-nums text-emerald-400">
                        1 of 2 Sessions Remaining
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono">
                        Valid through 18 Nov 2026
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-black/40 border border-zinc-800 text-xs font-mono space-y-1">
                      <div className="text-zinc-500 text-[10px]">NEXT SCHEDULED SLOT:</div>
                      <div className="font-bold text-white">Saturday, 07:00 PM</div>
                      <div className="text-emerald-400 text-[11px]">Google Meet link sent via WhatsApp</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mentorship Upgrade & Additional Sessions Grid */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h2 className="text-lg font-bold tracking-tight">Available Mentorship Tiers</h2>
                  <span className="text-xs font-mono text-zinc-400">1-click direct booking via UPI or Card</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className={`p-5 rounded-2xl border flex flex-col justify-between ${isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-slate-200'}`}>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">Diagnostic</span>
                      <h3 className="font-bold text-sm mt-1">Single Strategy Call</h3>
                      <div className="text-xl font-bold font-mono text-white dark:text-zinc-100 my-2">₹499</div>
                      <p className="text-xs text-zinc-400">45-min deep dive mock &amp; tracker audit.</p>
                    </div>
                    {onBookMoreSessions && (
                      <button
                        type="button"
                        onClick={onBookMoreSessions}
                        className="mt-4 w-full py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-emerald-500 text-black hover:bg-emerald-400 transition cursor-pointer"
                      >
                        Book Now
                      </button>
                    )}
                  </div>
                  <div className={`p-5 rounded-2xl border flex flex-col justify-between relative ${isDark ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-emerald-50/50 border-emerald-200'}`}>
                    <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-emerald-500 text-black">Popular</span>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-emerald-400">Intensive</span>
                      <h3 className="font-bold text-sm mt-1">30-Day Mentorship</h3>
                      <div className="text-xl font-bold font-mono text-emerald-400 my-2">₹2,999</div>
                      <p className="text-xs text-zinc-400">4 weekly 1-on-1 calls + WhatsApp doubt support.</p>
                    </div>
                    {onBookMoreSessions && (
                      <button
                        type="button"
                        onClick={onBookMoreSessions}
                        className="mt-4 w-full py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-emerald-500 text-black hover:bg-emerald-400 transition cursor-pointer"
                      >
                        Enroll Now
                      </button>
                    )}
                  </div>
                  <div className={`p-5 rounded-2xl border flex flex-col justify-between ${isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-slate-200'}`}>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-purple-400">Comprehensive</span>
                      <h3 className="font-bold text-sm mt-1">Full Season AIR 100</h3>
                      <div className="text-xl font-bold font-mono text-white dark:text-zinc-100 my-2">₹6,999</div>
                      <p className="text-xs text-zinc-400">12 1-on-1 calls + 24/7 priority support until NEET.</p>
                    </div>
                    {onBookMoreSessions && (
                      <button
                        type="button"
                        onClick={onBookMoreSessions}
                        className="mt-4 w-full py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-purple-600 text-white hover:bg-purple-500 transition cursor-pointer"
                      >
                        Enroll Now
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Transactions History */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold tracking-tight">Transaction History & Receipts</h2>
                <div
                  className={`rounded-2xl border overflow-x-auto ${
                    isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr
                        className={`border-b text-zinc-400 font-mono uppercase text-[10px] tracking-wider ${
                          isDark ? 'border-zinc-800 bg-zinc-900/80' : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <th className="py-3.5 px-4">Invoice ID</th>
                        <th className="py-3.5 px-4">Plan / Service</th>
                        <th className="py-3.5 px-4">Date</th>
                        <th className="py-3.5 px-4">Payment Method</th>
                        <th className="py-3.5 px-4 text-right">Amount</th>
                        <th className="py-3.5 px-4 text-center">Status</th>
                        <th className="py-3.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-mono">
                      {payments.map((tx) => (
                        <tr
                          key={tx.id}
                          className={`transition-colors ${
                            isDark ? 'hover:bg-zinc-800/30' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-3.5 px-4 font-bold text-zinc-300">{tx.invoiceId}</td>
                          <td className="py-3.5 px-4 font-sans font-medium text-white">
                            <div>{tx.planName}</div>
                            <div className="text-[11px] text-zinc-400 font-mono">
                              Mentor: {tx.mentorAssigned} ({tx.mentorAir})
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-zinc-400">{tx.date}</td>
                          <td className="py-3.5 px-4 text-zinc-400">{tx.paymentMethod}</td>
                          <td className="py-3.5 px-4 text-right font-bold tabular-nums text-white">
                            ₹{tx.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                tx.status === 'Confirmed'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-zinc-800 text-zinc-300'
                              }`}
                            >
                              {tx.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedInvoice(tx)}
                              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 cursor-pointer underline underline-offset-2"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Receipt</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TRANSCRIPTS & RECORDINGS */}
          {activeTab === 'recordings' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
                <div>
                  <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                    Post-Session Intelligence
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Session Recordings & Transcripts
                  </h1>
                </div>

                <div className="text-xs font-mono text-zinc-400">
                  {recordings.length} Recorded Strategy Sessions
                </div>
              </div>

              {/* Session Selector Strip */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {recordings.map((rec) => {
                  const isSelected = rec.id === activeRecording?.id;
                  return (
                    <button
                      key={rec.id}
                      type="button"
                      onClick={() => setSelectedRecordingId(rec.id)}
                      className={`px-4 py-3 rounded-2xl border text-left shrink-0 transition-all cursor-pointer min-w-[260px] ${
                        isSelected
                          ? isDark
                            ? 'bg-zinc-900 border-emerald-500/60 shadow-md text-white'
                            : 'bg-white border-emerald-500 shadow-sm text-slate-900'
                          : isDark
                          ? 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                          : 'bg-slate-100/70 border-slate-200 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                        {rec.sessionDate} · {rec.duration}
                      </div>
                      <div className="text-xs font-bold line-clamp-1 mt-0.5">
                        {rec.title}
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono mt-1">
                        With {rec.mentorName} ({rec.mentorAir})
                      </div>
                    </button>
                  );
                })}
              </div>

              {activeRecording && (
                <div className="space-y-6">
                  {/* Interactive Audio/Video Player Preview Card */}
                  <div
                    className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
                      isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold">{activeRecording.title}</h2>
                        <div className="text-xs text-zinc-400 font-mono mt-1">
                          Mentor: <span className="text-emerald-400 font-bold">{activeRecording.mentorName}</span> ({activeRecording.mentorAir} · {activeRecording.mentorCollege})
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-zinc-400">Speed:</span>
                        {[1, 1.25, 1.5, 2].map((spd) => (
                          <button
                            key={spd}
                            type="button"
                            onClick={() => setPlaybackSpeed(spd)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                              playbackSpeed === spd
                                ? 'bg-emerald-500 text-black font-bold'
                                : isDark
                                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            }`}
                          >
                            {spd}x
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Waveform / Scrub bar */}
                    <div className="space-y-2">
                      <div className="h-14 rounded-2xl bg-black/50 border border-zinc-800/80 px-4 flex items-center justify-between gap-1 overflow-hidden">
                        {Array.from({ length: 48 }).map((_, idx) => {
                          const height = Math.min(
                            100,
                            Math.max(20, Math.sin(idx * 0.4) * 50 + Math.cos(idx * 0.8) * 35 + 50)
                          );
                          const isPlayed = (idx / 48) * 100 <= playProgress;
                          return (
                            <div
                              key={idx}
                              onClick={() => setPlayProgress((idx / 48) * 100)}
                              className={`flex-1 rounded-full cursor-pointer transition-all ${
                                isPlayed
                                  ? 'bg-emerald-400'
                                  : isDark
                                  ? 'bg-zinc-700 hover:bg-zinc-600'
                                  : 'bg-slate-300 hover:bg-slate-400'
                              }`}
                              style={{ height: `${height}%` }}
                            />
                          );
                        })}
                      </div>

                      {/* Timeline Indicators */}
                      <div className="flex justify-between text-[11px] font-mono text-zinc-400 px-1">
                        <span>14:48</span>
                        <span>{activeRecording.duration}</span>
                      </div>
                    </div>

                    {/* Controls Row */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setIsPlaying(!isPlaying)}
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md ${
                            isDark
                              ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                          aria-label={isPlaying ? 'Pause Recording' : 'Play Recording'}
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5 fill-current" />
                          ) : (
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setPlayProgress(0)}
                          className={`p-2.5 rounded-xl border text-xs font-mono transition-colors cursor-pointer ${
                            isDark
                              ? 'border-zinc-800 text-zinc-400 hover:text-white'
                              : 'border-slate-200 text-slate-600 hover:text-slate-900'
                          }`}
                          title="Restart from beginning"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                        <Volume2 className="w-4 h-4 text-emerald-400" />
                        <span>High-Fidelity Audio / Zoom Recording</span>
                      </div>
                    </div>
                  </div>

                  {/* 2-Column: Key Takeaways & Action Items */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div
                      className={`p-6 rounded-2xl border space-y-3 ${
                        isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                        <Sparkles className="w-4 h-4" />
                        <span>Key Strategic Takeaways</span>
                      </div>
                      <div className="space-y-2.5 text-xs text-zinc-300 leading-relaxed">
                        {activeRecording.keyTakeaways.map((point, idx) => (
                          <div key={idx} className="flex items-start gap-2.5">
                            <span className="text-emerald-400 font-mono font-bold shrink-0">
                              0{idx + 1}.
                            </span>
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div
                      className={`p-6 rounded-2xl border space-y-3 ${
                        isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-sm text-amber-400">
                        <Target className="w-4 h-4" />
                        <span>Mentor Assigned Action Items</span>
                      </div>
                      <div className="space-y-2.5 text-xs text-zinc-300 leading-relaxed">
                        {activeRecording.actionItems.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Verbatim Transcript Viewer with Live Search */}
                  <div
                    className={`p-6 sm:p-8 rounded-3xl border space-y-5 ${
                      isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
                      <div>
                        <h3 className="text-base font-bold">Verbatim Session Transcript</h3>
                        <p className="text-xs text-zinc-400">
                          Search key discussions, formulas, or advice given during the call.
                        </p>
                      </div>

                      <div className="relative w-full sm:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                          type="text"
                          value={transcriptSearch}
                          onChange={(e) => setTranscriptSearch(e.target.value)}
                          placeholder="Search in transcript..."
                          className={`w-full pl-9 pr-3.5 py-1.5 rounded-xl border text-xs font-sans ${
                            isDark
                              ? 'bg-zinc-950 border-zinc-700 text-white placeholder-zinc-500'
                              : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2">
                      {filteredTranscriptLines.length === 0 ? (
                        <div className="py-8 text-center text-xs font-mono text-zinc-500">
                          No matching dialogue lines found for "{transcriptSearch}".
                        </div>
                      ) : (
                        filteredTranscriptLines.map((line, idx) => {
                          const isMentor = line.speaker.includes('AIR');
                          return (
                            <div
                              key={idx}
                              className={`p-4 rounded-xl border text-xs transition-colors ${
                                isMentor
                                  ? isDark
                                    ? 'bg-emerald-950/20 border-emerald-500/20 text-zinc-200'
                                    : 'bg-emerald-50/60 border-emerald-100 text-slate-800'
                                  : isDark
                                  ? 'bg-zinc-950/40 border-zinc-800/80 text-zinc-300'
                                  : 'bg-slate-50 border-slate-200 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1.5 font-mono text-[11px]">
                                <span
                                  className={`font-bold ${
                                    isMentor ? 'text-emerald-400' : 'text-sky-400'
                                  }`}
                                >
                                  {line.speaker}
                                </span>
                                <span className="text-zinc-500 tabular-nums">
                                  [{line.timestamp}]
                                </span>
                              </div>
                              <p className="leading-relaxed">{line.text}</p>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PLAN PREPARED (Custom NEET Study Plan) */}
          {activeTab === 'plan' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
                <div>
                  <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                    Custom Revision Roadmap
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {studyPlan.planTitle}
                  </h1>
                </div>

                <div className="text-xs font-mono text-zinc-400">
                  Prepared by: <span className="font-bold text-white">{studyPlan.preparedBy}</span> ({studyPlan.mentorAir})
                </div>
              </div>

              {/* Marks MathonGo Syllabus Tracker Integration Banner */}
              <div
                className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDark
                    ? 'bg-gradient-to-r from-blue-950/40 via-zinc-900 to-emerald-950/20 border-blue-500/30'
                    : 'bg-gradient-to-r from-blue-50 via-white to-emerald-50 border-blue-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      100% Free Tool
                    </span>
                    <span className="text-xs font-mono text-zinc-400">Inspired by Marks MathonGo</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold font-sans">
                    Complete 65-Chapter NEET UG Syllabus Tracker & Analytics
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Track chapter weightage (Block A/B/C), NCERT line-by-line ticks, 2019–2024 PYQ count, and Rev 1 & 2 cycles.
                  </p>
                </div>

                {onOpenSyllabusTracker && (
                  <button
                    type="button"
                    onClick={onOpenSyllabusTracker}
                    className="shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold font-mono uppercase bg-[#3B82F6] hover:bg-blue-600 text-white transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>Open Tracker</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Mentorship Upgrade Callout for Personalized Study Plan */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDark
                    ? 'bg-gradient-to-r from-purple-950/30 via-zinc-900 to-emerald-950/30 border-purple-500/30'
                    : 'bg-gradient-to-r from-purple-50 via-white to-emerald-50 border-purple-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-purple-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Personalized Revision Timetable Service</span>
                  </div>
                  <h4 className="font-bold text-sm">
                    Want an AIIMS Delhi Topper to customize this timetable to your actual Syllabus Tracker completion?
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Our mentors align your coaching schedule, mock test dates, and weak chapters into a customized 7-day schedule with daily accountability.
                  </p>
                </div>
                {onBookMoreSessions && (
                  <button
                    type="button"
                    onClick={onBookMoreSessions}
                    className="shrink-0 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-400 text-black hover:brightness-110 transition cursor-pointer shadow-xs active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Get Custom AIR Plan (₹499)</span>
                  </button>
                )}
              </div>

              {/* Progress Summary Banner */}
              <div
                className={`p-6 rounded-3xl border ${
                  isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                  <div>
                    <div className="text-xs font-mono text-zinc-400">High-Yield Syllabus Mastery</div>
                    <div className="text-xl font-bold font-mono">
                      {checklistStats.completed} of {checklistStats.total} Core Chapters Mastered
                    </div>
                  </div>
                  <div className="text-2xl font-black font-mono text-emerald-400 tabular-nums">
                    {checklistStats.percent}% Complete
                  </div>
                </div>
                <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${checklistStats.percent}%` }}
                  />
                </div>
              </div>

              {/* Daily Schedule Timeline Grid */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold tracking-tight">Recommended Daily Timetable</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {studyPlan.dailySchedule.map((slot, idx) => (
                    <div
                      key={idx}
                      className={`p-5 rounded-2xl border space-y-2 ${
                        isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono text-xs">
                        <span className="text-emerald-400 font-bold">{slot.time}</span>
                        <span className="text-[10px] uppercase tracking-wider text-zinc-400 px-2 py-0.5 rounded bg-zinc-800/80">
                          {slot.focusType}
                        </span>
                      </div>
                      <div className="font-bold text-sm text-white">{slot.subject}</div>
                      <p className="text-xs text-zinc-400 leading-relaxed">{slot.activity}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Milestones */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold tracking-tight">4-Week Tactical Roadmap</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {studyPlan.weeklyRoadmap.map((wk) => (
                    <div
                      key={wk.weekNumber}
                      className={`p-6 rounded-2xl border space-y-3 ${
                        wk.status === 'completed'
                          ? isDark
                            ? 'bg-emerald-950/15 border-emerald-500/30'
                            : 'bg-emerald-50/50 border-emerald-200'
                          : wk.status === 'in_progress'
                          ? isDark
                            ? 'bg-amber-950/15 border-amber-500/30'
                            : 'bg-amber-50/50 border-amber-200'
                          : isDark
                          ? 'bg-zinc-900/40 border-zinc-800'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                          Week 0{wk.weekNumber}
                        </div>
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                            wk.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : wk.status === 'in_progress'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {wk.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-white">{wk.title}</h3>
                      <p className="text-xs text-zinc-400">{wk.focus}</p>
                      <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
                        {wk.deliverables.map((item, dIdx) => (
                          <div key={dIdx} className="flex items-center gap-2 text-xs text-zinc-300">
                            <CheckCircle2
                              className={`w-3.5 h-3.5 shrink-0 ${
                                wk.status === 'completed' ? 'text-emerald-400' : 'text-zinc-500'
                              }`}
                            />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* High-Yield Chapter Interactive Checklist */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold tracking-tight">
                    High-Yield Chapter Priority Checklist
                  </h2>
                  <span className="text-xs text-zinc-400 font-mono">
                    Click checkbox to record completed revision
                  </span>
                </div>

                <div
                  className={`rounded-2xl border divide-y overflow-hidden ${
                    isDark
                      ? 'bg-zinc-900/40 border-zinc-800 divide-zinc-800/80'
                      : 'bg-white border-slate-200 divide-slate-100 shadow-xs'
                  }`}
                >
                  {studyPlan.highYieldChecklist.map((ch) => (
                    <div
                      key={ch.id}
                      onClick={() => handleToggleChapter(ch.id)}
                      className={`p-4 flex items-center justify-between gap-4 transition-colors cursor-pointer select-none ${
                        isDark ? 'hover:bg-zinc-800/30' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                            ch.completed
                              ? 'bg-emerald-500 border-emerald-500 text-black'
                              : isDark
                              ? 'border-zinc-700 bg-zinc-800'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {ch.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div>
                          <div
                            className={`text-xs font-semibold ${
                              ch.completed
                                ? 'line-through text-zinc-500 dark:text-zinc-500'
                                : 'text-zinc-100'
                            }`}
                          >
                            {ch.name}
                          </div>
                          <div className="text-[11px] font-mono text-zinc-400">
                            {ch.subject} · {ch.weightage}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                          ch.priority === 'High Yield'
                            ? 'bg-red-500/15 text-red-300 border border-red-500/20'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {ch.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mentor Directives Card */}
              <div
                className={`p-6 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-100/60 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                  <Award className="w-4 h-4" />
                  <span>Direct Examination Directives from AIR 200 Ayush Prasad</span>
                </div>
                <div className="space-y-2 text-xs leading-relaxed text-zinc-300">
                  {studyPlan.mentorDirectives.map((dir, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-mono font-bold">»</span>
                      <span>{dir}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: DAILY QUESTION (OQAD - One Question A Day) */}
          {activeTab === 'daily_question' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
                <div>
                  <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                    OQAD · One Question A Day
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Daily High-Yield NEET Challenge
                  </h1>
                </div>

                {/* Subject Segmented Filter */}
                <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
                  {(['All', 'Biology', 'Physics', 'Chemistry'] as const).map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => {
                        setQuestionSubjectFilter(sub);
                        setSelectedQuestionIndex(0);
                        setSelectedOption(null);
                        setHasSubmittedAnswer(false);
                      }}
                      className={`px-3 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                        questionSubjectFilter === sub
                          ? 'bg-emerald-500 text-black font-bold'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Card */}
              {currentDailyQuestion && (
                <div
                  className={`p-6 sm:p-9 rounded-3xl border space-y-6 relative ${
                    isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200 shadow-md'
                  }`}
                >
                  {/* Question Top Metadata & Timer */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800/80 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[11px]">
                        {currentDailyQuestion.subject}
                      </span>
                      <span className="text-zinc-400">·</span>
                      <span className="text-zinc-300">{currentDailyQuestion.chapter}</span>
                      <span className="text-zinc-400">·</span>
                      <span className="text-zinc-500">{currentDailyQuestion.examCitation}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/40 border border-zinc-800 text-amber-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="tabular-nums font-bold">
                          00:{questionTimerSeconds.toString().padStart(2, '0')}
                        </span>
                      </div>
                      <div className="text-zinc-400">
                        Marking: <span className="text-emerald-400 font-bold">+4</span> /{' '}
                        <span className="text-red-400 font-bold">-1</span>
                      </div>
                    </div>
                  </div>

                  {/* Question Prompt */}
                  <div className="text-base sm:text-lg font-medium leading-relaxed text-zinc-100">
                    {currentDailyQuestion.question}
                  </div>

                  {/* MCQ Options A, B, C, D */}
                  <div className="space-y-3 pt-2">
                    {currentDailyQuestion.options.map((opt, optIdx) => {
                      const letter = ['A', 'B', 'C', 'D'][optIdx];
                      const isSelected = selectedOption === optIdx;
                      const isCorrect = optIdx === currentDailyQuestion.correctAnswer;

                      let optionStyle = isDark
                        ? 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300';

                      if (hasSubmittedAnswer) {
                        if (isCorrect) {
                          optionStyle =
                            'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold';
                        } else if (isSelected && !isCorrect) {
                          optionStyle =
                            'bg-red-500/20 border-red-500 text-red-300 font-semibold';
                        }
                      } else if (isSelected) {
                        optionStyle = isDark
                          ? 'bg-zinc-800 border-[#3B82F6] text-white shadow-xs'
                          : 'bg-blue-50 border-[#0066FF] text-blue-900 shadow-xs';
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={hasSubmittedAnswer}
                          onClick={() => setSelectedOption(optIdx)}
                          className={`w-full p-4 rounded-2xl border text-left flex items-center gap-4 transition-all cursor-pointer ${optionStyle}`}
                        >
                          <div
                            className={`w-8 h-8 rounded-xl font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
                              hasSubmittedAnswer && isCorrect
                                ? 'bg-emerald-500 text-black'
                                : hasSubmittedAnswer && isSelected && !isCorrect
                                ? 'bg-red-500 text-white'
                                : isSelected
                                ? isDark
                                  ? 'bg-[#3B82F6] text-white'
                                  : 'bg-[#0066FF] text-white'
                                : isDark
                                ? 'bg-zinc-800 text-zinc-300'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {letter}
                          </div>
                          <span className="text-sm">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Submit / Feedback Row */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-800/80">
                    <div>
                      {hasSubmittedAnswer && (
                        <div className="flex items-center gap-2 font-mono text-xs">
                          {selectedOption === currentDailyQuestion.correctAnswer ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" /> Correct Answer! (+4 Marks)
                            </span>
                          ) : (
                            <span className="text-red-400 font-bold flex items-center gap-1.5">
                              <AlertCircle className="w-4 h-4" /> Incorrect (-1 Mark)
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {!hasSubmittedAnswer ? (
                        <button
                          type="button"
                          disabled={selectedOption === null}
                          onClick={handleAnswerSubmit}
                          className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                            selectedOption === null
                              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                              : isDark
                              ? 'bg-[#3B82F6] text-white hover:bg-[#2563EB]'
                              : 'bg-[#0066FF] text-white hover:bg-[#0052cc]'
                          }`}
                        >
                          Submit Answer
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const nextIdx = (selectedQuestionIndex + 1) % filteredQuestions.length;
                            handleSelectQuestion(nextIdx);
                          }}
                          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                            isDark
                              ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          <span>Next Question</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Step-by-Step NCERT Explanation (Unlocked upon submission) */}
                  {hasSubmittedAnswer && (
                    <div
                      className={`p-6 rounded-2xl border space-y-3 animate-in fade-in duration-300 ${
                        isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-400">
                        <span>Step-by-Step NCERT & Concept Solution</span>
                        <span className="text-zinc-500">{currentDailyQuestion.formulaOrConceptTag}</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        {currentDailyQuestion.explanation}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Archive of Daily Questions Bank */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold tracking-tight">Question Archive & Bank</h2>
                  <span className="text-xs font-mono text-zinc-400">
                    {solvedQuestions.length} of {DAILY_NEET_QUESTIONS_BANK.length} Solved
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {DAILY_NEET_QUESTIONS_BANK.map((q, idx) => {
                    const isSolved = solvedQuestions.includes(q.id);
                    const isCurrent = currentDailyQuestion?.id === q.id;
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => {
                          const targetIdx = filteredQuestions.findIndex((item) => item.id === q.id);
                          if (targetIdx !== -1) {
                            handleSelectQuestion(targetIdx);
                          } else {
                            setQuestionSubjectFilter('All');
                            const allIdx = DAILY_NEET_QUESTIONS_BANK.findIndex((item) => item.id === q.id);
                            handleSelectQuestion(allIdx);
                          }
                        }}
                        className={`p-4 rounded-2xl border text-left space-y-2 transition-all cursor-pointer ${
                          isCurrent
                            ? isDark
                              ? 'bg-zinc-900 border-emerald-500 shadow-md'
                              : 'bg-white border-emerald-500 shadow-sm'
                            : isDark
                            ? 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-emerald-400 font-bold">{q.subject}</span>
                          {isSolved ? (
                            <span className="text-emerald-400 flex items-center gap-1 font-bold">
                              <Check className="w-3 h-3" /> Solved
                            </span>
                          ) : (
                            <span className="text-zinc-500">Unattempted</span>
                          )}
                        </div>
                        <div className="text-xs font-semibold line-clamp-2 text-zinc-200">
                          {q.question}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono">{q.chapter}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Log Mock Test Modal */}
      {isLogMockOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setIsLogMockOpen(false)}
        >
          <div
            className={`w-full max-w-lg rounded-3xl border p-6 sm:p-7 shadow-2xl space-y-5 ${
              isDark ? 'bg-[#101014] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  Diagnostic Score Tracker
                </div>
                <h3 className="text-lg font-bold">Log New Mock Test Result</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLogMockOpen(false)}
                className="p-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMockTest} className="space-y-4 text-xs">
              <div>
                <label className="block font-mono text-zinc-400 mb-1 font-bold">
                  Mock Test Title / Series
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Allen Major Test 05 / Aakash AIATS"
                  value={mockName}
                  onChange={(e) => setMockName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-sans text-sm ${
                    isDark ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-mono text-amber-400 mb-1 font-bold">
                    Physics (/180)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="180"
                    required
                    value={mockPhysics}
                    onChange={(e) => setMockPhysics(parseInt(e.target.value, 10) || 0)}
                    className={`w-full px-3 py-2 rounded-xl border font-mono text-sm ${
                      isDark ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-mono text-sky-400 mb-1 font-bold">
                    Chemistry (/180)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="180"
                    required
                    value={mockChemistry}
                    onChange={(e) => setMockChemistry(parseInt(e.target.value, 10) || 0)}
                    className={`w-full px-3 py-2 rounded-xl border font-mono text-sm ${
                      isDark ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-mono text-emerald-400 mb-1 font-bold">
                    Biology (/360)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="360"
                    required
                    value={mockBiology}
                    onChange={(e) => setMockBiology(parseInt(e.target.value, 10) || 0)}
                    className={`w-full px-3 py-2 rounded-xl border font-mono text-sm ${
                      isDark ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="font-mono text-zinc-400">Total Calculated Score:</span>
                <span className="text-base font-extrabold font-mono text-emerald-400 tabular-nums">
                  {mockPhysics + mockChemistry + mockBiology} / 720
                </span>
              </div>

              <div>
                <label className="block font-mono text-red-400 mb-1 font-bold">
                  Negative Marks Lost (e.g. -24)
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  required
                  value={mockNegative}
                  onChange={(e) => setMockNegative(parseInt(e.target.value, 10) || 0)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-sm ${
                    isDark ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsLogMockOpen(false)}
                  className="px-4 py-2 rounded-xl font-mono text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-xl font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    isDark
                      ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  Save & Update Analytics
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Receipt Modal */}
      {selectedInvoice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setSelectedInvoice(null)}
        >
          <div
            className={`w-full max-w-md rounded-3xl border p-6 sm:p-7 shadow-2xl space-y-5 ${
              isDark ? 'bg-[#101014] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">Payment Receipt & Invoice</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="p-1 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Invoice Number:</span>
                <span className="font-bold text-white">{selectedInvoice.invoiceId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Date:</span>
                <span className="text-zinc-200">{selectedInvoice.date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Service:</span>
                <span className="font-sans font-bold text-white">{selectedInvoice.planName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Assigned Topper:</span>
                <span className="text-emerald-400 font-bold">
                  {selectedInvoice.mentorAssigned} ({selectedInvoice.mentorAir})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Payment Channel:</span>
                <span className="text-zinc-200">{selectedInvoice.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-2 text-sm">
                <span className="text-zinc-400">Total Amount Paid:</span>
                <span className="font-extrabold text-emerald-400 tabular-nums">
                  ₹{selectedInvoice.amount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedInvoice(null)}
              className="w-full py-2.5 rounded-xl font-bold font-mono uppercase tracking-wider bg-zinc-800 text-zinc-200 hover:bg-zinc-700 cursor-pointer"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
