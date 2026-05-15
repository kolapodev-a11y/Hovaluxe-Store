import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { isAdminRole, normalizeUserRole } from '../utils/auth';

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

  const normalizedUser = session?.user
    ? { ...session.user, role: normalizeUserRole(session.user.role) }
    : null;

  const normalizedSession = session
    ? { ...session, user: normalizedUser }
    : null;

  const clearSession = () => {
    setSession(null);
    return true;
  };

  const requestLogout = (message = 'Are you sure you want to log out?') => {
    if (typeof window !== 'undefined' && !window.confirm(message)) {
      return false;
    }
    return clearSession();
  };

  const value = useMemo(
    () => ({
      session: normalizedSession,
      token: normalizedSession?.token || '',
      user: normalizedUser,
      isAuthenticated: Boolean(normalizedSession?.token),
      isAdmin: isAdminRole(normalizedUser?.role),
      setSession,
      login: (nextSession) => setSession(nextSession),
      logout: clearSession,
      requestLogout,
    }),
    [normalizedSession, normalizedUser],
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
