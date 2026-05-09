import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Wallet,
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

const fallbackConfig = {
  deliveryFee: 2500,
  whatsappNumber: '',
  supportEmail: 'hello@hovaluxe.com',
  currency: 'NGN',
  heroNotice: 'Nationwide delivery available',
};

export function StorefrontPage() {
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
      const response = await api.createFlutterwaveCheckout({
        customerName,
        customerPhone,
        customerEmail,
        shippingAddress,
        notes,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      });

      setCheckoutOpen(false);
      setCartOpen(false);
      window.location.href = response.data.paymentLink;
    } catch (checkoutError) {
      setNotice(checkoutError.message || 'Unable to start Flutterwave checkout.');
    } finally {
      setSubmitting(false);
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      <Header cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />
      <HeroSection notice={config.heroNotice} />

      {notice ? (
        <div className="mx-auto max-w-7xl px-4 pt-6 md:px-6 lg:px-8">
          <div className="rounded-[1.4rem] border border-[var(--gold)]/25 bg-[var(--gold)]/10 px-4 py-3 text-sm text-[var(--text-primary)] text-center">
            {notice}
          </div>
        </div>
      ) : null}

      <main>
        <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Luxury categories"
            title="Curated scent families and home fragrance essentials"
            description="Explore signature perfumes, daily freshness picks, roll ons, diffusers, and humidifiers designed for refined everyday living."
            align="center"
          />
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
            {[
              ['Perfume', 'Signature scents for day and night.'],
              ['Body Spray', 'Fresh, affordable daily freshness.'],
              ['Roll Ons', 'Portable oils for quick re-application.'],
              ['Diffusers', 'Ambient home fragrance collection.'],
              ['Humidifiers', 'Lifestyle devices for aromatic spaces.'],
            ].map(([title, text]) => (
              <div
                key={title}
                className="rounded-[1.6rem] border border-[var(--line)] bg-white/[0.03] p-5 text-center"
              >
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-green)]">
                  {title}
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="collections" className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-[var(--line)] bg-[linear-gradient(135deg,rgba(226,201,138,.08),rgba(24,181,106,.05))] p-6 md:p-8">
            <SectionTitle
              eyebrow="Featured set"
              title="A polished selection ready for the spotlight"
              description="Highlight your best-selling fragrances and seasonal favorites while the full catalog stays easy to browse below."
              align="center"
            />
            <div className="grid gap-4 md:grid-cols-3">
              {featuredProducts.length ? featuredProducts.map((product) => (
                <div key={product.id} className="rounded-[1.5rem] border border-[var(--line)] bg-[#101111] p-4 text-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-52 w-full rounded-[1.2rem] object-cover"
                  />
                  <p className="mt-3 text-sm uppercase tracking-[0.22em] text-[var(--text-secondary)]">{product.category}</p>
                  <p className="mt-2 font-display text-3xl text-[var(--text-primary)]">{product.name}</p>
                  <p className="mt-2 text-sm text-[var(--gold)]">{formatPrice(product.price)}</p>
                </div>
              )) : (
                <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[#101111] p-6 text-sm text-[var(--text-secondary)] text-center md:col-span-3">
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
              title="Browse, search, and filter products quickly"
              description="Find the right scent or home fragrance piece with category filters, image magnification, and instant product search."
              align="center"
            />
            <div className="mx-auto w-full max-w-md">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search perfume, body spray, diffuser..."
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
                Try another keyword or switch the active category filter.
              </p>
            </div>
          )}
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:px-6 lg:grid-cols-[1fr_1fr_1fr] lg:px-8">
          <InfoPanel
            icon={<MessageCircle size={18} />}
            title="WhatsApp assistance"
            text="Send a ready-made order summary directly to the Hovaluxe team for confirmation, stock checks, and delivery follow-up."
          />
          <InfoPanel
            icon={<Wallet size={18} />}
            title="Flutterwave payments"
            text="Move from cart to secure payment quickly when you are ready to complete the order online."
          />
          <InfoPanel
            icon={<ShieldCheck size={18} />}
            title="Trusted order handling"
            text="Orders are reviewed and fulfilled with clear delivery details, payment tracking, and store-side management."
          />
        </section>

        <section id="payments" className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[2rem] border border-[var(--line)] bg-white/[0.03] p-6 text-center lg:text-left">
              <SectionTitle
                eyebrow="Payments"
                title="Two clear ways to complete your order"
                description="Choose the buying style that suits you best: instant secure checkout or direct chat with the store team."
              />
              <div className="space-y-4">
                <PaymentRow
                  icon={<MessageCircle size={18} />}
                  title="WhatsApp"
                  body="Opens a structured message with your details, delivery address, selected items, and total for quick order confirmation."
                />
                <PaymentRow
                  icon={<Wallet size={18} />}
                  title="Flutterwave"
                  body="Creates a secure checkout session so you can complete payment online and receive confirmation immediately."
                />
              </div>
            </div>

            <div className="rounded-[2rem] border border-[var(--line)] bg-[#101111] p-6 text-center">
              <div className="flex flex-col items-center gap-3">
                <PackageCheck className="text-[var(--gold)]" />
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-green)]">Why customers love it</p>
                  <h3 className="mt-2 font-display text-3xl text-[var(--text-primary)]">Simple, premium, and easy to trust</h3>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {[
                  'Luxury presentation designed for fragrance shopping.',
                  'Easy WhatsApp handoff for personalized guidance.',
                  'Secure Flutterwave payment for direct online checkout.',
                  `Standard delivery fee currently set to ${formatPrice(config.deliveryFee)}.`,
                ].map((line) => (
                  <div key={line} className="rounded-[1.4rem] border border-[var(--line)] bg-white/[0.03] p-4 text-sm text-[var(--text-secondary)]">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 md:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-[var(--line)] bg-[linear-gradient(135deg,rgba(17,19,20,1),rgba(24,181,106,.08))] p-8 text-center md:p-10">
            <div className="mx-auto max-w-4xl">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-green)]">Ready to order</p>
              <h3 className="mt-2 font-display text-4xl text-[var(--text-primary)]">Build your cart and choose the checkout path that fits you best</h3>
              <p className="mt-4 text-sm leading-8 text-[var(--text-secondary)] md:text-base">
                For fast support, use WhatsApp inside checkout. For direct online payment, continue with Flutterwave once your cart is ready.
              </p>
              <a
                href="#payments"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-6 py-3 text-sm font-semibold text-[#111]"
              >
                Review payment options
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </section>
      </main>

      <CartDrawer
        open={cartOpen}
        cart={cart}
        onClose={() => setCartOpen(false)}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onCheckout={() => setCheckoutOpen(true)}
      />
      <CheckoutModal
        open={checkoutOpen}
        cart={cart}
        deliveryFee={config.deliveryFee}
        onClose={() => setCheckoutOpen(false)}
        onPlaceOrder={placeOrder}
        submitting={submitting}
      />

      <footer className="border-t border-[var(--line)] bg-[#090a0b]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-center text-sm text-[var(--text-secondary)] md:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between xl:text-left">
          <p>
            {brand.name} • {config.heroNotice} • Delivery fee {formatPrice(config.deliveryFee)}
          </p>
          <div className="flex flex-wrap justify-center gap-3 xl:justify-end">
            <span className="inline-flex items-center gap-2">
              <PackageCheck size={16} /> Curated products
            </span>
            <span className="inline-flex items-center gap-2">
              <Sparkles size={16} /> Premium styling
            </span>
            <span className="inline-flex items-center gap-2">
              <MessageCircle size={16} /> {config.supportEmail}
            </span>
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
