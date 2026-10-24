/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Logo } from './components/Logo.tsx';
import { SocialModal } from './components/SocialModal.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { GetInTouchModal } from './components/GetInTouchModal.tsx';
import { Footer } from './components/Footer.tsx';
import { DesktopNav, MobileBottomNav } from './components/Navigation.tsx';
import { AnimatedCursor } from './components/AnimatedCursor.tsx';
import { SupportAgentIcon } from './components/SupportAgentIcon.tsx';
import { AIChatModal } from './components/AIChatModal.tsx';
import { subscribeToAuth, authSignOut, type AuthUserData, type AccountRole } from './lib/supabase.ts';
import { AboutSection } from './components/AboutSection.tsx';
import { NeetTimer } from './components/NeetTimer.tsx';
import { HomeSection } from './components/HomeSection.tsx';
import { MentorSpotlight } from './components/MentorSpotlight.tsx';
import { BookingModal } from './components/BookingModal.tsx';
import { BookingPaymentFlow } from './components/BookingPaymentFlow.tsx';
import { TopperDashboard } from './components/TopperDashboard.tsx';
import { AspirantDashboard, type AspirantTab } from './components/AspirantDashboard.tsx';
import { TopperProfileOnboardingModal } from './components/TopperProfileOnboardingModal.tsx';
import { StudentSessionsModal } from './components/StudentSessionsModal.tsx';
import { SyllabusTracker } from './components/SyllabusTracker.tsx';
import { loadTopperProfile } from './utils/topperStorage.ts';
import {
  Sun,
  Moon,
  LogIn,
  LogOut,
  Mail,
  User,
  LayoutDashboard,
  GraduationCap,
  Sparkles,
  Calendar,
  CheckSquare,
} from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const isDark = theme === 'dark';

  const [activeNav, setActiveNav] = useState<string>('home');
  const [isSocialOpen, setIsSocialOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isStudentSessionsOpen, setIsStudentSessionsOpen] = useState(false);
  const [isGetInTouchOpen, setIsGetInTouchOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingMentor, setBookingMentor] = useState<string | undefined>();
  const [bookingTier, setBookingTier] = useState<string | undefined>();
  const [bookingInitialMode, setBookingInitialMode] = useState<'choose_topper' | 'diagnostic_test' | undefined>();
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUserData | null>(null);
  const signedInEmail = currentUser?.email ?? null;

  // Dedicated dashboard view controls
  const [topperInitialTab, setTopperInitialTab] = useState<'overview' | 'slots' | 'profile' | 'mentees' | 'earnings'>('overview');
  const [topperAutoEdit, setTopperAutoEdit] = useState<boolean>(false);
  const [aspirantInitialTab, setAspirantInitialTab] = useState<AspirantTab>('assessment');
  const [aspirantAutoEdit, setAspirantAutoEdit] = useState<boolean>(false);

  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);
  const [authModalState, setAuthModalState] = useState<{
    message?: string;
    mode?: 'login' | 'signup';
    role?: AccountRole;
    forceStep?: 'role' | 'auth';
  } | null>(null);

  useEffect(() => {
    const handleAuthError = (event: Event) => {
      const custom = event as CustomEvent<{ message: string; mode?: 'login' | 'signup'; role?: AccountRole }>;
      if (custom.detail?.message) {
        setAuthModalState({
          message: custom.detail.message,
          mode: custom.detail.mode || 'login',
          role: custom.detail.role,
        });
        setIsLoginOpen(true);
      }
    };

    window.addEventListener('airneet_show_auth_error', handleAuthError);

    if (typeof window !== 'undefined') {
      const savedError = sessionStorage.getItem('airneet_auth_error');
      if (savedError) {
        sessionStorage.removeItem('airneet_auth_error');
        setAuthModalState({ message: savedError, mode: 'login' });
        setIsLoginOpen(true);
      }
    }

    const unsubscribe = subscribeToAuth((user) => {
      setCurrentUser(user);
    });

    return () => {
      window.removeEventListener('airneet_show_auth_error', handleAuthError);
      unsubscribe();
    };
  }, []);

  const handleLoginButton = async () => {
    if (currentUser) {
      await authSignOut();
    } else {
      setIsLoginOpen(true);
    }
  };

  const handleNavSelect = (navId: string) => {
    if (navId === 'syllabus_tracker') {
      if (!currentUser) {
        setPendingRedirect('syllabus_tracker');
        setAuthModalState({
          mode: 'login',
          role: 'student_mentee',
          message: 'Please log in or register with your student account to access the Syllabus Tracker.',
          forceStep: 'auth',
        });
        setIsLoginOpen(true);
        return;
      }
    }
    if (navId === 'aspirant_dashboard') {
      if (!currentUser) {
        setPendingRedirect('aspirant_dashboard');
        setAuthModalState({
          mode: 'login',
          role: 'student_mentee',
          message: 'Please log in or register with your student account to access the Aspirant Portal.',
          forceStep: 'auth',
        });
        setIsLoginOpen(true);
        return;
      }
    }
    if (navId === 'dashboard') {
      if (!currentUser || currentUser.role !== 'mentor') {
        setPendingRedirect('dashboard');
        setAuthModalState({
          mode: 'login',
          role: 'mentor',
          message: 'Please log in or register with your AIR Topper mentor account to access the Topper Portal.',
          forceStep: 'auth',
        });
        setIsLoginOpen(true);
        return;
      }
    }
    setActiveNav(navId);
  };

  // If activeNav is 'dashboard', render the dedicated Topper Dashboard with left-side menu bar
  if (activeNav === 'dashboard') {
    return (
      <TopperDashboard
        theme={theme}
        userId={currentUser?.id || 'topper_active'}
        userEmail={currentUser?.email}
        userName={currentUser?.fullName}
        initialTab={topperInitialTab}
        autoEditProfile={topperAutoEdit}
        onSignOut={async () => {
          await authSignOut();
          setActiveNav('home');
        }}
        onSwitchToHome={() => setActiveNav('home')}
      />
    );
  }

  // If activeNav is 'aspirant_dashboard' or 'oqad', render the dedicated Aspirant Dashboard
  if (activeNav === 'aspirant_dashboard' || activeNav === 'oqad') {
    if (!currentUser) {
      return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-[#080808] text-white' : 'bg-white text-slate-900'}`}>
          <div className={`max-w-md w-full p-8 rounded-3xl border text-center space-y-5 shadow-2xl ${isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-slate-200'}`}>
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold font-sans">Aspirant Portal Protected</h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                The Aspirant Dashboard is personalized for registered students. Please log in or create an account to fill your diagnostic profile and view personalized analytics.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setAuthModalState({ mode: 'login', role: 'student_mentee', forceStep: 'auth' });
                  setIsLoginOpen(true);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold font-mono uppercase bg-[#3B82F6] text-white cursor-pointer hover:bg-blue-600 transition"
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthModalState({ mode: 'signup', role: 'student_mentee', forceStep: 'auth' });
                  setIsLoginOpen(true);
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold font-mono uppercase border cursor-pointer transition ${
                  isDark ? 'border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white' : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-900'
                }`}
              >
                Register
              </button>
            </div>
            <button
              type="button"
              onClick={() => setActiveNav('home')}
              className="text-xs text-zinc-400 hover:text-white underline font-mono cursor-pointer pt-1 inline-block"
            >
              ← Back to Home
            </button>
          </div>
          <LoginModal
            isOpen={isLoginOpen}
            onClose={() => setIsLoginOpen(false)}
            onMentorRegister={() => {
              setIsLoginOpen(false);
              setAuthModalState(null);
              setTopperInitialTab('profile');
              setTopperAutoEdit(true);
              setActiveNav('dashboard');
            }}
            onMentorLogin={() => {
              setIsLoginOpen(false);
              setAuthModalState(null);
              setTopperInitialTab('overview');
              setTopperAutoEdit(false);
              setActiveNav('dashboard');
            }}
            onStudentRegister={() => {
              setIsLoginOpen(false);
              setAuthModalState(null);
              const target = pendingRedirect;
              setPendingRedirect(null);
              if (target === 'syllabus_tracker') {
                setActiveNav('syllabus_tracker');
              } else {
                setAspirantInitialTab('profile');
                setAspirantAutoEdit(true);
                setActiveNav('aspirant_dashboard');
              }
            }}
            onStudentLogin={() => {
              setIsLoginOpen(false);
              setAuthModalState(null);
              const target = pendingRedirect;
              setPendingRedirect(null);
              if (target === 'syllabus_tracker') {
                setActiveNav('syllabus_tracker');
              } else {
                setAspirantInitialTab('assessment');
                setAspirantAutoEdit(false);
                setActiveNav('aspirant_dashboard');
              }
            }}
            theme={theme}
            initialState={authModalState}
          />
        </div>
      );
    }

    return (
      <AspirantDashboard
        theme={theme}
        userId={currentUser.id}
        userEmail={currentUser.email}
        userName={currentUser.fullName}
        initialTab={activeNav === 'oqad' ? 'daily_question' : aspirantInitialTab}
        autoEditProfile={aspirantAutoEdit}
        onSignOut={async () => {
          await authSignOut();
          setActiveNav('home');
        }}
        onSwitchToHome={() => setActiveNav('home')}
        onBookMoreSessions={() => {
          setActiveNav('home');
          setIsBookingOpen(true);
        }}
        onOpenSyllabusTracker={() => setActiveNav('syllabus_tracker')}
        onExploreMentors={() => setActiveNav('toppers')}
      />
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-200 flex flex-col justify-between pb-16 md:pb-0 ${
        isDark
          ? 'bg-[#080808] text-white selection:bg-[#3B82F6] selection:text-white'
          : 'bg-white text-slate-900 selection:bg-[#0066FF] selection:text-white'
      }`}
    >
      {/* Top Header / Navigation Bar (Floating Island with Rounded Corners) */}
      <header className="sticky top-0 z-40 w-full px-3 sm:px-6 md:px-8 pt-3 pb-1 transition-all">
        <div
          className={`max-w-[1560px] mx-auto px-4 sm:px-7 h-16 md:h-18 rounded-2xl md:rounded-3xl border backdrop-blur-xl transition-all duration-300 flex items-center justify-between gap-4 shadow-md ${
            isDark
              ? 'bg-[#0a0a0c]/65 border-zinc-800/60 shadow-black/30 text-white'
              : 'bg-white/75 border-slate-200/70 shadow-slate-200/40 text-slate-900'
          }`}
        >
          {/* Zone 1 (Left): Brand Logo & Wordmark */}
          <button
            type="button"
            onClick={() => setIsSocialOpen(true)}
            className="flex items-center shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] rounded-xl transition-transform active:scale-98 cursor-pointer text-left"
            title="Click to visit Instagram & YouTube channels"
            aria-label="Air NEETwork — Open Instagram and YouTube channels"
          >
            <Logo theme={theme} size="sm" />
          </button>

          {/* Zone 2 (Center): Main Navigation Icons (Balanced in the middle) */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <DesktopNav
              theme={theme}
              activeId={activeNav}
              onSelect={handleNavSelect}
              isMentor={currentUser?.role === 'mentor'}
            />
          </div>

          {/* Zone 3 (Right): User Controls Cluster (Theme Switcher + Log in) */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Sliding Theme Toggle Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={isDark}
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`relative w-16 sm:w-18 h-9 rounded-full p-1 transition-colors duration-300 ease-in-out border focus:outline-none flex items-center justify-between cursor-pointer select-none shrink-0 ${
                isDark
                  ? 'bg-zinc-900 border-zinc-700'
                  : 'bg-slate-200 border-slate-300'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle dark and light mode"
            >
              {/* Track Background Icons */}
              <Sun
                className={`w-4 h-4 ml-1 transition-opacity duration-200 ${
                  isDark ? 'text-zinc-600 opacity-60' : 'text-[#0066FF] opacity-90'
                }`}
              />
              <Moon
                className={`w-4 h-4 mr-1 transition-opacity duration-200 ${
                  isDark ? 'text-blue-400 opacity-90' : 'text-slate-400 opacity-60'
                }`}
              />

              {/* Sliding Thumb Knob */}
              <div
                className={`absolute top-1 left-1 w-7 h-7 rounded-full shadow-md transition-transform duration-300 ease-out flex items-center justify-center ${
                  isDark
                    ? 'translate-x-7 sm:translate-x-9 bg-black text-blue-400 border border-zinc-700'
                    : 'translate-x-0 bg-white text-[#0066FF]'
                }`}
              >
                {isDark ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </div>
            </button>

            {/* Subtle Divider between Theme Control and Log in */}
            <div className={`hidden sm:block h-6 w-px ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`} />

            {/* Authenticated User Status or Log In Button */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                {currentUser.role === 'mentor' && (
                  <button
                    type="button"
                    onClick={() => setActiveNav('dashboard')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-semibold transition-all cursor-pointer active:scale-95 shadow-sm ${
                      isDark
                        ? 'border-purple-500/50 bg-purple-950/40 text-purple-200 hover:bg-purple-900/50 hover:border-purple-400'
                        : 'border-purple-300 bg-purple-50 text-purple-900 hover:bg-purple-100'
                    }`}
                    title="Open Topper Mentoring Dashboard"
                  >
                    <LayoutDashboard className="w-4.5 h-4.5 text-purple-400 shrink-0" />
                    <span>Topper Portal</span>
                  </button>
                )}

                <div
                  className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border ${
                    isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                  title={currentUser.email}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      currentUser.role === 'mentor' ? 'bg-purple-400' : 'bg-[#3B82F6]'
                    }`}
                  />
                  <span className="max-w-[120px] truncate">{currentUser.fullName || currentUser.email.split('@')[0]}</span>
                  <span
                    className={`text-xs font-mono px-2 py-0.5 rounded-md uppercase ${
                      isDark ? 'bg-black text-zinc-400' : 'bg-white text-slate-600'
                    }`}
                  >
                    {currentUser.role === 'mentor' ? 'Mentor' : 'Student'}
                  </span>
                </div>

                {currentUser.role === 'student_mentee' && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveNav('aspirant_dashboard')}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-semibold transition-all cursor-pointer active:scale-95 shadow-sm ${
                        isDark
                          ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-200 hover:bg-emerald-900/50 hover:border-emerald-400'
                          : 'border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                      }`}
                      title="Open Aspirant Dashboard (Assessments, Profile, Payments, Recordings, Plan, Daily Question)"
                    >
                      <LayoutDashboard className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                      <span>Dashboard</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsStudentSessionsOpen(true)}
                      className={`hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all cursor-pointer active:scale-95 ${
                        isDark
                          ? 'border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:text-slate-900'
                      }`}
                      title="View My Mentoring Sessions & Confirmed Slots"
                    >
                      <Calendar className="w-4.5 h-4.5 text-zinc-400 shrink-0" />
                      <span>Slots</span>
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleLoginButton}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer active:scale-95 border ${
                    isDark
                      ? 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800'
                      : 'border-slate-300 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  title="Sign out of your account"
                >
                  <LogOut className="w-4.5 h-4.5 text-red-400 shrink-0" />
                  <span className="hidden xs:inline">Sign out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Clean, standard Log In button */}
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalState({ mode: 'login', forceStep: 'role' });
                    setIsLoginOpen(true);
                  }}
                  className={`h-10 px-3.5 sm:px-4 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 select-none ${
                    isDark
                      ? 'text-zinc-300 hover:text-white hover:bg-zinc-800/80 active:bg-zinc-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200'
                  }`}
                  title="Log in as Student or AIR Mentor"
                >
                  <LogIn className="w-4.5 h-4.5 shrink-0 opacity-80" />
                  <span>Log in</span>
                </button>

                {/* Clean, standard Register action pill */}
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalState({ mode: 'signup', forceStep: 'role' });
                    setIsLoginOpen(true);
                  }}
                  className={`h-10 px-4 sm:px-5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 active:scale-95 shadow-sm border select-none ${
                    isDark
                      ? 'bg-[#3B82F6] hover:bg-[#2563EB] text-white border-[#3B82F6]/50 shadow-[#3B82F6]/20'
                      : 'bg-[#0066FF] hover:bg-[#0052cc] text-white border-[#0066FF]/50 shadow-[#0066FF]/15'
                  }`}
                  title="Create a new account as Student or AIR Mentor"
                >
                  <User className="w-4.5 h-4.5 shrink-0" />
                  <span>Register</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {activeNav === 'home' && (
        <NeetTimer
          theme={theme}
          onJoinAsMentor={() => {
            setAuthModalState({ mode: 'signup', role: 'mentor', forceStep: 'role' });
            setIsLoginOpen(true);
          }}
          onJoinCommunity={() => setIsSocialOpen(true)}
        />
      )}

      {activeNav !== 'home' && activeNav !== 'about' && activeNav !== 'syllabus_tracker' && (
        <div className="fixed bottom-[11.25rem] left-4 z-40 max-w-[calc(100vw-2rem)] md:bottom-5 md:left-6">
          <NeetTimer
            theme={theme}
            variant="compact"
            onJoinAsMentor={() => {
              setAuthModalState({ mode: 'signup', role: 'mentor', forceStep: 'role' });
              setIsLoginOpen(true);
            }}
          />
        </div>
      )}

      {/* Main Content Area - Full height so footer is hidden until scroll */}
      <main className="max-w-[1560px] mx-auto px-4 sm:px-8 md:px-10 w-full flex-1 flex flex-col justify-between min-h-[calc(100vh-4rem)]">
        {activeNav === 'about' ? (
          <AboutSection theme={theme} />
        ) : activeNav === 'toppers' ? (
          <MentorSpotlight
            theme={theme}
            onSelectMentor={(mentorName) => {
              setBookingMentor(mentorName);
              setBookingTier(undefined);
              setIsBookingOpen(true);
            }}
          />
        ) : activeNav === 'syllabus_tracker' ? (
          !currentUser ? (
            <div className="py-12 sm:py-20 flex items-center justify-center w-full">
              <div className={`max-w-md w-full p-8 rounded-3xl border text-center space-y-5 shadow-2xl ${isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-slate-200'}`}>
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto text-[#3B82F6]">
                  <CheckSquare className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold font-sans">Syllabus Tracker Protected</h2>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                    Track your 65 chapters, Marks MathonGo Block A/B/C weightage, 6-stage revision progress, and projected NEET score. Please log in or create a student account to access your tracker.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPendingRedirect('syllabus_tracker');
                      setAuthModalState({ mode: 'login', role: 'student_mentee', forceStep: 'auth' });
                      setIsLoginOpen(true);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold font-mono uppercase bg-[#3B82F6] text-white cursor-pointer hover:bg-blue-600 transition"
                  >
                    Log In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingRedirect('syllabus_tracker');
                      setAuthModalState({ mode: 'signup', role: 'student_mentee', forceStep: 'auth' });
                      setIsLoginOpen(true);
                    }}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold font-mono uppercase border cursor-pointer transition ${
                      isDark ? 'border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white' : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-900'
                    }`}
                  >
                    Register
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveNav('home')}
                  className="text-xs text-zinc-400 hover:text-white underline font-mono cursor-pointer pt-1 inline-block"
                >
                  ← Back to Home
                </button>
              </div>
            </div>
          ) : (
            <div className="py-6 sm:py-8 w-full">
              <SyllabusTracker
                theme={theme}
                userId={currentUser?.id}
                onOpenMentorship={() => {
                  setActiveNav('toppers');
                }}
                onOpenDashboard={() => {
                  handleNavSelect('aspirant_dashboard');
                }}
              />
            </div>
          )
        ) : activeNav === 'booking' ? (
          <div className="py-6 sm:py-10">
            <BookingPaymentFlow
              theme={theme}
              initialMentor={bookingMentor}
              initialTier={bookingTier}
              onClose={() => setActiveNav('home')}
              isModal={false}
            />
          </div>
        ) : (
          activeNav === 'home' ? (
            <>
            <HomeSection
              theme={theme}
              onBookSession={(tierName) => {
                setBookingMentor(undefined);
                setBookingTier(tierName);
                setBookingInitialMode(undefined);
                setIsBookingOpen(true);
              }}
              onTakeAssessment={() => {
                setBookingMentor(undefined);
                setBookingTier(undefined);
                setBookingInitialMode('diagnostic_test');
                setIsBookingOpen(true);
              }}
              onBookRankerSession={() => {
                const el = document.getElementById('pricing-title');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onViewMentors={() => setActiveNav('toppers')}
              onOpenSyllabusTracker={() => handleNavSelect('syllabus_tracker')}
            />
            </>
          ) : <div className="flex-1" aria-hidden="true" />
        )}

        {/* End of Screen: "Get in touch" Button (Positioned at the end of content, strictly OUTSIDE the footer) */}
        <div className="py-12 flex flex-col items-center justify-center text-center border-t border-zinc-800/50">
          <p className="text-xs font-mono text-zinc-400 mb-4">
            Have questions about mentorship or admissions?
          </p>
          <button
            type="button"
            onClick={() => setIsGetInTouchOpen(true)}
            className={`inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider font-mono transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-lg ${
              isDark
                ? 'bg-[#3B82F6] text-white hover:bg-[#2563EB]'
                : 'bg-[#0066FF] text-white hover:bg-[#0052cc]'
            }`}
            title="Open contact & callback options"
          >
            <Mail className="w-4 h-4" />
            <span>Get in touch</span>
          </button>
        </div>
      </main>

      {/* Footer Section - Located below the fold, only visible upon scrolling */}
      <Footer theme={theme} />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        theme={theme}
        activeId={activeNav}
        onSelect={handleNavSelect}
        isMentor={currentUser?.role === 'mentor'}
      />

      {/* Fixed customer support representative icon */}
      <SupportAgentIcon theme={theme} onOpenAIChat={() => setIsAIChatOpen(true)} />

      <AIChatModal
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        theme={theme}
      />

      {/* Get In Touch Modal (WhatsApp, Mobile Number, Request Callback Form) */}
      <GetInTouchModal
        isOpen={isGetInTouchOpen}
        onClose={() => setIsGetInTouchOpen(false)}
        theme={theme}
      />

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => {
          setIsBookingOpen(false);
          setBookingMentor(undefined);
          setBookingTier(undefined);
          setBookingInitialMode(undefined);
        }}
        theme={theme}
        initialMentor={bookingMentor}
        initialTier={bookingTier}
        initialMode={bookingInitialMode}
      />

      {/* Student & Mentor Login / Registration Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => {
          setIsLoginOpen(false);
          setAuthModalState(null);
        }}
        onMentorRegister={() => {
          setIsLoginOpen(false);
          setAuthModalState(null);
          setTopperInitialTab('profile');
          setTopperAutoEdit(true);
          setActiveNav('dashboard');
        }}
        onMentorLogin={() => {
          setIsLoginOpen(false);
          setAuthModalState(null);
          setTopperInitialTab('overview');
          setTopperAutoEdit(false);
          setActiveNav('dashboard');
        }}
        onStudentRegister={() => {
          setIsLoginOpen(false);
          setAuthModalState(null);
          const target = pendingRedirect;
          setPendingRedirect(null);
          if (target === 'syllabus_tracker') {
            setActiveNav('syllabus_tracker');
          } else {
            setAspirantInitialTab('profile');
            setAspirantAutoEdit(true);
            setActiveNav('aspirant_dashboard');
          }
        }}
        onStudentLogin={() => {
          setIsLoginOpen(false);
          setAuthModalState(null);
          const target = pendingRedirect;
          setPendingRedirect(null);
          if (target === 'syllabus_tracker') {
            setActiveNav('syllabus_tracker');
          } else {
            setAspirantInitialTab('assessment');
            setAspirantAutoEdit(false);
            setActiveNav('aspirant_dashboard');
          }
        }}
        onMentorSuccess={() => {
          setIsLoginOpen(false);
          setPendingRedirect(null);
          setTopperInitialTab('overview');
          setActiveNav('dashboard');
        }}
        onStudentSuccess={() => {
          setIsLoginOpen(false);
          const target = pendingRedirect;
          setPendingRedirect(null);
          if (target === 'syllabus_tracker') {
            setActiveNav('syllabus_tracker');
          } else {
            setAspirantInitialTab('assessment');
            setAspirantAutoEdit(false);
            setActiveNav('aspirant_dashboard');
          }
        }}
        onOpenOnboarding={() => {
          setIsLoginOpen(false);
          setIsOnboardingOpen(true);
        }}
        theme={theme}
        initialState={authModalState}
      />

      {/* Detailed NEET Topper Profile & Slot Manager Onboarding Modal */}
      <TopperProfileOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onBackToSignUp={() => {
          setIsOnboardingOpen(false);
          setAuthModalState({ mode: 'signup', role: 'mentor' });
          setIsLoginOpen(true);
        }}
        onComplete={(_profile) => {
          setIsOnboardingOpen(false);
          setActiveNav('dashboard');
        }}
        initialProfile={loadTopperProfile(
          currentUser?.id || 'topper_active',
          currentUser?.email || undefined,
          currentUser?.fullName || undefined
        )}
        theme={theme}
      />

      {/* Aspirant Registered Account Confirmed Sessions Modal */}
      <StudentSessionsModal
        isOpen={isStudentSessionsOpen}
        onClose={() => setIsStudentSessionsOpen(false)}
        studentEmail={currentUser?.email}
        studentName={currentUser?.fullName}
        theme={theme}
      />

      {/* Instagram & YouTube Pop-up Modal */}
      <SocialModal
        isOpen={isSocialOpen}
        onClose={() => setIsSocialOpen(false)}
        theme={theme}
      />

      {/* Floating Preview Toolbar for Reviewing Mentor Registration & Flow */}
      <aside aria-label="Mentor registration preview controls" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-[96vw] bg-black/92 border border-amber-500/50 text-white rounded-2xl px-3 py-2 shadow-2xl backdrop-blur-md flex items-center gap-1.5 sm:gap-2 text-xs font-mono overflow-x-auto">
        <span className="hidden lg:inline-flex items-center gap-1.5 font-bold text-amber-300 mr-1 select-none shrink-0">
          <GraduationCap className="w-4 h-4 text-amber-400" />
          <span>Quick Preview:</span>
        </span>
        <button
          type="button"
          onClick={() => {
            setIsOnboardingOpen(false);
            setIsStudentSessionsOpen(false);
            setAuthModalState({ mode: 'signup', role: 'mentor' });
            setIsLoginOpen(true);
          }}
          className={`px-2.5 py-1.5 rounded-xl border font-bold transition cursor-pointer select-none shrink-0 ${
            isLoginOpen && authModalState?.role === 'mentor' && authModalState?.mode === 'signup'
              ? 'bg-[#3B82F6] text-white border-[#3B82F6] shadow-sm'
              : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500'
          }`}
          title="Preview Step 1: Mentor Sign-up & Credentials"
        >
          1. Sign-Up
        </button>
        <button
          type="button"
          onClick={() => {
            setIsLoginOpen(false);
            setIsStudentSessionsOpen(false);
            setIsOnboardingOpen(true);
          }}
          className={`px-2.5 py-1.5 rounded-xl border font-bold transition cursor-pointer select-none shrink-0 ${
            isOnboardingOpen
              ? 'bg-purple-500 text-white border-purple-400 shadow-sm'
              : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500'
          }`}
          title="Preview Step 2: 3-Page NEET Profile & Simplified Slot Manager"
        >
          2. NEET Onboarding
        </button>
        <button
          type="button"
          onClick={() => {
            setIsLoginOpen(false);
            setIsOnboardingOpen(false);
            setIsStudentSessionsOpen(false);
            setActiveNav('dashboard');
          }}
          className={`px-2.5 py-1.5 rounded-xl border font-bold transition cursor-pointer select-none shrink-0 ${
            activeNav === 'dashboard'
              ? 'bg-blue-500 text-white border-blue-400 shadow-sm'
              : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500'
          }`}
          title="Preview Topper Dashboard (Confirm Student Requests)"
        >
          3. Topper Portal
        </button>
        <button
          type="button"
          onClick={() => {
            setIsLoginOpen(false);
            setIsOnboardingOpen(false);
            setIsStudentSessionsOpen(true);
          }}
          className={`px-2.5 py-1.5 rounded-xl border font-bold transition cursor-pointer select-none shrink-0 ${
            isStudentSessionsOpen
              ? 'bg-emerald-500 text-black border-emerald-400 shadow-sm'
              : 'bg-zinc-900 border-zinc-700 text-emerald-400 hover:text-white hover:border-emerald-500'
          }`}
          title="Preview Aspirant View (Check Confirmed Slot Status)"
        >
          4. Aspirant Confirmed Slots
        </button>
        <button
          type="button"
          onClick={() => {
            setIsOnboardingOpen(false);
            setIsStudentSessionsOpen(false);
            setAuthModalState({ mode: 'signup', role: 'student_mentee', forceStep: 'auth' });
            setIsLoginOpen(true);
          }}
          className={`px-2.5 py-1.5 rounded-xl border font-bold transition cursor-pointer select-none shrink-0 ${
            isLoginOpen && authModalState?.role === 'student_mentee' && authModalState?.mode === 'signup'
              ? 'bg-emerald-500 text-black border-emerald-400 shadow-sm'
              : 'bg-zinc-900 border-zinc-700 text-emerald-300 hover:text-white hover:border-emerald-500'
          }`}
          title="Preview Aspirant Registration -> opens profile to fill details"
        >
          5. Aspirant Sign-Up
        </button>
        <button
          type="button"
          onClick={() => {
            setIsOnboardingOpen(false);
            setIsStudentSessionsOpen(false);
            setAuthModalState({ mode: 'login', role: 'student_mentee', forceStep: 'auth' });
            setIsLoginOpen(true);
          }}
          className={`px-2.5 py-1.5 rounded-xl border font-bold transition cursor-pointer select-none shrink-0 ${
            isLoginOpen && authModalState?.role === 'student_mentee' && authModalState?.mode === 'login'
              ? 'bg-emerald-500 text-black border-emerald-400 shadow-sm'
              : 'bg-zinc-900 border-zinc-700 text-emerald-300 hover:text-white hover:border-emerald-500'
          }`}
          title="Preview Aspirant Login -> loads existing dashboard details"
        >
          6. Aspirant Log-In
        </button>
      </aside>

      {/* Fluid Animated Mouse Cursor Bubble */}
      <AnimatedCursor theme={theme} />
    </div>
  );
}
