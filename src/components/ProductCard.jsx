import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBag, Star, ZoomIn } from 'lucide-react';
import { Badge } from './Badge';
import { formatPrice } from '../utils/format';
import { getProductImages } from '../data/store';
import { ImageLightbox } from './ImageLightbox';

const SWIPE_THRESHOLD = 40;

export function ProductCard({ product, onAddToCart }) {
  const disabled = product.status === 'out-of-stock' || product.status === 'sold';
  const images = useMemo(() => getProductImages(product), [product]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);

  const showPreviousImage = () => {
    setActiveImageIndex((current) => (current - 1 + images.length) % images.length);
  };

  const showNextImage = () => {
    setActiveImageIndex((current) => (current + 1) % images.length);
  };

  const handleTouchStart = (event) => {
    setTouchStartX(event.touches?.[0]?.clientX ?? null);
  };

  const handleTouchEnd = (event) => {
    if (touchStartX === null || images.length <= 1) return;

    const endX = event.changedTouches?.[0]?.clientX ?? touchStartX;
    const delta = endX - touchStartX;

    if (Math.abs(delta) >= SWIPE_THRESHOLD) {
      if (delta < 0) {
        showNextImage();
      } else {
        showPreviousImage();
      }
    }

    setTouchStartX(null);
  };

  return (
    <>
      <article className="group overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,.01))] shadow-[0_18px_45px_rgba(0,0,0,.18)] transition duration-300 hover:-translate-y-1 hover:border-[var(--gold)]/28">
        <div className="relative overflow-hidden border-b border-[var(--line)] bg-[#0c0d0d]">
          <div
            className="relative aspect-square w-full overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex h-full transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${activeImageIndex * 100}%)` }}
            >
              {images.map((image, index) => (
                <div key={`${image}-${index}`} className="h-full w-full shrink-0">
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>

            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,.15)_65%,rgba(0,0,0,.7))]" />

            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              <Badge value={product.status} />
              {product.featured ? <Badge value="featured">Featured</Badge> : null}
            </div>

            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={showPreviousImage}
                  className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white transition hover:bg-black/65"
                  aria-label={`Show previous image for ${product.name}`}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={showNextImage}
                  className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white transition hover:bg-black/65"
                  aria-label={`Show next image for ${product.name}`}
                >
                  <ChevronRight size={18} />
                </button>
              </>
            ) : null}

            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              {images.map((_, index) => (
                <button
                  key={`${product.id}-dot-${index}`}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  className={`h-2.5 rounded-full transition ${
                    activeImageIndex === index
                      ? 'w-6 bg-[var(--gold)]'
                      : 'w-2.5 bg-white/45 hover:bg-white/70'
                  }`}
                  aria-label={`Show image ${index + 1} for ${product.name}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-xs font-medium text-white"
              aria-label={`Magnify ${product.name}`}
            >
              <ZoomIn size={14} />
              Magnify
            </button>
          </div>
        </div>

        <div className="space-y-4 p-5 text-center">
          <div className="mx-auto flex w-fit items-center justify-center gap-1 rounded-full border border-[var(--line)] bg-white/5 px-3 py-1 text-xs text-[var(--gold)]">
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
