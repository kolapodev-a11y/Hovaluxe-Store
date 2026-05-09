import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { categories, createProductArtwork, statusOptions } from '../data/store';

const emptyProduct = {
  name: '',
  category: categories[0],
  price: '',
  status: 'in-stock',
  inventoryQuantity: '0',
  volume: '',
  sku: '',
  description: '',
  featured: false,
  image: '',
  isActive: true,
};

export function ProductFormModal({ open, onClose, onSave, product }) {
  const [form, setForm] = useState(emptyProduct);

  useEffect(() => {
    if (product) {
      setForm({
        ...product,
        price: String(product.price ?? ''),
        inventoryQuantity: String(product.inventoryQuantity ?? 0),
      });
    } else {
      setForm(emptyProduct);
    }
  }, [product]);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => updateField('image', String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSave({
      ...form,
      price: Number(form.price || 0),
      inventoryQuantity: Number(form.inventoryQuantity || 0),
      image:
        form.image ||
        createProductArtwork({
          title: form.name || 'Hovaluxe',
          subtitle: form.category || 'Luxury Scent',
          bottle: String(form.name || 'LUXE').split(' ')[0].toUpperCase().slice(0, 8),
        }),
    });
  };

  return (
    <>
      <div onClick={onClose} className={`fixed inset-0 z-[70] bg-black/60 transition ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`} />
      <div className={`fixed left-1/2 top-1/2 z-[80] w-[min(96vw,760px)] -translate-x-1/2 rounded-[2rem] border border-[var(--line)] bg-[#0c0d0d] p-6 transition ${open ? 'translate-y-[-50%] opacity-100' : 'pointer-events-none translate-y-[-46%] opacity-0'}`}>
        <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-secondary)]">Catalog editor</p>
            <h3 className="mt-2 font-display text-3xl text-[var(--text-primary)]">{product ? 'Edit product' : 'Add product'}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-[var(--line)] bg-white/5 p-3 text-[var(--text-primary)]">
            <X size={18} />
          </button>
        </div>

        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Field label="Product name">
            <input value={form.name} onChange={(e) => updateField('name', e.target.value)} required className="input-style" />
          </Field>
          <Field label="Category">
            <select value={form.category} onChange={(e) => updateField('category', e.target.value)} className="input-style">
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </Field>
          <Field label="Price">
            <input type="number" min="0" value={form.price} onChange={(e) => updateField('price', e.target.value)} required className="input-style" />
          </Field>
          <Field label="Inventory quantity">
            <input type="number" min="0" value={form.inventoryQuantity} onChange={(e) => updateField('inventoryQuantity', e.target.value)} className="input-style" />
          </Field>
          <Field label="Volume / size">
            <input value={form.volume} onChange={(e) => updateField('volume', e.target.value)} className="input-style" placeholder="100ml" />
          </Field>
          <Field label="SKU">
            <input value={form.sku} onChange={(e) => updateField('sku', e.target.value)} className="input-style" placeholder="HOV-001" />
          </Field>
          <Field label="Stock label">
            <select value={form.status} onChange={(e) => updateField('status', e.target.value)} className="input-style">
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </Field>
          <label className="flex items-center gap-3 rounded-[1rem] border border-[var(--line)] bg-white/[0.03] px-4 py-3 text-sm text-[var(--text-primary)]">
            <input type="checkbox" checked={form.featured} onChange={(e) => updateField('featured', e.target.checked)} />
            Featured on storefront
          </label>
          <label className="flex items-center gap-3 rounded-[1rem] border border-[var(--line)] bg-white/[0.03] px-4 py-3 text-sm text-[var(--text-primary)] md:col-span-2">
            <input type="checkbox" checked={form.isActive} onChange={(e) => updateField('isActive', e.target.checked)} />
            Visible on storefront
          </label>
          <Field label="Image URL" className="md:col-span-2">
            <input value={form.image} onChange={(e) => updateField('image', e.target.value)} className="input-style" placeholder="Paste a hosted image URL or upload below" />
          </Field>
          <Field label="Upload image" className="md:col-span-2">
            <input type="file" accept="image/*" onChange={handleUpload} className="input-style file:mr-4 file:rounded-full file:border-0 file:bg-[var(--gold)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#111]" />
          </Field>
          <Field label="Description" className="md:col-span-2">
            <textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} className="input-style min-h-28 resize-none" required />
          </Field>

          {form.image ? (
            <div className="md:col-span-2 rounded-[1.5rem] border border-[var(--line)] bg-white/[0.03] p-4">
              <p className="mb-3 text-sm text-[var(--text-secondary)]">Preview</p>
              <img src={form.image} alt="Preview" className="h-56 w-full rounded-[1.25rem] object-cover" />
            </div>
          ) : null}

          <div className="md:col-span-2 flex flex-wrap justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-full border border-[var(--line)] px-5 py-3 text-sm text-[var(--text-primary)]">Cancel</button>
            <button type="submit" className="rounded-full bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[#111]">Save product</button>
          </div>
        </form>
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
