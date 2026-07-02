import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { formatPrice } from '../utils/format';

export function CartDrawer({ open, cart, onClose, onUpdateQuantity, onRemove, onCheckout }) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/55 transition ${open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-[var(--line)] bg-[#0c0d0d] p-5 shadow-[0_20px_80px_rgba(0,0,0,.5)] transition duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-secondary)]">Shopping bag</p>
            <h3 className="mt-2 font-display text-3xl text-[var(--text-primary)]">Your selection</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-white/5 text-[var(--text-primary)]"
          >
            <X size={18} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--line)] bg-white/5 text-[var(--gold)]">
              <ShoppingBag size={28} />
            </div>
            <h4 className="mt-5 font-display text-2xl text-[var(--text-primary)]">Your cart is empty</h4>
            <p className="mt-2 max-w-xs text-sm leading-7 text-[var(--text-secondary)]">
              Add a few Kunleluxe products and then proceed to Flutterwave checkout or send your order directly through WhatsApp.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-5 flex-1 space-y-4 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="rounded-[1.4rem] border border-[var(--line)] bg-white/[0.03] p-4">
                  <div className="flex gap-4">
                    <img src={item.image} alt={item.name} className="h-24 w-20 rounded-2xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-secondary)]">{item.category}</p>
                          <h4 className="mt-1 font-medium text-[var(--text-primary)]">{item.name}</h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemove(item.id)}
                          className="text-[var(--text-secondary)] transition hover:text-rose-300"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <p className="font-display text-xl text-[var(--gold)]">{formatPrice(item.price)}</p>
                        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[#111314] px-2 py-1">
                          <button type="button" onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="rounded-full p-1 text-[var(--text-primary)] hover:bg-white/5">
                            <Minus size={14} />
                          </button>
                          <span className="min-w-6 text-center text-sm text-[var(--text-primary)]">{item.quantity}</span>
                          <button type="button" onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="rounded-full p-1 text-[var(--text-primary)] hover:bg-white/5">
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-[1.6rem] border border-[var(--line)] bg-white/[0.03] p-5">
              <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-[var(--text-secondary)]">
                <span>Delivery estimate</span>
                <span>{formatPrice(2500)}</span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-4 font-display text-2xl text-[var(--text-primary)]">
                <span>Total</span>
                <span className="text-[var(--gold)]">{formatPrice(subtotal + 2500)}</span>
              </div>
              <button
                type="button"
                onClick={onCheckout}
                className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[var(--gold)] px-4 py-3 text-sm font-semibold text-[#12110f]"
              >
                Proceed to checkout
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
