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
  Check,
  Video,
  ArrowRight,
  School,
  Search,
} from 'lucide-react';
import {
  type TopperProfile,
  type MonthlyAvailability,
  type SessionRequest,
  type CoachingMode,
  type LanguageOption,
  calculateSessionRateByAir,
} from '../types/topper.ts';
import {
  loadTopperProfile,
  saveTopperProfile,
  loadMonthlyAvailability,
  saveMonthlyAvailability,
  TOP_COACHING_INSTITUTES,
  AVATAR_PRESETS,
} from '../utils/topperStorage.ts';
import {
  loadAllSessionRequests,
  getRequestsForTopper,
  confirmSessionRequest,
  subscribeToSessionChanges,
} from '../utils/sessionRequestStorage.ts';
import { TopperMonthlySlotManager } from './TopperMonthlySlotManager.tsx';
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

  // Session requests state from persistent storage
  const [sessionRequests, setSessionRequests] = useState<SessionRequest[]>(() =>
    getRequestsForTopper(userId)
  );
  const [confirmToast, setConfirmToast] = useState<string | null>(null);

  // In-place Profile Editing state (Single source of truth)
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editAvatar, setEditAvatar] = useState(profile.avatarUrl || AVATAR_PRESETS[0].url);
  const [editAirRank, setEditAirRank] = useState(profile.airRank);
  const [editCollege, setEditCollege] = useState(profile.currentCollege);
  const [editYear, setEditYear] = useState(profile.yearOfNeet);
  const [editAttempts, setEditAttempts] = useState(profile.numberOfAttempts);
  const [editLanguage, setEditLanguage] = useState<LanguageOption>(profile.language);
  const [editCoachingMode, setEditCoachingMode] = useState<CoachingMode>(profile.coachingMode);
  const [editCoachingName, setEditCoachingName] = useState(profile.coachingName);
  const [editPhysics, setEditPhysics] = useState(profile.subjectWiseMarks?.physics ?? 175);
  const [editChemistry, setEditChemistry] = useState(profile.subjectWiseMarks?.chemistry ?? 175);
  const [editBiology, setEditBiology] = useState(profile.subjectWiseMarks?.biology ?? 360);
  const [editBio, setEditBio] = useState(profile.bio || '');
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // Sync session changes from storage in real time
  useEffect(() => {
    const unsub = subscribeToSessionChanges(() => {
      setSessionRequests(getRequestsForTopper(userId));
    });
    return unsub;
  }, [userId]);

  // Auto calculate fixed honorarium strictly based on AIR
  const calculatedRate = calculateSessionRateByAir(profile.airRank);

  // Total free slots count
  const totalSlotsCount = Object.values(availability.days).reduce(
    (acc, day) => acc + (day.enabledSlots?.length || 0),
    0
  );

  // Handle single Confirm Slot action
  const handleConfirmSlot = (requestId: string) => {
    const confirmed = confirmSessionRequest(requestId);
    if (confirmed) {
      setConfirmToast(`Confirmed session with ${confirmed.studentName}! Meet details synced to their account.`);
      setTimeout(() => setConfirmToast(null), 4000);
    }
  };

  // Handle saving profile in single place
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const rateInfo = calculateSessionRateByAir(editAirRank);
    const updatedTotal = Number(editPhysics || 0) + Number(editChemistry || 0) + Number(editBiology || 0);

    const updatedProfile: TopperProfile = {
      ...profile,
      name: editName.trim(),
      avatarUrl: editAvatar,
      airRank: editAirRank.trim(),
      currentCollege: editCollege.trim(),
      yearOfNeet: editYear,
      numberOfAttempts: editAttempts,
      language: editLanguage,
      coachingMode: editCoachingMode,
      coachingName: editCoachingName.trim(),
      subjectWiseMarks: {
        physics: Number(editPhysics),
        chemistry: Number(editChemistry),
        biology: Number(editBiology),
      },
      totalMarks: updatedTotal,
      bio: editBio.trim(),
      sessionRate: rateInfo.rate,
      sessionRateDisplay: rateInfo.display,
      isProfileComplete: true,
    };

    setProfile(updatedProfile);
    saveTopperProfile(updatedProfile);
    setIsEditingProfile(false);
    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 3000);
  };

  const pendingRequestsCount = sessionRequests.filter((r) => r.status === 'pending').length;
  const confirmedRequestsCount = sessionRequests.filter((r) => r.status === 'confirmed').length;

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
      label: 'Student Session Requests',
      icon: Users,
      badge: pendingRequestsCount > 0 ? `${pendingRequestsCount} New` : undefined,
    },
    { id: 'earnings', label: 'Payouts & Honorarium', icon: CreditCard },
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
            : 'bg-white/95 border-slate-200 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className={`p-2 rounded-xl border cursor-pointer ${
              isDark ? 'border-zinc-700 bg-zinc-900 text-white' : 'border-slate-300 bg-slate-100 text-slate-900'
            }`}
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <img
              src={profile.avatarUrl || AVATAR_PRESETS[0].url}
              alt={profile.name}
              className="w-8 h-8 rounded-full object-cover border border-amber-400"
            />
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#CCFF00] font-bold">
                AIR Mentor Portal
              </div>
              <div className="text-sm font-black truncate max-w-[150px]">
                {profile.name || 'Ranker Dashboard'}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border bg-amber-400/20 text-amber-300 border-amber-400/40">
            AIR {profile.airRank || '—'}
          </span>
          <button
            type="button"
            onClick={onSwitchToHome}
            className={`text-xs font-mono px-2 py-1 rounded-lg border cursor-pointer ${
              isDark ? 'border-zinc-800 text-zinc-300 hover:text-white' : 'border-slate-300 text-slate-700 hover:text-slate-900'
            }`}
          >
            Exit
          </button>
        </div>
      </div>

      {/* LEFT-SIDE PERSISTENT SIDEBAR */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-72 shrink-0 z-40 flex flex-col justify-between border-r p-5 transition-transform duration-300 md:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${
          isDark
            ? 'bg-[#0d0d11] border-zinc-800/80 text-white'
            : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}
      >
        <div className="space-y-6">
          {/* Logo & Platform Info */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/60">
            <button
              type="button"
              onClick={onSwitchToHome}
              className="focus:outline-none cursor-pointer flex items-center gap-2"
              title="Return to Aspirant Homepage"
            >
              <Logo theme={theme} size="sm" showText={false} />
              <div className="text-left leading-tight">
                <span className="text-sm font-black tracking-tight block">AIR NEETwork</span>
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                  Mentor Portal
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mentor Profile Pill (No Tiers, Clean Profile Picture + AIR Badge) */}
          <div
            className={`p-3.5 rounded-2xl border transition-all ${
              isDark
                ? 'bg-[#15151b] border-zinc-800 text-white'
                : 'bg-slate-50 border-slate-200 text-slate-900 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <img
                  src={profile.avatarUrl || AVATAR_PRESETS[0].url}
                  alt={profile.name}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400 shadow-sm"
                />
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-3.5 h-3.5 rounded-full border-2 border-black" title="Verified Ranker" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold truncate block">{profile.name || 'Ranker Mentor'}</span>
                </div>
                <div className="text-[11px] font-mono font-bold text-amber-400 truncate">
                  AIR {profile.airRank || '—'} · NEET {profile.yearOfNeet}
                </div>
                <div className="text-[10px] truncate text-zinc-400">
                  {profile.currentCollege.split(',')[0]}
                </div>
              </div>
            </div>

            {/* Honorarium Card */}
            <div className={`mt-3 pt-2.5 border-t flex items-center justify-between text-[11px] font-mono ${
              isDark ? 'border-zinc-800/80 text-zinc-300' : 'border-slate-200 text-slate-700'
            }`}>
              <span className="text-zinc-400">Fixed Rate:</span>
              <span className="font-bold text-[#CCFF00] bg-black/40 px-2 py-0.5 rounded-md border border-zinc-800">
                {calculatedRate.display} / call
              </span>
            </div>
          </div>

          {/* Navigation Menu Links */}
          <nav className="space-y-1.5">
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
                        ? 'bg-[#CCFF00] text-black shadow-sm font-black'
                        : 'bg-[#0066FF] text-white shadow-sm font-black'
                      : isDark
                      ? 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-sans font-bold ${
                        isActive
                          ? 'bg-black text-[#CCFF00]'
                          : isDark
                          ? 'bg-zinc-800 text-zinc-300'
                          : 'bg-slate-200 text-slate-800'
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

        {/* Bottom Sidebar Action Items */}
        <div className={`pt-4 border-t space-y-2 ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSwitchToHome}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                isDark
                  ? 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-500'
                  : 'border-slate-300 bg-slate-100 text-slate-700 hover:text-slate-900'
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
        {confirmToast && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-mono flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{confirmToast}</span>
          </div>
        )}

        {/* Top Header Banner for Tab */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80 mb-6">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-1.5 mb-1">
              <span>Topper Portal</span>
              <span>/</span>
              <span className={`font-bold ${isDark ? 'text-[#CCFF00]' : 'text-[#0066FF]'}`}>
                {menuItems.find((m) => m.id === activeTab)?.label}
              </span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {activeTab === 'overview' && `Welcome Back, ${profile.name || 'Ranker'}!`}
              {activeTab === 'slots' && "Next Month's Availability Calendar"}
              {activeTab === 'profile' && 'NEET Academic & Personal Profile'}
              {activeTab === 'mentees' && 'Student Session Requests'}
              {activeTab === 'earnings' && 'Session Earnings & Payout Schedule'}
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {activeTab !== 'profile' && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('profile');
                  setIsEditingProfile(true);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                  isDark
                    ? 'border-zinc-700 bg-zinc-900 text-zinc-200 hover:text-white hover:border-zinc-500'
                    : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            )}

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

        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                className={`p-5 rounded-2xl border ${
                  isDark ? 'bg-[#121217] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider">Free Slots Next Month</span>
                  <Calendar className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black">{totalSlotsCount} Slots</div>
                <p className={`text-[10px] font-mono mt-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Across next 30 days
                </p>
              </div>

              <div
                className={`p-5 rounded-2xl border ${
                  isDark ? 'bg-[#121217] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider">Pending Student Requests</span>
                  <Users className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-amber-400">{pendingRequestsCount} Awaiting</div>
                <button
                  type="button"
                  onClick={() => setActiveTab('mentees')}
                  className="text-[10px] font-mono text-[#CCFF00] hover:underline mt-1 block cursor-pointer"
                >
                  Review & Confirm Slots →
                </button>
              </div>

              <div
                className={`p-5 rounded-2xl border ${
                  isDark ? 'bg-[#121217] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider">Confirmed Strategy Calls</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-400">{confirmedRequestsCount} Confirmed</div>
                <p className={`text-[10px] font-mono mt-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Synced to student accounts
                </p>
              </div>

              <div
                className={`p-5 rounded-2xl border ${
                  isDark ? 'bg-[#121217] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider">Fixed Honorarium</span>
                  <Award className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-[#CCFF00]">{calculatedRate.display}</div>
                <p className={`text-[10px] font-mono mt-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Fixed standard for AIR {profile.airRank}
                </p>
              </div>
            </div>

            {/* Quick Summary Card */}
            <div
              className={`p-6 sm:p-7 rounded-3xl border ${
                isDark ? 'bg-[#121217] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80 mb-5">
                <div className="flex items-center gap-3">
                  <img
                    src={profile.avatarUrl || AVATAR_PRESETS[0].url}
                    alt={profile.name}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400"
                  />
                  <div>
                    <h3 className="text-lg font-bold">Verified NEET Ranker Credentials</h3>
                    <p className={`text-xs font-mono ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                      Managed in one place under your Profile tab
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('profile');
                    setIsEditingProfile(true);
                  }}
                  className={`text-xs font-mono px-3 py-1.5 rounded-xl border font-bold cursor-pointer transition-all ${
                    isDark
                      ? 'bg-zinc-800 border-zinc-700 text-[#CCFF00] hover:bg-zinc-700'
                      : 'bg-blue-50 border-blue-200 text-[#0066FF] hover:bg-blue-100'
                  }`}
                >
                  Edit in Profile Tab →
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`block text-[10px] uppercase ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>AIR Rank</span>
                  <strong className="text-[#CCFF00] text-sm font-black">AIR {profile.airRank}</strong>
                </div>
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`block text-[10px] uppercase ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>NEET Score</span>
                  <strong className="text-sm font-black">{profile.totalMarks || 700} / 720</strong>
                </div>
                <div className={`p-3 rounded-xl border sm:col-span-2 ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`block text-[10px] uppercase ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Medical College</span>
                  <strong className="text-sm truncate block font-bold">{profile.currentCollege}</strong>
                </div>
                <div className={`p-3 rounded-xl border sm:col-span-2 ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`block text-[10px] uppercase ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Coaching Institute</span>
                  <strong className="text-sm truncate block font-bold">{profile.coachingName} ({profile.coachingMode})</strong>
                </div>
                <div className={`p-3 rounded-xl border sm:col-span-2 ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`block text-[10px] uppercase ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Marks Breakdown</span>
                  <span className="text-xs font-bold">
                    P: {profile.subjectWiseMarks?.physics ?? 175} · C: {profile.subjectWiseMarks?.chemistry ?? 175} · B: {profile.subjectWiseMarks?.biology ?? 360}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: MONTHLY FREE SLOTS ================= */}
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

        {/* ================= TAB 3: NEET & COLLEGE PROFILE (SINGLE PLACE FOR EDITING) ================= */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {profileSaveSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Profile successfully updated! Changes reflect on your public mentor card.</span>
              </div>
            )}

            <div
              className={`p-6 sm:p-8 rounded-3xl border ${
                isDark ? 'bg-[#121217] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80 mb-6">
                <div>
                  <h3 className="text-xl font-bold">Your NEET Mentor Profile</h3>
                  <p className={`text-xs font-mono mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                    Single place for all your personal, academic, and coaching information.
                  </p>
                </div>

                {!isEditingProfile ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(true)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase transition-all cursor-pointer shadow-sm active:scale-95 ${
                      isDark
                        ? 'bg-[#CCFF00] text-black hover:bg-[#d8ff33]'
                        : 'bg-[#0066FF] text-white hover:bg-[#0052cc]'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className={`px-3 py-2 rounded-xl border text-xs font-mono font-bold cursor-pointer ${
                        isDark ? 'border-zinc-700 bg-zinc-800 text-zinc-300' : 'border-slate-300 bg-slate-100 text-slate-700'
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {!isEditingProfile ? (
                /* READ-ONLY VIEW */
                <div className="space-y-6">
                  {/* Top Profile Summary Card */}
                  <div className="flex items-center gap-4 p-4 rounded-2xl border border-zinc-800/80 bg-black/20">
                    <img
                      src={profile.avatarUrl || AVATAR_PRESETS[0].url}
                      alt={profile.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
                    />
                    <div>
                      <div className="text-lg font-black">{profile.name}</div>
                      <div className="text-xs font-mono text-amber-400 font-bold">
                        AIR {profile.airRank} · {profile.currentCollege}
                      </div>
                      <div className={`text-xs mt-1 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                        {profile.bio}
                      </div>
                    </div>
                  </div>

                  {/* 11 Fields Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
                    <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                      <span className={`block text-[10px] uppercase ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>1. Full Name</span>
                      <strong className="text-sm">{profile.name}</strong>
                    </div>

                    <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                      <span className={`block text-[10px] uppercase ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>2. Gender</span>
                      <strong className="text-sm">{profile.gender}</strong>
                    </div>

                    <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                      <span className={`block text-[10px] uppercase ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>3. Year of NEET</span>
                      <strong className="text-sm">{profile.yearOfNeet}</strong>
                    </div>

                    <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                      <span className={`block text-[10px] uppercase ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>4. Number of Attempts</span>
                      <strong className="text-sm">{profile.numberOfAttempts}</strong>
                    </div>

                    <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                      <span className={`block text-[10px] uppercase ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>5. Mentoring Language</span>
                      <strong className="text-sm">{profile.language === 'Both' ? 'Hindi + English' : profile.language}</strong>
                    </div>

                    <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                      <span className={`block text-[10px] uppercase ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>6. All India Rank</span>
                      <strong className="text-sm text-[#CCFF00]">AIR {profile.airRank}</strong>
                    </div>

                    <div className={`p-3.5 rounded-xl border sm:col-span-2 ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                      <span className={`block text-[10px] uppercase ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>7. Medical College (MBBS)</span>
                      <strong className="text-sm truncate block">{profile.currentCollege}</strong>
                    </div>

                    <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                      <span className={`block text-[10px] uppercase ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>8. Coaching Mode</span>
                      <strong className="text-sm">{profile.coachingMode}</strong>
                    </div>

                    <div className={`p-3.5 rounded-xl border sm:col-span-2 ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                      <span className={`block text-[10px] uppercase ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>9. Coaching Institute</span>
                      <strong className="text-sm truncate block">{profile.coachingName}</strong>
                    </div>

                    <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                      <span className={`block text-[10px] uppercase ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>10. Fixed Honorarium</span>
                      <strong className="text-sm text-amber-400">{calculatedRate.display}</strong>
                    </div>

                    <div className={`p-3.5 rounded-xl border sm:col-span-3 ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                      <span className={`block text-[10px] uppercase ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>11. Subject Marks & Total</span>
                      <div className="flex flex-wrap items-center gap-4 text-xs mt-1">
                        <span>Physics: <strong>{profile.subjectWiseMarks?.physics ?? 175}/180</strong></span>
                        <span>Chemistry: <strong>{profile.subjectWiseMarks?.chemistry ?? 175}/180</strong></span>
                        <span>Biology: <strong>{profile.subjectWiseMarks?.biology ?? 360}/360</strong></span>
                        <span className="font-bold text-[#CCFF00]">Total NEET: {profile.totalMarks || 700}/720</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* IN-PLACE SINGLE EDITOR */
                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-mono font-bold uppercase mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                        Full Legal Name
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none ${
                          isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-mono font-bold uppercase mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                        All India Rank (AIR)
                      </label>
                      <input
                        type="text"
                        value={editAirRank}
                        onChange={(e) => setEditAirRank(e.target.value)}
                        required
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono font-bold focus:outline-none ${
                          isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Profile Picture Avatar Selector */}
                  <div>
                    <label className={`block text-xs font-mono font-bold uppercase mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                      Profile Picture / Avatar
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {AVATAR_PRESETS.map((av) => (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => setEditAvatar(av.url)}
                          className={`relative rounded-xl p-1 border-2 transition-all cursor-pointer ${
                            editAvatar === av.url ? 'border-[#CCFF00]' : 'border-transparent'
                          }`}
                        >
                          <img src={av.url} alt={av.label} className="w-full aspect-square object-cover rounded-lg" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-mono font-bold uppercase mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                      Medical College (MBBS Institution)
                    </label>
                    <input
                      type="text"
                      value={editCollege}
                      onChange={(e) => setEditCollege(e.target.value)}
                      required
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none ${
                        isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-mono font-bold uppercase mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                        Coaching Mode
                      </label>
                      <select
                        value={editCoachingMode}
                        onChange={(e) => setEditCoachingMode(e.target.value as CoachingMode)}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none ${
                          isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value="Classroom / Offline">Classroom / Offline</option>
                        <option value="Online">Online</option>
                        <option value="Self-Study">Self-Study</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-xs font-mono font-bold uppercase mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                        Coaching Institute Name
                      </label>
                      <input
                        type="text"
                        value={editCoachingName}
                        onChange={(e) => setEditCoachingName(e.target.value)}
                        required
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none ${
                          isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <span className={`block text-xs font-mono mb-1 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>Physics (/180)</span>
                      <input
                        type="number"
                        min={0}
                        max={180}
                        value={editPhysics}
                        onChange={(e) => setEditPhysics(Number(e.target.value))}
                        className={`w-full px-3 py-2 rounded-xl border text-sm font-mono focus:outline-none ${
                          isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                    <div>
                      <span className={`block text-xs font-mono mb-1 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>Chemistry (/180)</span>
                      <input
                        type="number"
                        min={0}
                        max={180}
                        value={editChemistry}
                        onChange={(e) => setEditChemistry(Number(e.target.value))}
                        className={`w-full px-3 py-2 rounded-xl border text-sm font-mono focus:outline-none ${
                          isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                    <div>
                      <span className={`block text-xs font-mono mb-1 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>Biology (/360)</span>
                      <input
                        type="number"
                        min={0}
                        max={360}
                        value={editBiology}
                        onChange={(e) => setEditBiology(Number(e.target.value))}
                        className={`w-full px-3 py-2 rounded-xl border text-sm font-mono focus:outline-none ${
                          isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-mono font-bold uppercase mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                      Mentoring Bio & Focus Area
                    </label>
                    <textarea
                      rows={2}
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none ${
                        isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-3 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className={`px-4 py-2.5 rounded-xl border text-xs font-mono font-bold cursor-pointer ${
                        isDark ? 'border-zinc-700 bg-zinc-800 text-zinc-300' : 'border-slate-300 bg-slate-100 text-slate-700'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-mono text-xs font-bold uppercase transition-all cursor-pointer shadow-md ${
                        isDark ? 'bg-[#CCFF00] text-black hover:bg-[#d8ff33]' : 'bg-[#0066FF] text-white hover:bg-[#0052cc]'
                      }`}
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Profile Changes</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 4: STUDENT CALL REQUESTS (CONFIRM SLOT ONLY) ================= */}
        {activeTab === 'mentees' && (
          <div className="space-y-4">
            <div
              className={`p-6 sm:p-7 rounded-3xl border ${
                isDark ? 'bg-[#121217] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80 mb-5">
                <div>
                  <h3 className="font-bold text-lg">Incoming Student Session Requests</h3>
                  <p className={`text-xs font-mono mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                    Click "Confirm Slot" to lock the appointment. The confirmed status and meeting link reflect immediately in the aspirant&apos;s registered account.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    {pendingRequestsCount} Pending
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    {confirmedRequestsCount} Confirmed
                  </span>
                </div>
              </div>

              {sessionRequests.length === 0 ? (
                <div className="py-12 text-center text-zinc-400 font-mono text-xs">
                  No session requests at the moment. As aspirants reserve slots, they will appear here.
                </div>
              ) : (
                <div className="space-y-3.5">
                  {sessionRequests.map((req) => {
                    const isConfirmed = req.status === 'confirmed';

                    return (
                      <div
                        key={req.id}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                          isConfirmed
                            ? isDark
                              ? 'bg-emerald-950/20 border-emerald-500/40'
                              : 'bg-emerald-50/70 border-emerald-300'
                            : isDark
                            ? 'bg-zinc-900/60 border-zinc-800'
                            : 'bg-white border-slate-200 shadow-xs'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2.5">
                              <span className="font-bold text-sm sm:text-base">{req.studentName}</span>
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                                  isConfirmed
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                                    : 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                                }`}
                              >
                                {isConfirmed ? '✓ Slot Confirmed' : 'Action Required: Pending Slot'}
                              </span>
                              <span className="text-[10px] font-mono text-zinc-400">
                                {req.neetAspirantYear}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs font-mono text-zinc-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                                <strong>Date:</strong> {req.requestedDate}
                              </span>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                                <strong>Slot:</strong> {req.requestedSlotLabel}
                              </span>
                              {req.studentPhone && (
                                <>
                                  <span>·</span>
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3.5 h-3.5 text-zinc-400" />
                                    {req.studentPhone}
                                  </span>
                                </>
                              )}
                            </div>

                            {req.doubtTopic && (
                              <div
                                className={`text-xs px-3 py-1.5 rounded-lg mt-1 font-sans ${
                                  isDark ? 'bg-black/30 text-zinc-300' : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                <span className="font-bold text-emerald-400 font-mono">Doubt Focus:</span>{' '}
                                {req.doubtTopic}
                              </div>
                            )}

                            {isConfirmed && req.meetingLink && (
                              <div className="flex items-center gap-2 pt-1 text-xs font-mono text-emerald-400">
                                <Video className="w-4 h-4 shrink-0" />
                                <span>Meeting Link:</span>
                                <a
                                  href={req.meetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline font-bold hover:text-emerald-300"
                                >
                                  {req.meetingLink}
                                </a>
                              </div>
                            )}
                          </div>

                          {/* ACTION BUTTON: Confirm Slot Only as requested */}
                          <div className="shrink-0 flex items-center gap-2">
                            {!isConfirmed ? (
                              <button
                                type="button"
                                onClick={() => handleConfirmSlot(req.id)}
                                className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 ${
                                  isDark
                                    ? 'bg-[#CCFF00] text-black hover:bg-[#d8ff33]'
                                    : 'bg-[#0066FF] text-white hover:bg-[#0052cc]'
                                }`}
                                title="Confirm this slot for the aspirant"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Confirm Slot</span>
                              </button>
                            ) : (
                              <span className="text-xs font-mono text-emerald-400 font-bold px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5" />
                                <span>Slot Confirmed</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 5: PAYOUTS & EARNINGS ================= */}
        {activeTab === 'earnings' && (
          <div className="space-y-6">
            <div
              className={`p-6 sm:p-8 rounded-3xl border ${
                isDark ? 'bg-[#121217] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-6">
                <div>
                  <h3 className="text-xl font-bold">Session Honorarium & Payout Schedule</h3>
                  <p className={`text-xs font-mono mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                    Fixed per-session honorarium calculated strictly based on your All India Rank bracket.
                  </p>
                </div>

                <div className="text-right font-mono">
                  <div className={`text-[10px] uppercase font-bold ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Your Verified AIR Rate</div>
                  <div className="text-xl font-black text-[#CCFF00]">{calculatedRate.display}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`block text-xs font-mono uppercase ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Completed Strategy Sessions</span>
                  <strong className="text-2xl font-black mt-1 block">4 Calls</strong>
                </div>

                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`block text-xs font-mono uppercase ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Honorarium Earned</span>
                  <strong className="text-2xl font-black text-[#CCFF00] mt-1 block">
                    ₹{(calculatedRate.rate * 4).toLocaleString()}
                  </strong>
                </div>

                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`block text-xs font-mono uppercase ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Next Direct UPI Payout</span>
                  <strong className="text-sm font-bold mt-1 block text-emerald-400">Monday (Weekly Settlement)</strong>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border font-mono text-xs ${isDark ? 'bg-black/30 border-zinc-800 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                <h4 className="font-bold uppercase tracking-wider mb-2 text-[#CCFF00]">AIR NEETwork Fixed Honorarium Structure:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[11px]">
                  <div className="p-2 rounded-lg border border-zinc-800 bg-zinc-900/50">AIR 1–10: <strong>₹1,500/₹1,999</strong></div>
                  <div className="p-2 rounded-lg border border-zinc-800 bg-zinc-900/50">AIR 10–100: <strong>₹1,299</strong></div>
                  <div className="p-2 rounded-lg border border-zinc-800 bg-zinc-900/50">AIR 100–500: <strong>₹1,199</strong></div>
                  <div className="p-2 rounded-lg border border-zinc-800 bg-zinc-900/50">AIR 500–1000: <strong>₹1,000</strong></div>
                  <div className="p-2 rounded-lg border border-zinc-800 bg-zinc-900/50">Beyond AIR 1000: <strong>₹900</strong></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
