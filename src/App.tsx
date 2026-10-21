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
import {
  Sun,
  Moon,
  LogIn,
  LogOut,
  Mail,
  User,
} from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const isDark = theme === 'dark';

  const [activeNav, setActiveNav] = useState<string>('home');
  const [isSocialOpen, setIsSocialOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isGetInTouchOpen, setIsGetInTouchOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingMentor, setBookingMentor] = useState<string | undefined>();
  const [bookingTier, setBookingTier] = useState<string | undefined>();
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUserData | null>(null);
  const signedInEmail = currentUser?.email ?? null;

  const [authModalState, setAuthModalState] = useState<{
    message?: string;
    mode?: 'login' | 'signup';
    role?: AccountRole;
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

  return (
    <div
      className={`min-h-screen transition-colors duration-200 flex flex-col justify-between pb-16 md:pb-0 ${
        isDark
          ? 'bg-[#080808] text-white selection:bg-[#CCFF00] selection:text-black'
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
            className="flex items-center shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00] rounded-xl transition-transform active:scale-98 cursor-pointer text-left"
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
                  isDark ? 'text-[#CCFF00] opacity-90' : 'text-slate-400 opacity-60'
                }`}
              />

              {/* Sliding Thumb Knob */}
              <div
                className={`absolute top-1 left-1 w-6 h-6 rounded-full shadow-md transition-transform duration-300 ease-out flex items-center justify-center ${
                  isDark
                    ? 'translate-x-7 sm:translate-x-8 bg-black text-[#CCFF00] border border-zinc-700'
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
                <div
                  className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border ${
                    isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                  title={currentUser.email}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      currentUser.role === 'mentor' ? 'bg-[#CCFF00]' : 'bg-[#0066FF]'
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
              <button
                type="button"
                onClick={handleLoginButton}
                className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-95 shadow-sm ${
                  isDark
                    ? 'bg-[#CCFF00] text-black hover:bg-[#d8ff33]'
                    : 'bg-[#0066FF] text-white hover:bg-[#0052cc] shadow-[#0066FF]/20 shadow-md'
                }`}
                title="Log in to your account"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log in</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {activeNav === 'home' && (
        <NeetTimer
          theme={theme}
          onJoinAsMentor={() => setIsLoginOpen(true)}
          onJoinCommunity={() => setIsSocialOpen(true)}
        />
      )}

      {activeNav !== 'home' && activeNav !== 'about' && (
        <div className="fixed bottom-[11.25rem] left-4 z-40 max-w-[calc(100vw-2rem)] md:bottom-5 md:left-6">
          <NeetTimer
            theme={theme}
            variant="compact"
            onJoinAsMentor={() => setIsLoginOpen(true)}
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
        ) : (
          activeNav === 'home' ? (
            <>
            <HomeSection
              theme={theme}
              onBookSession={(tierName) => {
                setBookingMentor(undefined);
                setBookingTier(tierName);
                setIsBookingOpen(true);
              }}
              onBookRankerSession={() => {
                setBookingMentor(undefined);
                setBookingTier(undefined);
                setIsBookingOpen(true);
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
                ? 'bg-[#CCFF00] text-black hover:bg-[#d8ff33]'
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
        }}
        theme={theme}
        initialMentor={bookingMentor}
        initialTier={bookingTier}
      />

      {/* Student & Mentor Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => {
          setIsLoginOpen(false);
          setAuthModalState(null);
        }}
        theme={theme}
        initialState={authModalState}
      />

      {/* Instagram & YouTube Pop-up Modal */}
      <SocialModal
        isOpen={isSocialOpen}
        onClose={() => setIsSocialOpen(false)}
        theme={theme}
      />

      {/* Fluid Animated Mouse Cursor Bubble */}
      <AnimatedCursor theme={theme} />
    </div>
  );
}
