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
    text: 'Long-lasting signature scents for daily wear and special moments.',
    icon: Gem,
  },
  {
    title: 'Body Spray',
    text: 'Fresh and expressive sprays with light but noticeable projection.',
    icon: Wind,
  },
  {
    title: 'Roll Ons',
    text: 'Compact fragrance oils and portable daily touch-up essentials.',
    icon: Droplets,
  },
  {
    title: 'Diffusers',
    text: 'Elegant room fragrance pieces for homes, offices, and gift sets.',
    icon: Flame,
  },
  {
    title: 'Humidifiers',
    text: 'Functional scent-tech for soft ambience and cleaner aromatic spaces.',
    icon: Cloud,
  },
];

const catalogSectionId = 'catalog';

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
    'Hello Hovaluxe, I would like to place an order.',
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

const scrollToSection = (sectionId) => {
  if (typeof document === 'undefined') return;
  window.requestAnimationFrame(() => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
};

export function StorefrontPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user, isAuthenticated } = useAuth();
  const [config, setConfig] = useState(fallbackConfig);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useLocalStorage('hovaluxe_cart', []);

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
    const sectionId = location.state?.scrollTo;
    const restoreCategory = location.state?.restoreCategory;
    const restoreSearch = typeof location.state?.restoreSearch === 'string'
      ? location.state.restoreSearch
      : null;

    if (!sectionId && !restoreCategory && restoreSearch === null) {
      return;
    }

    if (restoreCategory) {
      setActiveCategory(restoreCategory);
    }

    if (restoreSearch !== null) {
      setSearch(restoreSearch);
    }

    if (sectionId) {
      scrollToSection(sectionId);
    }

    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

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
        onShopCollection={() => handleCatalogBrowse({ category: 'All' })}
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
        <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Categories"
            title="Curated scent essentials"
            description="Explore the product families that shape the Hovaluxe store experience."
            align="center"
          />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            {categoryCards.map(({ title, text, icon: Icon }) => (
              <button
                key={title}
                type="button"
                onClick={() => handleCatalogBrowse({ category: title })}
                className="luxe-panel w-full rounded-[1.35rem] p-4 text-center transition hover:-translate-y-1 hover:border-[var(--gold)]/30 sm:p-[1.125rem]"
              >
                <span className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-[0.9rem] border border-[var(--gold)]/20 bg-[linear-gradient(135deg,rgba(216,192,122,0.18),rgba(216,192,122,0.05))] text-[var(--gold-soft)] sm:h-12 sm:w-12">
                  <Icon size={18} />
                </span>
                <h3 className="mt-3 font-display text-xl leading-tight text-[var(--gold-soft)] sm:text-2xl">{title}</h3>
                <p className="mt-2 text-xs leading-6 text-[var(--text-secondary)] sm:text-sm sm:leading-6">{text}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--gold-soft)] sm:text-xs">
                  Browse
                  <ArrowRight size={13} />
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* FEATURED COLLECTION - horizontal scrollable */}
        {featuredProducts.length > 0 ? (
          <section id="collections" className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8">
            <SectionTitle
              eyebrow="Featured"
              title="Featured collection"
              description="A clean product-first display. Tap any item to open its full details page."
              align="left"
            />

            <div className="relative">
              <div
                className="scrollbar-thin flex gap-5 overflow-x-auto pb-4"
                style={{ scrollSnapType: 'x mandatory' }}
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
                        scrollTo: 'collections',
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
        <section id={catalogSectionId} className="mx-auto max-w-7xl px-4 py-14 md:px-6 lg:px-8">
          <div className="text-center">
            <SectionTitle
              eyebrow="Shop"
              title="Shop the full catalog"
              description="Only product image, name, and price appear here first. Click any product to view its full details and larger images."
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

          <div className="mt-6">
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
            text="Reach the Hovaluxe team directly for product questions, stock availability, or delivery updates."
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
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--gold)]/25 bg-[linear-gradient(135deg,#181613,#0c0c0d)] text-[var(--gold)] shadow-[0_0_30px_rgba(216,192,122,.16)]">
                <Gem size={20} />
              </div>
              <div>
                <p className="font-display text-3xl leading-none text-[var(--gold-soft)]">{brand.name}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-[var(--text-secondary)]">
                  Luxury fragrance store
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

  return (
    <a
      href={href}
      className={classes}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      {content}
    </a>
  );
}

function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]" aria-hidden="true">
      <path d="M18.901 2H22l-6.77 7.738L23 22h-6.109l-4.785-7.406L5.622 22H2.521l7.24-8.274L2 2h6.264l4.326 6.718L18.901 2Zm-1.071 18h1.689L7.347 3.894H5.535L17.83 20Z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]" aria-hidden="true">
      <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.55 2 2.08 6.47 2.08 11.96c0 1.75.46 3.47 1.33 4.98L2 22l5.21-1.37a9.9 9.9 0 0 0 4.83 1.24h.01c5.49 0 9.96-4.47 9.96-9.96 0-2.66-1.03-5.16-2.96-7ZM12.05 20.2h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.09.81.82-3.02-.2-.31a8.2 8.2 0 0 1-1.26-4.39c0-4.54 3.69-8.23 8.24-8.23a8.18 8.18 0 0 1 5.84 2.42 8.17 8.17 0 0 1 2.4 5.81c0 4.54-3.69 8.24-8.23 8.24Zm4.51-6.17c-.25-.12-1.47-.73-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.98-.15.17-.29.19-.54.06-.25-.12-1.04-.38-1.99-1.21-.74-.66-1.24-1.47-1.39-1.72-.15-.25-.02-.38.11-.51.11-.11.25-.29.38-.44.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08s.89 2.41 1.01 2.58c.12.17 1.74 2.66 4.21 3.73.59.25 1.05.4 1.41.52.59.19 1.12.16 1.54.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.06-.11-.23-.17-.48-.29Z" />
    </svg>
  );
}
