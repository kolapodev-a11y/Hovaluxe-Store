import { useMemo, useState } from 'react';
import {
  BarChart3,
  Boxes,
  Eye,
  LogOut,
  PackagePlus,
  Pencil,
  ShoppingBag,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  brand,
  createProductArtwork,
  seedProducts,
  seedTransactions,
} from '../data/store';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { formatPrice } from '../utils/format';
import { Badge } from '../components/Badge';
import { ProductFormModal } from '../components/ProductFormModal';
import { StatCard } from '../components/StatCard';

export function AdminPage() {
  const [products, setProducts] = useLocalStorage('hovaluxe_products', seedProducts);
  const [transactions, setTransactions] = useLocalStorage(
    'hovaluxe_transactions',
    seedTransactions,
  );
  const [session, setSession] = useLocalStorage('hovaluxe_admin_session', null);

  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const stats = useMemo(() => {
    const paidRevenue = transactions
      .filter((item) => item.status === 'Paid')
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      totalProducts: products.length,
      lowStock: products.filter((item) => ['low-stock', 'out-of-stock'].includes(item.status))
        .length,
      soldItems: products.filter((item) => item.status === 'sold').length,
      revenue: paidRevenue,
    };
  }, [products, transactions]);

  const login = (event) => {
    event.preventDefault();

    if (
      credentials.email === brand.adminDemo.email &&
      credentials.password === brand.adminDemo.password
    ) {
      setSession({ email: credentials.email, loggedInAt: new Date().toISOString() });
      setError('');
      return;
    }

    setError('Use the demo credentials shown below to open the admin panel.');
  };

  const saveProduct = (product) => {
    const normalizedProduct = {
      ...product,
      image: product.image || createFallbackArtwork(product),
    };

    if (editingProduct) {
      setProducts((currentProducts) =>
        currentProducts.map((item) =>
          item.id === editingProduct.id ? { ...editingProduct, ...normalizedProduct } : item,
        ),
      );
    } else {
      setProducts((currentProducts) => [
        {
          ...normalizedProduct,
          id: `hv-${Date.now().toString().slice(-6)}`,
        },
        ...currentProducts,
      ]);
    }

    setModalOpen(false);
    setEditingProduct(null);
  };

  const quickStatus = (id, status) => {
    setProducts((currentProducts) =>
      currentProducts.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  };

  const deleteProduct = (id) =>
    setProducts((currentProducts) => currentProducts.filter((item) => item.id !== id));

  const resetDemo = () => {
    setProducts(seedProducts);
    setTransactions(seedTransactions);
  };

  const updateTransactionStatus = (id, status) => {
    setTransactions((currentTransactions) =>
      currentTransactions.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  };

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-[2rem] border border-[var(--line)] bg-[#0c0d0d] p-8 shadow-[0_24px_90px_rgba(0,0,0,.48)]">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-green)]">
            Admin access
          </p>
          <h1 className="mt-3 font-display text-4xl text-[var(--text-primary)]">
            Hovaluxe dashboard
          </h1>
          <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
            This demo admin panel stores data in localStorage so you can test
            product management before adding authentication and backend APIs.
          </p>

          <form className="mt-6 space-y-4" onSubmit={login}>
            <label className="block space-y-2">
              <span className="text-sm text-[var(--text-primary)]">Admin email</span>
              <input
                className="input-style"
                value={credentials.email}
                onChange={(e) =>
                  setCredentials((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm text-[var(--text-primary)]">Password</span>
              <input
                type="password"
                className="input-style"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials((prev) => ({ ...prev, password: e.target.value }))
                }
              />
            </label>
            {error ? (
              <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            ) : null}
            <button
              type="submit"
              className="w-full rounded-full bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[#111]"
            >
              Sign in to admin
            </button>
          </form>

          <div className="mt-5 rounded-[1.5rem] border border-[var(--line)] bg-white/[0.03] p-4 text-sm leading-7 text-[var(--text-secondary)]">
            <p className="font-medium text-[var(--text-primary)]">Demo credentials</p>
            <p>Email: {brand.adminDemo.email}</p>
            <p>Password: {brand.adminDemo.password}</p>
          </div>

          <Link to="/" className="mt-5 inline-flex text-sm text-[var(--accent-green)]">
            ← Back to storefront
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-6 md:px-6 lg:px-8">
        <aside className="hidden w-72 shrink-0 rounded-[2rem] border border-[var(--line)] bg-[#0c0d0d] p-5 lg:block">
          <Link to="/" className="block border-b border-[var(--line)] pb-5">
            <p className="font-display text-3xl text-[var(--text-primary)]">Hovaluxe</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Product and transaction admin
            </p>
          </Link>
          <nav className="mt-5 space-y-2 text-sm">
            <SidebarItem
              label="Dashboard"
              active={activeTab === 'dashboard'}
              onClick={() => setActiveTab('dashboard')}
              icon={<BarChart3 size={16} />}
            />
            <SidebarItem
              label="Products"
              active={activeTab === 'products'}
              onClick={() => setActiveTab('products')}
              icon={<Boxes size={16} />}
            />
            <SidebarItem
              label="Transactions"
              active={activeTab === 'transactions'}
              onClick={() => setActiveTab('transactions')}
              icon={<ShoppingBag size={16} />}
            />
          </nav>
        </aside>

        <div className="min-w-0 flex-1 rounded-[2rem] border border-[var(--line)] bg-[#0c0d0d] p-5 md:p-6">
          <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-green)]">
                Admin panel
              </p>
              <h1 className="mt-2 font-display text-4xl text-[var(--text-primary)]">
                Manage the storefront
              </h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setModalOpen(true);
                  setActiveTab('products');
                }}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[#111]"
              >
                <PackagePlus size={16} />
                Add product
              </button>
              <button
                type="button"
                onClick={resetDemo}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-5 py-3 text-sm text-[var(--text-primary)]"
              >
                <Sparkles size={16} />
                Reset demo data
              </button>
              <button
                type="button"
                onClick={() => setSession(null)}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-5 py-3 text-sm text-[var(--text-primary)]"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 lg:hidden">
            <SidebarItem
              label="Dashboard"
              active={activeTab === 'dashboard'}
              onClick={() => setActiveTab('dashboard')}
              icon={<BarChart3 size={16} />}
              compact
            />
            <SidebarItem
              label="Products"
              active={activeTab === 'products'}
              onClick={() => setActiveTab('products')}
              icon={<Boxes size={16} />}
              compact
            />
            <SidebarItem
              label="Transactions"
              active={activeTab === 'transactions'}
              onClick={() => setActiveTab('transactions')}
              icon={<ShoppingBag size={16} />}
              compact
            />
          </div>

          {activeTab === 'dashboard' ? (
            <div className="mt-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Products" value={stats.totalProducts} helper="All listed items" />
                <StatCard label="Low stock" value={stats.lowStock} helper="Needs attention" />
                <StatCard label="Sold items" value={stats.soldItems} helper="Marked sold by admin" />
                <StatCard
                  label="Paid revenue"
                  value={formatPrice(stats.revenue)}
                  helper="From transaction history"
                />
              </div>
              <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <Panel
                  title="Recent transactions"
                  subtitle="Quick view from your live transaction history"
                >
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((transaction) => (
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
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge value={transaction.status}>{transaction.status}</Badge>
                          <span className="text-sm text-[var(--gold)]">
                            {formatPrice(transaction.amount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>
                <Panel
                  title="Inventory health"
                  subtitle="Fast actions for common admin tasks"
                >
                  <div className="space-y-3">
                    {products.slice(0, 4).map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between gap-3 rounded-[1.4rem] border border-[var(--line)] bg-white/[0.03] p-4"
                      >
                        <div>
                          <p className="text-sm font-medium text-[var(--text-primary)]">
                            {product.name}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                            {product.category}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge value={product.status} />
                          <button
                            type="button"
                            onClick={() => quickStatus(product.id, 'sold')}
                            className="rounded-full border border-[var(--line)] px-3 py-2 text-xs text-[var(--text-primary)]"
                          >
                            Mark sold
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>
              </div>
            </div>
          ) : null}

          {activeTab === 'products' ? (
            <div className="mt-6 space-y-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="grid gap-4 rounded-[1.6rem] border border-[var(--line)] bg-white/[0.03] p-4 md:grid-cols-[110px_1fr_auto] md:items-center"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-28 w-full rounded-[1.2rem] object-cover"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-display text-2xl text-[var(--text-primary)]">
                        {product.name}
                      </h3>
                      <Badge value={product.status} />
                      {product.featured ? <Badge value="featured">Featured</Badge> : null}
                    </div>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">
                      {product.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-[var(--text-secondary)]">
                      <span>{product.category}</span>
                      <span>{product.volume}</span>
                      <span className="text-[var(--gold)]">{formatPrice(product.price)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <ActionButton
                      icon={<Eye size={14} />}
                      label="Low stock"
                      onClick={() => quickStatus(product.id, 'low-stock')}
                    />
                    <ActionButton
                      icon={<ShoppingBag size={14} />}
                      label="Out"
                      onClick={() => quickStatus(product.id, 'out-of-stock')}
                    />
                    <ActionButton
                      icon={<Sparkles size={14} />}
                      label="Sold"
                      onClick={() => quickStatus(product.id, 'sold')}
                    />
                    <ActionButton
                      icon={<Pencil size={14} />}
                      label="Edit"
                      onClick={() => {
                        setEditingProduct(product);
                        setModalOpen(true);
                      }}
                    />
                    <ActionButton
                      icon={<Trash2 size={14} />}
                      label="Delete"
                      danger
                      onClick={() => deleteProduct(product.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === 'transactions' ? (
            <div className="mt-6 overflow-hidden rounded-[1.6rem] border border-[var(--line)]">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[var(--line)] text-left text-sm">
                  <thead className="bg-white/[0.03] text-[var(--text-secondary)]">
                    <tr>
                      <th className="px-4 py-3 font-medium">Reference</th>
                      <th className="px-4 py-3 font-medium">Customer</th>
                      <th className="px-4 py-3 font-medium">Channel</th>
                      <th className="px-4 py-3 font-medium">Amount</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="align-top text-[var(--text-primary)]">
                        <td className="px-4 py-4">
                          <p>{transaction.id}</p>
                          <p className="mt-1 text-xs text-[var(--text-secondary)]">
                            {transaction.date}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <p>{transaction.customer}</p>
                          <p className="mt-1 text-xs text-[var(--text-secondary)]">
                            {transaction.items}
                          </p>
                        </td>
                        <td className="px-4 py-4">{transaction.channel}</td>
                        <td className="px-4 py-4 text-[var(--gold)]">
                          {formatPrice(transaction.amount)}
                        </td>
                        <td className="px-4 py-4">
                          <Badge value={transaction.status}>{transaction.status}</Badge>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <ActionButton
                              label="Paid"
                              onClick={() => updateTransactionStatus(transaction.id, 'Paid')}
                            />
                            <ActionButton
                              label="Pending"
                              onClick={() =>
                                updateTransactionStatus(transaction.id, 'Pending')
                              }
                            />
                            <ActionButton
                              label="Cancelled"
                              danger
                              onClick={() =>
                                updateTransactionStatus(transaction.id, 'Cancelled')
                              }
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <ProductFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        onSave={saveProduct}
      />
    </div>
  );
}

function SidebarItem({ label, icon, active, onClick, compact = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
        active
          ? 'border-[var(--gold)]/30 bg-[var(--gold)] text-[#111]'
          : 'border-[var(--line)] bg-white/[0.03] text-[var(--text-primary)]'
      } ${compact ? '' : 'w-full justify-start rounded-2xl px-4 py-3'}`}
    >
      {icon}
      {label}
    </button>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <section className="rounded-[1.7rem] border border-[var(--line)] bg-white/[0.03] p-5">
      <h2 className="font-display text-3xl text-[var(--text-primary)]">{title}</h2>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">{subtitle}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ActionButton({ icon, label, onClick, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs transition ${
        danger
          ? 'border-rose-500/25 bg-rose-500/10 text-rose-200'
          : 'border-[var(--line)] bg-white/[0.03] text-[var(--text-primary)]'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function createFallbackArtwork(product) {
  const categoryLabel = product.category
    ?.split(' ')
    .join(' ')
    .slice(0, 10)
    .toUpperCase();

  const accentByCategory = {
    Perfume: ['#c7a45d', '#18b56a'],
    'Body Spray': ['#e2c98a', '#f4a7b9'],
    'Roll Ons': ['#f0d596', '#8f6b42'],
    Diffusers: ['#18b56a', '#c7a45d'],
    Humidifiers: ['#8fe7d2', '#18b56a'],
  };

  const [accentA, accentB] = accentByCategory[product.category] || ['#c7a45d', '#18b56a'];

  return createProductArtwork({
    title: product.name || 'Hovaluxe Product',
    subtitle: product.category || 'Luxury Drop',
    accentA,
    accentB,
    bottle: categoryLabel || 'LUXE',
  });
}
