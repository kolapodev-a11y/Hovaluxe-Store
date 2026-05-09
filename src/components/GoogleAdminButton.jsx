import { useEffect, useRef, useState } from 'react';
import {
  GOOGLE_CLIENT_ID,
  isAuthorizedAdminEmail,
  loadGoogleIdentityScript,
  normalizeGoogleProfile,
  parseGoogleCredential,
} from '../lib/googleAuth';

export function GoogleAdminButton({
  onAuthenticated,
  onUnauthorized,
  className = '',
  theme = 'filled_black',
  text = 'continue_with',
  width = 320,
}) {
  const containerRef = useRef(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function mountGoogleButton() {
      if (!GOOGLE_CLIENT_ID) {
        setMessage('Set VITE_GOOGLE_CLIENT_ID to enable Google admin sign-in.');
        return;
      }

      try {
        await loadGoogleIdentityScript();
        if (!active || !containerRef.current || !window.google?.accounts?.id) return;

        const accounts = window.google.accounts.id;
        accounts.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
            const payload = normalizeGoogleProfile(parseGoogleCredential(response.credential));
            if (!payload) {
              setMessage('Unable to read the Google sign-in response.');
              return;
            }

            if (!isAuthorizedAdminEmail(payload.email)) {
              const unauthorizedMessage = 'This Google account is not allowed to open the admin panel.';
              setMessage(unauthorizedMessage);
              onUnauthorized?.(payload, unauthorizedMessage);
              return;
            }

            setMessage('');
            onAuthenticated?.(payload);
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        containerRef.current.innerHTML = '';
        accounts.renderButton(containerRef.current, {
          theme,
          size: 'large',
          shape: 'pill',
          text,
          width,
          logo_alignment: 'left',
        });
      } catch (error) {
        if (!active) return;
        setMessage(error.message || 'Google sign-in is unavailable right now.');
      }
    }

    mountGoogleButton();

    return () => {
      active = false;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [onAuthenticated, onUnauthorized, text, theme, width]);

  return (
    <div className={className}>
      <div ref={containerRef} />
      {message ? <p className="mt-3 text-sm leading-6 text-amber-200">{message}</p> : null}
    </div>
  );
}
