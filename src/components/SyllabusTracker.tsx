import React, { useState, useMemo, useEffect } from 'react';
import {
  CheckSquare,
  Search,
  Flame,
  Zap,
  BookOpen,
  Filter,
  CheckCircle2,
  Circle,
  HelpCircle,
  RotateCcw,
  Download,
  ChevronDown,
  ChevronUp,
  FileText,
  Save,
  BarChart2,
  Layers,
  Sparkles,
  Trophy,
  AlertTriangle,
  BookmarkCheck,
  GraduationCap,
  Percent,
} from 'lucide-react';
import {
  NEET_SYLLABUS_CHAPTERS,
  type NeetChapter,
  type ChapterProgress,
  type SyllabusProgressRecord,
  type SubjectType,
  type ClassLevel,
  type PriorityLevel,
  type ConfidenceLevel,
  getSyllabusProgress,
  saveSyllabusProgress,
  calculateChapterStatus,
} from '../data/neetSyllabusData.ts';

interface SyllabusTrackerProps {
  theme: 'dark' | 'light';
  userId?: string;
  onOpenMentorship?: () => void;
  onOpenDashboard?: () => void;
}

export const SyllabusTracker: React.FC<SyllabusTrackerProps> = ({
  theme,
  userId,
  onOpenMentorship,
  onOpenDashboard,
}) => {
  const isDark = theme === 'dark';

  // State
  const [progress, setProgress] = useState<SyllabusProgressRecord>(() =>
    getSyllabusProgress(userId)
  );
  const [selectedSubject, setSelectedSubject] = useState<'All' | SubjectType>('All');
  const [selectedClass, setSelectedClass] = useState<'All' | ClassLevel>('All');
  const [selectedPriority, setSelectedPriority] = useState<'All' | PriorityLevel>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'not_started' | 'in_progress' | 'mastered' | 'ncert_pending' | 'rev2_pending'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null);
  const [activeNotesChapter, setActiveNotesChapter] = useState<NeetChapter | null>(null);
  const [tempNotesText, setTempNotesText] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Sync state to storage
  useEffect(() => {
    saveSyllabusProgress(progress, userId);
  }, [progress, userId]);

  // Handler to update chapter progress
  const updateChapterStage = (
    chapterId: string,
    field: keyof Omit<ChapterProgress, 'confidence' | 'userNotes' | 'lastUpdated' | 'pyqsSolvedCount'>
  ) => {
    setProgress((prev) => {
      const current = prev[chapterId] || {
        theoryDone: false,
        ncertDone: false,
        notesDone: false,
        pyqsDone: false,
        rev1Done: false,
        rev2Done: false,
        confidence: 'not_rated',
      };

      const updatedVal = !current[field];
      const updated: ChapterProgress = {
        ...current,
        [field]: updatedVal,
        lastUpdated: new Date().toISOString(),
      };

      // Auto-update confidence if all 6 completed
      const allSteps = [
        field === 'theoryDone' ? updatedVal : current.theoryDone,
        field === 'ncertDone' ? updatedVal : current.ncertDone,
        field === 'notesDone' ? updatedVal : current.notesDone,
        field === 'pyqsDone' ? updatedVal : current.pyqsDone,
        field === 'rev1Done' ? updatedVal : current.rev1Done,
        field === 'rev2Done' ? updatedVal : current.rev2Done,
      ];
      if (allSteps.every(Boolean) && updated.confidence === 'not_rated') {
        updated.confidence = 'mastered';
      }

      return {
        ...prev,
        [chapterId]: updated,
      };
    });
  };

  const updateConfidence = (chapterId: string, confidence: ConfidenceLevel) => {
    setProgress((prev) => {
      const current = prev[chapterId] || {
        theoryDone: false,
        ncertDone: false,
        notesDone: false,
        pyqsDone: false,
        rev1Done: false,
        rev2Done: false,
        confidence: 'not_rated',
      };
      return {
        ...prev,
        [chapterId]: {
          ...current,
          confidence,
          lastUpdated: new Date().toISOString(),
        },
      };
    });
  };

  const saveNotes = () => {
    if (!activeNotesChapter) return;
    const cid = activeNotesChapter.id;
    setProgress((prev) => {
      const current = prev[cid] || {
        theoryDone: false,
        ncertDone: false,
        notesDone: false,
        pyqsDone: false,
        rev1Done: false,
        rev2Done: false,
        confidence: 'not_rated',
      };
      return {
        ...prev,
        [cid]: {
          ...current,
          userNotes: tempNotesText,
          lastUpdated: new Date().toISOString(),
        },
      };
    });
    setActiveNotesChapter(null);
  };

  const markAllNcertForFiltered = () => {
    setProgress((prev) => {
      const next = { ...prev };
      filteredChapters.forEach((ch) => {
        const cur = next[ch.id] || {
          theoryDone: false,
          ncertDone: false,
          notesDone: false,
          pyqsDone: false,
          rev1Done: false,
          rev2Done: false,
          confidence: 'not_rated',
        };
        next[ch.id] = { ...cur, ncertDone: true, lastUpdated: new Date().toISOString() };
      });
      return next;
    });
  };

  const resetAllProgress = () => {
    setProgress({});
    setShowResetConfirm(false);
  };

  const exportSummary = () => {
    const summary = {
      exportDate: new Date().toLocaleDateString(),
      totalChapters: NEET_SYLLABUS_CHAPTERS.length,
      progress,
    };
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `airneet_syllabus_progress_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportNotice('Progress downloaded successfully!');
    setTimeout(() => setExportNotice(null), 3000);
  };

  // Filtered Chapters
  const filteredChapters = useMemo(() => {
    return NEET_SYLLABUS_CHAPTERS.filter((ch) => {
      if (selectedSubject !== 'All' && ch.subject !== selectedSubject) return false;
      if (selectedClass !== 'All' && ch.classLevel !== selectedClass) return false;
      if (selectedPriority !== 'All' && ch.priority !== selectedPriority) return false;

      const p = progress[ch.id];
      const status = calculateChapterStatus(p);

      if (selectedStatus === 'not_started' && status !== 'not_started') return false;
      if (selectedStatus === 'in_progress' && status !== 'in_progress') return false;
      if (selectedStatus === 'mastered' && status !== 'mastered') return false;
      if (selectedStatus === 'ncert_pending' && p?.ncertDone) return false;
      if (selectedStatus === 'rev2_pending' && p?.rev2Done) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = ch.name.toLowerCase().includes(query);
        const matchesTopics = ch.highYieldTopics.some((t) => t.toLowerCase().includes(query));
        const matchesSub = ch.subCategory?.toLowerCase().includes(query);
        if (!matchesName && !matchesTopics && !matchesSub) return false;
      }

      return true;
    });
  }, [selectedSubject, selectedClass, selectedPriority, selectedStatus, searchQuery, progress]);

  // Overall Analytics calculations
  const stats = useMemo(() => {
    let totalChapters = NEET_SYLLABUS_CHAPTERS.length;
    let completedStepsCount = 0;
    const maxSteps = totalChapters * 6;

    let ncertCount = 0;
    let pyqDoneCount = 0;
    let rev2Count = 0;
    let masteredCount = 0;
    let highPriorityCount = 0;
    let highPriorityMastered = 0;

    // Projected Score Calculation based on completed chapters weightage
    let projectedScore = 0;
    let phyScore = 0;
    let chemScore = 0;
    let bioScore = 0;

    NEET_SYLLABUS_CHAPTERS.forEach((ch) => {
      const p = progress[ch.id];
      if (ch.priority === 'High') highPriorityCount++;

      if (p) {
        const steps = [p.theoryDone, p.ncertDone, p.notesDone, p.pyqsDone, p.rev1Done, p.rev2Done];
        const done = steps.filter(Boolean).length;
        completedStepsCount += done;

        if (p.ncertDone) ncertCount++;
        if (p.pyqsDone) pyqDoneCount++;
        if (p.rev2Done) rev2Count++;
        if (p.confidence === 'mastered') {
          masteredCount++;
          if (ch.priority === 'High') highPriorityMastered++;
        }

        // Weightage contribution: proportion of chapter's avgMarks achieved
        const ratio = done / 6;
        const marksEarned = Math.round(ch.avgMarks * ratio);
        projectedScore += marksEarned;
        if (ch.subject === 'Physics') phyScore += marksEarned;
        if (ch.subject === 'Chemistry') chemScore += marksEarned;
        if (ch.subject === 'Biology') bioScore += marksEarned;
      }
    });

    const overallPct = Math.round((completedStepsCount / maxSteps) * 100);

    return {
      totalChapters,
      overallPct,
      ncertCount,
      pyqDoneCount,
      rev2Count,
      masteredCount,
      highPriorityCount,
      highPriorityMastered,
      projectedScore: Math.min(720, projectedScore),
      phyScore: Math.min(180, phyScore),
      chemScore: Math.min(180, chemScore),
      bioScore: Math.min(360, bioScore),
    };
  }, [progress]);

  return (
    <div className="w-full space-y-6 pb-16">
      {/* MathonGo Style Top Banner & Header */}
      <div
        className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 backdrop-blur-xl transition-all shadow-xl ${
          isDark
            ? 'bg-gradient-to-br from-zinc-900/90 via-[#0c0d14] to-zinc-950 border-zinc-800'
            : 'bg-gradient-to-br from-blue-50/70 via-white to-slate-50 border-slate-200 shadow-slate-200/50'
        }`}
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                100% Free · NTA NEET UG Syllabus
              </span>
              <span className={`inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${
                isDark ? 'border-zinc-700 bg-zinc-800/80 text-zinc-300' : 'border-slate-300 bg-slate-100 text-slate-700'
              }`}>
                Inspired by Marks MathonGo
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight font-sans">
              NEET UG <span className="text-[#3B82F6]">Syllabus Tracker</span> & Analytics
            </h1>

            <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              Systematic 6-stage revision tracking: <span className="font-semibold text-emerald-400">Theory</span>,{' '}
              <span className="font-semibold text-emerald-400">NCERT Read</span>,{' '}
              <span className="font-semibold text-blue-400">Short Notes</span>,{' '}
              <span className="font-semibold text-purple-400">PYQs (2019-2024)</span>, and{' '}
              <span className="font-semibold text-amber-400">Rev 1 & Rev 2</span> cycles. Filter by high-weightage chapters to lock your government medical college seat.
            </p>
          </div>

          {/* Marks MathonGo Projected Score Card */}
          <div
            className={`shrink-0 lg:w-80 p-5 rounded-2xl border flex flex-col justify-between shadow-lg ${
              isDark
                ? 'bg-black/60 border-blue-500/30 shadow-blue-950/20'
                : 'bg-white border-blue-200 shadow-blue-100/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Trophy className="w-4 h-4" />
                Projected NEET Score
              </span>
              <span className="text-[11px] font-mono text-zinc-400">Target 720</span>
            </div>

            <div className="my-3 flex items-baseline gap-2">
              <span className="text-4xl font-black font-mono tracking-tight text-white">
                {stats.projectedScore}
              </span>
              <span className="text-sm font-mono text-zinc-400">/ 720 Marks</span>
            </div>

            <div className="space-y-1.5 pt-1 border-t border-zinc-800/60 text-[11px] font-mono">
              <div className="flex justify-between items-center text-zinc-400">
                <span>Biology (Target 360)</span>
                <span className="font-bold text-emerald-400">{stats.bioScore} / 360</span>
              </div>
              <div className="flex justify-between items-center text-zinc-400">
                <span>Chemistry (Target 180)</span>
                <span className="font-bold text-blue-400">{stats.chemScore} / 180</span>
              </div>
              <div className="flex justify-between items-center text-zinc-400">
                <span>Physics (Target 180)</span>
                <span className="font-bold text-purple-400">{stats.phyScore} / 180</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Progress Metrics Strip */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-zinc-800/50">
          <div
            className={`p-3.5 rounded-2xl border ${
              isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-mono uppercase text-zinc-400">Overall Progress</span>
              <span className="text-xs font-mono font-bold text-[#3B82F6]">{stats.overallPct}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-[#3B82F6] transition-all duration-500 rounded-full"
                style={{ width: `${stats.overallPct}%` }}
              />
            </div>
            <span className="text-[10px] text-zinc-400 mt-1.5 block font-mono">
              {stats.masteredCount} of {stats.totalChapters} chapters mastered
            </span>
          </div>

          <div
            className={`p-3.5 rounded-2xl border ${
              isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-mono uppercase text-zinc-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                High Yield
              </span>
              <span className="text-xs font-mono font-bold text-orange-400">
                {stats.highPriorityMastered}/{stats.highPriorityCount}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all duration-500 rounded-full"
                style={{
                  width: `${stats.highPriorityCount > 0 ? (stats.highPriorityMastered / stats.highPriorityCount) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="text-[10px] text-zinc-400 mt-1.5 block font-mono">
              Block A (3-5 Qs / chapter)
            </span>
          </div>

          <div
            className={`p-3.5 rounded-2xl border ${
              isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-mono uppercase text-zinc-400 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                NCERT Read
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {stats.ncertCount}/{stats.totalChapters}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${(stats.ncertCount / stats.totalChapters) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-zinc-400 mt-1.5 block font-mono">
              Direct source of 95% NEET Qs
            </span>
          </div>

          <div
            className={`p-3.5 rounded-2xl border ${
              isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-mono uppercase text-zinc-400 flex items-center gap-1">
                <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
                Rev 2 Done
              </span>
              <span className="text-xs font-mono font-bold text-purple-400">
                {stats.rev2Count}/{stats.totalChapters}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all duration-500 rounded-full"
                style={{ width: `${(stats.rev2Count / stats.totalChapters) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-zinc-400 mt-1.5 block font-mono">
              Final active recall lock
            </span>
          </div>
        </div>
      </div>

      {/* Control Toolbar (MathonGo Category Tabs, Search & Filters) */}
      <div
        className={`p-4 rounded-2xl border backdrop-blur-md space-y-4 shadow-sm ${
          isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-slate-200'
        }`}
      >
        {/* Row 1: Subject Segmented Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['All', 'Physics', 'Chemistry', 'Biology'] as const).map((sub) => {
              const isActive = selectedSubject === sub;
              const count =
                sub === 'All'
                  ? NEET_SYLLABUS_CHAPTERS.length
                  : NEET_SYLLABUS_CHAPTERS.filter((c) => c.subject === sub).length;

              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 select-none ${
                    isActive
                      ? isDark
                        ? 'bg-[#3B82F6] text-white shadow-md shadow-blue-500/20'
                        : 'bg-[#0066FF] text-white shadow-md shadow-blue-500/20'
                      : isDark
                      ? 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <span>{sub}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : isDark
                        ? 'bg-black text-zinc-400'
                        : 'bg-white text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={markAllNcertForFiltered}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                isDark
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
              title="Mark NCERT Read for all currently filtered chapters"
            >
              <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Mark Filtered</span> NCERT Done
            </button>

            <button
              type="button"
              onClick={exportSummary}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isDark
                  ? 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white'
                  : 'border-slate-300 bg-slate-100 text-slate-700 hover:text-slate-900'
              }`}
              title="Download your progress as JSON backup"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isDark
                  ? 'border-red-900/40 bg-red-950/20 text-red-400 hover:bg-red-900/30'
                  : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
              }`}
              title="Reset All Tracker Checklists"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Row 2: Secondary Filters & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search chapter, e.g. Optics, Genetics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-sans border focus:outline-none focus:ring-1 focus:ring-[#3B82F6] transition ${
                isDark
                  ? 'bg-zinc-800/80 border-zinc-700 text-white placeholder-zinc-500'
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Class Filter */}
          <div className="flex items-center gap-1">
            {(['All', 'Class 11', 'Class 12'] as const).map((cls) => (
              <button
                key={cls}
                type="button"
                onClick={() => setSelectedClass(cls)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-medium transition cursor-pointer text-center truncate ${
                  selectedClass === cls
                    ? isDark
                      ? 'bg-zinc-700 text-white font-bold'
                      : 'bg-slate-300 text-slate-900 font-bold'
                    : isDark
                    ? 'text-zinc-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cls === 'All' ? 'All Classes' : cls}
              </button>
            ))}
          </div>

          {/* Priority Weightage Filter */}
          <div className="flex items-center gap-1">
            {(['All', 'High', 'Medium', 'Low'] as const).map((prio) => (
              <button
                key={prio}
                type="button"
                onClick={() => setSelectedPriority(prio)}
                className={`flex-1 py-1.5 px-1.5 rounded-lg text-[11px] font-mono transition cursor-pointer text-center ${
                  selectedPriority === prio
                    ? prio === 'High'
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 font-bold'
                      : isDark
                      ? 'bg-zinc-700 text-white font-bold'
                      : 'bg-slate-300 text-slate-900 font-bold'
                    : isDark
                    ? 'text-zinc-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {prio === 'High' ? '🔥 High' : prio === 'Medium' ? '⚡ Med' : prio === 'Low' ? '📘 Low' : 'All Wt'}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className={`w-full py-1.5 px-3 rounded-xl text-xs font-mono border focus:outline-none focus:ring-1 focus:ring-[#3B82F6] cursor-pointer ${
              isDark
                ? 'bg-zinc-800/80 border-zinc-700 text-zinc-300'
                : 'bg-slate-50 border-slate-300 text-slate-700'
            }`}
          >
            <option value="All">Status: All Chapters ({NEET_SYLLABUS_CHAPTERS.length})</option>
            <option value="not_started">Status: Not Started</option>
            <option value="in_progress">Status: In Progress</option>
            <option value="mastered">Status: Mastered (Confidence Strong)</option>
            <option value="ncert_pending">Status: NCERT Pending</option>
            <option value="rev2_pending">Status: Rev 2 Pending</option>
          </select>
        </div>

        {/* Active Filter Chips & Feedback notification */}
        <div className="flex flex-wrap items-center justify-between text-xs font-mono text-zinc-400 pt-1">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-white">{filteredChapters.length}</strong> of{' '}
              {NEET_SYLLABUS_CHAPTERS.length} chapters
            </span>
            {(selectedSubject !== 'All' ||
              selectedClass !== 'All' ||
              selectedPriority !== 'All' ||
              selectedStatus !== 'All' ||
              searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedSubject('All');
                  setSelectedClass('All');
                  setSelectedPriority('All');
                  setSelectedStatus('All');
                  setSearchQuery('');
                }}
                className="text-[#3B82F6] hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>

          {exportNotice && (
            <span className="text-emerald-400 font-bold animate-pulse">{exportNotice}</span>
          )}
        </div>
      </div>

      {/* Chapter Cards / Checklist Table */}
      <div className="space-y-3">
        {filteredChapters.length === 0 ? (
          <div
            className={`p-12 text-center rounded-2xl border space-y-3 ${
              isDark ? 'bg-zinc-900/50 border-zinc-800 text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            <AlertTriangle className="w-8 h-8 mx-auto text-amber-400" />
            <p className="font-mono text-sm font-bold">No chapters match your current filter</p>
            <p className="text-xs">Try clearing the search query or changing your priority/class selection.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedSubject('All');
                setSelectedClass('All');
                setSelectedPriority('All');
                setSelectedStatus('All');
                setSearchQuery('');
              }}
              className="mt-2 px-4 py-2 rounded-xl text-xs font-mono bg-[#3B82F6] text-white hover:bg-blue-600 transition cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          filteredChapters.map((ch, idx) => {
            const p = progress[ch.id] || {
              theoryDone: false,
              ncertDone: false,
              notesDone: false,
              pyqsDone: false,
              rev1Done: false,
              rev2Done: false,
              confidence: 'not_rated',
            };

            const steps = [p.theoryDone, p.ncertDone, p.notesDone, p.pyqsDone, p.rev1Done, p.rev2Done];
            const completedCount = steps.filter(Boolean).length;
            const completionPct = Math.round((completedCount / 6) * 100);
            const isExpanded = expandedChapterId === ch.id;

            return (
              <div
                key={ch.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm ${
                  isDark
                    ? completedCount === 6
                      ? 'bg-zinc-900/90 border-emerald-500/30'
                      : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700'
                    : completedCount === 6
                    ? 'bg-emerald-50/40 border-emerald-300'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Main Chapter Card Row */}
                <div className="p-4 sm:p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                  {/* Left: Metadata & Chapter Identification */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                      {/* Priority Tag */}
                      {ch.priority === 'High' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30">
                          <Flame className="w-3 h-3 text-orange-400" />
                          Block A · High Yield ({ch.expectedQuestions})
                        </span>
                      ) : ch.priority === 'Medium' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                          <Zap className="w-3 h-3 text-blue-400" />
                          Block B · Medium ({ch.expectedQuestions})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
                          Block C · Core ({ch.expectedQuestions})
                        </span>
                      )}

                      <span
                        className={`px-2 py-0.5 rounded-md border ${
                          ch.subject === 'Physics'
                            ? 'border-purple-500/30 bg-purple-500/10 text-purple-300'
                            : ch.subject === 'Chemistry'
                            ? 'border-blue-500/30 bg-blue-500/10 text-blue-300'
                            : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                        }`}
                      >
                        {ch.subject} {ch.subCategory ? `· ${ch.subCategory}` : ''}
                      </span>

                      <span className={`px-2 py-0.5 rounded-md border ${
                        isDark ? 'border-zinc-800 bg-black/40 text-zinc-400' : 'border-slate-200 bg-slate-100 text-slate-600'
                      }`}>
                        {ch.classLevel}
                      </span>

                      <span className="text-zinc-400">
                        Avg: <strong className="text-white font-bold">{ch.avgMarks}M</strong> · {ch.pyqCount} PYQs
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 pt-0.5">
                      <span className="text-xs font-mono text-zinc-400 shrink-0">
                        #{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold font-sans tracking-tight leading-snug">
                        {ch.name}
                      </h3>
                    </div>

                    {/* Progress pill & high-yield preview */}
                    <div className="flex items-center gap-3 pt-1">
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="text-zinc-400">Stages:</span>
                        <span className="font-bold text-[#3B82F6]">{completedCount}/6 Done</span>
                        <div className="w-20 sm:w-28 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              completedCount === 6
                                ? 'bg-emerald-400'
                                : completedCount >= 3
                                ? 'bg-[#3B82F6]'
                                : 'bg-amber-400'
                            }`}
                            style={{ width: `${completionPct}%` }}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setExpandedChapterId(isExpanded ? null : ch.id)}
                        className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-mono cursor-pointer"
                      >
                        <span>{isExpanded ? 'Hide Topics' : 'High-Yield Topics'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {p.userNotes && (
                        <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                          <FileText className="w-3 h-3" /> Note added
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Center: MathonGo 6-Stage Checkbox Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2.5 shrink-0 pt-2 xl:pt-0">
                    {/* 1. Theory */}
                    <button
                      type="button"
                      onClick={() => updateChapterStage(ch.id, 'theoryDone')}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer min-w-[70px] select-none ${
                        p.theoryDone
                          ? 'border-blue-500/50 bg-blue-500/15 text-blue-300 font-bold'
                          : isDark
                          ? 'border-zinc-800 bg-zinc-800/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                          : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                      title="Theory & Lectures Covered"
                    >
                      <div className="flex items-center gap-1">
                        {p.theoryDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-zinc-400" />
                        )}
                        <span className="text-[11px] font-mono uppercase tracking-tight">Theory</span>
                      </div>
                      <span className="text-[9px] text-zinc-400 font-mono mt-0.5">Concepts</span>
                    </button>

                    {/* 2. NCERT Read */}
                    <button
                      type="button"
                      onClick={() => updateChapterStage(ch.id, 'ncertDone')}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer min-w-[70px] select-none ${
                        p.ncertDone
                          ? 'border-emerald-500/60 bg-emerald-500/20 text-emerald-300 font-bold shadow-sm shadow-emerald-950/40'
                          : isDark
                          ? 'border-zinc-800 bg-zinc-800/40 text-zinc-400 hover:border-emerald-500/40 hover:text-emerald-400'
                          : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                      title="NCERT Line-by-Line Reading (Key for NEET UG)"
                    >
                      <div className="flex items-center gap-1">
                        {p.ncertDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                        )}
                        <span className="text-[11px] font-mono uppercase tracking-tight font-bold">NCERT</span>
                      </div>
                      <span className="text-[9px] text-zinc-400 font-mono mt-0.5">Line-by-Line</span>
                    </button>

                    {/* 3. Short Notes */}
                    <button
                      type="button"
                      onClick={() => updateChapterStage(ch.id, 'notesDone')}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer min-w-[70px] select-none ${
                        p.notesDone
                          ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-300 font-bold'
                          : isDark
                          ? 'border-zinc-800 bg-zinc-800/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                          : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                      title="Formula Sheet & Short Notes Prepared"
                    >
                      <div className="flex items-center gap-1">
                        {p.notesDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-zinc-400" />
                        )}
                        <span className="text-[11px] font-mono uppercase tracking-tight">Notes</span>
                      </div>
                      <span className="text-[9px] text-zinc-400 font-mono mt-0.5">Formulas</span>
                    </button>

                    {/* 4. PYQs Solved */}
                    <button
                      type="button"
                      onClick={() => updateChapterStage(ch.id, 'pyqsDone')}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer min-w-[70px] select-none ${
                        p.pyqsDone
                          ? 'border-purple-500/50 bg-purple-500/15 text-purple-300 font-bold'
                          : isDark
                          ? 'border-zinc-800 bg-zinc-800/40 text-zinc-400 hover:border-purple-500/40 hover:text-purple-300'
                          : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                      title={`NEET PYQs (2019-2024: ${ch.pyqCount} Questions)`}
                    >
                      <div className="flex items-center gap-1">
                        {p.pyqsDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-zinc-400" />
                        )}
                        <span className="text-[11px] font-mono uppercase tracking-tight">PYQs</span>
                      </div>
                      <span className="text-[9px] text-zinc-400 font-mono mt-0.5">{ch.pyqCount} Qs</span>
                    </button>

                    {/* 5. Revision 1 */}
                    <button
                      type="button"
                      onClick={() => updateChapterStage(ch.id, 'rev1Done')}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer min-w-[70px] select-none ${
                        p.rev1Done
                          ? 'border-amber-500/50 bg-amber-500/15 text-amber-300 font-bold'
                          : isDark
                          ? 'border-zinc-800 bg-zinc-800/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                          : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                      title="First Revision Done (Formula recall + Error book review)"
                    >
                      <div className="flex items-center gap-1">
                        {p.rev1Done ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-zinc-400" />
                        )}
                        <span className="text-[11px] font-mono uppercase tracking-tight">Rev 1</span>
                      </div>
                      <span className="text-[9px] text-zinc-400 font-mono mt-0.5">Recall</span>
                    </button>

                    {/* 6. Revision 2 */}
                    <button
                      type="button"
                      onClick={() => updateChapterStage(ch.id, 'rev2Done')}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer min-w-[70px] select-none ${
                        p.rev2Done
                          ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300 font-bold'
                          : isDark
                          ? 'border-zinc-800 bg-zinc-800/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                          : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                      title="Second Revision Done (Timed 45-min chapter test)"
                    >
                      <div className="flex items-center gap-1">
                        {p.rev2Done ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-zinc-400" />
                        )}
                        <span className="text-[11px] font-mono uppercase tracking-tight">Rev 2</span>
                      </div>
                      <span className="text-[9px] text-zinc-400 font-mono mt-0.5">Final Lock</span>
                    </button>
                  </div>

                  {/* Right: Confidence Selector & Notes Drawer Trigger */}
                  <div className="flex items-center justify-between xl:justify-end gap-3 pt-2 xl:pt-0 border-t xl:border-t-0 border-zinc-800/50">
                    {/* Confidence Status Meter (Weak, Medium, Mastered) */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-mono text-zinc-400 mr-1 hidden sm:inline">Confidence:</span>
                      <button
                        type="button"
                        onClick={() => updateConfidence(ch.id, 'weak')}
                        className={`px-2 py-1 rounded-md text-[10px] font-mono transition cursor-pointer select-none ${
                          p.confidence === 'weak'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/50 font-bold'
                            : isDark
                            ? 'bg-zinc-800/60 text-zinc-400 hover:text-white'
                            : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                        }`}
                        title="Needs significant practice (< 50% accuracy)"
                      >
                        🔴 Weak
                      </button>
                      <button
                        type="button"
                        onClick={() => updateConfidence(ch.id, 'medium')}
                        className={`px-2 py-1 rounded-md text-[10px] font-mono transition cursor-pointer select-none ${
                          p.confidence === 'medium'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 font-bold'
                            : isDark
                            ? 'bg-zinc-800/60 text-zinc-400 hover:text-white'
                            : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                        }`}
                        title="Moderate confidence (50-75% accuracy)"
                      >
                        🟡 Medium
                      </button>
                      <button
                        type="button"
                        onClick={() => updateConfidence(ch.id, 'mastered')}
                        className={`px-2 py-1 rounded-md text-[10px] font-mono transition cursor-pointer select-none ${
                          p.confidence === 'mastered'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 font-bold'
                            : isDark
                            ? 'bg-zinc-800/60 text-zinc-400 hover:text-white'
                            : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                        }`}
                        title="Mastered (> 80% accuracy in PYQs & tests)"
                      >
                        🟢 Mastered
                      </button>
                    </div>

                    {/* Chapter Notes Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveNotesChapter(ch);
                        setTempNotesText(p.userNotes || '');
                      }}
                      className={`p-2 rounded-xl border transition cursor-pointer ${
                        p.userNotes
                          ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                          : isDark
                          ? 'border-zinc-800 bg-zinc-800/60 text-zinc-400 hover:text-white'
                          : 'border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900'
                      }`}
                      title="Add Chapter Reminders, Formula Pitfalls & Weak Sub-topics"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expandable High-Yield Sub-topics Panel */}
                {isExpanded && (
                  <div
                    className={`px-5 py-4 border-t text-xs space-y-2.5 ${
                      isDark ? 'bg-black/40 border-zinc-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        NTA Most Frequent Sub-Topics & Question Triggers
                      </span>
                      <span className="text-[11px] font-mono text-zinc-400">
                        Based on NEET 2019–2024 Exam Analysis
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
                      {ch.highYieldTopics.map((topic, tidx) => (
                        <div
                          key={tidx}
                          className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                            isDark ? 'bg-zinc-900/80 border-zinc-800/80' : 'bg-white border-slate-200'
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full bg-blue-500/10 text-[#3B82F6] flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                            {tidx + 1}
                          </span>
                          <span className="leading-snug text-zinc-300 font-sans">{topic}</span>
                        </div>
                      ))}
                    </div>

                    {p.userNotes && (
                      <div className="mt-3 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 font-mono text-xs">
                        <strong>My Notes:</strong> {p.userNotes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Call to Action: Connect with AIR Topper Mentors */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border text-center space-y-4 shadow-xl ${
          isDark
            ? 'bg-gradient-to-r from-blue-950/30 via-zinc-900 to-purple-950/30 border-blue-500/20'
            : 'bg-gradient-to-r from-blue-50 via-white to-purple-50 border-blue-200'
        }`}
      >
        <div className="max-w-xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#3B82F6]">
            Accelerate Your Preparation
          </span>
          <h3 className="text-xl sm:text-2xl font-black font-sans">
            Need Guidance on Prioritizing High-Yield Chapters?
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans">
            Book a 1-on-1 strategy call with AIR 1–100 NEET Rankers. Get a personalized revision calendar, mistake notebook review, and time-management roadmap.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {onOpenMentorship && (
            <button
              type="button"
              onClick={onOpenMentorship}
              className="px-6 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider bg-[#3B82F6] text-white hover:bg-blue-600 transition shadow-lg shadow-blue-500/25 cursor-pointer active:scale-95"
            >
              Consult AIR Toppers Now
            </button>
          )}
          {onOpenDashboard && (
            <button
              type="button"
              onClick={onOpenDashboard}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider border transition cursor-pointer ${
                isDark
                  ? 'border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white'
                  : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-800'
              }`}
            >
              Go to Aspirant Portal
            </button>
          )}
        </div>
      </div>

      {/* Chapter Notes Modal */}
      {activeNotesChapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div
            className={`w-full max-w-lg rounded-3xl border p-6 space-y-4 shadow-2xl ${
              isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold font-sans text-base">Chapter Notes & Reminders</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveNotesChapter(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div>
              <p className="text-xs font-mono text-zinc-400">
                {activeNotesChapter.subject} · {activeNotesChapter.classLevel}
              </p>
              <h4 className="font-bold text-sm">{activeNotesChapter.name}</h4>
            </div>

            <textarea
              rows={5}
              placeholder="Jot down formula traps, weak sub-topics, NCERT page numbers to re-read, or test mistakes..."
              value={tempNotesText}
              onChange={(e) => setTempNotesText(e.target.value)}
              className={`w-full p-3 rounded-2xl text-xs font-sans border focus:outline-none focus:ring-1 focus:ring-amber-400 leading-relaxed ${
                isDark
                  ? 'bg-zinc-800/80 border-zinc-700 text-white placeholder-zinc-500'
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveNotesChapter(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono border border-zinc-700 hover:bg-zinc-800 text-zinc-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveNotes}
                className="px-5 py-2 rounded-xl text-xs font-mono font-bold uppercase bg-amber-500 text-black hover:bg-amber-400 transition cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div
            className={`w-full max-w-sm rounded-3xl border p-6 space-y-4 shadow-2xl text-center ${
              isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold font-sans text-base">Reset Syllabus Progress?</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              This will clear all checklist ticks, NCERT flags, and confidence ratings for all chapters. This cannot be undone.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-mono border border-zinc-700 hover:bg-zinc-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={resetAllProgress}
                className="flex-1 py-2.5 rounded-xl text-xs font-mono font-bold uppercase bg-red-600 text-white hover:bg-red-500 transition cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
