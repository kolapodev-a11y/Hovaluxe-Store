import { useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import {
  ADMIN_EMAIL,
  GOOGLE_AUTH_STORAGE_KEY,
  GOOGLE_CLIENT_ID,
  isAuthorizedAdminEmail,
} from '../lib/googleAuth';

export function useGoogleAdminAuth() {
  const [googleAdmin, setGoogleAdmin] = useLocalStorage(GOOGLE_AUTH_STORAGE_KEY, null);

  const isAdmin = useMemo(
    () => isAuthorizedAdminEmail(googleAdmin?.email),
    [googleAdmin?.email],
  );

  const signOut = () => {
    setGoogleAdmin(null);
    window.google?.accounts?.id?.disableAutoSelect?.();
  };

  return {
    googleAdmin,
    setGoogleAdmin,
    isAdmin,
    signOut,
    configuredAdminEmail: ADMIN_EMAIL,
    hasGoogleClientId: Boolean(GOOGLE_CLIENT_ID),
  };
}
