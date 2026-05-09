import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AUTH_STORAGE_KEY = 'hovaluxe_auth_session';
const AUTH_EVENT = 'hovaluxe-auth-changed';

const AuthContext = createContext(null);

function readStoredSession() {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readStoredSession());

  useEffect(() => {
    try {
      if (session) {
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      } else {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      }
      window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: session }));
    } catch {
      // ignore storage write failures
    }
  }, [session]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === AUTH_STORAGE_KEY) {
        setSession(readStoredSession());
      }
    };

    const handleCustom = (event) => {
      setSession(event.detail ?? readStoredSession());
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(AUTH_EVENT, handleCustom);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(AUTH_EVENT, handleCustom);
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      token: session?.token || '',
      user: session?.user || null,
      isAuthenticated: Boolean(session?.token),
      isAdmin: session?.user?.role === 'admin',
      setSession,
      login: (nextSession) => setSession(nextSession),
      logout: () => setSession(null),
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }
  return context;
}
