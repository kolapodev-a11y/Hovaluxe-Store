import { useEffect, useMemo, useState } from 'react';
import { LoaderCircle, MessageCircle, ShieldCheck, Wallet, X } from 'lucide-react';
import { formatPrice } from '../utils/format';
import { paymentMethods } from '../data/store';

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
  isAuthenticated = false,
  whatsappNumber = '',
}) {
  const [form, setForm] = useState(() => makeInitialForm(customerProfile));

  useEffect(() => {
    if (!open) return undefined;

    setForm((current) => ({
      ...makeInitialForm(customerProfile),
      customerPhone: current.customerPhone,
      shippingAddress: current.shippingAddress,
      notes: current.notes,
      paymentMethod: current.paymentMethod || 'WhatsApp',
      customerName: customerProfile?.name || current.customerName,
      customerEmail: customerProfile?.email || current.customerEmail,
    }));

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, customerProfile]);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const total = subtotal + (cart.length ? deliveryFee : 0);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    onPlaceOrder({
      ...form,
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
                    Choose the payment flow that fits your customer journey: direct WhatsApp handoff or secure Flutterwave checkout.
                  </p>
                  {customerProfile?.email ? (
                    <div className="mt-3 inline-flex max-w-full items-center rounded-full border border-[var(--line)] bg-white/[0.03] px-4 py-2 text-sm text-[var(--gold-soft)]">
                      <span className="truncate">Signed in as {customerProfile.email}</span>
                    </div>
                  ) : null}
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
                  <p className="text-sm text-[var(--text-secondary)]">Everything stays in one mobile-friendly checkout flow.</p>
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
                      onChange={(e) => updateField('customerEmail', e.target.value)}
                      readOnly={Boolean(customerProfile?.email)}
                      required={form.paymentMethod === 'Flutterwave'}
                      className={`input-style ${customerProfile?.email ? 'cursor-not-allowed bg-white/[0.02] text-[var(--text-secondary)]' : ''}`}
                      placeholder="you@example.com"
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
                <h4 className="mt-2 font-display text-2xl text-[var(--text-primary)] sm:text-3xl">Choose how to complete payment</h4>

                <div className="mt-5 grid gap-3 lg:grid-cols-2">
                  {paymentMethods.map((method) => {
                    const selected = form.paymentMethod === method;
                    const isWhatsApp = method === 'WhatsApp';
                    const Icon = isWhatsApp ? MessageCircle : Wallet;
                    return (
                      <label
                        key={method}
                        className={`cursor-pointer rounded-[1.3rem] border p-4 transition ${
                          selected
                            ? 'border-[var(--gold)]/35 bg-[var(--gold)]/10'
                            : 'border-[var(--line)] bg-white/[0.03] hover:border-[var(--gold)]/20'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method}
                          checked={selected}
                          onChange={(e) => updateField('paymentMethod', e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex items-start gap-3 text-[var(--text-primary)]">
                          <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${selected ? 'bg-white/12 text-[var(--gold)]' : 'bg-white/8 text-[var(--gold-soft)]'}`}>
                            <Icon size={18} />
                          </span>
                          <div className="min-w-0">
                            <p className="font-medium">{method}</p>
                            <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                              {isWhatsApp
                                ? 'Send the order summary directly to the store owner for manual confirmation and payment coordination.'
                                : 'Pay online through Flutterwave for instant verification and automatic transaction history.'}
                            </p>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>

                <div className="mt-4 rounded-[1.2rem] border border-white/8 bg-[#111314] p-4 text-sm text-[var(--text-secondary)]">
                  {form.paymentMethod === 'WhatsApp' ? (
                    <div className="flex items-start gap-3">
                      <MessageCircle size={18} className="mt-0.5 shrink-0 text-[var(--accent-green)]" />
                      <div>
                        <p className="text-[var(--text-primary)]">WhatsApp orders are not recorded in admin transactions.</p>
                        <p className="mt-1 leading-6">
                          The checkout will open WhatsApp with a complete order summary so the store owner can handle payment and record it manually.
                          {whatsappNumber ? ' The configured business number will be used automatically.' : ' Add a valid WhatsApp number in store settings to enable this handoff.'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[var(--gold)]" />
                      <div>
                        <p className="text-[var(--text-primary)]">Flutterwave keeps standard e-commerce records.</p>
                        <p className="mt-1 leading-6">
                          {isAuthenticated
                            ? 'Your payment will be verified online and saved to your account transaction history and the admin dashboard.'
                            : 'Sign in is required before Flutterwave payment so the order can be linked to your account and tracked properly.'}
                        </p>
                      </div>
                    </div>
                  )}
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
                  disabled={submitting || (form.paymentMethod === 'WhatsApp' && !whatsappNumber)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[#111] disabled:opacity-70"
                >
                  {submitting ? <LoaderCircle size={16} className="animate-spin" /> : null}
                  {form.paymentMethod === 'WhatsApp' ? 'Continue to WhatsApp' : 'Pay with Flutterwave'}
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
