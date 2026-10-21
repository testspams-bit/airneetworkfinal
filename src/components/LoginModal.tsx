import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowRight,
  GraduationCap,
  ArrowLeft,
  BookOpenCheck,
  LoaderCircle,
  Mail,
  Lock,
  Phone,
  User,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { Logo } from './Logo.tsx';
import {
  isSupabaseConfigured,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  getAndClearAuthError,
  type AccountRole,
} from '../lib/supabase.ts';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
  initialState?: {
    message?: string;
    mode?: 'login' | 'signup';
    role?: AccountRole;
  } | null;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  theme,
  initialState,
}) => {
  const isDark = theme === 'dark';
  const [step, setStep] = useState<'role' | 'auth'>('role');
  const [role, setRole] = useState<AccountRole>('student_mentee');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMessage, setAuthMessage] = useState<{ text: string; type: 'error' | 'success' | 'info' } | null>(null);

  // Independent loading states
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      setIsEmailSubmitting(false);
      setIsGoogleSubmitting(false);

      if (initialState?.message) {
        setStep('auth');
        setAuthMode(initialState.mode || 'login');
        if (initialState.role) setRole(initialState.role);
        setAuthMessage({ text: initialState.message, type: 'error' });
      } else {
        const pendingError = getAndClearAuthError();
        if (pendingError) {
          setStep('auth');
          setAuthMode('login');
          setAuthMessage({ text: pendingError, type: 'error' });
        } else {
          setStep('role');
          setRole('student_mentee');
          setAuthMode('login');
          setAuthMessage(null);
        }
      }
      setFullName('');
      setPhone('');
      setEmail('');
      setPassword('');
    } else {
      setIsEmailSubmitting(false);
      setIsGoogleSubmitting(false);
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, initialState]);

  if (!isOpen) return null;

  const handleRoleSelect = (selectedRole: AccountRole) => {
    setRole(selectedRole);
    setIsEmailSubmitting(false);
    setIsGoogleSubmitting(false);
    setAuthMessage(null);
  };

  const handleModeSwitch = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsEmailSubmitting(false);
    setIsGoogleSubmitting(false);
    setAuthMessage(null);
  };

  const handleBackToRole = () => {
    setStep('role');
    setIsEmailSubmitting(false);
    setIsGoogleSubmitting(false);
    setAuthMessage(null);
  };

  const validateInputs = () => {
    if (!email.trim()) {
      setAuthMessage({ text: 'Please enter your email address.', type: 'error' });
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setAuthMessage({ text: 'Please enter a valid email address.', type: 'error' });
      return false;
    }
    if (!password || password.length < 6) {
      setAuthMessage({ text: 'Password must be at least 6 characters.', type: 'error' });
      return false;
    }
    if (authMode === 'signup' && !fullName.trim()) {
      setAuthMessage({ text: 'Please enter your full name.', type: 'error' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMessage(null);

    if (!validateInputs()) return;

    setIsEmailSubmitting(true);
    try {
      if (authMode === 'signup') {
        const result = await signUpWithEmail({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          phone: phone.trim(),
          role,
        });
        setAuthMessage({
          text: result.message || 'Account created successfully! Signing you in...',
          type: 'success',
        });
        window.setTimeout(onClose, 1000);
      } else {
        await signInWithEmail({
          email: email.trim(),
          password,
          expectedRole: role,
        });
        setAuthMessage({ text: 'Signed in successfully! Welcome back.', type: 'success' });
        window.setTimeout(onClose, 800);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Authentication failed. Please check your details.';
      setAuthMessage({ text: msg, type: 'error' });
    } finally {
      setIsEmailSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthMessage(null);
    setIsGoogleSubmitting(true);
    try {
      await signInWithGoogle(
        role,
        {
          fullName: fullName.trim() || undefined,
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
        },
        authMode
      );
      setAuthMessage({ text: 'Redirecting to Google...', type: 'info' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google sign-in could not be completed.';
      setAuthMessage({ text: msg, type: 'error' });
      setIsGoogleSubmitting(false);
    }
  };

  const isAnySubmitting = isEmailSubmitting || isGoogleSubmitting;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-sm max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl p-5 sm:p-6 shadow-2xl relative border transition-all ${
          isDark
            ? 'bg-[#121215] border-zinc-800 text-white shadow-black/80'
            : 'bg-white border-slate-200 text-slate-900 shadow-xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors cursor-pointer ${
            isDark
              ? 'text-zinc-500 hover:text-white hover:bg-zinc-800'
              : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
          }`}
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center mb-4">
          <Logo theme={theme} size="sm" showText={false} />
          <h2 className="mt-2 text-base font-bold tracking-tight">
            {step === 'role'
              ? 'Select Account Role'
              : authMode === 'login'
              ? `Sign In as ${role === 'mentor' ? 'Mentor' : 'Student'}`
              : `Create ${role === 'mentor' ? 'Mentor' : 'Student'} Account`}
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            {step === 'role'
              ? 'Personalized 1-on-1 NEET Mentoring'
              : isSupabaseConfigured
              ? 'Secured with Supabase Cloud Authentication'
              : 'Sign in with Google or Email + Password'}
          </p>
        </div>

        {/* STEP 1: Select Role */}
        {step === 'role' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                aria-pressed={role === 'student_mentee'}
                onClick={() => handleRoleSelect('student_mentee')}
                className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center transition cursor-pointer ${
                  isDark
                    ? role === 'student_mentee'
                      ? 'border-[#CCFF00]/50 bg-[#CCFF00]/10 text-white shadow-sm shadow-[#CCFF00]/10'
                      : 'border-zinc-800 text-zinc-300 hover:border-zinc-700 bg-zinc-900/40'
                    : role === 'student_mentee'
                    ? 'border-[#0066FF]/50 bg-[#0066FF]/10 text-slate-900 shadow-sm shadow-[#0066FF]/10'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-slate-50'
                }`}
              >
                <div
                  className={`p-2 rounded-full ${
                    role === 'student_mentee'
                      ? isDark ? 'bg-[#CCFF00]/20 text-[#CCFF00]' : 'bg-[#0066FF]/20 text-[#0066FF]'
                      : isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <span className="block text-sm font-bold">Student Mentee</span>
                  <span className="text-[10px] text-zinc-400">NEET UG Aspirant</span>
                </div>
              </button>

              <button
                type="button"
                aria-pressed={role === 'mentor'}
                onClick={() => handleRoleSelect('mentor')}
                className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center transition cursor-pointer ${
                  isDark
                    ? role === 'mentor'
                      ? 'border-[#CCFF00]/50 bg-[#CCFF00]/10 text-white shadow-sm shadow-[#CCFF00]/10'
                      : 'border-zinc-800 text-zinc-300 hover:border-zinc-700 bg-zinc-900/40'
                    : role === 'mentor'
                    ? 'border-[#0066FF]/50 bg-[#0066FF]/10 text-slate-900 shadow-sm shadow-[#0066FF]/10'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-slate-50'
                }`}
              >
                <div
                  className={`p-2 rounded-full ${
                    role === 'mentor'
                      ? isDark ? 'bg-[#CCFF00]/20 text-[#CCFF00]' : 'bg-[#0066FF]/20 text-[#0066FF]'
                      : isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <BookOpenCheck className="h-6 w-6" />
                </div>
                <div>
                  <span className="block text-sm font-bold">AIR Mentor</span>
                  <span className="text-[10px] text-zinc-400">Top Ranker / Medic</span>
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setStep('auth');
                setIsEmailSubmitting(false);
                setIsGoogleSubmitting(false);
                setAuthMessage(null);
              }}
              className={`w-full rounded-xl py-2.5 text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                isDark
                  ? 'bg-[#CCFF00] text-black hover:bg-[#d8ff33]'
                  : 'bg-[#0066FF] text-white hover:bg-[#0052cc]'
              }`}
            >
              Continue to {role === 'mentor' ? 'Mentor Portal' : 'Student Access'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          /* STEP 2: Auth Form (Google & Email + Password with Mobile number) */
          <div>
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={handleBackToRole}
                className={`flex items-center gap-1 text-xs cursor-pointer ${
                  isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Role
              </button>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase tracking-wide ${
                  isDark ? 'bg-zinc-800 text-[#CCFF00]' : 'bg-blue-50 text-[#0066FF]'
                }`}
              >
                {role === 'mentor' ? 'Mentor Mode' : 'Student Mode'}
              </span>
            </div>

            {/* Log in / Register Toggle */}
            <div
              className={`mb-4 flex rounded-xl border p-1 text-xs font-semibold ${
                isDark ? 'border-zinc-800 bg-zinc-900 text-zinc-400' : 'border-slate-200 bg-slate-100 text-slate-600'
              }`}
            >
              {(['login', 'signup'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleModeSwitch(mode)}
                  className={`flex-1 rounded-lg py-2 transition cursor-pointer ${
                    authMode === mode
                      ? isDark
                        ? 'bg-black text-[#CCFF00] shadow-sm'
                        : 'bg-white text-[#0066FF] shadow-sm'
                      : ''
                  }`}
                >
                  {mode === 'login' ? 'Log in' : 'Register'}
                </button>
              ))}
            </div>

            {/* Google Authentication Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isAnySubmitting}
              aria-label="Continue with Google"
              className={`flex w-full items-center justify-center gap-2.5 rounded-xl border py-2.5 px-3 text-sm font-semibold transition disabled:opacity-60 cursor-pointer shadow-xs ${
                isDark
                  ? 'border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-white'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
              }`}
            >
              {isGoogleSubmitting ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin text-[#CCFF00]" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
                    <path
                      fill="#4285F4"
                      d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h6.44a5.5 5.5 0 0 1-2.39 3.61v3h3.87c2.27-2.09 3.57-5.17 3.57-8.64Z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.96-1.08 7.95-2.92l-3.87-3c-1.08.72-2.46 1.15-4.08 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.1A12 12 0 0 0 12 24Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.27 14.27A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.55.37-2.27v-3.1H1.27A12 12 0 0 0 0 12c0 1.93.46 3.76 1.27 5.37l4-3.1Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.77c1.77 0 3.36.61 4.61 1.81l3.46-3.46C17.98 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.63l4 3.1c.95-2.85 3.6-4.96 6.73-4.96Z"
                    />
                  </svg>
                  <span>
                    {authMode === 'signup'
                      ? `Register with Google (${role === 'mentor' ? 'Mentor' : 'Student'})`
                      : `Log in with Google (${role === 'mentor' ? 'Mentor' : 'Student'})`}
                  </span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="my-3.5 flex items-center gap-3 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              <span className="h-px flex-1 bg-zinc-800/80" />
              <span>or with email</span>
              <span className="h-px flex-1 bg-zinc-800/80" />
            </div>

            {/* Email + Password Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* If Registering: Name field */}
              {authMode === 'signup' && (
                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-400">
                    <User className="w-3 h-3 text-zinc-500" /> Full Name
                  </label>
                  <input
                    type="text"
                    autoComplete="name"
                    placeholder="e.g. Rahul Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className={`w-full rounded-xl border px-3 py-2 text-sm transition-all focus:outline-none ${
                      isDark
                        ? 'bg-zinc-900/90 border-zinc-800 text-white focus:border-[#CCFF00]'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#0066FF]'
                    }`}
                  />
                </div>
              )}

              {/* Email Address field */}
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-400">
                  <Mail className="w-3 h-3 text-zinc-500" /> Email Address
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="aspirant@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full rounded-xl border px-3 py-2 text-sm transition-all focus:outline-none ${
                    isDark
                      ? 'bg-zinc-900/90 border-zinc-800 text-white focus:border-[#CCFF00]'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#0066FF]'
                  }`}
                />
              </div>

              {/* Password field */}
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-400">
                  <Lock className="w-3 h-3 text-zinc-500" /> Password
                </label>
                <input
                  type="password"
                  autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                  placeholder={authMode === 'signup' ? 'Create a secure password' : 'Enter your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                  className={`w-full rounded-xl border px-3 py-2 text-sm transition-all focus:outline-none ${
                    isDark
                      ? 'bg-zinc-900/90 border-zinc-800 text-white focus:border-[#CCFF00]'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#0066FF]'
                  }`}
                />
              </div>

              {/* Mobile Number Option in Registration (with explicit note that OTP is not used) */}
              {authMode === 'signup' && (
                <div className="pt-1">
                  <label className="mb-1 flex items-center justify-between text-xs font-mono font-medium text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-zinc-500" /> Mobile Number
                    </span>
                    <span className="text-[10px] text-zinc-500 font-sans">Optional / Contact only</span>
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full rounded-xl border px-3 py-2 text-sm transition-all focus:outline-none ${
                      isDark
                        ? 'bg-zinc-900/90 border-zinc-800 text-white focus:border-[#CCFF00]'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#0066FF]'
                    }`}
                  />
                  {/* Explanatory note as requested: OTP is not used because no OTP API subscription */}
                  <div className="mt-1.5 rounded-lg p-2 text-[11px] leading-tight flex items-start gap-1.5 bg-zinc-900/60 border border-zinc-800/80 text-zinc-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#CCFF00] shrink-0 mt-0.5" />
                    <span>
                      <strong>No OTP required:</strong> Mobile number is collected for mentor coordination only. OTP verification is bypassed (no third-party OTP API subscription).
                    </span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isAnySubmitting}
                className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition disabled:opacity-60 cursor-pointer shadow-sm ${
                  isDark
                    ? 'bg-[#CCFF00] text-black hover:bg-[#d8ff33]'
                    : 'bg-[#0066FF] text-white hover:bg-[#0052cc]'
                }`}
              >
                {isEmailSubmitting ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : authMode === 'signup' ? (
                  <span>Register Account</span>
                ) : (
                  <span>Log in with Email</span>
                )}
              </button>
            </form>

            {/* Feedback notification */}
            {authMessage && (
              <div
                role="status"
                className={`mt-3 p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  authMessage.type === 'error'
                    ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                    : authMessage.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                }`}
              >
                {authMessage.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                )}
                <span>{authMessage.text}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
