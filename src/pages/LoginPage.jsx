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
      title="Sign in to Kunleluxe"
      description="Choose your preferred sign-in method below. You can continue with email and password or use Google for faster access."
    >
      {resumeCheckout ? (
        <InfoBanner message="Please sign in first. Browsing stays open to everyone, but checkout and payment are available only to logged-in customers." />
      ) : null}

      <OptionGrid>
        <AuthOptionCard
          title="Email"
          description={emailEnabled ? 'Continue with your Kunleluxe email and password.' : 'Email sign-in is currently unavailable.'}
          active={emailEnabled}
        />
        <AuthOptionCard
          title="Google"
          description={googleEnabled ? 'Use your Google account for a quicker sign-in.' : 'Google sign-in becomes available after Google is configured on the server.'}
          active={googleEnabled}
        />
      </OptionGrid>

      <div className="mx-auto mt-8 w-full max-w-md text-left">
        <SectionLabel>Continue with email</SectionLabel>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
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
        </form>
      </div>

      <div className="mx-auto mt-8 w-full max-w-md">
        <SectionLabel>Continue with Google</SectionLabel>
        {authProvidersLoaded ? (
          googleEnabled ? (
            <div className="mt-4">
              <GoogleAuthButton
                onCredential={handleGoogleLogin}
                className="flex justify-center"
                width={320}
                clientId={googleClientId}
              />
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              Google sign-in is currently unavailable on the server. You can still continue with email and password.
            </div>
          )
        ) : null}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-center text-sm">
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
      </div>
    </AuthShell>
  );
}

function AuthShell({ eyebrow, title, description, children }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] px-4 py-8 text-[var(--text-primary)] md:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="luxe-panel flex flex-col justify-center rounded-[2rem] p-6 text-center md:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-green)]">Kunleluxe account</p>
            <h1 className="mt-4 font-display text-5xl leading-none text-[var(--gold-soft)] md:text-6xl">
              Fragrance shopping with a polished sign-in flow.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[var(--text-secondary)]">
              Sign in once, continue shopping smoothly, and complete checkout securely from the same account.
            </p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[var(--line)] bg-[#0c0d0d] p-6 text-center shadow-[0_24px_90px_rgba(0,0,0,.48)] md:p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-green)]">{eyebrow}</p>
          <h2 className="mt-3 font-display text-4xl text-[var(--text-primary)] md:text-5xl">{title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">{description}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

function OptionGrid({ children }) {
  return <div className="mx-auto mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-2">{children}</div>;
}

function AuthOptionCard({ title, description, active }) {
  return (
    <div
      className={`rounded-[1.4rem] border px-4 py-4 text-left transition ${
        active ? 'border-[var(--gold)]/30 bg-[var(--gold)]/10' : 'border-[var(--line)] bg-white/[0.03]'
      }`}
    >
      <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
    </div>
  );
}

function SectionLabel({ children }) {
  return <p className="text-center text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">{children}</p>;
}

function Field({ label, children }) {
  return (
    <label className="block space-y-2 text-left">
      <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
      {children}
    </label>
  );
}

function ErrorBanner({ message }) {
  return <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{message}</div>;
}

function InfoBanner({ message }) {
  return <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-[var(--gold)]/20 bg-[var(--gold)]/10 px-4 py-3 text-sm text-[var(--text-primary)]">{message}</div>;
}
