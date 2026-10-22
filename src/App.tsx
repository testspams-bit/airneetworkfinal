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
import { AspirantDashboard } from './components/AspirantDashboard.tsx';
import { TopperProfileOnboardingModal } from './components/TopperProfileOnboardingModal.tsx';
import { StudentSessionsModal } from './components/StudentSessionsModal.tsx';
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

  // If activeNav is 'dashboard', render the dedicated Topper Dashboard with left-side menu bar
  if (activeNav === 'dashboard') {
    return (
      <TopperDashboard
        theme={theme}
        userId={currentUser?.id || 'topper_active'}
        userEmail={currentUser?.email}
        userName={currentUser?.fullName}
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
    return (
      <AspirantDashboard
        theme={theme}
        userId={currentUser?.id || 'student_active'}
        userEmail={currentUser?.email}
        userName={currentUser?.fullName}
        initialTab={activeNav === 'oqad' ? 'daily_question' : 'assessment'}
        onSignOut={async () => {
          await authSignOut();
          setActiveNav('home');
        }}
        onSwitchToHome={() => setActiveNav('home')}
        onBookMoreSessions={() => {
          setActiveNav('home');
          setIsBookingOpen(true);
        }}
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
          className={`max-w-[1560px] mx-auto px-4 sm:px-8 h-16 rounded-2xl md:rounded-3xl border backdrop-blur-xl transition-all duration-300 flex items-center justify-between gap-4 shadow-lg ${
            isDark
              ? 'bg-[#0a0a0c]/85 border-zinc-800/80 shadow-black/40 text-white'
              : 'bg-white/90 border-slate-200/90 shadow-slate-200/50 text-slate-900'
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
              onSelect={setActiveNav}
              isMentor={currentUser?.role === 'mentor'}
            />
          </div>

          {/* Zone 3 (Right): User Controls Cluster (Theme Switcher + Log in) */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Sliding Theme Toggle Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={isDark}
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`relative w-15 sm:w-16 h-8 rounded-full p-1 transition-colors duration-300 ease-in-out border focus:outline-none flex items-center justify-between cursor-pointer select-none shrink-0 ${
                isDark
                  ? 'bg-zinc-900 border-zinc-700'
                  : 'bg-slate-200 border-slate-300'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle dark and light mode"
            >
              {/* Track Background Icons */}
              <Sun
                className={`w-3.5 h-3.5 ml-1 transition-opacity duration-200 ${
                  isDark ? 'text-zinc-600 opacity-60' : 'text-[#0066FF] opacity-90'
                }`}
              />
              <Moon
                className={`w-3.5 h-3.5 mr-1 transition-opacity duration-200 ${
                  isDark ? 'text-blue-400 opacity-90' : 'text-slate-400 opacity-60'
                }`}
              />

              {/* Sliding Thumb Knob */}
              <div
                className={`absolute top-1 left-1 w-6 h-6 rounded-full shadow-md transition-transform duration-300 ease-out flex items-center justify-center ${
                  isDark
                    ? 'translate-x-7 sm:translate-x-8 bg-black text-blue-400 border border-zinc-700'
                    : 'translate-x-0 bg-white text-[#0066FF]'
                }`}
              >
                {isDark ? (
                  <Moon className="w-3.5 h-3.5" />
                ) : (
                  <Sun className="w-3.5 h-3.5" />
                )}
              </div>
            </button>

            {/* Subtle Divider between Theme Control and Log in */}
            <div className={`hidden sm:block h-5 w-px ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`} />

            {/* Authenticated User Status or Log In Button */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                {currentUser.role === 'mentor' && (
                  <button
                    type="button"
                    onClick={() => setActiveNav('dashboard')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 shadow-sm ${
                      isDark
                        ? 'border-purple-500/50 bg-purple-950/40 text-purple-200 hover:bg-purple-900/50 hover:border-purple-400'
                        : 'border-purple-300 bg-purple-50 text-purple-900 hover:bg-purple-100'
                    }`}
                    title="Open Topper Mentoring Dashboard"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-purple-400" />
                    <span>Topper Dashboard</span>
                  </button>
                )}

                <div
                  className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border ${
                    isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                  title={currentUser.email}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      currentUser.role === 'mentor' ? 'bg-purple-400' : 'bg-[#3B82F6]'
                    }`}
                  />
                  <span className="max-w-[110px] truncate">{currentUser.fullName || currentUser.email.split('@')[0]}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded uppercase ${
                      isDark ? 'bg-black text-zinc-400' : 'bg-white text-slate-500'
                    }`}
                  >
                    {currentUser.role === 'mentor' ? 'Mentor' : 'Student'}
                  </span>
                </div>

                {currentUser.role === 'student_mentee' && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveNav('aspirant_dashboard')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 shadow-sm ${
                        isDark
                          ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-200 hover:bg-emerald-900/50 hover:border-emerald-400'
                          : 'border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                      }`}
                      title="Open Aspirant Dashboard (Assessments, Profile, Payments, Recordings, Plan, Daily Question)"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Aspirant Dashboard</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsStudentSessionsOpen(true)}
                      className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono font-medium transition-all cursor-pointer active:scale-95 ${
                        isDark
                          ? 'border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:text-slate-900'
                      }`}
                      title="View My Mentoring Sessions & Confirmed Slots"
                    >
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Slots</span>
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleLoginButton}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-95 border ${
                    isDark
                      ? 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800'
                      : 'border-slate-300 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  title="Sign out of your account"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-400" />
                  <span className="hidden xs:inline">Sign out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-1.5">
                {/* Sleek, compact Log In button */}
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalState({ mode: 'login', forceStep: 'role' });
                    setIsLoginOpen(true);
                  }}
                  className={`h-8 px-2.5 sm:px-3 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 select-none ${
                    isDark
                      ? 'text-zinc-300 hover:text-white hover:bg-zinc-800/80 active:bg-zinc-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200'
                  }`}
                  title="Log in as Student or AIR Mentor"
                >
                  <LogIn className="w-3.5 h-3.5 opacity-80" />
                  <span>Log in</span>
                </button>

                {/* Sleek, compact Register action pill */}
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalState({ mode: 'signup', forceStep: 'role' });
                    setIsLoginOpen(true);
                  }}
                  className={`h-8 px-3 sm:px-3.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm border select-none ${
                    isDark
                      ? 'bg-[#3B82F6] hover:bg-[#2563EB] text-white border-[#3B82F6]/50 shadow-[#3B82F6]/20'
                      : 'bg-[#0066FF] hover:bg-[#0052cc] text-white border-[#0066FF]/50 shadow-[#0066FF]/15'
                  }`}
                  title="Create a new account as Student or AIR Mentor"
                >
                  <User className="w-3.5 h-3.5" />
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

      {activeNav !== 'home' && activeNav !== 'about' && (
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
        onSelect={setActiveNav}
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
        onMentorSuccess={() => {
          setIsLoginOpen(false);
          setIsOnboardingOpen(true);
        }}
        onStudentSuccess={() => {
          setIsLoginOpen(false);
          setActiveNav('aspirant_dashboard');
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
      </aside>

      {/* Fluid Animated Mouse Cursor Bubble */}
      <AnimatedCursor theme={theme} />
    </div>
  );
}
