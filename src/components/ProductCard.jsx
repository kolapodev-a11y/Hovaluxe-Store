import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, ShoppingBag, Star, ZoomIn } from 'lucide-react';
import { Badge } from './Badge';
import { formatPrice } from '../utils/format';
import { getProductImages } from '../data/store';
import { ImageLightbox } from './ImageLightbox';
import { useWishlist } from '../context/WishlistContext';

const SWIPE_THRESHOLD = 40;

export function ProductCard({ product, onAddToCart, compact = false }) {
  const disabled = product.status === 'out-of-stock' || product.status === 'sold';
  const images = useMemo(() => getProductImages(product), [product]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const { isWishlisted, toggleWishlist } = useWishlist();

  const wishlisted = isWishlisted(product.id);

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
      <article
        className={`group overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,.01))] shadow-[0_18px_45px_rgba(0,0,0,.18)] transition duration-300 hover:-translate-y-1 hover:border-[var(--gold)]/28 ${compact ? 'rounded-[1.35rem]' : 'rounded-[1.75rem]'}`}
      >
        <div className="relative overflow-hidden border-b border-[var(--line)] bg-[#0c0d0d]">
          <div
            className={`relative w-full overflow-hidden ${compact ? 'aspect-[4/5]' : 'aspect-square'}`}
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

            <div className={`absolute left-3 top-3 flex flex-wrap gap-2 ${compact ? 'left-3 top-3' : 'left-4 top-4'}`}>
              <Badge value={product.status} />
              {product.featured ? <Badge value="featured">Featured</Badge> : null}
            </div>

            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              className={`absolute inline-flex items-center justify-center rounded-full border transition ${compact ? 'right-3 top-3 h-9 w-9' : 'right-4 top-4 h-11 w-11'} ${
                wishlisted
                  ? 'border-rose-400/40 bg-rose-500/15 text-rose-200'
                  : 'border-white/10 bg-black/45 text-white hover:bg-black/65'
              }`}
              aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            >
              <Heart size={compact ? 16 : 18} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>

            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={showPreviousImage}
                  className={`absolute top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white transition hover:bg-black/65 ${compact ? 'left-2.5 h-8 w-8' : 'left-3 h-10 w-10'}`}
                  aria-label={`Show previous image for ${product.name}`}
                >
                  <ChevronLeft size={compact ? 16 : 18} />
                </button>
                <button
                  type="button"
                  onClick={showNextImage}
                  className={`absolute top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white transition hover:bg-black/65 ${compact ? 'right-2.5 h-8 w-8' : 'right-3 h-10 w-10'}`}
                  aria-label={`Show next image for ${product.name}`}
                >
                  <ChevronRight size={compact ? 16 : 18} />
                </button>
              </>
            ) : null}

            <div className={`absolute flex items-center gap-2 ${compact ? 'bottom-3 left-3' : 'bottom-4 left-4'}`}>
              {images.map((_, index) => (
                <button
                  key={`${product.id}-dot-${index}`}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  className={`rounded-full transition ${
                    activeImageIndex === index
                      ? 'w-6 bg-[var(--gold)]'
                      : 'bg-white/45 hover:bg-white/70'
                  } ${compact ? 'h-2 w-2' : 'h-2.5 w-2.5'}`}
                  aria-label={`Show image ${index + 1} for ${product.name}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className={`absolute inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/45 font-medium text-white ${compact ? 'bottom-3 right-3 px-2.5 py-1 text-[11px]' : 'bottom-4 right-4 px-3 py-1.5 text-xs'}`}
              aria-label={`Magnify ${product.name}`}
            >
              <ZoomIn size={compact ? 13 : 14} />
              {!compact ? 'Magnify' : 'View'}
            </button>
          </div>
        </div>

        <div className={`space-y-3 ${compact ? 'p-4 text-left' : 'p-5 text-center'}`}>
          <div className={`mx-auto flex w-fit items-center justify-center gap-1 rounded-full border border-[var(--line)] bg-white/5 text-[var(--gold)] ${compact ? 'px-2.5 py-1 text-[11px] ml-0 mr-auto' : 'px-3 py-1 text-xs'}`}>
            <Star size={compact ? 11 : 12} fill="currentColor" />
            Luxe pick
          </div>

          <div>
            <p className={`uppercase tracking-[0.24em] text-[var(--text-secondary)] ${compact ? 'text-[10px]' : 'text-xs'}`}>{product.category}</p>
            <h3 className={`mt-2 font-display leading-tight text-[var(--text-primary)] ${compact ? 'text-[1.45rem]' : 'text-[1.9rem]'}`}>{product.name}</h3>
          </div>

          <p className={`text-[var(--text-secondary)] ${compact ? 'line-clamp-3 text-xs leading-6' : 'text-sm leading-7'}`}>{product.description}</p>

          <div className={`grid gap-3 rounded-[1.15rem] border border-[var(--line)] bg-white/[0.03] ${compact ? 'p-3 text-left' : 'p-4 sm:grid-cols-2'}`}>
            <div>
              <p className={`uppercase tracking-[0.22em] text-[var(--text-secondary)] ${compact ? 'text-[10px]' : 'text-xs'}`}>Volume</p>
              <p className={`mt-1 text-[var(--text-primary)] ${compact ? 'text-xs' : 'text-sm'}`}>{product.volume || 'Standard size'}</p>
            </div>
            <div>
              <p className={`uppercase tracking-[0.22em] text-[var(--text-secondary)] ${compact ? 'text-[10px]' : 'text-xs'}`}>Price</p>
              <p className={`mt-1 font-display text-[var(--gold)] ${compact ? 'text-[1.7rem]' : 'text-3xl'}`}>{formatPrice(product.price)}</p>
            </div>
          </div>

          <div className={`grid gap-2.5 ${compact ? 'grid-cols-1' : 'sm:grid-cols-2'}`}>
            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-full border font-semibold transition ${compact ? 'px-3 py-2.5 text-xs' : 'px-4 py-3 text-sm'} ${
                wishlisted
                  ? 'border-rose-500/30 bg-rose-500/10 text-rose-100 hover:bg-rose-500/15'
                  : 'border-[var(--line)] bg-white/5 text-[var(--text-primary)] hover:border-[var(--gold)]/30'
              }`}
            >
              <Heart size={compact ? 14 : 16} fill={wishlisted ? 'currentColor' : 'none'} />
              {wishlisted ? 'Saved' : 'Wishlist'}
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onAddToCart(product)}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--gold)]/20 bg-[var(--gold)] font-semibold text-[#12110f] transition hover:shadow-[0_14px_35px_rgba(199,164,93,.28)] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-[var(--text-secondary)] disabled:shadow-none ${compact ? 'px-3 py-2.5 text-xs' : 'px-4 py-3 text-sm'}`}
            >
              <ShoppingBag size={compact ? 14 : 16} />
              {disabled ? 'Unavailable' : 'Add to bag'}
            </button>
          </div>
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
