import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, LoaderCircle, ShoppingBag, XCircle } from 'lucide-react';
import { Header } from '../components/Header';
import { api } from '../lib/api';
import { formatPrice, formatDateTime, titleCase } from '../utils/format';

function extractParams(location) {
  const directParams = new URLSearchParams(location.search || '');
  const hash = window.location.hash || '';
  const hashQuery = hash.includes('?') ? hash.split('?')[1] : '';
  const hashParams = new URLSearchParams(hashQuery);

  return {
    transactionId:
      directParams.get('transaction_id') ||
      directParams.get('transactionId') ||
      hashParams.get('transaction_id') ||
      hashParams.get('transactionId') ||
      '',
    txRef:
      directParams.get('tx_ref') ||
      directParams.get('txRef') ||
      hashParams.get('tx_ref') ||
      hashParams.get('txRef') ||
      '',
  };
}

export function PaymentCallbackPage() {
  const location = useLocation();
  const params = useMemo(() => extractParams(location), [location]);
  const [cartCount, setCartCount] = useState(0);
  const [state, setState] = useState({ loading: true, error: '', order: null });

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('kunleluxe_cart') || '[]');
    setCartCount(savedCart.reduce((sum, item) => sum + (item.quantity || 0), 0));
  }, []);

  useEffect(() => {
    let active = true;

    async function verify() {
      try {
        const response = await api.verifyFlutterwavePayment(params);
        if (active) {
          setState({ loading: false, error: '', order: response.data });
          localStorage.removeItem('kunleluxe_cart');
          setCartCount(0);
        }
      } catch (error) {
        if (active) {
          setState({
            loading: false,
            error: error.message || 'Payment verification failed',
            order: null,
          });
        }
      }
    }

    verify();
    return () => {
      active = false;
    };
  }, [params]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      <Header cartCount={cartCount} onCartOpen={() => {}} />

      <div className="mx-auto flex min-h-[calc(100vh-88px)] max-w-7xl items-center justify-center px-4 py-12 md:px-6 lg:px-8">
        <div className="w-full max-w-3xl rounded-[2rem] border border-[var(--line)] bg-[#0c0d0d] p-8 shadow-[0_24px_90px_rgba(0,0,0,.48)]">
          {state.loading ? (
            <div className="text-center">
              <LoaderCircle className="mx-auto animate-spin text-[var(--gold)]" size={36} />
              <h1 className="mt-4 font-display text-4xl text-[var(--text-primary)]">Verifying payment</h1>
              <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                Please wait while we confirm your Flutterwave transaction.
              </p>
            </div>
          ) : state.error ? (
            <div className="text-center">
              <XCircle className="mx-auto text-rose-300" size={40} />
              <h1 className="mt-4 font-display text-4xl text-[var(--text-primary)]">Payment not confirmed</h1>
              <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{state.error}</p>
            </div>
          ) : (
            <div>
              <div className="text-center">
                <CheckCircle2 className="mx-auto text-emerald-300" size={42} />
                <h1 className="mt-4 font-display text-4xl text-[var(--text-primary)]">Payment received</h1>
                <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                  Your payment has been confirmed and your order is now in the processing queue.
                </p>
              </div>

              <div className="mt-8 rounded-[1.5rem] border border-[var(--line)] bg-white/[0.03] p-5 text-sm text-[var(--text-secondary)]">
                <div className="grid gap-4 md:grid-cols-2">
                  <Info label="Order reference" value={state.order.orderRef} />
                  <Info label="Payment method" value={titleCase(state.order.paymentMethod)} />
                  <Info label="Payment status" value={titleCase(state.order.paymentStatus)} />
                  <Info label="Fulfilment status" value={titleCase(state.order.fulfilmentStatus)} />
                  <Info label="Customer" value={state.order.customerName} />
                  <Info label="Total amount" value={formatPrice(state.order.totalAmount)} />
                  <Info label="Created at" value={formatDateTime(state.order.createdAt)} />
                  <Info label="Paid at" value={formatDateTime(state.order.paidAt)} />
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[#111]">
              <ShoppingBag size={16} />
              Back to storefront
            </Link>
            <Link to="/admin" className="rounded-full border border-[var(--line)] px-5 py-3 text-sm text-[var(--text-primary)]">
              Open admin panel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-secondary)]">{label}</p>
      <p className="mt-2 text-base text-[var(--text-primary)]">{value || '—'}</p>
    </div>
  );
}
