import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Cloud,
  Droplets,
  Flame,
  Gem,
  Mail,
  MessageCircle,
  PackageCheck,
  Receipt,
  ShieldCheck,
  Wind,
} from 'lucide-react';
import { brand, normalizeProduct } from '../data/store';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Header } from '../components/Header';
import { HeroSection } from '../components/HeroSection';
import { SectionTitle } from '../components/SectionTitle';
import { CategoryStrip } from '../components/CategoryStrip';
import { ProductCard } from '../components/ProductCard';
import { CartDrawer } from '../components/CartDrawer';
import { CheckoutModal } from '../components/CheckoutModal';
import { formatDateTime, formatPrice, titleCase } from '../utils/format';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const fallbackConfig = {
  deliveryFee: 2500,
  whatsappNumber: '0816 114 8918',
  supportEmail: 'henryolakunle8@gmail.com',
  twitterUrl: 'https://x.com/KUNLELUXE',
  currency: 'NGN',
  heroNotice: 'Nationwide delivery available',
};

const categoryCards = [
  {
    title: 'Perfume',
    text: 'Signature scents for daily wear and occasion dressing.',
    icon: Gem,
  },
  {
    title: 'Body Spray',
    text: 'Fresh sprays with easy daily projection.',
    icon: Wind,
  },
  {
    title: 'Roll Ons',
    text: 'Portable fragrance oils for quick touch-ups.',
    icon: Droplets,
  },
  {
    title: 'Diffusers',
    text: 'Refined home scents for calm, polished spaces.',
    icon: Flame,
  },
  {
    title: 'Humidifiers',
    text: 'Aroma-ready humidifiers for soft ambience.',
    icon: Cloud,
  },
];

const catalogSectionId = 'catalog';
const featuredCollectionSectionId = 'collections';
const STOREFRONT_RETURN_STATE_KEY = 'kunleluxe_storefront_return';

const normalizePhoneNumber = (value = '') => String(value || '').replace(/[^\d]/g, '');

const resolveTwitterUrl = (value = '') => {
  const normalized = String(value || '').trim();
  if (!normalized) return '';
  if (/^https?:\/\//i.test(normalized)) return normalized;
  return `https://twitter.com/${normalized.replace(/^@/, '')}`;
};

const buildWhatsAppOrderLink = ({ phoneNumber, customerName, customerPhone, customerEmail, shippingAddress, notes, cart, deliveryFee, total }) => {
  const phone = normalizePhoneNumber(phoneNumber);
  if (!phone) return '';

  const itemsSummary = cart
    .map((item, index) => `${index + 1}. ${item.name} x${item.quantity} — ${formatPrice(item.price * item.quantity)}`)
    .join('\n');

  const message = [
    'Hello Kunleluxe, I would like to place an order.',
    '',
    'Customer details',
    `Name: ${customerName}`,
    `Phone: ${customerPhone}`,
    customerEmail ? `Email: ${customerEmail}` : '',
    `Address: ${shippingAddress}`,
    notes ? `Notes: ${notes}` : '',
    '',
    'Order items',
    itemsSummary,
    '',
    `Delivery fee: ${formatPrice(deliveryFee)}`,
    `Total: ${formatPrice(total)}`,
    '',
    'Please confirm availability and share the payment instructions.',
  ]
    .filter(Boolean)
    .join('\n');

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

const readStoredStorefrontReturnState = () => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(STOREFRONT_RETURN_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const clearStoredStorefrontReturnState = () => {
  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.removeItem(STOREFRONT_RETURN_STATE_KEY);
  } catch {
    // Ignore storage cleanup errors.
  }
};

const restoreTrackScroll = (trackId, scrollLeft = 0) => {
  if (typeof document === 'undefined' || !trackId) return;

  window.requestAnimationFrame(() => {
    const track = document.querySelector(`[data-store-scroll-track="${trackId}"]`);
    if (track) {
      track.scrollLeft = Number(scrollLeft) || 0;
    }
  });
};

const scrollToSection = (sectionId, { behavior = 'smooth' } = {}) => {
  if (typeof document === 'undefined') return;
  window.requestAnimationFrame(() => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior, block: 'start' });
  });
};

export function StorefrontPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user, isAuthenticated } = useAuth();
  const [config, setConfig] = useState(fallbackConfig);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useLocalStorage('kunleluxe_cart', []);

  const [productsLoading, setProductsLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadStore() {
      setProductsLoading(true);
      setCatalogError('');

      const configRequest = api
        .getPublicConfig()
        .then((configResponse) => {
          if (!active) return;
          setConfig({ ...fallbackConfig, ...(configResponse.data || {}) });
        })
        .catch(() => {
          if (!active) return;
          setConfig(fallbackConfig);
        });

      const productsRequest = api
        .getProducts()
        .then((productsResponse) => {
          if (!active) return;
          setProducts((productsResponse.data || []).map((product) => normalizeProduct(product)));
          setCatalogError('');
        })
        .catch((loadError) => {
          if (!active) return;
          setCatalogError(loadError.message || 'Unable to load products right now.');
        })
        .finally(() => {
          if (active) setProductsLoading(false);
        });

      await Promise.allSettled([configRequest, productsRequest]);
    }

    loadStore();
    return () => {
      active = false;
    };
  }, []);

  const shouldResumeCheckout = Boolean(location.state?.openCheckout && cart.length && isAuthenticated);

  useEffect(() => {
    if (!shouldResumeCheckout) {
      return;
    }

    setCheckoutOpen(true);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, navigate, shouldResumeCheckout]);

  useEffect(() => {
    const persistedReturnState = readStoredStorefrontReturnState();
    const state = location.state || persistedReturnState || {};
    const sectionId = state.scrollTo;
    const restoreCategory = state.restoreCategory;
    const restoreSearch = typeof state.restoreSearch === 'string'
      ? state.restoreSearch
      : null;
    const restoreScrollY = Number.isFinite(state.restoreScrollY) ? Number(state.restoreScrollY) : null;
    const restoreTrackId = String(state.restoreTrackId || '').trim();
    const restoreTrackScrollLeft = Number.isFinite(state.restoreTrackScrollLeft)
      ? Number(state.restoreTrackScrollLeft)
      : 0;

    if (!sectionId && !restoreCategory && restoreSearch === null && restoreScrollY === null && !restoreTrackId) {
      return;
    }

    if (restoreCategory) {
      setActiveCategory(restoreCategory);
    }

    if (restoreSearch !== null) {
      setSearch(restoreSearch);
    }

    if (restoreTrackId) {
      restoreTrackScroll(restoreTrackId, restoreTrackScrollLeft);
    }

    if (restoreScrollY !== null) {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: restoreScrollY, left: 0, behavior: 'auto' });
      });
    } else if (sectionId) {
      scrollToSection(sectionId, { behavior: 'auto' });
    }

    clearStoredStorefrontReturnState();

    if (location.state) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate, productsLoading]);

  useEffect(() => {
    if (!location.state?.openCart) {
      return;
    }

    setCartOpen(true);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryMatch = activeCategory === 'All' || product.category === activeCategory;
      const searchMatch = `${product.name} ${product.description} ${product.category}`
        .toLowerCase()
        .includes(search.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [products, activeCategory, search]);

  const featuredProducts = useMemo(() => products.filter((p) => p.featured), [products]);

  const whatsappLink = useMemo(() => {
    const phone = normalizePhoneNumber(config.whatsappNumber);
    return phone ? `https://wa.me/${phone}` : '';
  }, [config.whatsappNumber]);

  const twitterLink = useMemo(
    () => resolveTwitterUrl(config.twitterUrl || config.twitterHandle || ''),
    [config.twitterHandle, config.twitterUrl],
  );

  const handleCatalogBrowse = ({ category = 'All', searchTerm = '', sectionId = catalogSectionId } = {}) => {
    setSearch(searchTerm);
    setActiveCategory(category);
    scrollToSection(sectionId);
  };

  const handleBrowseCollection = () => {
    scrollToSection(featuredProducts.length ? featuredCollectionSectionId : catalogSectionId);
  };

  const handleFooterCategoryClick = (categoryTitle) => {
    handleCatalogBrowse({ category: categoryTitle });
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const checkoutEstimate = cartSubtotal + (cart.length ? config.deliveryFee : 0);

  const updateQuantity = (id, nextQuantity) => {
    if (nextQuantity <= 0) {
      setCart((currentCart) => currentCart.filter((item) => item.id !== id));
      return;
    }

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id ? { ...item, quantity: nextQuantity } : item,
      ),
    );
  };

  const removeFromCart = (id) =>
    setCart((currentCart) => currentCart.filter((item) => item.id !== id));

  const openCheckoutFlow = () => {
    if (!cart.length) {
      setNotice('Add at least one product to the cart before proceeding to checkout.');
      setCartOpen(true);
      return;
    }

    setCheckoutOpen(true);
  };

  const placeOrder = async ({ customerName, customerPhone, customerEmail, shippingAddress, notes, total, paymentMethod }) => {
    const resolvedCustomerName = user?.name || customerName;
    const resolvedCustomerEmail = user?.email || customerEmail;

    if (paymentMethod === 'WhatsApp') {
      const whatsappCheckoutLink = buildWhatsAppOrderLink({
        phoneNumber: config.whatsappNumber,
        customerName: resolvedCustomerName,
        customerPhone,
        customerEmail: resolvedCustomerEmail,
        shippingAddress,
        notes,
        cart,
        deliveryFee: Number(config.deliveryFee || 0),
        total,
      });

      if (!whatsappCheckoutLink) {
        setNotice('WhatsApp checkout is not available yet because the business number is missing in store settings.');
        return;
      }

      setCheckoutOpen(false);
      setCartOpen(false);
      setCart([]);
      window.location.href = whatsappCheckoutLink;
      return;
    }

    if (!isAuthenticated) {
      setCheckoutOpen(false);
      setCartOpen(false);
      navigate('/login', { state: { from: '/', reason: 'checkout', openCheckout: true } });
      return;
    }

    if (!resolvedCustomerEmail) {
      setNotice('Email address is required for Flutterwave payment.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.createFlutterwaveCheckout(
        {
          customerName: resolvedCustomerName,
          customerPhone,
          customerEmail: resolvedCustomerEmail,
          shippingAddress,
          notes,
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        },
        token,
      );

      setCheckoutOpen(false);
      setCartOpen(false);
      window.location.href = response.data.paymentLink;
    } catch (checkoutError) {
      setNotice(checkoutError.message || 'Unable to start Flutterwave checkout.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      <Header
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        showTransactionSection={isAuthenticated}
      />
      <HeroSection
        notice={config.heroNotice}
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        onBrowseCollection={handleBrowseCollection}
      />

      {notice ? (
        <div className="mx-auto max-w-7xl px-4 pt-6 md:px-6 lg:px-8">
          <div className="rounded-[1.4rem] border border-[var(--gold)]/25 bg-[var(--gold)]/10 px-4 py-3 text-center text-sm text-[var(--text-primary)]">
            {notice}
          </div>
        </div>
      ) : null}

      <main>
        {/* CATEGORIES */}
        <section className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-12 lg:px-8">
          <SectionTitle
            eyebrow="Categories"
            title="Curated scent essentials"
            description="Quickly jump into the scent category you want to shop."
            align="center"
          />
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-3 xl:grid-cols-5">
            {categoryCards.map(({ title, text, icon: Icon }) => (
              <button
                key={title}
                type="button"
                onClick={() => handleCatalogBrowse({ category: title })}
                className="luxe-panel w-full rounded-[1.2rem] p-3 text-center transition hover:-translate-y-1 hover:border-[var(--gold)]/30 sm:p-4"
              >
                <span className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-[0.85rem] border border-[var(--gold)]/20 bg-[linear-gradient(135deg,rgba(216,192,122,0.18),rgba(216,192,122,0.05))] text-[var(--gold-soft)] sm:h-11 sm:w-11">
                  <Icon size={17} />
                </span>
                <h3 className="mt-2.5 font-display text-lg leading-tight text-[var(--gold-soft)] sm:text-xl">{title}</h3>
                <p className="mt-1.5 text-[11px] leading-5 text-[var(--text-secondary)] sm:text-xs sm:leading-5">{text}</p>
                <span className="mt-2.5 inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--gold-soft)] sm:text-[11px]">
                  Browse
                  <ArrowRight size={13} />
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* FEATURED COLLECTION - horizontal scrollable */}
        {featuredProducts.length > 0 ? (
          <section id={featuredCollectionSectionId} className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10 lg:px-8">
            <SectionTitle
              eyebrow="Featured"
              title="Featured collection"
              description="A compact product-first row. Tap any item to open its full details page."
              align="left"
            />

            <div className="relative">
              <div
                className="scrollbar-thin flex gap-4 overflow-x-auto pb-4"
                style={{ scrollSnapType: 'x mandatory' }}
                data-store-scroll-track="collections"
              >
                {featuredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="w-[240px] shrink-0 sm:w-[250px] lg:w-[260px]"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <ProductCard
                      product={product}
                      compact
                      linkState={{
                        fromPath: '/',
                        scrollTo: featuredCollectionSectionId,
                        restoreCategory: 'All',
                        restoreSearch: '',
                      }}
                    />
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-[var(--text-muted)]">← Scroll left or right to browse the featured collection →</p>
            </div>
          </section>
        ) : null}

        {/* SHOP - full catalog */}
        <section id={catalogSectionId} className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
          <div className="text-center">
            <SectionTitle
              eyebrow="Shop"
              title="Shop the full catalog"
              description="Browse the full catalog with product image, name, and price up front before opening details."
              align="center"
            />
            <div className="mx-auto w-full max-w-md">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search perfume, spray, diffuser..."
                className="input-style text-center"
              />
            </div>
          </div>

          <div className="mt-5">
            <CategoryStrip
              activeCategory={activeCategory}
              onChangeCategory={setActiveCategory}
            />
          </div>

          {productsLoading ? (
            <div className="mt-8 rounded-[1.8rem] border border-[var(--line)] bg-white/[0.03] p-8 text-center text-sm text-[var(--text-secondary)]">
              Loading products...
            </div>
          ) : catalogError ? (
            <div className="mt-8 rounded-[1.8rem] border border-rose-500/20 bg-rose-500/10 p-8 text-center text-sm text-rose-200">
              {catalogError}
            </div>
          ) : filteredProducts.length ? (
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  linkState={{
                    fromPath: '/',
                    scrollTo: catalogSectionId,
                    restoreCategory: activeCategory,
                    restoreSearch: search,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-[1.8rem] border border-dashed border-[var(--line)] bg-white/[0.03] p-8 text-center">
              <p className="font-display text-3xl text-[var(--text-primary)]">No products found</p>
              <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                Try another keyword or switch the active category.
              </p>
            </div>
          )}
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-4 md:px-6 lg:grid-cols-2 lg:px-8">
          <InfoPanel
            icon={<ShieldCheck size={18} />}
            title="Trusted fulfilment"
            text="Orders are reviewed with clear delivery details, payment tracking, and store-side management."
          />
          <InfoPanel
            icon={<MessageCircle size={18} />}
            title="WhatsApp assistance"
            text="Reach the Kunleluxe team directly for product questions, stock availability, or delivery updates."
          />
        </section>

        {cartCount > 0 ? (
          <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
            <div className="rounded-[2rem] border border-[var(--line)] bg-[#101111] p-6 shadow-[0_24px_70px_rgba(0,0,0,.38)] lg:p-7">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-green)]">Checkout</p>
                  <h3 className="mt-2 font-display text-4xl text-[var(--text-primary)]">Ready to complete an order</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                    Checkout now supports both direct WhatsApp handoff and Flutterwave payment in one continuous mobile-friendly flow.
                  </p>
                </div>
                <PackageCheck className="shrink-0 text-[var(--gold)]" size={24} />
              </div>

              <div className="mt-6 grid gap-4 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5 sm:grid-cols-3">
                <SummaryTile label="Items" value={String(cartCount)} />
                <SummaryTile label="Subtotal" value={formatPrice(cartSubtotal)} />
                <SummaryTile label="Estimated total" value={formatPrice(checkoutEstimate)} />
              </div>

              <div className="mt-6 grid gap-3 lg:grid-cols-2">
                {[
                  'WhatsApp checkout sends the order directly to the store owner without saving it to admin transactions.',
                  'Flutterwave remains available for customers who want instant online payment confirmation.',
                  `Delivery fee is currently ${formatPrice(config.deliveryFee)} and is shown before you confirm the order.`,
                  'The checkout form is optimized for smooth scrolling on mobile devices.',
                ].map((line) => (
                  <div key={line} className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-[var(--text-secondary)]">
                    {line}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={openCheckoutFlow}
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--gold-soft),var(--gold))] px-6 py-3 text-sm font-semibold text-[#1b140b] shadow-[0_10px_24px_rgba(216,192,122,0.18)] transition hover:-translate-y-0.5"
                >
                  Open checkout
                  <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setCartOpen(true)}
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white/5 px-6 py-3 text-sm font-semibold text-[var(--text-primary)] transition hover:-translate-y-0.5 hover:border-[var(--gold)]/35"
                >
                  Review cart
                </button>
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <CartDrawer
        open={cartOpen}
        cart={cart}
        onClose={() => setCartOpen(false)}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onCheckout={openCheckoutFlow}
      />
      {checkoutOpen || shouldResumeCheckout ? (
        <CheckoutModal
          open={checkoutOpen || shouldResumeCheckout}
          cart={cart}
          deliveryFee={config.deliveryFee}
          onClose={() => setCheckoutOpen(false)}
          onPlaceOrder={placeOrder}
          submitting={submitting}
          customerProfile={user}
          isAuthenticated={isAuthenticated}
          whatsappNumber={config.whatsappNumber}
        />
      ) : null}

      <footer className="border-t border-[var(--line)] bg-[#090909]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:px-6 lg:grid-cols-[1.1fr_0.9fr_0.9fr] lg:px-8">
          <div>
            <div className="inline-flex items-center gap-3">
              <img
                src="/kunleluxe-logo.png"
                alt={`${brand.name} logo`}
                className="h-12 w-auto rounded-[0.9rem] object-contain"
              />
              <div>
                <p className="font-display text-3xl leading-none text-[var(--gold-soft)]">{brand.name}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-[var(--text-secondary)]">
                  Luxe fragrance store
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-md text-sm leading-7 text-[var(--text-secondary)]">
              Premium fragrances and scent essentials with elegant browsing, secure payments, and direct customer support.
            </p>
          </div>

          <div>
            <h3 className="font-display text-3xl text-[var(--gold-soft)]">Categories</h3>
            <div className="mt-4 space-y-3 text-sm text-[var(--text-secondary)]">
              {categoryCards.map((category) => (
                <button
                  key={category.title}
                  type="button"
                  onClick={() => handleFooterCategoryClick(category.title)}
                  className="block text-left transition hover:text-[var(--text-primary)]"
                >
                  {category.title}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display text-3xl text-[var(--gold-soft)]">Contact</h3>
            <div className="mt-4 space-y-3 text-sm text-[var(--text-secondary)]">
              <ContactLink
                icon={<Mail size={18} />}
                label="Email"
                value={config.supportEmail ? 'Send us an email' : 'Email not set'}
                href={config.supportEmail ? `mailto:${config.supportEmail}` : ''}
              />
              <ContactLink
                icon={<TwitterIcon />}
                label="Twitter"
                value={twitterLink ? 'Follow us on X' : 'Twitter not set'}
                href={twitterLink}
              />
              <ContactLink
                icon={<WhatsAppIcon />}
                label="WhatsApp"
                value={whatsappLink ? 'Chat with us on WhatsApp' : 'WhatsApp not set'}
                href={whatsappLink}
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function InfoPanel({ icon, title, text }) {
  return (
    <div className="rounded-[1.6rem] border border-[var(--line)] bg-white/[0.03] p-5 text-center">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--gold)]/10 text-[var(--gold)]">
        {icon}
      </div>
      <h3 className="mt-4 font-display text-2xl text-[var(--text-primary)]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{text}</p>
    </div>
  );
}

function SummaryTile({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-secondary)]">{label}</p>
      <p className="mt-2 font-display text-2xl text-[var(--gold-soft)]">{value}</p>
    </div>
  );
}

function ContactLink({ icon, label, value, href }) {
  const clickable = Boolean(href);
  const external = /^https?:\/\//i.test(href || '');
  const classes = `flex items-center gap-3 rounded-[1.2rem] border border-[var(--line)] bg-white/[0.03] px-4 py-3 transition ${
    clickable
      ? 'hover:border-[var(--gold)]/35 hover:text-[var(--text-primary)]'
      : 'cursor-not-allowed opacity-70'
  }`;

  const content = (
    <>
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--gold)]/10 text-[var(--gold)]">
        {icon}
      </span>
      <span>
        <span className="block text-xs uppercase tracking-[0.22em] text-[var(--text-secondary)]">{label}</span>
        <span className="mt-1 block text-sm text-[var(--text-primary)]">{value}</span>
      </span>
    </>
  );

  if (!clickable) {
    return <div className={classes}>{content}</div>;
  }

  return external ? (
    <a href={href} target="_blank" rel="noreferrer" className={classes}>
      {content}
    </a>
  ) : (
    <a href={href} className={classes}>
      {content}
    </a>
  );
}

function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-current">
      <path d="M18.9 2H22l-6.77 7.74L23 22h-6.53l-5.12-6.73L5.44 22H2.33l7.24-8.28L1 2h6.69l4.63 6.1L18.9 2Zm-1.15 18h1.72L6.75 3.9H4.9L17.75 20Z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-current">
      <path d="M20.52 3.48A11.85 11.85 0 0 0 12.07 0C5.55 0 .24 5.3.24 11.82c0 2.08.54 4.11 1.57 5.91L0 24l6.45-1.69a11.77 11.77 0 0 0 5.61 1.43h.01c6.52 0 11.83-5.3 11.83-11.82 0-3.16-1.23-6.12-3.38-8.44ZM12.07 21.7h-.01a9.84 9.84 0 0 1-5.02-1.37l-.36-.21-3.83 1 1.02-3.74-.24-.38a9.8 9.8 0 0 1-1.51-5.18c0-5.41 4.41-9.82 9.85-9.82 2.63 0 5.1 1.02 6.95 2.88a9.76 9.76 0 0 1 2.89 6.95c0 5.41-4.42 9.82-9.84 9.82Zm5.39-7.38c-.3-.15-1.75-.87-2.03-.97-.27-.1-.47-.15-.67.15s-.77.97-.94 1.17c-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.46-.88-.79-1.47-1.76-1.64-2.06-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.29.3-.49.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.91-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.46 0 1.45 1.07 2.86 1.22 3.06.15.2 2.08 3.18 5.03 4.46.7.3 1.25.48 1.68.61.71.22 1.36.19 1.87.12.57-.08 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.12-.27-.2-.57-.34Z" />
    </svg>
  );
}
