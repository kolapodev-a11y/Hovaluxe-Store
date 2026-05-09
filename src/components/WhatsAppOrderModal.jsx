import { useMemo, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { formatPrice } from '../utils/format';

const initialRow = { productId: '', quantity: 1 };
const initialForm = {
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  shippingAddress: '',
  notes: '',
  adminNote: '',
  deliveryFee: 0,
};

export function WhatsAppOrderModal({ open, onClose, products, onSave, saving }) {
  const [form, setForm] = useState(initialForm);
  const [rows, setRows] = useState([initialRow]);

  const detailedItems = useMemo(
    () =>
      rows
        .map((row) => {
          const product = products.find((item) => item.id === row.productId);
          if (!product) return null;
          return {
            productId: product.id,
            name: product.name,
            category: product.category,
            image: product.image,
            price: product.price,
            quantity: Number(row.quantity || 1),
          };
        })
        .filter(Boolean),
    [rows, products],
  );

  const subtotal = detailedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + Number(form.deliveryFee || 0);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const updateRow = (index, key, value) => {
    setRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row)));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave({
      ...form,
      deliveryFee: Number(form.deliveryFee || 0),
      items: detailedItems,
    });
  };

  return (
    <>
      <div onClick={onClose} className={`fixed inset-0 z-[70] bg-black/60 transition ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`} />
      <div className={`fixed left-1/2 top-1/2 z-[80] w-[min(96vw,920px)] -translate-x-1/2 rounded-[2rem] border border-[var(--line)] bg-[#0c0d0d] p-6 transition ${open ? 'translate-y-[-50%] opacity-100' : 'pointer-events-none translate-y-[-46%] opacity-0'}`}>
        <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-secondary)]">Storekeeper entry</p>
            <h3 className="mt-2 font-display text-3xl text-[var(--text-primary)]">Record a WhatsApp sale</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-[var(--line)] bg-white/5 p-3 text-[var(--text-primary)]">
            <X size={18} />
          </button>
        </div>

        <form className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Customer name">
                <input className="input-style" value={form.customerName} onChange={(e) => updateField('customerName', e.target.value)} required />
              </Field>
              <Field label="Phone number">
                <input className="input-style" value={form.customerPhone} onChange={(e) => updateField('customerPhone', e.target.value)} required />
              </Field>
              <Field label="Email address">
                <input className="input-style" type="email" value={form.customerEmail} onChange={(e) => updateField('customerEmail', e.target.value)} />
              </Field>
              <Field label="Delivery fee">
                <input className="input-style" type="number" min="0" value={form.deliveryFee} onChange={(e) => updateField('deliveryFee', e.target.value)} />
              </Field>
            </div>
            <Field label="Shipping address">
              <textarea className="input-style min-h-24 resize-none" value={form.shippingAddress} onChange={(e) => updateField('shippingAddress', e.target.value)} required />
            </Field>
            <Field label="Customer note">
              <textarea className="input-style min-h-24 resize-none" value={form.notes} onChange={(e) => updateField('notes', e.target.value)} />
            </Field>
            <Field label="Internal note">
              <textarea className="input-style min-h-24 resize-none" value={form.adminNote} onChange={(e) => updateField('adminNote', e.target.value)} />
            </Field>

            <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-[var(--text-primary)]">Products</p>
                <button type="button" onClick={() => setRows((current) => [...current, initialRow])} className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2 text-sm text-[var(--text-primary)]">
                  <Plus size={14} />
                  Add line
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {rows.map((row, index) => (
                  <div key={`${index}-${row.productId}`} className="grid gap-3 md:grid-cols-[1fr_120px_auto]">
                    <select className="input-style" value={row.productId} onChange={(e) => updateRow(index, 'productId', e.target.value)} required>
                      <option value="">Select product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>{product.name}</option>
                      ))}
                    </select>
                    <input className="input-style" type="number" min="1" value={row.quantity} onChange={(e) => updateRow(index, 'quantity', e.target.value)} required />
                    <button type="button" onClick={() => setRows((current) => (current.length === 1 ? current : current.filter((_, rowIndex) => rowIndex !== index)))} className="inline-flex items-center justify-center rounded-2xl border border-[var(--line)] bg-white/5 px-4 text-[var(--text-primary)]">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="rounded-[1.5rem] border border-[var(--line)] bg-white/[0.03] p-5">
            <h4 className="font-display text-2xl text-[var(--text-primary)]">Recorded summary</h4>
            <div className="mt-4 space-y-3 text-sm text-[var(--text-secondary)]">
              {detailedItems.length ? detailedItems.map((item) => (
                <div key={`${item.productId}-${item.quantity}`} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[var(--text-primary)]">{item.name}</p>
                    <p>{item.quantity} × {formatPrice(item.price)}</p>
                  </div>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              )) : <p>No products selected yet.</p>}
            </div>
            <div className="mt-5 border-t border-[var(--line)] pt-4 text-sm text-[var(--text-secondary)]">
              <div className="flex items-center justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="mt-2 flex items-center justify-between"><span>Delivery</span><span>{formatPrice(form.deliveryFee)}</span></div>
              <div className="mt-4 flex items-center justify-between font-display text-2xl text-[var(--text-primary)]"><span>Total</span><span className="text-[var(--gold)]">{formatPrice(total)}</span></div>
            </div>
            <button type="submit" disabled={saving || !detailedItems.length} className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[var(--gold)] px-4 py-3 text-sm font-semibold text-[#111] disabled:opacity-60">
              Save WhatsApp order
            </button>
          </aside>
        </form>
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
