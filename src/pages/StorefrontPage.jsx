import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { brand, resolveProductImage } from '../data/store';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Header } from '../components/Header';
import { HeroSection } from '../components/HeroSection';
import { SectionTitle } from '../components/SectionTitle';
import { CategoryStrip } from '../components/CategoryStrip';
import { ProductCard } from '../components/ProductCard';
import { CartDrawer } from '../components/CartDrawer';
import { CheckoutModal } from '../components/CheckoutModal';
import { formatPrice } from '../utils/format';
import { Badge } from '../components/Badge';
import { api } from '../lib/api';

const fallbackConfig = {
  deliveryFee: 2500,
  whatsappNumber: '',
  currency: 'NGN',
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

        setConfig(configResponse.data || fallbackConfig);
        setProducts(
          (productsResponse.data || []).map((product) => ({
            ...product,
            image: resolveProductImage(product),
          })),
        );
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

  const featuredProducts = products.filter((product) => product.featured).slice(0, 3);

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
      const orderMessage = encodeURIComponent(
        `Hello ${brand.name}, I want to place an order.\n\nName: ${customerName}\nPhone: ${customerPhone}\nEmail: ${customerEmail || 'Not provided'}\nAddress: ${shippingAddress}\nItems: ${itemsSummary}\nTotal: ${formatPrice(total)}\nNotes: ${notes || 'None'}\n\nPlease confirm availability and next steps.`,
      );

      window.open(`https://wa.me/${config.whatsappNumber}?text=${orderMessage}`, '_blank');
      setCart([]);
      setCheckoutOpen(false);
      setCartOpen(false);
      setNotice('Your order details were sent to WhatsApp. The storekeeper will record and confirm the order manually.');
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

      setCart([]);
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
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      <Header cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />
      <HeroSection />

      {notice ? (
        <div className="mx-auto max-w-7xl px-4 pt-6 md:px-6 lg:px-8">
          <div className="rounded-[1.4rem] border border-[var(--gold)]/25 bg-[var(--gold)]/10 px-4 py-3 text-sm text-[var(--text-primary)]">
            {notice}
          </div>
        </div>
      ) : null}

      <main>
        <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Luxury categories"
            title="Curated scent families and home fragrance essentials"
            description="From signature perfumes to diffusers and humidifiers, each collection is structured for a premium retail flow."
          />
          <div className="grid gap-4 md:grid-cols-5">
            {[
              ['Perfume', 'Signature scents for day and night.'],
              ['Body Spray', 'Fresh, affordable daily freshness.'],
              ['Roll Ons', 'Portable oils for quick re-application.'],
              ['Diffusers', 'Ambient home fragrance collection.'],
              ['Humidifiers', 'Lifestyle devices for aromatic spaces.'],
            ].map(([title, text]) => (
              <div
                key={title}
                className="rounded-[1.6rem] border border-[var(--line)] bg-white/[0.03] p-5"
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
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <SectionTitle
                eyebrow="Featured set"
                title="Luxury pieces ready for storefront highlights"
                description="Feature high-priority products on the landing page while the full catalog remains searchable and filterable below."
              />
              <div className="grid gap-4 md:grid-cols-3">
                {featuredProducts.length ? featuredProducts.map((product) => (
                  <div key={product.id} className="rounded-[1.5rem] border border-[var(--line)] bg-[#101111] p-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-52 w-full rounded-[1.2rem] object-cover"
                    />
                    <p className="mt-3 text-sm text-[var(--text-secondary)]">{product.category}</p>
                    <p className="mt-1 text-base font-medium text-[var(--text-primary)]">{product.name}</p>
                    <p className="mt-2 text-sm text-[var(--gold)]">{formatPrice(product.price)}</p>
                  </div>
                )) : (
                  <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[#101111] p-6 text-sm text-[var(--text-secondary)] md:col-span-3">
                    Add featured products from the admin panel to highlight them here.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 md:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <SectionTitle
              eyebrow="Shop section"
              title="Browse, search, and filter products quickly"
              description="Catalog data is served by the backend, while cart state stays fast in the browser until checkout."
            />
            <div className="w-full max-w-md">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search perfume, body spray, diffuser..."
                className="input-style"
              />
            </div>
          </div>

          <CategoryStrip
            activeCategory={activeCategory}
            onChangeCategory={setActiveCategory}
          />

          {loading ? (
            <div className="mt-8 rounded-[1.8rem] border border-[var(--line)] bg-white/[0.03] p-8 text-center text-sm text-[var(--text-secondary)]">
              Loading products...
            </div>
          ) : error ? (
            <div className="mt-8 rounded-[1.8rem] border border-rose-500/20 bg-rose-500/10 p-8 text-center text-sm text-rose-200">
              {error}
            </div>
          ) : filteredProducts.length ? (
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
            title="WhatsApp checkout"
            text="Customers can send a prefilled order summary directly to your business WhatsApp. The storekeeper records these sales manually from the admin panel."
          />
          <InfoPanel
            icon={<Wallet size={18} />}
            title="Flutterwave payments"
            text="Flutterwave transactions are initialized by the backend, stored in MongoDB, and verified before fulfillment begins."
          />
          <InfoPanel
            icon={<ShieldCheck size={18} />}
            title="Admin controlled"
            text="Product edits, inventory updates, and order handling live inside the operations dashboard with secure admin login."
          />
        </section>

        <section id="payments" className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[2rem] border border-[var(--line)] bg-white/[0.03] p-6">
              <SectionTitle
                eyebrow="Payments"
                title="Two clear payment paths for the business workflow"
                description="Flutterwave orders are stored and tracked online. WhatsApp orders are captured by conversation and recorded by the store team once confirmed."
              />
              <div className="space-y-4">
                <PaymentRow
                  icon={<MessageCircle size={18} />}
                  title="WhatsApp"
                  body="Opens a structured order message with customer details, delivery address, items, and total for manual processing."
                />
                <PaymentRow
                  icon={<Wallet size={18} />}
                  title="Flutterwave"
                  body="Creates a secure checkout session in the backend and redirects the customer to Flutterwave for payment."
                />
              </div>
            </div>

            <div className="rounded-[2rem] border border-[var(--line)] bg-[#101111] p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-green)]">Operations overview</p>
                  <h3 className="mt-2 font-display text-3xl text-[var(--text-primary)]">Store workflow snapshot</h3>
                </div>
                <Badge value="paid">API ready</Badge>
              </div>
              <div className="mt-6 space-y-3">
                {[
                  'Secure admin authentication for products and order management.',
                  'MongoDB-backed catalog and order storage for Flutterwave transactions.',
                  'Manual WhatsApp order recording to reflect storekeeper-confirmed sales.',
                  `Delivery fee currently set to ${formatPrice(config.deliveryFee)} and managed by backend config.`,
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
          <div className="rounded-[2rem] border border-[var(--line)] bg-[linear-gradient(135deg,rgba(17,19,20,1),rgba(24,181,106,.08))] p-8 md:p-10">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-green)]">Operations</p>
                <h3 className="mt-2 font-display text-4xl text-[var(--text-primary)]">Manage products, payments, and manual sales from one admin view</h3>
                <p className="mt-4 max-w-3xl text-sm leading-8 text-[var(--text-secondary)] md:text-base">
                  The admin panel now handles product management, Flutterwave order tracking, and manual WhatsApp sale recording in a clean production-ready workflow.
                </p>
              </div>
              <a
                href="#/admin"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-6 py-3 text-sm font-semibold text-[#111]"
              >
                Open admin panel
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
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-[var(--text-secondary)] md:flex-row md:items-center md:justify-between md:px-6 lg:px-8">
          <p>
            {brand.name} • subtotal example {formatPrice(subtotal)} • delivery {formatPrice(config.deliveryFee)}
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2">
              <PackageCheck size={16} /> API-backed products
            </span>
            <span className="inline-flex items-center gap-2">
              <Sparkles size={16} /> Premium styling
            </span>
            <span className="inline-flex items-center gap-2">
              <MessageCircle size={16} /> WhatsApp flow
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function InfoPanel({ icon, title, text }) {
  return (
    <div className="rounded-[1.6rem] border border-[var(--line)] bg-white/[0.03] p-5">
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
    <div className="flex gap-4 rounded-[1.4rem] border border-[var(--line)] bg-[#111314] p-4">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--gold)]/10 text-[var(--gold)]">
        {icon}
      </div>
      <div>
        <h4 className="text-base font-medium text-[var(--text-primary)]">{title}</h4>
        <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{body}</p>
      </div>
    </div>
  );
}
