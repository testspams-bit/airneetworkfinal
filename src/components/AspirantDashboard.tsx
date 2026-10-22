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
  onSignOut: () => void;
  onSwitchToHome: () => void;
  onBookMoreSessions?: () => void;
}

export type AspirantTab =
  | 'assessment'
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
  onSignOut,
  onSwitchToHome,
  onBookMoreSessions,
}) => {
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<AspirantTab>(initialTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core Data States
  const [profile, setProfile] = useState<AspirantProfile>(() =>
    loadAspirantProfile(userEmail, userName)
  );
  const [assessment, setAssessment] = useState<AspirantAssessment>(() =>
    loadAspirantAssessment()
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

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState<AspirantProfile>(profile);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

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
    saveAspirantProfile(editProfileForm);
    setProfile(editProfileForm);
    setIsEditingProfile(false);
    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 3000);
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

    const updatedAssessment = addMockTestToAssessment(newResult);
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
    { id: 'profile' as AspirantTab, label: 'My Profile', icon: User },
    { id: 'payments' as AspirantTab, label: 'Payment Status', icon: CreditCard },
    { id: 'recordings' as AspirantTab, label: 'Recordings & Transcripts', icon: Video },
    { id: 'plan' as AspirantTab, label: 'Plan Prepared', icon: FileText },
    { id: 'daily_question' as AspirantTab, label: 'Daily Question (OQAD)', icon: Target },
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

          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span className="text-zinc-500">/</span>
            <span className="font-semibold text-emerald-400">Aspirant Portal</span>
            <span className="text-zinc-500">/</span>
            <span className="text-zinc-200 truncate capitalize">
              {activeTab.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Center: Quick Target Pill Indicator */}
        <div className="hidden lg:flex items-center gap-3 text-xs font-mono">
          <div
            className={`px-3 py-1 rounded-full border flex items-center gap-2 ${
              isDark
                ? 'bg-zinc-900/80 border-zinc-700 text-zinc-300'
                : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Target: {profile.dreamCollege}</span>
            <span className="text-zinc-400">·</span>
            <span className="tabular-nums font-bold text-emerald-400">
              {profile.targetScore}+
            </span>
          </div>

          <div
            className={`px-3 py-1 rounded-full border flex items-center gap-1.5 ${
              isDark
                ? 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="tabular-nums font-bold">{streak} Day Streak</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onSwitchToHome}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
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
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors cursor-pointer ${
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
            className={`md:hidden p-2 rounded-lg border cursor-pointer ${
              isDark ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-white'
            }`}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <LayoutDashboard className="w-4 h-4" />}
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

              {/* Assigned AIR Mentor Badge */}
              <div
                className={`pt-2.5 border-t text-[11px] font-mono flex items-center justify-between ${
                  isDark ? 'border-zinc-800 text-zinc-400' : 'border-slate-200 text-slate-500'
                }`}
              >
                <span>Mentor:</span>
                <span className="font-bold text-emerald-400">
                  {profile.assignedMentorName} ({profile.assignedMentorAir})
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="space-y-1.5" aria-label="Aspirant Dashboard Tabs">
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 px-3 py-1">
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
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer text-left select-none ${
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
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-emerald-400' : 'text-zinc-400'
                        }`}
                      />
                      <span className="whitespace-nowrap">{tab.label}</span>
                    </div>
                    {tab.id === 'daily_question' && (
                      <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                        OQAD
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Help / Schedule Call CTA in Sidebar */}
          <div className="pt-6 mt-6 border-t border-zinc-800/80">
            <div
              className={`p-3.5 rounded-2xl border text-xs ${
                isDark
                  ? 'bg-gradient-to-b from-zinc-900/60 to-zinc-950/80 border-zinc-800'
                  : 'bg-slate-100/70 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold text-emerald-400 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next Mentoring Call</span>
              </div>
              <p className="text-[11px] text-zinc-400 mb-3 leading-relaxed">
                Slot confirmed with {profile.assignedMentorName} for Saturday, 07:00 PM.
              </p>
              {onBookMoreSessions && (
                <button
                  type="button"
                  onClick={onBookMoreSessions}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    isDark
                      ? 'bg-[#3B82F6] text-white hover:bg-[#2563EB]'
                      : 'bg-[#0066FF] text-white hover:bg-[#0052cc]'
                  }`}
                >
                  Book New Session
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Right Content Viewport */}
        <main className="flex-1 p-4 sm:p-7 md:p-9 overflow-y-auto">
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
