import { useEffect, useMemo, useState } from 'react';
import { LoaderCircle, Wallet, X } from 'lucide-react';
import { formatPrice } from '../utils/format';

const makeInitialForm = (customerProfile = {}) => ({
  customerName: customerProfile?.name || '',
  customerPhone: '',
  customerEmail: customerProfile?.email || '',
  shippingAddress: '',
  notes: '',
  paymentMethod: 'Flutterwave',
});

export function CheckoutModal({
  open,
  cart,
  deliveryFee = 2500,
  onClose,
  onPlaceOrder,
  submitting,
  customerProfile,
}) {
  const [form, setForm] = useState(() => makeInitialForm(customerProfile));

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const total = subtotal + (cart.length ? deliveryFee : 0);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    onPlaceOrder({
      ...form,
      paymentMethod: 'Flutterwave',
      customerEmail: customerProfile?.email || form.customerEmail,
      total,
      subtotal,
      shipping: deliveryFee,
    });
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-[2px]">
      <div className="flex h-full items-stretch px-3 py-3 sm:px-6 sm:py-6">
        <div className="mx-auto flex w-full max-w-5xl">
          <div className="flex max-h-full w-full flex-col overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[#0c0d0d] shadow-[0_20px_80px_rgba(0,0,0,.55)]">
            <div className="shrink-0 border-b border-[var(--line)] bg-[#0c0d0d] px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-secondary)]">Checkout</p>
                  <h3 className="mt-2 font-display text-3xl text-[var(--text-primary)] sm:text-4xl">Finish your order</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                    The checkout header stays fixed while the payment form scrolls, so customers can keep the order context in view from start to finish.
                  </p>
                  <div className="mt-3 inline-flex max-w-full items-center rounded-full border border-[var(--line)] bg-white/[0.03] px-4 py-2 text-sm text-[var(--gold-soft)]">
                    <span className="truncate">Signed in as {customerProfile?.email || 'a logged-in customer'}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-[var(--line)] bg-white/5 p-3 text-[var(--text-primary)]"
                  aria-label="Close checkout"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <form className="scrollbar-thin flex-1 space-y-6 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8" onSubmit={handleSubmit}>
              <section className="rounded-[1.6rem] border border-[var(--line)] bg-white/[0.03] p-4 sm:p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-green)]">Customer details</p>
                    <h4 className="mt-2 font-display text-2xl text-[var(--text-primary)] sm:text-3xl">Delivery information</h4>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">Everything stays on one secure, scrollable payment flow.</p>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <Field label="Customer name">
                    <input
                      value={form.customerName}
                      onChange={(e) => updateField('customerName', e.target.value)}
                      required
                      className="input-style placeholder:text-sm"
                      placeholder="Enter the delivery contact name"
                    />
                  </Field>
                  <Field label="Phone number">
                    <input
                      value={form.customerPhone}
                      onChange={(e) => updateField('customerPhone', e.target.value)}
                      required
                      className="input-style placeholder:text-sm"
                      placeholder="08031234567"
                    />
                  </Field>
                  <Field label="Email address" className="md:col-span-2">
                    <input
                      type="email"
                      value={customerProfile?.email || form.customerEmail}
                      readOnly
                      className="input-style cursor-not-allowed bg-white/[0.02] text-[var(--text-secondary)]"
                    />
                  </Field>
                  <Field label="Delivery address" className="md:col-span-2">
                    <textarea
                      value={form.shippingAddress}
                      onChange={(e) => updateField('shippingAddress', e.target.value)}
                      required
                      className="input-style min-h-32 resize-none placeholder:text-sm"
                      placeholder="Enter the full delivery address"
                    />
                  </Field>
                  <Field label="Order notes" className="md:col-span-2">
                    <textarea
                      value={form.notes}
                      onChange={(e) => updateField('notes', e.target.value)}
                      className="input-style min-h-24 resize-none placeholder:text-sm"
                      placeholder="Optional directions, preferred contact time, or special request"
                    />
                  </Field>
                </div>
              </section>

              <section className="rounded-[1.6rem] border border-[var(--line)] bg-white/[0.03] p-4 sm:p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-green)]">Payment option</p>
                <h4 className="mt-2 font-display text-2xl text-[var(--text-primary)] sm:text-3xl">Flutterwave checkout</h4>
                <div className="mt-5 rounded-[1.3rem] border border-[var(--gold)]/25 bg-[var(--gold)]/10 p-4 text-left">
                  <div className="flex items-start gap-3 text-[var(--text-primary)]">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-[var(--gold)]">
                      <Wallet size={18} />
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium">Pay online with Flutterwave</p>
                      <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                        Standard e-commerce checkout now uses Flutterwave only, so all payment records and transaction history stay consistent for customers and the admin team.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-[1.6rem] border border-[var(--line)] bg-white/[0.03] p-4 sm:p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-green)]">Order summary</p>
                <h4 className="mt-2 font-display text-2xl text-[var(--text-primary)] sm:text-3xl">Review before you continue</h4>

                <div className="mt-5 space-y-3 text-sm text-[var(--text-secondary)]">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-3 rounded-[1rem] border border-white/8 bg-black/10 px-3 py-3">
                      <div className="min-w-0">
                        <p className="text-[var(--text-primary)]">{item.name}</p>
                        <p className="mt-1">{item.quantity} × {formatPrice(item.price)}</p>
                      </div>
                      <span className="shrink-0">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid gap-3 rounded-[1.3rem] border border-white/8 bg-[#111314] p-4 sm:grid-cols-3">
                  <SummaryTile label="Items" value={String(cart.reduce((sum, item) => sum + item.quantity, 0))} />
                  <SummaryTile label="Subtotal" value={formatPrice(subtotal)} />
                  <SummaryTile label="Delivery" value={formatPrice(cart.length ? deliveryFee : 0)} />
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[var(--line)] pt-4">
                  <span className="font-display text-2xl text-[var(--text-primary)] sm:text-3xl">Total</span>
                  <span className="font-display text-2xl text-[var(--gold)] sm:text-3xl">{formatPrice(total)}</span>
                </div>
              </section>

              <div className="pb-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[#111] disabled:opacity-70"
                >
                  {submitting ? <LoaderCircle size={16} className="animate-spin" /> : null}
                  Pay with Flutterwave
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, className = '' }) {
  return (
    <label className={`block space-y-2 ${className}`}>
      <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
      {children}
    </label>
  );
}

function SummaryTile({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">{label}</p>
      <p className="mt-2 text-lg font-medium text-[var(--text-primary)]">{value}</p>
    </div>
  );
}
