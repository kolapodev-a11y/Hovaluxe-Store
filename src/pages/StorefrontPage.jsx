import { useMemo, useState } from 'react';
import {
  ArrowRight,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { brand, seedProducts, seedTransactions } from '../data/store';
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

const deliveryFee = 2500;

export function StorefrontPage() {
  // Storefront and admin both read/write the same keys.
  // That gives you a simple frontend-only demo before adding a real backend.
  const [products] = useLocalStorage('hovaluxe_products', seedProducts);
  const [transactions, setTransactions] = useLocalStorage(
    'hovaluxe_transactions',
    seedTransactions,
  );
  const [cart, setCart] = useLocalStorage('hovaluxe_cart', []);

  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryMatch =
        activeCategory === 'All' || product.category === activeCategory;
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

  const placeOrder = ({ customer, phone, address, paymentMethod, total }) => {
    const itemsSummary = cart
      .map((item) => `${item.name} × ${item.quantity}`)
      .join(', ');

    const record = {
      id: `TXN-${Date.now().toString().slice(-6)}`,
      customer,
      channel: paymentMethod,
      amount: total,
      status: paymentMethod === 'WhatsApp' ? 'Pending' : 'Initiated',
      items: `${itemsSummary}, shipping`,
      date: new Date().toLocaleString('en-NG', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    };

    setTransactions((currentTransactions) => [record, ...currentTransactions]);

    const orderMessage = encodeURIComponent(
      `Hello ${brand.name}, I want to place an order.\n\nName: ${customer}\nPhone: ${phone}\nAddress: ${address}\nItems: ${itemsSummary}\nTotal: ${formatPrice(total)}\nPayment method: ${paymentMethod}`,
    );

    if (paymentMethod === 'WhatsApp') {
      window.open(`https://wa.me/${brand.whatsappNumber}?text=${orderMessage}`, '_blank');
    } else {
      window.open(brand.flutterwaveLink, '_blank');
    }

    setCart([]);
    setCheckoutOpen(false);
    setCartOpen(false);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      <Header cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />
      <HeroSection />

      <main>
        <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Luxury categories"
            title="Curated scent families and home fragrance essentials"
            description="Each category maps to your requested product types so you can keep expanding the catalog without breaking the brand style."
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
                title="A cleaner luxury storefront than the original reference"
                description="The structure stays familiar, but the styling is darker, more editorial, and more premium to match the WhatsApp brand mood."
              />
              <div className="grid gap-4 md:grid-cols-3">
                {featuredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-[1.5rem] border border-[var(--line)] bg-[#101111] p-4"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-52 w-full rounded-[1.2rem] object-cover"
                    />
                    <p className="mt-3 text-sm text-[var(--text-secondary)]">
                      {product.category}
                    </p>
                    <p className="mt-1 text-base font-medium text-[var(--text-primary)]">
                      {product.name}
                    </p>
                    <p className="mt-2 text-sm text-[var(--gold)]">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 md:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <SectionTitle
              eyebrow="Shop section"
              title="Browse, search, and filter products quickly"
              description="This section is driven by reusable React components and local state, while product data itself is shared with the admin panel through localStorage."
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

          {filteredProducts.length ? (
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
              <p className="font-display text-3xl text-[var(--text-primary)]">
                No products found
              </p>
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
            text="Customers can send a prefilled order summary directly to your WhatsApp business number."
          />
          <InfoPanel
            icon={<Wallet size={18} />}
            title="Flutterwave ready"
            text="Use the current link as placeholder, then swap it with your real Flutterwave integration or payment link."
          />
          <InfoPanel
            icon={<ShieldCheck size={18} />}
            title="Admin controlled"
            text="Product edits, stock updates, and transaction review happen from the React admin route using shared state."
          />
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[2rem] border border-[var(--line)] bg-white/[0.03] p-6">
              <SectionTitle
                eyebrow="Payments"
                title="Simple frontend flow for both requested payment methods"
                description="WhatsApp is great for conversational selling, while Flutterwave becomes the cleaner online payment route once you replace the placeholder link with your real integration."
              />
              <div className="space-y-4">
                <PaymentRow
                  icon={<MessageCircle size={18} />}
                  title="WhatsApp"
                  body="Creates an order record locally and opens a ready-to-send message containing customer name, phone, address, item list, and total."
                />
                <PaymentRow
                  icon={<Wallet size={18} />}
                  title="Flutterwave"
                  body="Creates an initiated transaction record and redirects users to your configured Flutterwave URL as a placeholder for the real flow."
                />
              </div>
            </div>

            <div className="rounded-[2rem] border border-[var(--line)] bg-[#101111] p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-green)]">
                    Recent transactions
                  </p>
                  <h3 className="mt-2 font-display text-3xl text-[var(--text-primary)]">
                    Live admin-linked history
                  </h3>
                </div>
                <Badge value="Paid">
                  {transactions.filter((item) => item.status === 'Paid').length} paid
                </Badge>
              </div>
              <div className="mt-6 space-y-3">
                {transactions.slice(0, 4).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex flex-col gap-3 rounded-[1.4rem] border border-[var(--line)] bg-white/[0.03] p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {transaction.customer}
                      </p>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">
                        {transaction.items}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                        {transaction.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge value={transaction.status}>{transaction.status}</Badge>
                      <span className="font-display text-xl text-[var(--gold)]">
                        {formatPrice(transaction.amount)}
                      </span>
                    </div>
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
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-green)]">
                  Build notes
                </p>
                <h3 className="mt-2 font-display text-4xl text-[var(--text-primary)]">
                  A learning-friendly codebase, not just a visual clone
                </h3>
                <p className="mt-4 max-w-3xl text-sm leading-8 text-[var(--text-secondary)] md:text-base">
                  The project separates reusable UI components, shared seed data,
                  localStorage hooks, storefront logic, and admin logic so you can
                  learn the app in layers while you build toward a real backend.
                </p>
              </div>
              <a
                href="/admin"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-6 py-3 text-sm font-semibold text-[#111]"
              >
                Open admin demo
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
        onClose={() => setCheckoutOpen(false)}
        onPlaceOrder={placeOrder}
      />

      <footer className="border-t border-[var(--line)] bg-[#090a0b]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-[var(--text-secondary)] md:flex-row md:items-center md:justify-between md:px-6 lg:px-8">
          <p>
            Hovaluxe storefront demo • subtotal example {formatPrice(subtotal)} •
            delivery {formatPrice(deliveryFee)}
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2">
              <PackageCheck size={16} /> React components
            </span>
            <span className="inline-flex items-center gap-2">
              <Sparkles size={16} /> Tailwind styling
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
