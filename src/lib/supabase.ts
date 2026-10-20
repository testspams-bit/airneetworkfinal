import { createClient, type Session, type User } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://obtlfbkjfnjitgvwmspy.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9idGxmYmtqZm5qaXRndndtc3B5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0OTQ1MTYsImV4cCI6MjEwODA3MDUxNn0.Zp9Q007uqGu0E03xW6GGcdlN37KXqBGPQSwdmUouhbM';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export type AccountRole = 'student_mentee' | 'mentor';

export const roleLabel = (role: AccountRole) =>
  role === 'student_mentee' ? 'Student Mentee' : 'Mentor';

export interface AuthUserData {
  id: string;
  email: string;
  role: AccountRole;
  fullName?: string;
  phone?: string;
  provider?: 'email' | 'google';
}

const LOCAL_STORAGE_USER_KEY = 'airneet_current_user';
const LOCAL_STORAGE_ACCOUNTS_KEY = 'airneet_local_accounts';
const AUTH_EVENT_NAME = 'airneet_auth_change';

// Helper to notify listeners of auth state change
function emitAuthChange(user: AuthUserData | null) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME, { detail: user }));
  }
}

// Get the current user synchronously from local storage or cached session
export function getCurrentAuthUser(): AuthUserData | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUserData;
  } catch {
    return null;
  }
}

// Subscribe to auth state changes across the application
export function subscribeToAuth(callback: (user: AuthUserData | null) => void): () => void {
  // First send immediate current state
  callback(getCurrentAuthUser());

  // Listen to Supabase if configured
  let supabaseUnsub: (() => void) | null = null;
  if (supabase) {
    const handleSession = (session: Session | null) => {
      if (session?.user) {
        const u = session.user;
        const storedRole = localStorage.getItem('airneet-auth-role') as AccountRole | null;
        const pendingRegistration = localStorage.getItem('airneet-auth-registration');
        if (storedRole && !u.user_metadata?.air_neetwork_role) {
          let regData: Record<string, unknown> = {};
          if (pendingRegistration) {
            try {
              regData = JSON.parse(pendingRegistration);
            } catch {
              // ignore
            }
          }
          void supabase.auth.updateUser({
            data: {
              air_neetwork_role: storedRole,
              ...regData,
            },
          });
          localStorage.removeItem('airneet-auth-role');
          localStorage.removeItem('airneet-auth-registration');
        }

        const role = (u.user_metadata?.air_neetwork_role || storedRole || 'student_mentee') as AccountRole;
        const userData: AuthUserData = {
          id: u.id,
          email: u.email || '',
          role,
          fullName: (u.user_metadata?.full_name as string) || undefined,
          phone: (u.user_metadata?.contact_phone as string) || undefined,
          provider: session.user.app_metadata?.provider === 'google' ? 'google' : 'email',
        };
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userData));
        callback(userData);
      } else {
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
        callback(null);
      }
    };

    void supabase.auth.getSession().then(({ data }) => handleSession(data.session));

    const { data } = supabase.auth.onAuthStateChange(async (_event, session: Session | null) => {
      handleSession(session);
    });
    supabaseUnsub = () => data.subscription.unsubscribe();
  }

  // Also listen for internal local auth events
  const handleCustomEvent = (event: Event) => {
    const custom = event as CustomEvent<AuthUserData | null>;
    callback(custom.detail);
  };

  window.addEventListener(AUTH_EVENT_NAME, handleCustomEvent);

  return () => {
    window.removeEventListener(AUTH_EVENT_NAME, handleCustomEvent);
    if (supabaseUnsub) supabaseUnsub();
  };
}

// Sign up with Email + Password + optional Mobile number (no OTP required)
export async function signUpWithEmail(params: {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: AccountRole;
}): Promise<{ user: AuthUserData; message?: string }> {
  const { email, password, fullName, phone, role } = params;

  if (supabase) {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          air_neetwork_role: role,
          full_name: fullName.trim(),
          contact_phone: phone.trim(),
          contact_email: email.trim(),
        },
      },
    });
    if (error) throw error;

    if (data.user) {
      const userData: AuthUserData = {
        id: data.user.id,
        email: data.user.email || email.trim(),
        role,
        fullName: fullName.trim(),
        phone: phone.trim(),
        provider: 'email',
      };
      if (data.session) {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userData));
        emitAuthChange(userData);
      }
      return {
        user: userData,
        message: data.session
          ? 'Account created and signed in successfully!'
          : 'Account created! Please check your email to confirm your account.',
      };
    }
  }

  // Local authentication fallback if Supabase keys are not set
  let accounts: Array<{ email: string; pass: string; user: AuthUserData }> = [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ACCOUNTS_KEY);
    if (raw) accounts = JSON.parse(raw);
  } catch {
    accounts = [];
  }

  const existing = accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    throw new Error('An account with this email already exists. Please log in.');
  }

  const newUser: AuthUserData = {
    id: 'user_' + Math.random().toString(36).substring(2, 10),
    email: email.trim(),
    role,
    fullName: fullName.trim(),
    phone: phone.trim(),
    provider: 'email',
  };

  accounts.push({ email: email.trim(), pass: password, user: newUser });
  localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
  localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newUser));
  emitAuthChange(newUser);

  return { user: newUser, message: 'Account registered and signed in successfully!' };
}

// Sign in with Email + Password
export async function signInWithEmail(params: {
  email: string;
  password: string;
  expectedRole: AccountRole;
}): Promise<{ user: AuthUserData }> {
  const { email, password, expectedRole } = params;

  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;
    if (!data.user) throw new Error('Sign in failed. No user returned.');

    const savedRole = data.user.user_metadata?.air_neetwork_role;
    if (savedRole && savedRole !== expectedRole) {
      await supabase.auth.signOut();
      throw new Error(
        `This account is registered as ${savedRole === 'mentor' ? 'a Mentor' : 'a Student Mentee'}. Switch to ${savedRole === 'mentor' ? 'Mentor' : 'Student'} to sign in.`
      );
    }

    if (!savedRole) {
      await supabase.auth.updateUser({ data: { air_neetwork_role: expectedRole } });
    }

    const userData: AuthUserData = {
      id: data.user.id,
      email: data.user.email || email.trim(),
      role: (savedRole || expectedRole) as AccountRole,
      fullName: (data.user.user_metadata?.full_name as string) || undefined,
      phone: (data.user.user_metadata?.contact_phone as string) || undefined,
      provider: 'email',
    };

    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userData));
    emitAuthChange(userData);
    return { user: userData };
  }

  // Local fallback
  let accounts: Array<{ email: string; pass: string; user: AuthUserData }> = [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ACCOUNTS_KEY);
    if (raw) accounts = JSON.parse(raw);
  } catch {
    accounts = [];
  }

  const found = accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
  if (found) {
    if (found.pass !== password) {
      throw new Error('Incorrect password. Please try again.');
    }
    if (found.user.role !== expectedRole) {
      throw new Error(
        `This account is registered as ${found.user.role === 'mentor' ? 'a Mentor' : 'a Student Mentee'}. Please choose the matching account type.`
      );
    }
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(found.user));
    emitAuthChange(found.user);
    return { user: found.user };
  }

  // If no previous account exists locally, create one smoothly to allow testing
  const fallbackUser: AuthUserData = {
    id: 'user_' + Math.random().toString(36).substring(2, 10),
    email: email.trim(),
    role: expectedRole,
    fullName: email.split('@')[0],
    provider: 'email',
  };
  accounts.push({ email: email.trim(), pass: password, user: fallbackUser });
  localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
  localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(fallbackUser));
  emitAuthChange(fallbackUser);

  return { user: fallbackUser };
}

// Sign in with Google
export async function signInWithGoogle(
  role: AccountRole,
  extraData?: { fullName?: string; phone?: string; email?: string }
): Promise<void> {
  if (supabase) {
    localStorage.setItem('airneet-auth-role', role);
    if (extraData) {
      localStorage.setItem('airneet-auth-registration', JSON.stringify(extraData));
    }
    const callbackUrl = new URL(window.location.href);
    callbackUrl.searchParams.set('authRole', role);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl.toString() },
    });
    if (error) {
      localStorage.removeItem('airneet-auth-role');
      localStorage.removeItem('airneet-auth-registration');
      throw error;
    }
    return;
  }

  // Local Google OAuth simulation when Supabase credentials are not connected
  const simulatedGoogleUser: AuthUserData = {
    id: 'google_' + Math.random().toString(36).substring(2, 10),
    email: extraData?.email?.trim() || 'google.aspirant@gmail.com',
    role,
    fullName: extraData?.fullName?.trim() || 'Google Aspirant',
    phone: extraData?.phone?.trim() || undefined,
    provider: 'google',
  };

  localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(simulatedGoogleUser));
  emitAuthChange(simulatedGoogleUser);
}

// Sign out from any active session
export async function authSignOut(): Promise<void> {
  localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }
  emitAuthChange(null);
}
