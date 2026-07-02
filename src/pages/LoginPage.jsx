import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { GoogleAuthButton } from '../components/GoogleAuthButton';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { isAdminRole } from '../utils/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [googleClientId, setGoogleClientId] = useState('');
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [authProvidersLoaded, setAuthProvidersLoaded] = useState(false);

  const nextPath = useMemo(() => location.state?.from || '/', [location.state]);
  const resumeCheckout = location.state?.reason === 'checkout';

  useEffect(() => {
    let active = true;

    async function loadAuthProviders() {
      try {
        const response = await api.getAuthProviders();
        if (!active) return;
        setGoogleEnabled(Boolean(response?.data?.google?.enabled));
        setGoogleClientId(String(response?.data?.google?.clientId || ''));
        setEmailEnabled(response?.data?.email?.enabled !== false);
      } catch {
        if (!active) return;
        setGoogleEnabled(false);
        setGoogleClientId('');
        setEmailEnabled(true);
      } finally {
        if (active) setAuthProvidersLoaded(true);
      }
    }

    loadAuthProviders();

    return () => {
      active = false;
    };
  }, []);

  const finishLogin = (payload) => {
    login(payload);

    if (isAdminRole(payload?.user?.role)) {
      navigate('/admin', { replace: true });
      return;
    }

    navigate(nextPath, {
      replace: true,
      state: resumeCheckout ? { openCheckout: true } : null,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setBusy(true);
      setError('');
      const response = await api.login(form);
      finishLogin(response.data);
    } catch (loginError) {
      setError(loginError.message || 'Unable to sign in right now.');
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleLogin = async (credential) => {
    if (!googleEnabled) {
      setError('Google sign-in is temporarily unavailable. Please use your email and password.');
      return;
    }

    try {
      setBusy(true);
      setError('');
      const response = await api.googleLogin({ credential });
      finishLogin(response.data);
    } catch (loginError) {
      setError(loginError.message || 'Google sign-in failed.');
    } finally {
      setBusy(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to={nextPath} replace state={resumeCheckout ? { openCheckout: true } : null} />;
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in"
      description="Continue with your email or Google account."
      footer={(
        <>
          <p className="text-[var(--text-secondary)]">
            New here?{' '}
            <Link to="/register" state={location.state} className="text-[var(--gold-soft)] hover:text-[var(--gold)]">
              Create an account
            </Link>
          </p>
          <span className="hidden text-[var(--text-muted)] sm:inline">•</span>
          <Link to="/" className="text-[var(--accent-green)] hover:text-[var(--text-primary)]">
            Back to store
          </Link>
        </>
      )}
    >
      {resumeCheckout ? (
        <InfoBanner message="Please sign in to continue to checkout." />
      ) : null}

      <form className="mt-6 space-y-4 text-left" onSubmit={handleSubmit}>
        <Field label="Email address">
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            className="input-style"
            placeholder="you@example.com"
            required
          />
        </Field>
        <Field label="Password">
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            className="input-style"
            placeholder="Enter your password"
            required
          />
        </Field>

        {error ? <ErrorBanner message={error} /> : null}

        <button
          type="submit"
          disabled={busy || !emailEnabled}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[#111] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {busy ? <LoaderCircle size={16} className="animate-spin" /> : <ArrowRight size={16} />}
          Sign in with email
        </button>

        {!emailEnabled ? <MutedNotice message="Email sign-in is currently unavailable." /> : null}
      </form>

      <Divider label="or continue with Google" />

      <div className="mt-5">
        {authProvidersLoaded ? (
          googleEnabled ? (
            <GoogleAuthButton
              onCredential={handleGoogleLogin}
              className="flex justify-center"
              width={320}
              clientId={googleClientId}
            />
          ) : (
            <MutedNotice message="Google sign-in is currently unavailable on the server." />
          )
        ) : null}
      </div>
    </AuthShell>
  );
}

function AuthShell({ eyebrow, title, description, children, footer }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] px-4 py-8 text-[var(--text-primary)] md:px-6 lg:px-8">
      <div className="mx-auto max-w-xl rounded-[2rem] border border-[var(--line)] bg-[#0c0d0d] p-6 text-center shadow-[0_24px_90px_rgba(0,0,0,.48)] md:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-green)]">{eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl text-[var(--text-primary)] md:text-5xl">{title}</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
        {children}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-center text-sm">{footer}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-2 text-left">
      <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
      {children}
    </label>
  );
}

function Divider({ label }) {
  return (
    <div className="mt-6 flex items-center gap-3">
      <span className="h-px flex-1 bg-[var(--line)]" />
      <span className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">{label}</span>
      <span className="h-px flex-1 bg-[var(--line)]" />
    </div>
  );
}

function ErrorBanner({ message }) {
  return <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{message}</div>;
}

function InfoBanner({ message }) {
  return <div className="mx-auto mt-5 max-w-lg rounded-2xl border border-[var(--gold)]/20 bg-[var(--gold)]/10 px-4 py-3 text-sm text-[var(--text-primary)]">{message}</div>;
}

function MutedNotice({ message }) {
  return <div className="rounded-2xl border border-[var(--line)] bg-white/[0.03] px-4 py-3 text-sm text-[var(--text-secondary)]">{message}</div>;
}
