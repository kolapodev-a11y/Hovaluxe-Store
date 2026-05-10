import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Cloud,
  CreditCard,
  Droplets,
  Flame,
  Gem,
  Mail,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  Sparkles,
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
import { formatPrice } from '../utils/format';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const fallbackConfig = {
  deliveryFee: 2500,
  whatsappNumber: '0816 114 8918',
  supportEmail: 'henryolakunle8@gmail.com',
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

const scrollToSection = (sectionId) => {
  if (typeof document === 'undefined') return;
  window.requestAnimationFrame(() => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
};

export function StorefrontPage() {
  const { token, isAdmin } = useAuth();
  const [config, setConfig] = useState(fallbackConfig);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useLocalStorage('hovaluxe_cart', []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadStore() {
      try {
        const [configResponse, productsResponse] = await Promise.all([
          api.getPublicConfig(),
          api.getProducts(),
        ]);

        if (!active) return;

        setConfig({ ...fallbackConfig, ...(configResponse.data || {}) });
        setProducts((productsResponse.data || []).map((product) => normalizeProduct(product)));
        setError('');
      } catch (loadError) {
        if (!active) return;
        setError(loadError.message || 'Unable to load the storefront right now.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadStore();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!cart.length && checkoutOpen) {
      setCheckoutOpen(false);
    }
  }, [cart.length, checkoutOpen]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryMatch = activeCategory === 'All' || product.category === activeCategory;
      const searchMatch = `${product.name} ${product.description} ${product.category}`
        .toLowerCase()
        .includes(search.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [products, activeCategory, search]);

  const featuredProducts = useMemo(
    () => products.filter((product) => product.featured).slice(0, 3),
    [products],
  );
  const showFeaturedSection = Boolean(featuredProducts.length || isAdmin);

  const whatsappLink = useMemo(() => {
    const phone = normalizePhoneNumber(config.whatsappNumber);
    return phone ? `https://wa.me/${phone}` : '';
  }, [config.whatsappNumber]);

  const twitterLink = useMemo(
    () => resolveTwitterUrl(config.twitterUrl || config.twitterHandle || ''),
    [config.twitterHandle, config.twitterUrl],
  );

  const handleFooterCategoryClick = (categoryTitle) => {
    setSearch('');
    setActiveCategory(categoryTitle);
    scrollToSection(catalogSectionId);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const checkoutEstimate = cartSubtotal + (cart.length ? config.deliveryFee : 0);

  const addToCart = (product) => {
    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.id === product.id);
      if (existing) {
        return currentCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });
    setCartOpen(true);
    setNotice(`${product.name} was added to your cart.`);
  };

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

  const placeOrder = async ({ customerName, customerPhone, customerEmail, shippingAddress, notes, paymentMethod, total }) => {
    const itemsSummary = cart
      .map((item) => `${item.name} × ${item.quantity}`)
      .join(', ');

    if (paymentMethod === 'WhatsApp') {
      if (!config.whatsappNumber) {
        setNotice('WhatsApp ordering is not configured yet. Please contact the store directly.');
        return;
      }

      const orderMessage = encodeURIComponent(
        `Hello ${brand.name}, I want to place an order.\n\nName: ${customerName}\nPhone: ${customerPhone}\nEmail: ${customerEmail || 'Not provided'}\nAddress: ${shippingAddress}\nItems: ${itemsSummary}\nTotal: ${formatPrice(total)}\nNotes: ${notes || 'None'}\n\nPlease confirm availability and next steps.`,
      );

      window.open(`https://wa.me/${config.whatsappNumber}?text=${orderMessage}`, '_blank');
      setCart([]);
      setCheckoutOpen(false);
      setCartOpen(false);
      setNotice('Your order details were sent to WhatsApp. The Hovaluxe team will confirm the order manually.');
      return;
    }

    if (!customerEmail) {
      setNotice('Email address is required for Flutterwave payment.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.createFlutterwaveCheckout(
        {
          customerName,
          customerPhone,
          customerEmail,
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
      <Header cartCount={cartCount} onCartOpen={() => setCartOpen(true)} canAccessCheckout={cartCount > 0} />
      <HeroSection notice={config.heroNotice} cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />

      {notice ? (
        <div className="mx-auto max-w-7xl px-4 pt-6 md:px-6 lg:px-8">
          <div className="rounded-[1.4rem] border border-[var(--gold)]/25 bg-[var(--gold)]/10 px-4 py-3 text-center text-sm text-[var(--text-primary)]">
            {notice}
          </div>
        </div>
      ) : null}

      <main>
        <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Categories"
            title="Curated scent essentials"
            description="Explore the product families that shape the Hovaluxe store experience."
            align="center"
          />
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
            {categoryCards.map(({ title, text, icon: Icon }) => (
              <article
                key={title}
                className="luxe-panel rounded-[1.6rem] p-5 text-center transition hover:-translate-y-1"
              >
                <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-[1.1rem] border border-[var(--gold)]/20 bg-[linear-gradient(135deg,rgba(216,192,122,0.18),rgba(216,192,122,0.05))] text-[var(--gold-soft)]">
                  <Icon size={22} />
                </span>
                <h3 className="mt-4 font-display text-[2rem] text-[var(--gold-soft)]">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{text}</p>
              </article>
            ))}
          </div>
        </section>

        {showFeaturedSection ? (
          <section id="collections" className="mx-auto max-w-7xl px-4 py-4 md:px-6 lg:px-8">
            <div className="luxe-panel rounded-[2rem] p-6 md:p-8">
              <SectionTitle
                eyebrow="Featured collection"
                title="Best sellers and spotlight products"
                description="Showcase the products you want customers to notice first."
                align="center"
              />
              <div className="grid gap-4 md:grid-cols-3">
                {featuredProducts.length ? featuredProducts.map((product) => (
                  <div key={product.id} className="overflow-hidden rounded-[1.5rem] border border-white/8 bg-[#101111] text-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-56 w-full object-cover"
                    />
                    <div className="p-5">
                      <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-secondary)]">{product.category}</p>
                      <p className="mt-2 font-display text-3xl text-[var(--text-primary)]">{product.name}</p>
                      <p className="mt-2 text-sm text-[var(--gold)]">{formatPrice(product.price)}</p>
                    </div>
                  </div>
                )) : isAdmin ? (
                  <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[#101111] p-6 text-center text-sm text-[var(--text-secondary)] md:col-span-3">
                    Add featured products from the admin panel to highlight them here.
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        <section id={catalogSectionId} className="mx-auto max-w-7xl px-4 py-14 md:px-6 lg:px-8">
          <div className="text-center">
            <SectionTitle
              eyebrow="Shop"
              title="Browse the full catalog"
              description="Search products and filter by category."
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

          {loading ? (
            <div className="mt-8 rounded-[1.8rem] border border-[var(--line)] bg-white/[0.03] p-8 text-center text-sm text-[var(--text-secondary)]">
              Loading products...
            </div>
          ) : error ? (
            <div className="mt-8 rounded-[1.8rem] border border-rose-500/20 bg-rose-500/10 p-8 text-center text-sm text-rose-200">
              {error}
            </div>
          ) : filteredProducts.length ? (
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
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
            icon={<MessageCircle size={18} />}
            title="WhatsApp assistance"
            text="Send a ready-made order summary for stock confirmation, delivery follow-up, and direct support."
          />
          <InfoPanel
            icon={<ShieldCheck size={18} />}
            title="Trusted fulfilment"
            text="Orders are reviewed with clear delivery details, payment tracking, and store-side management."
          />
        </section>

        {cartCount > 0 ? (
          <section id="payments" className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="luxe-panel rounded-[2rem] p-6 lg:p-7">
                <SectionTitle
                  eyebrow="Payments"
                  title="Checkout your way"
                  description="Payment options are shown only after products have been added to the cart."
                />
                <div className="space-y-4">
                  <PaymentRow
                    icon={<MessageCircle size={18} />}
                    title="WhatsApp order"
                    body="Opens a structured order message with your customer details, selected items, and delivery address."
                  />
                  <PaymentRow
                    icon={<CreditCard size={18} />}
                    title="Flutterwave"
                    body="Creates a secure checkout session for online payment and order confirmation."
                  />
                </div>

                <div className="mt-6 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5 text-sm text-[var(--text-secondary)]">
                  <div className="flex items-start gap-3">
                    <Sparkles size={18} className="mt-0.5 text-[var(--gold)]" />
                    <p>
                      Delivery fee is currently set to <span className="text-[var(--gold-soft)]">{formatPrice(config.deliveryFee)}</span>. Customers can review this before completing checkout.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-[var(--line)] bg-[#101111] p-6 shadow-[0_24px_70px_rgba(0,0,0,.38)] lg:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-green)]">Active checkout</p>
                    <h3 className="mt-2 font-display text-4xl text-[var(--text-primary)]">Ready to complete an order</h3>
                  </div>
                  <PackageCheck className="text-[var(--gold)]" size={24} />
                </div>

                <div className="mt-6 grid gap-4 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5 sm:grid-cols-3">
                  <SummaryTile label="Items" value={String(cartCount)} />
                  <SummaryTile label="Subtotal" value={formatPrice(cartSubtotal)} />
                  <SummaryTile label="Estimated total" value={formatPrice(checkoutEstimate)} />
                </div>

                <div className="mt-6 space-y-3">
                  {[
                    'Customer details are collected inside a responsive mobile-friendly checkout flow.',
                    'WhatsApp and Flutterwave stay available in the same order experience.',
                    'Payment only appears after products are added to the cart.',
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
      <CheckoutModal
        open={checkoutOpen}
        cart={cart}
        deliveryFee={config.deliveryFee}
        onClose={() => setCheckoutOpen(false)}
        onPlaceOrder={placeOrder}
        submitting={submitting}
      />

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
                value={config.supportEmail || 'Email not set'}
                href={config.supportEmail ? `mailto:${config.supportEmail}` : ''}
              />
              <ContactLink
                icon={<TwitterIcon />}
                label="Twitter"
                value={config.twitterHandle || config.twitterUrl || 'Twitter not set'}
                href={twitterLink}
              />
              <ContactLink
                icon={<WhatsAppIcon />}
                label="WhatsApp"
                value={config.whatsappNumber || 'WhatsApp not set'}
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

function PaymentRow({ icon, title, body }) {
  return (
    <div className="flex gap-4 rounded-[1.4rem] border border-[var(--line)] bg-[#111314] p-4 text-left">
      <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--gold)]/10 text-[var(--gold)]">
        {icon}
      </div>
      <div>
        <h4 className="text-base font-medium text-[var(--text-primary)]">{title}</h4>
        <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{body}</p>
      </div>
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
