import { useMemo } from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/format';
import { buildProductPath, getProductImages } from '../data/store';
import { useWishlist } from '../context/WishlistContext';

const STOREFRONT_RETURN_STATE_KEY = 'hovaluxe_storefront_return';

export function ProductCard({
  product,
  onAddToCart,
  compact = false,
  showWishlistToggle = false,
  showAddToCartButton = false,
  linkState,
  priority = false,
}) {
  const disabled = product.status === 'out-of-stock' || product.status === 'sold';
  const image = useMemo(() => getProductImages(product)[0], [product]);
  const productPath = useMemo(() => buildProductPath(product), [product]);
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  const imageSizes = compact
    ? '(max-width: 640px) 240px, (max-width: 1024px) 250px, 260px'
    : '(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw';

  const handleProductClick = (event) => {
    if (typeof window === 'undefined') return;

    const returnState = {
      ...(linkState || {}),
      restoreScrollY: window.scrollY,
    };

    const scrollTrack = event.currentTarget.closest('[data-store-scroll-track]');
    const trackId = scrollTrack?.dataset?.storeScrollTrack;

    if (trackId) {
      returnState.restoreTrackId = trackId;
      returnState.restoreTrackScrollLeft = scrollTrack.scrollLeft;
    }

    try {
      window.sessionStorage.setItem(STOREFRONT_RETURN_STATE_KEY, JSON.stringify(returnState));
    } catch {
      // Ignore storage errors and allow navigation to continue.
    }
  };

  return (
    <article
      className={`group overflow-hidden rounded-[1.45rem] border border-[var(--line)] bg-[#0f1010] shadow-[0_18px_45px_rgba(0,0,0,.18)] transition duration-300 hover:-translate-y-1 hover:border-[var(--gold)]/28 ${
        compact ? 'rounded-[1.25rem]' : ''
      }`}
    >
      <Link
        to={productPath}
        state={linkState}
        onClick={handleProductClick}
        className="block"
        aria-label={`View details for ${product.name}`}
      >
        <div className={`overflow-hidden bg-[#090909] ${compact ? 'aspect-[4/5]' : 'aspect-[4/5]'}`}>
          <img
            src={image}
            alt={product.name}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
            sizes={imageSizes}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>

        <div className={`space-y-3 ${compact ? 'p-3.5' : 'p-4'}`}>
          <div>
            <p className={`uppercase tracking-[0.24em] text-[var(--text-secondary)] ${compact ? 'text-[10px]' : 'text-[11px]'}`}>
              {product.category}
            </p>
            <h3 className={`mt-2 line-clamp-2 font-medium leading-snug text-[var(--text-primary)] ${compact ? 'text-sm' : 'text-base'}`}>
              {product.name}
            </h3>
          </div>

          <div className="flex items-end justify-between gap-3">
            <p className={`font-display text-[var(--gold)] ${compact ? 'text-2xl' : 'text-[1.9rem]'}`}>
              {formatPrice(product.price)}
            </p>
            <span className="text-xs font-medium text-[var(--accent-green)]">View details</span>
          </div>
        </div>
      </Link>

      {(showWishlistToggle || showAddToCartButton) && (
        <div className={`grid gap-2 border-t border-[var(--line)] bg-white/[0.02] ${compact ? 'p-3' : 'p-4'} ${showWishlistToggle && showAddToCartButton ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
          {showWishlistToggle ? (
            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                wishlisted
                  ? 'border-rose-500/30 bg-rose-500/10 text-rose-100 hover:bg-rose-500/15'
                  : 'border-[var(--line)] bg-white/5 text-[var(--text-primary)] hover:border-[var(--gold)]/30'
              }`}
            >
              <Heart size={15} fill={wishlisted ? 'currentColor' : 'none'} />
              {wishlisted ? 'Saved' : 'Wishlist'}
            </button>
          ) : null}

          {showAddToCartButton ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onAddToCart?.(product)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--gold)]/20 bg-[var(--gold)] px-4 py-2.5 text-sm font-semibold text-[#12110f] transition hover:shadow-[0_14px_35px_rgba(199,164,93,.28)] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-[var(--text-secondary)] disabled:shadow-none"
            >
              <ShoppingBag size={15} />
              {disabled ? 'Unavailable' : 'Add to bag'}
            </button>
          ) : null}
        </div>
      )}
    </article>
  );
}
