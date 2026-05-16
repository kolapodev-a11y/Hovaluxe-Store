import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Heart, LoaderCircle, ShoppingBag, ZoomIn } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { ImageLightbox } from '../components/ImageLightbox';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { buildProductPath, getProductImages, normalizeProduct, slugifyProductName } from '../data/store';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { api } from '../lib/api';
import { formatPrice, titleCase } from '../utils/format';

const STOREFRONT_RETURN_STATE_KEY = 'hovaluxe_storefront_return';

function readStoredStorefrontReturnState() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(STOREFRONT_RETURN_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function QuantityButton({ children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-white/5 text-lg text-[var(--text-primary)] transition hover:border-[var(--gold)]/35 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export function ProductDetailsPage() {
  const { productId = '', productSlug = '' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [cart, setCart] = useLocalStorage('hovaluxe_cart', []);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      try {
        setLoading(true);
        setError('');
        const response = await api.getProducts();
        if (!active) return;

        const normalizedProducts = (response.data || []).map((entry) => normalizeProduct(entry));
        const matchedProduct = normalizedProducts.find((entry) => {
          const entryId = String(entry.id || entry._id || '');
          const entrySlug = slugifyProductName(entry.name);

          if (productId) {
            return entryId === productId || entrySlug === productSlug;
          }

          return entrySlug === productSlug;
        });

        if (!matchedProduct) {
          setProduct(null);
          setError('We could not find that product. It may have been removed from the catalog.');
          return;
        }

        setProduct(matchedProduct);
      } catch (loadError) {
        if (!active) return;
        setError(loadError.message || 'Unable to load the selected product right now.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      active = false;
    };
  }, [productId, productSlug]);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [productId, productSlug]);

  useEffect(() => {
    setActiveImageIndex(0);
    setQuantity(1);
    setNotice('');
  }, [product?.id]);

  const images = useMemo(() => getProductImages(product), [product]);
  const disabled = product?.status === 'out-of-stock' || product?.status === 'sold';
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlisted = product ? isWishlisted(product.id) : false;

  const addToCart = () => {
    if (!product || disabled) return;

    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.id === product.id);
      if (existing) {
        return currentCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
        );
      }

      return [...currentCart, { ...product, quantity }];
    });

    setNotice(`${product.name} was added to your cart.`);
  };

  const openCart = () => {
    navigate('/', { state: { openCart: true }, replace: false });
  };

  const goBackToStore = () => {
    const storedReturnState = readStoredStorefrontReturnState();

    const fromPath = location.state?.fromPath || storedReturnState?.fromPath || '/';
    const restoreSearch = typeof location.state?.restoreSearch === 'string'
      ? location.state.restoreSearch
      : typeof storedReturnState?.restoreSearch === 'string'
        ? storedReturnState.restoreSearch
        : '';

    const returnState = {
      scrollTo: location.state?.scrollTo || storedReturnState?.scrollTo || 'catalog',
      restoreCategory: location.state?.restoreCategory || storedReturnState?.restoreCategory || 'All',
      restoreSearch,
    };

    if (Number.isFinite(location.state?.restoreScrollY)) {
      returnState.restoreScrollY = Number(location.state.restoreScrollY);
    } else if (Number.isFinite(storedReturnState?.restoreScrollY)) {
      returnState.restoreScrollY = Number(storedReturnState.restoreScrollY);
    }

    const restoreTrackId = location.state?.restoreTrackId || storedReturnState?.restoreTrackId || '';
    if (restoreTrackId) {
      returnState.restoreTrackId = restoreTrackId;
    }

    if (Number.isFinite(location.state?.restoreTrackScrollLeft)) {
      returnState.restoreTrackScrollLeft = Number(location.state.restoreTrackScrollLeft);
    } else if (Number.isFinite(storedReturnState?.restoreTrackScrollLeft)) {
      returnState.restoreTrackScrollLeft = Number(storedReturnState.restoreTrackScrollLeft);
    }

    navigate(fromPath, { state: returnState });
  };

  if (!loading && !product && !error) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      <Header
        cartCount={cartCount}
        onCartOpen={openCart}
        showTransactionSection={isAuthenticated}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
          <button
            type="button"
            onClick={goBackToStore}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/5 px-4 py-2.5 text-[var(--text-primary)] transition hover:border-[var(--gold)]/35"
          >
            <ArrowLeft size={16} />
            Back to store
          </button>
          {product ? (
            <Link
              to={buildProductPath(product)}
              className="rounded-full border border-[var(--gold)]/20 bg-[var(--gold)]/10 px-4 py-2.5 text-[var(--gold-soft)]"
            >
              {product.name}
            </Link>
          ) : null}
        </div>

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center rounded-[2rem] border border-[var(--line)] bg-[#0d0e0e] p-8 text-sm text-[var(--text-secondary)]">
            <LoaderCircle size={18} className="mr-2 animate-spin" /> Loading product details...
          </div>
        ) : error ? (
          <div className="rounded-[2rem] border border-rose-500/20 bg-rose-500/10 p-8 text-center text-sm text-rose-200">
            {error}
          </div>
        ) : product ? (
          <section className="grid gap-8 rounded-[2rem] border border-[var(--line)] bg-[#0d0e0e] p-5 shadow-[0_24px_90px_rgba(0,0,0,.42)] lg:grid-cols-[1.05fr_0.95fr] lg:p-8">
            <div>
              <div className="relative overflow-hidden rounded-[1.8rem] border border-[var(--line)] bg-[#090909]">
                <img
                  src={images[activeImageIndex]}
                  alt={product.name}
                  className="aspect-square w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/55 px-4 py-2 text-sm text-white"
                >
                  <ZoomIn size={15} />
                  View larger image
                </button>
                {images.length > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveImageIndex((current) => (current - 1 + images.length) % images.length)}
                      className="absolute left-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white"
                      aria-label="Show previous image"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveImageIndex((current) => (current + 1) % images.length)}
                      className="absolute right-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white"
                      aria-label="Show next image"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                ) : null}
              </div>

              {images.length > 1 ? (
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {images.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      className={`overflow-hidden rounded-[1.2rem] border transition ${
                        activeImageIndex === index
                          ? 'border-[var(--gold)] shadow-[0_0_0_1px_rgba(199,164,93,.25)]'
                          : 'border-[var(--line)] opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img src={image} alt={`${product.name} ${index + 1}`} className="aspect-square w-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="flex flex-col justify-center">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-green)]">Product details</p>
              <h1 className="mt-3 font-display text-4xl text-[var(--text-primary)] md:text-5xl">{product.name}</h1>
              <p className="mt-3 font-display text-4xl text-[var(--gold)]">{formatPrice(product.price)}</p>

              <div className="mt-6 grid gap-4 rounded-[1.5rem] border border-[var(--line)] bg-white/[0.03] p-5 sm:grid-cols-3">
                <DetailItem label="Category" value={product.category || 'General'} />
                <DetailItem label="Volume" value={product.volume || 'Standard size'} />
                <DetailItem label="Availability" value={titleCase(product.status || 'in-stock')} />
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-[var(--line)] bg-white/[0.03] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-secondary)]">Description</p>
                <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                  {product.description || 'Product details will appear here once the item description is added by the store owner.'}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/[0.03] px-3 py-2">
                  <QuantityButton onClick={() => setQuantity((current) => Math.max(1, current - 1))} disabled={quantity <= 1}>
                    −
                  </QuantityButton>
                  <span className="min-w-10 text-center text-base font-semibold text-[var(--text-primary)]">{quantity}</span>
                  <QuantityButton onClick={() => setQuantity((current) => current + 1)}>+</QuantityButton>
                </div>

                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-medium transition ${
                    wishlisted
                      ? 'border-rose-500/30 bg-rose-500/10 text-rose-100 hover:bg-rose-500/15'
                      : 'border-[var(--line)] bg-white/5 text-[var(--text-primary)] hover:border-[var(--gold)]/30'
                  }`}
                >
                  <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
                  {wishlisted ? 'Saved to wishlist' : 'Save to wishlist'}
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={addToCart}
                  disabled={disabled}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--gold-soft),var(--gold))] px-6 py-3.5 text-sm font-semibold text-[#1b140b] shadow-[0_10px_24px_rgba(216,192,122,0.18)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-[var(--text-secondary)] disabled:shadow-none"
                >
                  <ShoppingBag size={16} />
                  {disabled ? 'Unavailable' : 'Add to bag'}
                </button>
                <button
                  type="button"
                  onClick={openCart}
                  className="inline-flex w-full items-center justify-center rounded-full border border-[var(--line)] bg-white/5 px-6 py-3.5 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--gold)]/35"
                >
                  Open cart
                </button>
              </div>

              {notice ? (
                <div className="mt-4 rounded-[1.2rem] border border-[var(--gold)]/25 bg-[var(--gold)]/10 px-4 py-3 text-sm text-[var(--text-primary)]">
                  {notice}
                </div>
              ) : null}
            </div>
          </section>
        ) : null}
      </main>

      <ImageLightbox
        open={lightboxOpen}
        images={images}
        activeIndex={activeImageIndex}
        onIndexChange={setActiveImageIndex}
        onClose={() => setLightboxOpen(false)}
        title={product?.name || 'Product image'}
      />
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-secondary)]">{label}</p>
      <p className="mt-2 text-sm text-[var(--text-primary)]">{value}</p>
    </div>
  );
}
