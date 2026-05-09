import { useMemo, useState } from 'react';
import { ShoppingBag, Star, ZoomIn } from 'lucide-react';
import { Badge } from './Badge';
import { formatPrice } from '../utils/format';
import { getProductImages } from '../data/store';
import { ImageLightbox } from './ImageLightbox';

export function ProductCard({ product, onAddToCart }) {
  const disabled = product.status === 'out-of-stock' || product.status === 'sold';
  const images = useMemo(() => getProductImages(product), [product]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <article className="group overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,.01))] shadow-[0_18px_45px_rgba(0,0,0,.18)] transition duration-300 hover:-translate-y-1 hover:border-[var(--gold)]/28">
        <div className="relative overflow-hidden border-b border-[var(--line)] bg-[#0c0d0d]">
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="relative block aspect-square w-full overflow-hidden text-left"
            aria-label={`Magnify ${product.name}`}
          >
            <img
              src={images[activeImageIndex]}
              alt={product.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,.15)_65%,rgba(0,0,0,.7))]" />
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              <Badge value={product.status} />
              {product.featured ? <Badge value="featured">Featured</Badge> : null}
            </div>
            <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-xs font-medium text-white">
              <ZoomIn size={14} />
              Magnify
            </span>
          </button>

          {images.length > 1 ? (
            <div className="grid grid-cols-4 gap-2 border-t border-[var(--line)] bg-[#0f1011] p-3">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  className={`overflow-hidden rounded-xl border transition ${
                    activeImageIndex === index
                      ? 'border-[var(--gold)] shadow-[0_0_0_1px_rgba(199,164,93,.25)]'
                      : 'border-[var(--line)] opacity-80 hover:opacity-100'
                  }`}
                  aria-label={`Show image ${index + 1} for ${product.name}`}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} className="h-14 w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-4 p-5 text-center">
          <div className="flex items-center justify-center gap-1 rounded-full border border-[var(--line)] bg-white/5 px-3 py-1 text-xs text-[var(--gold)] w-fit mx-auto">
            <Star size={12} fill="currentColor" />
            Luxe pick
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-secondary)]">{product.category}</p>
            <h3 className="mt-2 font-display text-[1.9rem] leading-tight text-[var(--text-primary)]">{product.name}</h3>
          </div>

          <p className="text-sm leading-7 text-[var(--text-secondary)]">{product.description}</p>

          <div className="grid gap-3 rounded-[1.3rem] border border-[var(--line)] bg-white/[0.03] p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-secondary)]">Volume</p>
              <p className="mt-1 text-sm text-[var(--text-primary)]">{product.volume || 'Standard size'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-secondary)]">Price</p>
              <p className="mt-1 font-display text-3xl text-[var(--gold)]">{formatPrice(product.price)}</p>
            </div>
          </div>

          <button
            type="button"
            disabled={disabled}
            onClick={() => onAddToCart(product)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--gold)]/20 bg-[var(--gold)] px-4 py-3 text-sm font-semibold text-[#12110f] transition hover:shadow-[0_14px_35px_rgba(199,164,93,.28)] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-[var(--text-secondary)] disabled:shadow-none"
          >
            <ShoppingBag size={16} />
            {disabled ? 'Unavailable' : 'Add to bag'}
          </button>
        </div>
      </article>

      <ImageLightbox
        open={lightboxOpen}
        images={images}
        activeIndex={activeImageIndex}
        onIndexChange={setActiveImageIndex}
        onClose={() => setLightboxOpen(false)}
        title={product.name}
      />
    </>
  );
}
