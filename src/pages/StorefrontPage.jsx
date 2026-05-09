import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Cloud,
  CreditCard,
  Droplets,
  Flame,
  Gem,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Wallet,
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
  whatsappNumber: '',
  supportEmail: 'hello@hovaluxe.com',
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

export function StorefrontPage() {
  const { token } = useAuth();
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
              )) : (
                <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[#101111] p-6 text-center text-sm text-[var(--text-secondary)] md:col-span-3">
                  Add featured products from the admin panel to highlight them here.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 md:px-6 lg:px-8">
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

        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-4 md:px-6 lg:grid-cols-3 lg:px-8">
          <InfoPanel
            icon={<MessageCircle size={18} />}
            title="WhatsApp assistance"
            text="Send a ready-made order summary for stock confirmation, delivery follow-up, and direct support."
          />
          <InfoPanel
            icon={<Wallet size={18} />}
            title="Flutterwave payments"
            text="Move from cart to secure checkout quickly when you are ready to complete the order online."
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
                <a key={category.title} href="#collections" className="block transition hover:text-[var(--text-primary)]">
                  {category.title}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display text-3xl text-[var(--gold-soft)]">Payments</h3>
            <div className="mt-4 space-y-3 text-sm text-[var(--text-secondary)]">
              {cartCount > 0 ? (
                <>
                  <a href="#payments" className="block transition hover:text-[var(--text-primary)]">WhatsApp</a>
                  <a href="#payments" className="block transition hover:text-[var(--text-primary)]">Flutterwave</a>
                </>
              ) : (
                <p>Add a product to cart to unlock checkout options.</p>
              )}
              <p>{config.supportEmail}</p>
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
