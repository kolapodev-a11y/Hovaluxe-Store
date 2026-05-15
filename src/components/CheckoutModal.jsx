import { useEffect, useMemo, useState } from 'react';
import { LoaderCircle, MessageCircle, Wallet, X } from 'lucide-react';
import { formatPrice } from '../utils/format';

const makeInitialForm = (customerProfile = {}) => ({
  customerName: customerProfile?.name || '',
  customerPhone: '',
  customerEmail: customerProfile?.email || '',
  shippingAddress: '',
  notes: '',
  paymentMethod: 'WhatsApp',
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

    setForm((current) => ({
      ...current,
      customerName: customerProfile?.name || '',
      customerEmail: customerProfile?.email || '',
    }));

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [customerProfile, open]);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const total = subtotal + (cart.length ? deliveryFee : 0);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    onPlaceOrder({
      ...form,
      customerName: customerProfile?.name || form.customerName,
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
    <>
      <div onClick={onClose} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-[2px]" />
      <div className="fixed inset-0 z-[60] flex items-end justify-center p-3 sm:items-center sm:p-6">
        <div className="flex max-h-[calc(100vh-0.75rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[#0c0d0d] shadow-[0_20px_80px_rgba(0,0,0,.55)] sm:max-h-[calc(100vh-2rem)]">
          <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] px-4 py-4 sm:px-6 sm:py-5">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-secondary)]">Checkout</p>
              <h3 className="mt-2 font-display text-3xl text-[var(--text-primary)] sm:text-4xl">Finish your order</h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                Review your account details below, add your delivery information, and choose how you want to complete the order.
              </p>
              <div className="mt-3 inline-flex max-w-full items-center rounded-full border border-[var(--line)] bg-white/[0.03] px-4 py-2 text-sm text-[var(--gold-soft)]">
                <span className="truncate">Checking out as {customerProfile?.email || 'a logged-in customer'}</span>
              </div>
            </div>
            <button type="button" onClick={onClose} className="rounded-full border border-[var(--line)] bg-white/5 p-3 text-[var(--text-primary)]">
              <X size={18} />
            </button>
          </div>

          <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[minmax(0,1fr)_340px]">
            <form className="min-h-0 overflow-y-auto px-4 py-4 scrollbar-thin sm:px-6 sm:py-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Customer name">
                  <input
                    value={customerProfile?.name || form.customerName}
                    readOnly
                    className="input-style cursor-not-allowed bg-white/[0.02] text-[var(--text-secondary)]"
                  />
                </Field>
                <Field label="Email address">
                  <input
                    type="email"
                    value={customerProfile?.email || form.customerEmail}
                    readOnly
                    className="input-style cursor-not-allowed bg-white/[0.02] text-[var(--text-secondary)]"
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
                <Field label="Delivery address" className="md:col-span-2">
                  <textarea
                    value={form.shippingAddress}
                    onChange={(e) => updateField('shippingAddress', e.target.value)}
                    required
                    className="input-style min-h-28 resize-none placeholder:text-sm"
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
                <Field label="Payment method" className="md:col-span-2">
                  <div className="grid gap-3 md:grid-cols-2">
                    {['WhatsApp', 'Flutterwave'].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => updateField('paymentMethod', method)}
                        className={`rounded-[1.3rem] border p-4 text-left transition ${
                          form.paymentMethod === method
                            ? 'border-[var(--gold)]/35 bg-[var(--gold)]/10'
                            : 'border-[var(--line)] bg-white/[0.03]'
                        }`}
                      >
                        <div className="flex items-start gap-3 text-[var(--text-primary)]">
                          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 text-[var(--gold)]">
                            {method === 'WhatsApp' ? <MessageCircle size={18} /> : <Wallet size={18} />}
                          </span>
                          <div className="min-w-0">
                            <p className="font-medium">{method}</p>
                            <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                              {method === 'WhatsApp'
                                ? 'Send your order summary directly to the Hovaluxe team.'
                                : 'Continue to a secure Flutterwave payment page.'}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </Field>
              </div>

              <div className="sticky bottom-0 mt-5 border-t border-[var(--line)] bg-[#0c0d0d] pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[#111] disabled:opacity-70"
                >
                  {submitting ? <LoaderCircle size={16} className="animate-spin" /> : null}
                  {form.paymentMethod === 'WhatsApp' ? 'Continue on WhatsApp' : 'Pay with Flutterwave'}
                </button>
              </div>
            </form>

            <aside className="border-t border-[var(--line)] bg-white/[0.03] px-4 py-4 lg:min-h-0 lg:overflow-y-auto lg:border-l lg:border-t-0 lg:px-5 lg:py-5">
              <h4 className="font-display text-2xl text-[var(--text-primary)] sm:text-3xl">Order summary</h4>
              <div className="mt-4 space-y-3 text-sm text-[var(--text-secondary)]">
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
              <div className="mt-5 border-t border-[var(--line)] pt-4 text-sm text-[var(--text-secondary)]">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span>Delivery</span>
                  <span>{formatPrice(cart.length ? deliveryFee : 0)}</span>
                </div>
                <div className="mt-4 flex items-center justify-between font-display text-2xl text-[var(--text-primary)] sm:text-3xl">
                  <span>Total</span>
                  <span className="text-[var(--gold)]">{formatPrice(total)}</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
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
