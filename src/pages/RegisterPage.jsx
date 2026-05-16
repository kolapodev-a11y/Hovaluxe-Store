import { useEffect, useState } from 'react';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { GoogleAuthButton } from '../components/GoogleAuthButton';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { isAdminRole } from '../utils/auth';

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [googleClientId, setGoogleClientId] = useState('');
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [authProvidersLoaded, setAuthProvidersLoaded] = useState(false);

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

  const finishAuth = (payload) => {
    login(payload);

    if (isAdminRole(payload?.user?.role)) {
      navigate('/admin', { replace: true });
      return;
    }

    navigate('/', {
      replace: true,
      state: resumeCheckout ? { openCheckout: true } : null,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setBusy(true);
      setError('');
      const response = await api.register(form);
      finishAuth(response.data);
    } catch (registerError) {
      setError(registerError.message || 'Unable to create the account right now.');
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleLogin = async (credential) => {
    if (!googleEnabled) {
      setError('Google sign-in is temporarily unavailable. Please create your account with email and password.');
      return;
    }

    try {
      setBusy(true);
      setError('');
      const response = await api.googleLogin({ credential });
      finishAuth(response.data);
    } catch (registerError) {
      setError(registerError.message || 'Google sign-up failed.');
    } finally {
      setBusy(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/" replace state={resumeCheckout ? { openCheckout: true } : null} />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] px-4 py-8 text-[var(--text-primary)] md:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-[var(--line)] bg-[#0c0d0d] p-6 text-center shadow-[0_24px_90px_rgba(0,0,0,.48)] md:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-green)]">Create account</p>
        <h1 className="mt-3 font-display text-4xl text-[var(--text-primary)] md:text-5xl">Join Hovaluxe</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
          Choose how you want to register. You can sign up with email and password or continue with Google for a faster account setup.
        </p>

        {resumeCheckout ? (
          <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-[var(--gold)]/20 bg-[var(--gold)]/10 px-4 py-3 text-sm text-[var(--text-primary)]">
            Create your account to continue to checkout. Visitors can browse products freely, but payment is available only after sign-in.
          </div>
        ) : null}

        <div className="mx-auto mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
          <AuthOptionCard
            title="Email"
            description={emailEnabled ? 'Create an account with your name, email address, and password.' : 'Email sign-up is currently unavailable.'}
            active={emailEnabled}
          />
          <AuthOptionCard
            title="Google"
            description={googleEnabled ? 'Use your Google account for a quicker sign-up.' : 'Google sign-up becomes available after Google is configured on the server.'}
            active={googleEnabled}
          />
        </div>

        <div className="mx-auto mt-8 w-full max-w-md text-left">
          <p className="text-center text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Continue with email</p>
          <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
            <label className="block space-y-2 text-left">
              <span className="text-sm font-medium text-[var(--text-primary)]">Full name</span>
              <input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                className="input-style"
                placeholder="Adaeze Martins"
                required
              />
            </label>
            <label className="block space-y-2 text-left">
              <span className="text-sm font-medium text-[var(--text-primary)]">Email address</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                className="input-style"
                placeholder="you@example.com"
                required
              />
            </label>
            <label className="block space-y-2 text-left">
              <span className="text-sm font-medium text-[var(--text-primary)]">Password</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                className="input-style"
                placeholder="Minimum 6 characters"
                minLength={6}
                required
              />
            </label>

            {error ? <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

            <button
              type="submit"
              disabled={busy || !emailEnabled}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[#111] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {busy ? <LoaderCircle size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              Create account with email
            </button>
          </form>
        </div>

        <div className="mx-auto mt-8 w-full max-w-md">
          <p className="text-center text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Continue with Google</p>
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
                Google sign-up is currently unavailable on the server. You can still create your account with email and password.
              </div>
            )
          ) : null}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-center text-sm">
          <p className="text-[var(--text-secondary)]">
            Already have an account?{' '}
            <Link to="/login" state={location.state} className="text-[var(--gold-soft)] hover:text-[var(--gold)]">
              Sign in
            </Link>
          </p>
          <span className="hidden text-[var(--text-muted)] sm:inline">•</span>
          <Link to="/" className="text-[var(--accent-green)] hover:text-[var(--text-primary)]">
            Back to store
          </Link>
        </div>
      </div>
    </div>
  );
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
