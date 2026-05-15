import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { GoogleAuthButton } from '../components/GoogleAuthButton';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [authProvidersLoaded, setAuthProvidersLoaded] = useState(false);

  const nextPath = useMemo(() => location.state?.from || '/', [location.state]);

  useEffect(() => {
    let active = true;

    async function loadAuthProviders() {
      try {
        const response = await api.getAuthProviders();
        if (!active) return;
        setGoogleEnabled(Boolean(response?.data?.google?.enabled));
      } catch {
        if (!active) return;
        setGoogleEnabled(false);
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
    navigate(payload?.user?.role === 'admin' ? '/admin' : nextPath, { replace: true });
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
    return <Navigate to={nextPath} replace />;
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to Hovaluxe"
      description="Use your email account or continue with Google to sign in quickly and continue shopping."
    >
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[#111] disabled:opacity-70"
        >
          {busy ? <LoaderCircle size={16} className="animate-spin" /> : <ArrowRight size={16} />}
          Sign in
        </button>
      </form>

      {authProvidersLoaded ? (
        googleEnabled ? (
          <div className="mt-6">
            <div className="relative text-center text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">
              <span className="relative z-10 bg-[#0c0d0d] px-3">or continue with</span>
              <div className="absolute left-0 right-0 top-1/2 -z-0 h-px -translate-y-1/2 bg-[var(--line)]" />
            </div>
            <GoogleAuthButton onCredential={handleGoogleLogin} className="mt-4 flex justify-center" width={340} />
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Google sign-in is currently unavailable on the server. Use your email and password to continue.
          </div>
        )
      ) : null}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-[var(--text-secondary)]">
          New here?{' '}
          <Link to="/register" className="text-[var(--gold-soft)] hover:text-[var(--gold)]">
            Create an account
          </Link>
        </p>
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
        <div className="luxe-panel flex flex-col justify-between rounded-[2rem] p-6 md:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-green)]">Hovaluxe account</p>
            <h1 className="mt-4 font-display text-5xl leading-none text-[var(--gold-soft)] md:text-6xl">
              Fragrance shopping with a polished sign-in flow.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--text-secondary)]">
              Access your account quickly and continue shopping with a streamlined email or Google sign-in flow.
            </p>
          </div>

        </div>

        <div className="rounded-[2rem] border border-[var(--line)] bg-[#0c0d0d] p-6 shadow-[0_24px_90px_rgba(0,0,0,.48)] md:p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-green)]">{eyebrow}</p>
          <h2 className="mt-3 font-display text-4xl text-[var(--text-primary)] md:text-5xl">{title}</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">{description}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
      {children}
    </label>
  );
}

function ErrorBanner({ message }) {
  return <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{message}</div>;
}
