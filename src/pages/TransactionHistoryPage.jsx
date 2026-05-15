import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LoaderCircle, Receipt } from 'lucide-react';
import { Header } from '../components/Header';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { formatDateTime, formatPrice, titleCase } from '../utils/format';

export function TransactionHistoryPage() {
  const navigate = useNavigate();
  const { token, user, isAuthenticated } = useAuth();
  const [cart] = useLocalStorage('hovaluxe_cart', []);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      if (!isAuthenticated || !token) {
        setOrders([]);
        setLoading(false);
        setError('');
        return;
      }

      try {
        setLoading(true);
        const response = await api.getMyOrders(token);
        if (!active) return;
        setOrders(response.data || []);
        setError('');
      } catch (loadError) {
        if (!active) return;
        setError(loadError.message || 'Unable to load your transaction history right now.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOrders();
    return () => {
      active = false;
    };
  }, [isAuthenticated, token]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      <Header cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} onCartOpen={() => navigate('/')} showTransactionSection={isAuthenticated} />

      <main className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-[var(--line)] bg-[#0f1010] p-6 shadow-[0_24px_70px_rgba(0,0,0,.36)] lg:p-8">
          <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-green)]">Account</p>
              <h1 className="mt-2 font-display text-4xl text-[var(--text-primary)] md:text-5xl">Transaction history</h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
                Review your Flutterwave payment activity, order references, and fulfilment updates from your signed-in account.
              </p>
            </div>
            {isAuthenticated ? (
              <div className="rounded-[1.2rem] border border-[var(--line)] bg-white/[0.03] px-4 py-3 text-sm text-[var(--text-secondary)]">
                Signed in as <span className="text-[var(--gold-soft)]">{user?.email}</span>
              </div>
            ) : null}
          </div>

          {!isAuthenticated ? (
            <div className="mt-6 rounded-[1.4rem] border border-[var(--line)] bg-white/[0.03] p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--gold)]/10 text-[var(--gold)]">
                <Receipt size={22} />
              </div>
              <h2 className="mt-4 font-display text-3xl text-[var(--text-primary)]">Sign in to view your orders</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                Your completed Flutterwave transactions are tied to your account for a standard e-commerce order history experience.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link to="/login" state={{ from: '/transactions' }} className="rounded-full bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[#111]">
                  Sign in
                </Link>
                <Link to="/register" state={{ from: '/transactions' }} className="rounded-full border border-[var(--line)] px-5 py-3 text-sm text-[var(--text-primary)]">
                  Create account
                </Link>
              </div>
            </div>
          ) : loading ? (
            <div className="mt-6 flex items-center justify-center rounded-[1.4rem] border border-[var(--line)] bg-white/[0.03] p-8 text-sm text-[var(--text-secondary)]">
              <LoaderCircle size={18} className="mr-2 animate-spin" /> Loading your transactions...
            </div>
          ) : error ? (
            <div className="mt-6 rounded-[1.4rem] border border-rose-500/20 bg-rose-500/10 p-6 text-sm text-rose-200">
              {error}
            </div>
          ) : orders.length ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {orders.map((order) => (
                <TransactionCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-[1.4rem] border border-dashed border-[var(--line)] bg-white/[0.03] p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--gold)]/10 text-[var(--gold)]">
                <Receipt size={22} />
              </div>
              <h2 className="mt-4 font-display text-3xl text-[var(--text-primary)]">No transactions yet</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                Your Flutterwave payment history will appear here once you complete an order from this account.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function TransactionCard({ order }) {
  return (
    <article className="rounded-[1.5rem] border border-[var(--line)] bg-white/[0.03] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-green)]">{order.orderRef}</p>
          <h3 className="mt-2 font-display text-3xl text-[var(--text-primary)]">{formatPrice(order.totalAmount)}</h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Created {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusPill label={titleCase(order.paymentStatus)} tone={order.paymentStatus === 'paid' ? 'success' : 'neutral'} />
          <StatusPill label={titleCase(order.fulfilmentStatus)} tone="neutral" />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <MetaBlock label="Payment method" value="Flutterwave" />
        <MetaBlock label="Items" value={String(order.items?.length || 0)} />
        <MetaBlock label="Paid at" value={formatDateTime(order.paidAt)} />
      </div>

      <div className="mt-4 rounded-[1.2rem] border border-[var(--line)] bg-[#111314] p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">Delivery address</p>
        <p className="mt-2 text-sm leading-6 text-[var(--text-primary)]">{order.shippingAddress}</p>
      </div>
    </article>
  );
}

function MetaBlock({ label, value }) {
  return (
    <div className="rounded-[1.1rem] border border-[var(--line)] bg-[#111314] px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">{label}</p>
      <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

function StatusPill({ label, tone = 'neutral' }) {
  const toneClass = tone === 'success'
    ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200'
    : 'border-[var(--line)] bg-white/[0.04] text-[var(--text-primary)]';

  return (
    <span className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em] ${toneClass}`}>
      {label}
    </span>
  );
}
