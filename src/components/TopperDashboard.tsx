import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Calendar,
  UserCheck,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Sparkles,
  Trophy,
  Crown,
  Gem,
  Award,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Phone,
  MessageSquare,
  Edit3,
  Save,
  Menu,
  X,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';
import {
  type TopperProfile,
  type MonthlyAvailability,
} from '../types/topper.ts';
import {
  loadTopperProfile,
  saveTopperProfile,
  loadMonthlyAvailability,
  saveMonthlyAvailability,
} from '../utils/topperStorage.ts';
import { TopperMonthlySlotManager } from './TopperMonthlySlotManager.tsx';
import { TopperProfileOnboardingModal } from './TopperProfileOnboardingModal.tsx';
import { Logo } from './Logo.tsx';

interface TopperDashboardProps {
  theme: 'dark' | 'light';
  userId: string;
  userEmail?: string;
  userName?: string;
  onSignOut: () => void;
  onSwitchToHome: () => void;
}

type DashboardTab = 'overview' | 'slots' | 'profile' | 'mentees' | 'earnings';

export const TopperDashboard: React.FC<TopperDashboardProps> = ({
  theme,
  userId,
  userEmail,
  userName,
  onSignOut,
  onSwitchToHome,
}) => {
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Profile state
  const [profile, setProfile] = useState<TopperProfile>(() =>
    loadTopperProfile(userId, userEmail, userName)
  );

  // Monthly availability state
  const [availability, setAvailability] = useState<MonthlyAvailability>(() =>
    loadMonthlyAvailability(userId)
  );

  // First-time registration onboarding modal state
  // If the profile is not complete, immediately prompt them with the 11 fields + free slots onboarding modal!
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    return !profile.isProfileComplete || !profile.airRank;
  });

  // Calculate tier based on AIR rank
  const cleanRank = parseInt(profile.airRank.replace(/\D/g, '') || '50', 10);
  const isPurpleTier = cleanRank <= 100;
  const tierName = isPurpleTier ? 'Purple Tier' : 'Diamond Tier';
  const sessionFee = isPurpleTier ? 1999 : 1499;

  // Total free slots count
  const totalSlotsCount = Object.values(availability.days).reduce(
    (acc, day) => acc + day.enabledSlots.length,
    0
  );

  // Save profile updates
  const handleProfileUpdate = (updated: TopperProfile) => {
    setProfile(updated);
    saveTopperProfile(updated);
  };

  const menuItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    {
      id: 'slots',
      label: "Next Month's Free Slots",
      icon: Calendar,
      badge: `${totalSlotsCount} Slots`,
    },
    { id: 'profile', label: 'NEET & College Profile', icon: UserCheck },
    {
      id: 'mentees',
      label: 'Student Call Requests',
      icon: Users,
      badge: '2 New',
    },
    { id: 'earnings', label: 'Payouts & Earnings', icon: CreditCard },
  ];

  return (
    <div
      className={`min-h-screen flex flex-col md:flex-row transition-colors duration-200 ${
        isDark ? 'bg-[#09090b] text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Mobile Top App Bar */}
      <div
        className={`md:hidden flex items-center justify-between p-4 border-b sticky top-0 z-30 backdrop-blur-lg ${
          isDark
            ? 'bg-[#0f0f13]/90 border-zinc-800'
            : 'bg-white/90 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-xl border border-zinc-700/60 cursor-pointer"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#CCFF00] font-bold">
              Topper Portal
            </div>
            <div className="text-sm font-black truncate max-w-[180px]">
              {profile.name || 'Ranker Dashboard'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
              isPurpleTier
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
            }`}
          >
            AIR {profile.airRank || '—'}
          </span>
          <button
            type="button"
            onClick={onSwitchToHome}
            className="text-xs font-mono text-zinc-400 hover:text-white px-2 py-1 rounded-lg border border-zinc-800 cursor-pointer"
          >
            Exit
          </button>
        </div>
      </div>

      {/* LEFT-SIDE BASED MENU BAR (Persistent Sidebar) */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-72 shrink-0 z-40 flex flex-col justify-between border-r p-5 transition-transform duration-300 md:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${
          isDark
            ? 'bg-[#0d0d11] border-zinc-800/80 text-white'
            : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}
      >
        {/* Top: Brand & Verified Ranker Pill */}
        <div>
          <div className="flex items-center justify-between pb-5 border-b border-zinc-800/80 mb-5">
            <button
              type="button"
              onClick={onSwitchToHome}
              className="flex items-center gap-2 text-left cursor-pointer group"
              title="Return to Aspirant Landing Page"
            >
              <Logo theme={theme} size="sm" />
            </button>

            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg border border-zinc-700/60 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Active Topper Profile Card in Sidebar */}
          <div
            className={`p-4 rounded-2xl border mb-6 relative overflow-hidden ${
              isPurpleTier
                ? isDark
                  ? 'bg-gradient-to-br from-purple-950/50 to-zinc-900 border-purple-500/40'
                  : 'bg-purple-50 border-purple-200'
                : isDark
                ? 'bg-gradient-to-br from-sky-950/50 to-zinc-900 border-sky-500/40'
                : 'bg-sky-50 border-sky-200'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border shadow-inner shrink-0 bg-black/40 border-white/10">
                {isPurpleTier ? (
                  <Crown className="w-5 h-5 text-purple-400" />
                ) : (
                  <Gem className="w-5 h-5 text-sky-400" />
                )}
              </div>

              <span
                className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  isPurpleTier
                    ? 'border-purple-400/50 text-purple-300 bg-purple-500/20'
                    : 'border-sky-400/50 text-sky-300 bg-sky-500/20'
                }`}
              >
                {tierName}
              </span>
            </div>

            <h3 className="font-extrabold text-sm truncate">
              {profile.name || 'Ranker Mentoring'}
            </h3>
            <div className="text-[11px] font-mono font-bold text-[#CCFF00] mt-0.5">
              AIR {profile.airRank || 'Rank pending'} · {profile.totalMarks || 700}/720
            </div>
            <div className="text-[10px] text-zinc-400 font-mono truncate mt-1">
              {profile.currentCollege || 'AIIMS New Delhi'}
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
              <span className="text-zinc-400">Session Rate:</span>
              <strong className="text-white">₹{sessionFee}</strong>
            </div>
          </div>

          {/* Navigation Menu List */}
          <nav className="space-y-1" aria-label="Topper Dashboard Menu">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id as DashboardTab);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    isActive
                      ? isDark
                        ? 'bg-[#CCFF00] text-black shadow-lg shadow-[#CCFF00]/10 font-black'
                        : 'bg-[#0066FF] text-white shadow-md'
                      : isDark
                      ? 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-black/20 text-current'
                          : isDark
                          ? 'bg-zinc-800 text-zinc-300'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions Cluster */}
        <div className="pt-4 border-t border-zinc-800/80 space-y-2">
          {!profile.isProfileComplete && (
            <button
              type="button"
              onClick={() => setIsOnboardingOpen(true)}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-[11px] font-mono font-bold bg-amber-500/20 border border-amber-500/50 text-amber-300 hover:bg-amber-500/30 transition-all cursor-pointer"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Complete Profile (11 Fields)</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSwitchToHome}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-[11px] font-mono transition-colors cursor-pointer ${
                isDark
                  ? 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>Aspirant View</span>
              <ExternalLink className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={onSignOut}
              className="p-2.5 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-6xl w-full mx-auto overflow-y-auto">
        {/* Top Header Banner for Tab */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80 mb-6">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-1.5 mb-1">
              <span>Topper Portal</span>
              <span>/</span>
              <span className="text-[#CCFF00] font-bold">
                {menuItems.find((m) => m.id === activeTab)?.label}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {activeTab === 'overview' && `Welcome Back, ${profile.name || 'Ranker'}!`}
              {activeTab === 'slots' && "Next Month's Availability Calendar"}
              {activeTab === 'profile' && 'NEET Academic & Coaching Details'}
              {activeTab === 'mentees' && 'Aspirant 1-on-1 Strategy Requests'}
              {activeTab === 'earnings' && 'Session Earnings & Payout Schedule'}
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsOnboardingOpen(true)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                isDark
                  ? 'border-purple-500/50 bg-purple-950/30 text-purple-300 hover:bg-purple-950/60'
                  : 'border-purple-300 bg-purple-50 text-purple-900 hover:bg-purple-100'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit 11 Profile Fields</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('slots')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95 ${
                isDark
                  ? 'bg-[#CCFF00] text-black hover:bg-[#d8ff33]'
                  : 'bg-[#0066FF] text-white hover:bg-[#0052cc]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Manage 30-Day Slots</span>
            </button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Urgent Incomplete Profile Warning if needed */}
            {!profile.isProfileComplete && (
              <div
                className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDark
                    ? 'bg-amber-950/30 border-amber-500/60 text-amber-200'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-sm">
                      Complete Your First-Time Topper Registration Details
                    </h3>
                    <p className="text-xs opacity-80 mt-0.5">
                      We need your 11 mandatory academic fields (AIR, Total Marks, Subject-wise breakdown, NEET Year, Language, Attempts, College) before aspirants can see your card.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOnboardingOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-400 text-black font-mono font-bold text-xs uppercase tracking-wider shrink-0 cursor-pointer hover:bg-amber-300 active:scale-95"
                >
                  Complete Now →
                </button>
              </div>
            )}

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                className={`p-5 rounded-2xl border ${
                  isDark ? 'bg-[#121217] border-zinc-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider">
                    Free Slots Next Month
                  </span>
                  <Calendar className="w-4 h-4 text-[#CCFF00]" />
                </div>
                <div className="text-2xl font-black">{totalSlotsCount} Slots</div>
                <p className="text-[10px] font-mono text-zinc-400 mt-1">
                  Across 30 days of availability
                </p>
              </div>

              <div
                className={`p-5 rounded-2xl border ${
                  isDark ? 'bg-[#121217] border-zinc-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider">
                    Assigned Tier
                  </span>
                  <Trophy className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-black">{tierName}</div>
                <p className="text-[10px] font-mono text-zinc-400 mt-1">
                  AIR {profile.airRank || '—'} · ₹{sessionFee} / Session
                </p>
              </div>

              <div
                className={`p-5 rounded-2xl border ${
                  isDark ? 'bg-[#121217] border-zinc-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider">
                    Call Requests
                  </span>
                  <Users className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-2xl font-black">2 Pending</div>
                <p className="text-[10px] font-mono text-zinc-400 mt-1">
                  Aspirants reserved with ₹1 token
                </p>
              </div>

              <div
                className={`p-5 rounded-2xl border ${
                  isDark ? 'bg-[#121217] border-zinc-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider">
                    Est. Next Payout
                  </span>
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black">₹{sessionFee * 2}</div>
                <p className="text-[10px] font-mono text-zinc-400 mt-1">
                  Direct weekly UPI transfer
                </p>
              </div>
            </div>

            {/* Next Month Slot Quick Banner */}
            <div
              className={`p-6 rounded-3xl border ${
                isDark
                  ? 'bg-gradient-to-r from-purple-950/40 via-zinc-900 to-sky-950/40 border-purple-500/30'
                  : 'bg-gradient-to-r from-purple-50 via-white to-sky-50 border-purple-200'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-[#CCFF00]" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#CCFF00]">
                      Monthly Availability Mechanism
                    </span>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">
                    {totalSlotsCount > 0
                      ? `You currently have ${totalSlotsCount} slots active for the next month`
                      : 'No slots configured yet for next month'}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                    Aspirants look for mentors with active slots on weekday nights and weekends. Keep your schedule fresh so you never get interrupted during your medical college postings.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('slots')}
                  className={`px-5 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md shrink-0 active:scale-95 ${
                    isDark
                      ? 'bg-[#CCFF00] text-black hover:bg-[#d8ff33]'
                      : 'bg-[#0066FF] text-white hover:bg-[#0052cc]'
                  }`}
                >
                  Open 30-Day Slot Manager →
                </button>
              </div>
            </div>

            {/* Profile Summary Snapshot (All 11 Fields Checked) */}
            <div
              className={`p-6 rounded-3xl border ${
                isDark ? 'bg-[#121217] border-zinc-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold">11-Field Academic Credentials</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOnboardingOpen(true)}
                  className="text-xs font-mono text-[#CCFF00] hover:underline cursor-pointer"
                >
                  Edit Information
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs font-mono">
                <div className="p-3 rounded-xl border border-white/5 bg-black/20">
                  <span className="text-zinc-500 block text-[10px] uppercase">1. Full Name</span>
                  <strong className="text-white text-sm">{profile.name || '—'}</strong>
                </div>

                <div className="p-3 rounded-xl border border-white/5 bg-black/20">
                  <span className="text-zinc-500 block text-[10px] uppercase">2. Gender</span>
                  <strong className="text-white text-sm">{profile.gender}</strong>
                </div>

                <div className="p-3 rounded-xl border border-white/5 bg-black/20">
                  <span className="text-zinc-500 block text-[10px] uppercase">3. NEET Year</span>
                  <strong className="text-white text-sm">{profile.yearOfNeet}</strong>
                </div>

                <div className="p-3 rounded-xl border border-white/5 bg-black/20">
                  <span className="text-zinc-500 block text-[10px] uppercase">4. Attempts</span>
                  <strong className="text-white text-sm">{profile.numberOfAttempts}</strong>
                </div>

                <div className="p-3 rounded-xl border border-white/5 bg-black/20">
                  <span className="text-zinc-500 block text-[10px] uppercase">5. Language</span>
                  <strong className="text-white text-sm">{profile.language} (H/E/Both)</strong>
                </div>

                <div className="p-3 rounded-xl border border-white/5 bg-black/20">
                  <span className="text-zinc-500 block text-[10px] uppercase">6. All India Rank</span>
                  <strong className="text-[#CCFF00] text-sm">AIR {profile.airRank || '—'}</strong>
                </div>

                <div className="p-3 rounded-xl border border-white/5 bg-black/20 sm:col-span-2">
                  <span className="text-zinc-500 block text-[10px] uppercase">7. Medical College</span>
                  <strong className="text-white text-sm truncate block">{profile.currentCollege}</strong>
                </div>

                <div className="p-3 rounded-xl border border-white/5 bg-black/20">
                  <span className="text-zinc-500 block text-[10px] uppercase">8. Coaching Mode</span>
                  <strong className="text-white text-sm">{profile.coachingMode}</strong>
                </div>

                <div className="p-3 rounded-xl border border-white/5 bg-black/20">
                  <span className="text-zinc-500 block text-[10px] uppercase">9. Coaching Name</span>
                  <strong className="text-white text-sm">{profile.coachingName}</strong>
                </div>

                <div className="p-3 rounded-xl border border-white/5 bg-black/20 sm:col-span-2">
                  <span className="text-zinc-500 block text-[10px] uppercase">10. Subject Marks & 11. Total</span>
                  <div className="flex items-center gap-3 mt-0.5 text-xs">
                    <span>Phy: <strong className="text-white">{profile.subjectWiseMarks?.physics ?? 175}</strong></span>
                    <span>Chem: <strong className="text-white">{profile.subjectWiseMarks?.chemistry ?? 175}</strong></span>
                    <span>Bio: <strong className="text-white">{profile.subjectWiseMarks?.biology ?? 350}</strong></span>
                    <span className="text-[#CCFF00] font-bold">Total: {profile.totalMarks || 700}/720</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MONTHLY FREE SLOTS */}
        {activeTab === 'slots' && (
          <div className="space-y-6">
            <TopperMonthlySlotManager
              availability={availability}
              onSave={(updated) => {
                setAvailability(updated);
                saveMonthlyAvailability(updated);
              }}
              theme={theme}
            />
          </div>
        )}

        {/* TAB 3: NEET & COLLEGE PROFILE */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div
              className={`p-6 sm:p-8 rounded-3xl border ${
                isDark ? 'bg-[#121217] border-zinc-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
                <div>
                  <h3 className="text-xl font-bold">Your NEET Mentor Profile</h3>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    These credentials are demonstrated to mentees when they select you as their mentor.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOnboardingOpen(true)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                    isDark
                      ? 'bg-[#CCFF00] text-black hover:bg-[#d8ff33]'
                      : 'bg-[#0066FF] text-white hover:bg-[#0052cc]'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Launch 11-Field Editor</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                <div className="space-y-1">
                  <span className="text-xs font-mono text-zinc-500 uppercase">Full Name</span>
                  <div className="p-3 rounded-xl border border-zinc-800 bg-black/30 font-bold">{profile.name}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-mono text-zinc-500 uppercase">Gender</span>
                  <div className="p-3 rounded-xl border border-zinc-800 bg-black/30 font-mono">{profile.gender}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-mono text-zinc-500 uppercase">Year of NEET</span>
                  <div className="p-3 rounded-xl border border-zinc-800 bg-black/30 font-mono">NEET {profile.yearOfNeet}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-mono text-zinc-500 uppercase">Number of Attempts</span>
                  <div className="p-3 rounded-xl border border-zinc-800 bg-black/30 font-mono">{profile.numberOfAttempts}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-mono text-zinc-500 uppercase">Mentoring Language</span>
                  <div className="p-3 rounded-xl border border-zinc-800 bg-black/30 font-mono">
                    {profile.language === 'Both' ? 'Bilingual (Hindi + English)' : profile.language === 'H' ? 'Hindi Only' : 'English Only'}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-mono text-zinc-500 uppercase">All India Rank (AIR)</span>
                  <div className="p-3 rounded-xl border border-purple-500/40 bg-purple-950/20 text-[#CCFF00] font-mono font-black text-lg">
                    AIR {profile.airRank}
                  </div>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <span className="text-xs font-mono text-zinc-500 uppercase">Current Medical College</span>
                  <div className="p-3 rounded-xl border border-zinc-800 bg-black/30 font-bold">{profile.currentCollege}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-mono text-zinc-500 uppercase">Coaching Mode</span>
                  <div className="p-3 rounded-xl border border-zinc-800 bg-black/30 font-mono">{profile.coachingMode}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-mono text-zinc-500 uppercase">Coaching Institute</span>
                  <div className="p-3 rounded-xl border border-zinc-800 bg-black/30 font-mono">{profile.coachingName}</div>
                </div>

                <div className="space-y-2 md:col-span-2 pt-2 border-t border-zinc-800">
                  <span className="text-xs font-mono text-zinc-500 uppercase block">Subject-wise Marks & Score</span>
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div className="p-3 rounded-xl border border-zinc-800 bg-black/40">
                      <div className="text-[10px] font-mono text-zinc-400">Physics</div>
                      <div className="text-base font-black font-mono mt-0.5">{profile.subjectWiseMarks?.physics ?? 175}/180</div>
                    </div>
                    <div className="p-3 rounded-xl border border-zinc-800 bg-black/40">
                      <div className="text-[10px] font-mono text-zinc-400">Chemistry</div>
                      <div className="text-base font-black font-mono mt-0.5">{profile.subjectWiseMarks?.chemistry ?? 175}/180</div>
                    </div>
                    <div className="p-3 rounded-xl border border-zinc-800 bg-black/40">
                      <div className="text-[10px] font-mono text-zinc-400">Biology</div>
                      <div className="text-base font-black font-mono mt-0.5">{profile.subjectWiseMarks?.biology ?? 350}/360</div>
                    </div>
                    <div className="p-3 rounded-xl border border-[#CCFF00]/40 bg-[#CCFF00]/10 text-[#CCFF00]">
                      <div className="text-[10px] font-mono font-bold">Total NEET</div>
                      <div className="text-base font-black font-mono mt-0.5">{profile.totalMarks || 700}/720</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: STUDENT CALL REQUESTS */}
        {activeTab === 'mentees' && (
          <div className="space-y-4">
            <div
              className={`p-5 rounded-2xl border ${
                isDark ? 'bg-[#121217] border-zinc-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-base">Incoming Aspirant Slot Reservations (₹1 Token Paid)</h3>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    These students requested a 1-on-1 strategy call with you. Direct WhatsApp coordination is activated.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-zinc-800 bg-black/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">Rahul Verma</span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        Token ₹1 Confirmed
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400 font-mono">
                      Target: AIIMS Delhi · Current Mocks: 580/720 · Weak Area: Physics Rotational & Electrostatics
                    </div>
                    <div className="text-[11px] text-zinc-500 font-mono">
                      Preferred Slot: Saturday 06:00 PM – 07:00 PM
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href="https://wa.me/919999999999?text=Hi%20Rahul,%20I%20am%20your%20AIR%20NEETwork%20mentor."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 text-black text-xs font-mono font-bold hover:bg-emerald-400 transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp Mentee</span>
                    </a>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-zinc-800 bg-black/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">Pooja Nair</span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        Token ₹1 Confirmed
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400 font-mono">
                      Target: MAMC · Current Mocks: 620/720 · Weak Area: Negative marking in Botany assertion-reason
                    </div>
                    <div className="text-[11px] text-zinc-500 font-mono">
                      Preferred Slot: Sunday 09:00 PM – 10:00 PM
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href="https://wa.me/919999999999?text=Hi%20Pooja,%20I%20am%20your%20AIR%20NEETwork%20mentor."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 text-black text-xs font-mono font-bold hover:bg-emerald-400 transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp Mentee</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PAYOUTS & EARNINGS */}
        {activeTab === 'earnings' && (
          <div className="space-y-6">
            <div
              className={`p-6 rounded-3xl border ${
                isDark ? 'bg-[#121217] border-zinc-800' : 'bg-white border-slate-200'
              }`}
            >
              <h3 className="text-lg font-bold mb-1">Mentor Honorarium & Payout Ledger</h3>
              <p className="text-xs text-zinc-400 font-mono mb-6">
                You receive 100% of your designated tier session honorarium (₹{sessionFee} per strategy session). Weekly payouts are settled automatically to your UPI / Bank account every Monday.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-2xl border border-zinc-800 bg-black/40">
                  <span className="text-xs font-mono text-zinc-400">Total Completed Sessions</span>
                  <div className="text-2xl font-black mt-1">12 Calls</div>
                </div>

                <div className="p-4 rounded-2xl border border-zinc-800 bg-black/40">
                  <span className="text-xs font-mono text-zinc-400">Total Lifetime Payouts</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">₹{sessionFee * 12}</div>
                </div>

                <div className="p-4 rounded-2xl border border-[#CCFF00]/30 bg-[#CCFF00]/5">
                  <span className="text-xs font-mono text-zinc-400">Next Upcoming Payout</span>
                  <div className="text-2xl font-black text-[#CCFF00] mt-1">₹{sessionFee * 2}</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-zinc-800 bg-black/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
                <div>
                  <span className="text-zinc-400 block">Registered Payout Method:</span>
                  <strong className="text-white">UPI: {userEmail?.split('@')[0] || 'doctor'}@okhdfcbank</strong>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                  Verified for Direct Transfer
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Onboarding Wizard Modal: Asks for all 11 required fields + next whole month's free slots */}
      <TopperProfileOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={(updated) => handleProfileUpdate(updated)}
        initialProfile={profile}
        theme={theme}
      />
    </div>
  );
};
