import { useMemo, useState } from 'react';
import { MessageCircle, Wallet, X } from 'lucide-react';
import { brand } from '../data/store';
import { formatPrice } from '../utils/format';

const initialForm = {
  customer: '',
  phone: '',
  address: '',
  paymentMethod: 'WhatsApp',
};

export function CheckoutModal({ open, cart, onClose, onPlaceOrder }) {
  const [form, setForm] = useState(initialForm);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const shipping = cart.length ? 2500 : 0;
  const total = subtotal + shipping;

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    onPlaceOrder({ ...form, total, subtotal, shipping });
    setForm(initialForm);
  };

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/60 transition ${open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
      />
      <div
        className={`fixed left-1/2 top-1/2 z-[60] w-[min(96vw,860px)] -translate-x-1/2 rounded-[2rem] border border-[var(--line)] bg-[#0c0d0d] p-6 shadow-[0_20px_80px_rgba(0,0,0,.55)] transition ${open ? 'translate-y-[-50%] opacity-100' : 'pointer-events-none translate-y-[-46%] opacity-0'}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] pb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-secondary)]">Checkout</p>
            <h3 className="mt-2 font-display text-3xl text-[var(--text-primary)]">Finish your order</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Frontend demo flow using WhatsApp and Flutterwave handoff.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-[var(--line)] bg-white/5 p-3 text-[var(--text-primary)]">
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Field label="Customer name">
              <input value={form.customer} onChange={(e) => updateField('customer', e.target.value)} required className="input-style" placeholder="e.g. Adaeze Martins" />
            </Field>
            <Field label="WhatsApp number">
              <input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} required className="input-style" placeholder="e.g. 08031234567" />
            </Field>
            <Field label="Delivery address">
              <textarea value={form.address} onChange={(e) => updateField('address', e.target.value)} required className="input-style min-h-28 resize-none" placeholder="Where should we deliver the order?" />
            </Field>

            <Field label="Payment method">
              <div className="grid gap-3 sm:grid-cols-2">
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
                    <div className="flex items-center gap-3 text-[var(--text-primary)]">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-[var(--gold)]">
                        {method === 'WhatsApp' ? <MessageCircle size={18} /> : <Wallet size={18} />}
                      </span>
                      <div>
                        <p className="font-medium">{method}</p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {method === 'WhatsApp' ? 'Send order summary to business chat' : 'Redirect customer to payment provider'}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Field>

            <button type="submit" className="inline-flex w-full items-center justify-center rounded-full bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[#12110f]">
              Place order now
            </button>
          </form>

          <div className="rounded-[1.6rem] border border-[var(--line)] bg-white/[0.03] p-5">
            <h4 className="font-display text-2xl text-[var(--text-primary)]">Order summary</h4>
            <div className="mt-4 space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                  <div>
                    <p className="text-[var(--text-primary)]">{item.name}</p>
                    <p className="text-[var(--text-secondary)]">Qty {item.quantity}</p>
                  </div>
                  <span className="text-[var(--gold)]">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-2 border-t border-[var(--line)] pt-4 text-sm text-[var(--text-secondary)]">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>{formatPrice(shipping)}</span></div>
              <div className="flex justify-between font-display text-xl text-[var(--text-primary)]"><span>Total</span><span className="text-[var(--gold)]">{formatPrice(total)}</span></div>
            </div>
            <div id="payments" className="mt-5 rounded-[1.2rem] border border-[var(--line)] bg-[#111314] p-4 text-sm leading-7 text-[var(--text-secondary)]">
              <p className="font-medium text-[var(--text-primary)]">Payment setup note</p>
              <p>
                The Flutterwave button currently links to <span className="text-[var(--text-primary)]">{brand.flutterwaveLink}</span>. Replace it with your real checkout integration or payment link when your backend is ready.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
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
