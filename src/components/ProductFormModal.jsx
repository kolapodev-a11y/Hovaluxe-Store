import { useEffect, useMemo, useState } from 'react';
import { ImagePlus, Trash2, X } from 'lucide-react';
import { categories, createProductArtwork, getProductImages, statusOptions } from '../data/store';

const MAX_IMAGES = 4;

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
  images: [],
  isActive: true,
};

function padImages(images = []) {
  return [...images.slice(0, MAX_IMAGES), ...Array.from({ length: MAX_IMAGES }, () => '')].slice(0, MAX_IMAGES);
}

export function ProductFormModal({ open, onClose, onSave, product }) {
  const [form, setForm] = useState(emptyProduct);

  useEffect(() => {
    if (product) {
      setForm({
        ...product,
        price: String(product.price ?? ''),
        inventoryQuantity: String(product.inventoryQuantity ?? 0),
        images: getProductImages(product),
      });
    } else {
      setForm(emptyProduct);
    }
  }, [product]);

  const imageSlots = useMemo(() => padImages(form.images), [form.images]);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const updateImageAt = (index, value) => {
    setForm((prev) => {
      const nextImages = padImages(prev.images);
      nextImages[index] = value;
      return {
        ...prev,
        images: nextImages.filter(Boolean),
      };
    });
  };

  const clearImageAt = (index) => {
    setForm((prev) => {
      const nextImages = padImages(prev.images);
      nextImages[index] = '';
      return {
        ...prev,
        images: nextImages.filter(Boolean),
      };
    });
  };

  const handleUpload = (index, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => updateImageAt(index, String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const fallbackImage = createProductArtwork({
      title: form.name || 'Hovaluxe',
      subtitle: form.category || 'Luxury Scent',
      bottle: String(form.name || 'LUXE').split(' ')[0].toUpperCase().slice(0, 8),
    });

    const images = form.images.filter(Boolean).slice(0, MAX_IMAGES);
    const finalImages = images.length ? images : [fallbackImage];

    onSave({
      ...form,
      price: Number(form.price || 0),
      inventoryQuantity: Number(form.inventoryQuantity || 0),
      images: finalImages,
      image: finalImages[0],
    });
  };

  return (
    <>
      <div onClick={onClose} className={`fixed inset-0 z-[70] bg-black/60 transition ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`} />
      <div className={`fixed left-1/2 top-1/2 z-[80] w-[min(96vw,980px)] -translate-x-1/2 rounded-[2rem] border border-[var(--line)] bg-[#0c0d0d] p-6 transition ${open ? 'translate-y-[-50%] opacity-100' : 'pointer-events-none translate-y-[-46%] opacity-0'}`}>
        <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-secondary)]">Catalog editor</p>
            <h3 className="mt-2 font-display text-3xl text-[var(--text-primary)]">{product ? 'Edit product' : 'Add product'}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-[var(--line)] bg-white/5 p-3 text-[var(--text-primary)]">
            <X size={18} />
          </button>
        </div>

        <form className="mt-6 grid max-h-[72vh] gap-4 overflow-y-auto pr-1 md:grid-cols-2" onSubmit={handleSubmit}>
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

          <Field label="Description" className="md:col-span-2">
            <textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} className="input-style min-h-28 resize-none" required />
          </Field>

          <div className="md:col-span-2">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Product gallery</p>
                <p className="text-sm text-[var(--text-secondary)]">Upload or paste up to 4 images. The first image becomes the main storefront image.</p>
              </div>
              <span className="rounded-full border border-[var(--line)] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[var(--accent-green)]">
                4 image max
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {imageSlots.map((image, index) => (
                <div key={`image-slot-${index}`} className="rounded-[1.4rem] border border-[var(--line)] bg-white/[0.03] p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {index === 0 ? 'Primary image' : `Image ${index + 1}`}
                    </p>
                    {image ? (
                      <button
                        type="button"
                        onClick={() => clearImageAt(index)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-500/30 text-rose-200"
                        aria-label={`Remove image ${index + 1}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    ) : null}
                  </div>

                  <div className="mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-[1.1rem] border border-[var(--line)] bg-[#101112]">
                    {image ? (
                      <img src={image} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 px-4 text-center text-sm text-[var(--text-secondary)]">
                        <ImagePlus size={22} className="text-[var(--gold)]" />
                        <span>No image yet</span>
                      </div>
                    )}
                  </div>

                  <Field label="Image URL">
                    <input
                      value={image}
                      onChange={(e) => updateImageAt(index, e.target.value)}
                      className="input-style"
                      placeholder="Paste a hosted image URL"
                    />
                  </Field>

                  <Field label="Upload image" className="mt-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleUpload(index, event)}
                      className="input-style file:mr-3 file:rounded-full file:border-0 file:bg-[var(--gold)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#111]"
                    />
                  </Field>
                </div>
              ))}
            </div>
          </div>

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
