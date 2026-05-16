export const GOOGLE_AUTH_STORAGE_KEY = 'hovaluxe_google_admin';
export const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || '').trim().toLowerCase();
export const GOOGLE_CLIENT_ID = (
  import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.VITE_GOGGLE_CLIENT_ID || ''
).trim();

export function isAuthorizedAdminEmail(email = '') {
  return Boolean(ADMIN_EMAIL) && String(email).trim().toLowerCase() === ADMIN_EMAIL;
}

export function parseGoogleCredential(credential = '') {
  try {
    const payload = credential.split('.')[1];
    if (!payload) return null;

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    );

    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function normalizeGoogleProfile(payload = {}) {
  if (!payload?.email) return null;

  return {
    email: payload.email,
    name: payload.name || payload.email,
    picture: payload.picture || '',
  };
}

export function loadGoogleIdentityScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google sign-in is only available in the browser.'));
  }

  if (!GOOGLE_CLIENT_ID) {
    return Promise.reject(
      new Error('Google sign-in is not configured. Set VITE_GOOGLE_CLIENT_ID or the legacy VITE_GOGGLE_CLIENT_ID.'),
    );
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve(window.google);
  }

  if (loadGoogleIdentityScript.promise) {
    return loadGoogleIdentityScript.promise;
  }

  loadGoogleIdentityScript.promise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');

    const handleLoad = () => {
      if (existingScript) {
        existingScript.dataset.loaded = 'true';
      }
      resolve(window.google);
    };

    const handleError = () => {
      loadGoogleIdentityScript.promise = null;
      reject(new Error('Unable to load Google Identity Services.'));
    };

    if (existingScript) {
      if (window.google?.accounts?.id || existingScript.dataset.loaded === 'true') {
        resolve(window.google);
        return;
      }

      existingScript.addEventListener('load', handleLoad, { once: true });
      existingScript.addEventListener('error', handleError, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      script.dataset.loaded = 'true';
      handleLoad();
    };
    script.onerror = handleError;
    document.head.appendChild(script);
  });

  return loadGoogleIdentityScript.promise;
}
