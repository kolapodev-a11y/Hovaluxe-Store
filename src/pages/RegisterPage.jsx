import { useState } from 'react';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { GoogleAuthButton } from '../components/GoogleAuthButton';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export function RegisterPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const finishAuth = (payload) => {
    login(payload);
    navigate(payload?.user?.role === 'admin' ? '/admin' : '/', { replace: true });
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
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] px-4 py-8 text-[var(--text-primary)] md:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-[var(--line)] bg-[#0c0d0d] p-6 shadow-[0_24px_90px_rgba(0,0,0,.48)] md:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-green)]">Create account</p>
        <h1 className="mt-3 font-display text-4xl text-[var(--text-primary)] md:text-5xl">Join Hovaluxe</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
          Create a customer account with email and password, or use Google for a faster sign-up flow.
        </p>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[var(--text-primary)]">Full name</span>
            <input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className="input-style"
              placeholder="Adaeze Martins"
              required
            />
          </label>
          <label className="block space-y-2">
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
          <label className="block space-y-2">
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
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[#111] disabled:opacity-70"
          >
            {busy ? <LoaderCircle size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            Create account
          </button>
        </form>

        <div className="mt-6">
          <div className="relative text-center text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">
            <span className="relative z-10 bg-[#0c0d0d] px-3">or continue with</span>
            <div className="absolute left-0 right-0 top-1/2 -z-0 h-px -translate-y-1/2 bg-[var(--line)]" />
          </div>
          <GoogleAuthButton onCredential={handleGoogleLogin} className="mt-4 flex justify-center" width={340} />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-[var(--text-secondary)]">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--gold-soft)] hover:text-[var(--gold)]">
              Sign in
            </Link>
          </p>
          <Link to="/" className="text-[var(--accent-green)] hover:text-[var(--text-primary)]">
            Back to store
          </Link>
        </div>
      </div>
    </div>
  );
}
