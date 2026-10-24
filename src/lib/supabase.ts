import { createClient, type Session, type User } from '@supabase/supabase-js';

function isValidHttpUrl(val?: string | null): boolean {
  if (!val || typeof val !== 'string') return false;
  try {
    const u = new URL(val.trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function getSanitizedSupabaseConfig() {
  const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  // Only configure Supabase if real environment variables are provided with a valid HTTP(S) URL and non-empty key
  if (isValidHttpUrl(rawUrl) && rawKey && (rawKey.startsWith('ey') || rawKey.length > 20)) {
    return { url: rawUrl, key: rawKey };
  }

  return { url: '', key: '' };
}

const { url: supabaseUrl, key: supabaseAnonKey } = getSanitizedSupabaseConfig();

export const isSupabaseConfigured = Boolean(isValidHttpUrl(supabaseUrl) && supabaseAnonKey);

let supabaseClient = null;
if (isSupabaseConfigured) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'implicit',
      },
    });
  } catch (initError) {
    console.warn('[AIR NEETwork] Failed to initialize Supabase client:', initError);
    supabaseClient = null;
  }
}

export const supabase = supabaseClient;

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
const AUTH_ERROR_SESSION_KEY = 'airneet_auth_error';

// Helper to notify listeners of auth state change
function emitAuthChange(user: AuthUserData | null) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME, { detail: user }));
  }
}

// Dispatches an event that immediately pops open the LoginModal with an error and preselects the tab
function dispatchAuthErrorModal(message: string, mode: 'login' | 'signup' = 'login', role?: AccountRole) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('airneet_show_auth_error', {
        detail: { message, mode, role },
      })
    );
  }
}

// Retrieve and clear any OAuth error from sessionStorage
export function getAndClearAuthError(): string | null {
  if (typeof window === 'undefined') return null;
  const err = sessionStorage.getItem(AUTH_ERROR_SESSION_KEY);
  if (err) {
    sessionStorage.removeItem(AUTH_ERROR_SESSION_KEY);
    return err;
  }
  return null;
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
  // First send immediate current state from storage
  callback(getCurrentAuthUser());

  let supabaseUnsub: (() => void) | null = null;
  if (supabase) {
    const handleSession = (session: Session | null) => {
      if (session?.user) {
        const u = session.user;
        const storedRole = localStorage.getItem('airneet-auth-role') as AccountRole | null;
        const storedMode = localStorage.getItem('airneet-auth-mode') as 'login' | 'signup' | null;
        const pendingRegistration = localStorage.getItem('airneet-auth-registration');
        const savedRole = u.user_metadata?.air_neetwork_role as AccountRole | undefined;

        // MODE 1: LOG IN CHECKS
        if (storedMode === 'login' && storedRole) {
          // If no role exists in user metadata, they never registered!
          if (!savedRole) {
            console.warn('Login attempt with unregistered account:', u.email);
            void supabase.auth.signOut();
            localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
            localStorage.removeItem('airneet-auth-role');
            localStorage.removeItem('airneet-auth-mode');
            const message = `No ${storedRole === 'mentor' ? 'Mentor' : 'Student'} account found for ${u.email}. Please switch to the "Register" tab to create your ${storedRole === 'mentor' ? 'Mentor' : 'Student'} account first.`;
            sessionStorage.setItem(AUTH_ERROR_SESSION_KEY, message);
            dispatchAuthErrorModal(message, 'signup', storedRole);
            callback(null);
            emitAuthChange(null);
            return;
          }

          // If role doesn't match the requested portal (e.g. Student trying to log into Mentor portal)
          if (savedRole !== storedRole) {
            console.warn(`Role mismatch: account is ${savedRole}, requested ${storedRole}`);
            void supabase.auth.signOut();
            localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
            localStorage.removeItem('airneet-auth-role');
            localStorage.removeItem('airneet-auth-mode');
            const message = `This account is registered as a ${savedRole === 'mentor' ? 'Mentor' : 'Student Mentee'}. Please switch to the ${savedRole === 'mentor' ? 'Mentor' : 'Student'} portal to sign in.`;
            sessionStorage.setItem(AUTH_ERROR_SESSION_KEY, message);
            dispatchAuthErrorModal(message, 'login', savedRole);
            callback(null);
            emitAuthChange(null);
            return;
          }
        }

        // MODE 2: REGISTER CHECKS
        if (storedMode === 'signup' && storedRole) {
          // If the account is ALREADY registered with ANY role:
          if (savedRole) {
            console.warn(`Account is already registered as ${savedRole}`);
            void supabase.auth.signOut();
            localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
            localStorage.removeItem('airneet-auth-role');
            localStorage.removeItem('airneet-auth-mode');
            localStorage.removeItem('airneet-auth-registration');

            const message = savedRole === storedRole
              ? `You are already registered as a ${savedRole === 'mentor' ? 'Mentor' : 'Student Mentee'}. Please click "Log in" to sign in.`
              : `This account is already registered as a ${savedRole === 'mentor' ? 'Mentor' : 'Student Mentee'}. Please switch to the ${savedRole === 'mentor' ? 'Mentor' : 'Student'} portal to sign in.`;

            sessionStorage.setItem(AUTH_ERROR_SESSION_KEY, message);
            dispatchAuthErrorModal(message, 'login', savedRole);
            callback(null);
            emitAuthChange(null);
            return;
          }

          // Brand new user registering: save the selected role into Supabase user metadata
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
        }

        // Authoritative role calculation
        const finalRole: AccountRole =
          (storedMode === 'signup' && storedRole) ? storedRole : (savedRole || storedRole || 'student_mentee');

        const userData: AuthUserData = {
          id: u.id,
          email: u.email || '',
          role: finalRole,
          fullName: (u.user_metadata?.full_name as string) || (u.user_metadata?.name as string) || undefined,
          phone: (u.user_metadata?.contact_phone as string) || undefined,
          provider: session.user.app_metadata?.provider === 'google' ? 'google' : 'email',
        };

        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userData));
        callback(userData);

        // Clean up pending tokens
        localStorage.removeItem('airneet-auth-role');
        localStorage.removeItem('airneet-auth-mode');
        localStorage.removeItem('airneet-auth-registration');
      } else {
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
        callback(null);
      }
    };

    // 1. Process URL parameters if returning from an OAuth flow
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

      // Check for OAuth error in query or hash
      const oauthError =
        searchParams.get('error_description') ||
        searchParams.get('error') ||
        hashParams.get('error_description') ||
        hashParams.get('error');

      if (oauthError) {
        console.warn('OAuth redirect error:', oauthError);
        sessionStorage.setItem(AUTH_ERROR_SESSION_KEY, oauthError);
        dispatchAuthErrorModal(oauthError);
        const clean = new URL(window.location.href);
        clean.searchParams.delete('error');
        clean.searchParams.delete('error_description');
        clean.searchParams.delete('error_code');
        clean.hash = '';
        window.history.replaceState({}, document.title, clean.toString());
      }
    }

    // 2. Initial session check
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        handleSession(data.session);
      }
    });

    // 3. Listen to all auth state changes
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

    // Check if account already existed
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      throw new Error(
        'This email is already registered. Please switch to the "Log in" tab to sign in.'
      );
    }

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
          ? `Account created! Signed in as ${roleLabel(role)}.`
          : 'Account created! Please check your email to confirm your account.',
      };
    }
  }

  // Local authentication fallback
  const accounts = getLocalAccounts();
  const existing = accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    throw new Error('This email is already registered. Please switch to the "Log in" tab to sign in.');
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

  return { user: newUser, message: `Account registered! Signed in as ${roleLabel(role)}.` };
}

// Helper to seed and retrieve local storage accounts for testing and persistence
function getLocalAccounts(): Array<{ email: string; pass: string; user: AuthUserData }> {
  if (typeof window === 'undefined') return [];
  const defaultSeeds: Array<{ email: string; pass: string; user: AuthUserData }> = [
    {
      email: 'mentor@airneetwork.com',
      pass: 'mentor123',
      user: {
        id: 'mentor_aryan',
        email: 'mentor@airneetwork.com',
        role: 'mentor',
        fullName: 'Dr. Aryan Sharma (AIR 42)',
        phone: '+91 98765 43210',
        provider: 'email',
      },
    },
    {
      email: 'student@airneetwork.com',
      pass: 'student123',
      user: {
        id: 'student_rahul',
        email: 'student@airneetwork.com',
        role: 'student_mentee',
        fullName: 'Rahul Verma',
        phone: '+91 98765 12345',
        provider: 'email',
      },
    },
  ];

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ACCOUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }

  localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(defaultSeeds));
  return defaultSeeds;
}

// Sign in with Email + Password
export async function signInWithEmail(params: {
  email: string;
  password: string;
  expectedRole: AccountRole;
}): Promise<{ user: AuthUserData }> {
  const { email, password, expectedRole } = params;

  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        if (!error.message?.includes('Failed to fetch') && !error.message?.includes('NetworkError')) {
          if (error.message.toLowerCase().includes('invalid login credentials')) {
            throw new Error(
              `Invalid email or password. If you have not created your ${expectedRole === 'mentor' ? 'Mentor' : 'Student'} account yet, click the "Register" tab above.`
            );
          }
          throw error;
        }
        console.warn('Supabase sign-in network error, attempting local fallback');
      } else if (data?.user) {
        const savedRole = data.user.user_metadata?.air_neetwork_role;
        if (!savedRole) {
          await supabase.auth.signOut();
          throw new Error(
            `No ${expectedRole === 'mentor' ? 'Mentor' : 'Student'} account found for this email. Please switch to the "Register" tab to sign up first.`
          );
        }

        if (savedRole !== expectedRole) {
          await supabase.auth.signOut();
          throw new Error(
            `This account is registered as ${savedRole === 'mentor' ? 'a Mentor' : 'a Student Mentee'}. Switch to the ${savedRole === 'mentor' ? 'Mentor' : 'Student'} portal to sign in.`
          );
        }

        const userData: AuthUserData = {
          id: data.user.id,
          email: data.user.email || email.trim(),
          role: savedRole as AccountRole,
          fullName: (data.user.user_metadata?.full_name as string) || undefined,
          phone: (data.user.user_metadata?.contact_phone as string) || undefined,
          provider: 'email',
        };

        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userData));
        emitAuthChange(userData);
        return { user: userData };
      }
    } catch (sbErr) {
      if (sbErr instanceof Error && (sbErr.message.includes('Invalid') || sbErr.message.includes('No ') || sbErr.message.includes('registered as'))) {
        throw sbErr;
      }
      console.warn('Supabase sign-in caught error, checking local accounts:', sbErr);
    }
  }

  // Local fallback
  const accounts = getLocalAccounts();
  const found = accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
  if (!found) {
    throw new Error(
      `No account found with this email. Please click the "Register" tab above to sign up as a ${expectedRole === 'mentor' ? 'Mentor' : 'Student'}.`
    );
  }
  if (found.pass !== password) {
    throw new Error('Incorrect password. Please try again.');
  }
  if (found.user.role !== expectedRole) {
    throw new Error(
      `This account is registered as ${found.user.role === 'mentor' ? 'a Mentor' : 'a Student Mentee'}. Please switch to the ${found.user.role === 'mentor' ? 'Mentor' : 'Student'} portal.`
    );
  }

  localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(found.user));
  emitAuthChange(found.user);
  return { user: found.user };
}

// Sign in or Register with Google
export async function signInWithGoogle(
  role: AccountRole,
  extraData?: { fullName?: string; phone?: string; email?: string },
  authMode: 'login' | 'signup' = 'login'
): Promise<AuthUserData | void> {
  if (supabase) {
    localStorage.setItem('airneet-auth-role', role);
    localStorage.setItem('airneet-auth-mode', authMode);
    if (extraData) {
      localStorage.setItem('airneet-auth-registration', JSON.stringify(extraData));
    }

    // Clean redirect URL pointing to origin without query parameters
    const cleanRedirectUrl = window.location.origin + window.location.pathname;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: cleanRedirectUrl,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });
    if (error) {
      localStorage.removeItem('airneet-auth-role');
      localStorage.removeItem('airneet-auth-mode');
      localStorage.removeItem('airneet-auth-registration');
      throw error;
    }
    return;
  }

  // Local simulation
  const accounts = getLocalAccounts();
  if (authMode === 'login') {
    let found = accounts.find((a) => a.user.role === role);
    if (!found) {
      // Create seamless default Google session for this role
      const simulatedUser: AuthUserData = {
        id: 'google_' + Math.random().toString(36).substring(2, 10),
        email: role === 'mentor' ? 'mentor@gmail.com' : 'student@gmail.com',
        role,
        fullName: role === 'mentor' ? 'Dr. Aryan Sharma (AIR Mentor)' : 'NEET UG Student',
        provider: 'google',
      };
      accounts.push({ email: simulatedUser.email, pass: 'google', user: simulatedUser });
      localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
      found = { email: simulatedUser.email, pass: 'google', user: simulatedUser };
    }
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(found.user));
    emitAuthChange(found.user);
    return found.user;
  }

  const simulatedGoogleUser: AuthUserData = {
    id: 'google_' + Math.random().toString(36).substring(2, 10),
    email: extraData?.email?.trim() || (role === 'mentor' ? 'mentor@gmail.com' : 'student@gmail.com'),
    role,
    fullName: extraData?.fullName?.trim() || (role === 'mentor' ? 'Dr. Aryan Sharma (AIR Mentor)' : 'NEET UG Student'),
    phone: extraData?.phone?.trim() || undefined,
    provider: 'google',
  };

  accounts.push({ email: simulatedGoogleUser.email, pass: 'google', user: simulatedGoogleUser });
  localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
  localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(simulatedGoogleUser));
  emitAuthChange(simulatedGoogleUser);
  return simulatedGoogleUser;
}

// Sign out from any active session
export async function authSignOut(): Promise<void> {
  localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  localStorage.removeItem('airneet-auth-role');
  localStorage.removeItem('airneet-auth-mode');
  localStorage.removeItem('airneet-auth-registration');
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }
  emitAuthChange(null);
}
