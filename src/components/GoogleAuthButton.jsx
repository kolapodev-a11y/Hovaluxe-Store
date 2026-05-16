import { useEffect, useMemo, useRef, useState } from 'react';
import { loadGoogleIdentityScript, resolveGoogleClientId } from '../lib/googleAuth';

export function GoogleAuthButton({
  onCredential,
  className = '',
  theme = 'outline',
  text = 'continue_with',
  width = 320,
  clientId = '',
}) {
  const containerRef = useRef(null);
  const [message, setMessage] = useState('');
  const resolvedClientId = useMemo(() => resolveGoogleClientId(clientId), [clientId]);

  useEffect(() => {
    let active = true;

    async function mountGoogleButton() {
      if (!resolvedClientId) {
        setMessage('Google sign-in is not configured yet.');
        return;
      }

      try {
        await loadGoogleIdentityScript();
        if (!active || !containerRef.current || !window.google?.accounts?.id) return;

        const accounts = window.google.accounts.id;
        accounts.initialize({
          client_id: resolvedClientId,
          callback: (response) => {
            if (!response?.credential) {
              setMessage('Unable to read the Google sign-in response.');
              return;
            }
            setMessage('');
            onCredential?.(response.credential);
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
  }, [onCredential, resolvedClientId, text, theme, width]);

  return (
    <div className={className}>
      <div ref={containerRef} />
      {message ? <p className="mt-3 text-sm leading-6 text-amber-200">{message}</p> : null}
    </div>
  );
}
