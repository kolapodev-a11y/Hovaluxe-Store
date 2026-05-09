import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Boxes,
  LoaderCircle,
  LogOut,
  PackagePlus,
  Pencil,
  ShoppingBag,
  Shield,
  Trash2,
  WalletCards,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { brand } from '../data/store';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { formatDateTime, formatPrice, titleCase } from '../utils/format';
import { Badge } from '../components/Badge';
import { ProductFormModal } from '../components/ProductFormModal';
import { StatCard } from '../components/StatCard';
import { WhatsAppOrderModal } from '../components/WhatsAppOrderModal';
import { api } from '../lib/api';

const initialSummary = {
  productsCount: 0,
  lowStockCount: 0,
  flutterwaveOrders: 0,
  whatsappOrders: 0,
  paidRevenue: 0,
};

export function AdminPage() {
  const [session, setSession] = useLocalStorage('hovaluxe_admin_session', null);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [summary, setSummary] = useState(initialSummary);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [savingOrderId, setSavingOrderId] = useState('');

  const token = session?.token;

  const loadDashboard = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [summaryResponse, productsResponse, ordersResponse] = await Promise.all([
        api.getAdminSummary(token),
        api.getAdminProducts(token),
        api.getOrders(token),
      ]);
      setSummary(summaryResponse.data || initialSummary);
      setProducts(productsResponse.data || []);
      setOrders(ordersResponse.data || []);
      setError('');
    } catch (loadError) {
      if (String(loadError.message || '').toLowerCase().includes('token')) {
        setSession(null);
      }
      setError(loadError.message || 'Unable to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [token]);

  const filteredOrders = useMemo(() => {
    if (orderFilter === 'all') return orders;
    return orders.filter((order) => order.paymentMethod === orderFilter);
  }, [orders, orderFilter]);

  const login = async (event) => {
    event.preventDefault();
    try {
      setBusy(true);
      const response = await api.adminLogin(credentials);
      setSession({ token: response.token, admin: response.admin });
      setError('');
    } catch (loginError) {
      setError(loginError.message || 'Unable to sign in.');
    } finally {
      setBusy(false);
    }
  };

  const saveProduct = async (product) => {
    try {
      setBusy(true);
      if (editingProduct) {
        await api.updateProduct(token, editingProduct.id, product);
      } else {
        await api.createProduct(token, product);
      }
      setModalOpen(false);
      setEditingProduct(null);
      await loadDashboard();
    } catch (saveError) {
      setError(saveError.message || 'Unable to save product.');
    } finally {
      setBusy(false);
    }
  };

  const deleteProduct = async (id) => {
    const shouldDelete = window.confirm('Delete this product from the catalog?');
    if (!shouldDelete) return;

    try {
      setBusy(true);
      await api.deleteProduct(token, id);
      await loadDashboard();
    } catch (deleteError) {
      setError(deleteError.message || 'Unable to delete product.');
    } finally {
      setBusy(false);
    }
  };

  const saveWhatsAppOrder = async (payload) => {
    try {
      setBusy(true);
      await api.recordWhatsAppOrder(token, payload);
      setRecordModalOpen(false);
      await loadDashboard();
      setActiveTab('orders');
    } catch (saveError) {
      setError(saveError.message || 'Unable to record WhatsApp order.');
    } finally {
      setBusy(false);
    }
  };

  const updateOrder = async (id, payload) => {
    try {
      setSavingOrderId(id);
      await api.updateOrder(token, id, payload);
      await loadDashboard();
    } catch (updateError) {
      setError(updateError.message || 'Unable to update order.');
    } finally {
      setSavingOrderId('');
    }
  };

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-[2rem] border border-[var(--line)] bg-[#0c0d0d] p-8 shadow-[0_24px_90px_rgba(0,0,0,.48)]">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-green)]">Admin access</p>
          <h1 className="mt-3 font-display text-4xl text-[var(--text-primary)]">Hovaluxe dashboard</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
            Sign in with your backend admin credentials to manage products, Flutterwave orders, and manually recorded WhatsApp sales.
          </p>

          <form className="mt-6 space-y-4" onSubmit={login}>
            <label className="block space-y-2">
              <span className="text-sm text-[var(--text-primary)]">Admin email</span>
              <input
                className="input-style"
                value={credentials.email}
                onChange={(e) => setCredentials((prev) => ({ ...prev, email: e.target.value }))}
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm text-[var(--text-primary)]">Password</span>
              <input
                type="password"
                className="input-style"
                value={credentials.password}
                onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
              />
            </label>
            {error ? (
              <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            ) : null}
            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[#111] disabled:opacity-70"
            >
              {busy ? <LoaderCircle size={16} className="animate-spin" /> : null}
              Sign in to admin
            </button>
          </form>

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
            <p className="font-display text-3xl text-[var(--text-primary)]">{brand.name}</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Store operations center</p>
          </Link>
          <nav className="mt-5 space-y-2 text-sm">
            <SidebarItem label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<BarChart3 size={16} />} />
            <SidebarItem label="Products" active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={<Boxes size={16} />} />
            <SidebarItem label="Orders" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<ShoppingBag size={16} />} />
          </nav>
        </aside>

        <div className="min-w-0 flex-1 rounded-[2rem] border border-[var(--line)] bg-[#0c0d0d] p-5 md:p-6">
          <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-green)]">Admin panel</p>
              <h1 className="mt-2 font-display text-4xl text-[var(--text-primary)]">Manage the storefront</h1>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Signed in as {session.admin?.name || brand.name}</p>
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
                onClick={() => setRecordModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-5 py-3 text-sm text-[var(--text-primary)]"
              >
                <WalletCards size={16} />
                Record WhatsApp sale
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
            <SidebarItem label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<BarChart3 size={16} />} compact />
            <SidebarItem label="Products" active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={<Boxes size={16} />} compact />
            <SidebarItem label="Orders" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<ShoppingBag size={16} />} compact />
          </div>

          {error ? (
            <div className="mt-6 rounded-[1.4rem] border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="mt-8 flex items-center justify-center rounded-[1.5rem] border border-[var(--line)] bg-white/[0.03] p-8 text-sm text-[var(--text-secondary)]">
              <LoaderCircle size={18} className="mr-2 animate-spin" /> Loading dashboard...
            </div>
          ) : null}

          {!loading && activeTab === 'dashboard' ? (
            <div className="mt-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <StatCard label="Products" value={summary.productsCount} helper="Active catalog items" />
                <StatCard label="Low stock" value={summary.lowStockCount} helper="Needs attention" />
                <StatCard label="Flutterwave" value={summary.flutterwaveOrders} helper="Online orders" />
                <StatCard label="WhatsApp" value={summary.whatsappOrders} helper="Recorded manually" />
                <StatCard label="Revenue" value={formatPrice(summary.paidRevenue)} helper="Paid + recorded orders" />
              </div>
              <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <Panel title="Recent orders" subtitle="Latest activity across Flutterwave and WhatsApp orders">
                  <div className="space-y-3">
                    {orders.slice(0, 6).map((order) => (
                      <div key={order.id} className="rounded-[1.3rem] border border-[var(--line)] bg-white/[0.03] p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-sm font-medium text-[var(--text-primary)]">{order.customerName}</p>
                            <p className="mt-1 text-sm text-[var(--text-secondary)]">{order.orderRef} • {titleCase(order.paymentMethod)}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">{formatDateTime(order.createdAt)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge value={order.paymentStatus} />
                            <Badge value={order.fulfilmentStatus} />
                            <span className="font-display text-xl text-[var(--gold)]">{formatPrice(order.totalAmount)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>
                <Panel title="Operational notes" subtitle="What this dashboard now controls">
                  <div className="space-y-3 text-sm leading-7 text-[var(--text-secondary)]">
                    <div className="rounded-[1.2rem] border border-[var(--line)] bg-white/[0.03] p-4">Secure admin sign-in backed by the Express API.</div>
                    <div className="rounded-[1.2rem] border border-[var(--line)] bg-white/[0.03] p-4">Catalog management for product data, status, imagery, and stock quantity.</div>
                    <div className="rounded-[1.2rem] border border-[var(--line)] bg-white/[0.03] p-4">Flutterwave orders synced from the storefront and verified before fulfillment.</div>
                    <div className="rounded-[1.2rem] border border-[var(--line)] bg-white/[0.03] p-4">Storekeeper-only WhatsApp sales entry for manual order reconciliation.</div>
                  </div>
                </Panel>
              </div>
            </div>
          ) : null}

          {!loading && activeTab === 'products' ? (
            <div className="mt-6 space-y-4">
              {products.map((product) => (
                <div key={product.id} className="grid gap-4 rounded-[1.5rem] border border-[var(--line)] bg-white/[0.03] p-4 lg:grid-cols-[120px_1fr_auto] lg:items-center">
                  <img src={product.image} alt={product.name} className="h-28 w-full rounded-[1rem] object-cover lg:w-[120px]" />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-3xl text-[var(--text-primary)]">{product.name}</h3>
                      <Badge value={product.status} />
                      {product.featured ? <Badge value="featured">Featured</Badge> : null}
                    </div>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">{product.category} • {product.volume || 'Standard size'} • SKU {product.sku || '—'}</p>
                    <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{product.description}</p>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
                      <span>Price: <strong className="text-[var(--gold)]">{formatPrice(product.price)}</strong></span>
                      <span>Inventory: <strong className="text-[var(--text-primary)]">{product.inventoryQuantity}</strong></span>
                      <span>Visibility: <strong className="text-[var(--text-primary)]">{product.isActive ? 'Visible' : 'Hidden'}</strong></span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 lg:justify-end">
                    <button type="button" onClick={() => { setEditingProduct(product); setModalOpen(true); }} className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2 text-sm text-[var(--text-primary)]">
                      <Pencil size={14} /> Edit
                    </button>
                    <button type="button" onClick={() => deleteProduct(product.id)} className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 px-4 py-2 text-sm text-rose-200">
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {!loading && activeTab === 'orders' ? (
            <div className="mt-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-3">
                  {[
                    ['all', 'All orders'],
                    ['flutterwave', 'Flutterwave'],
                    ['whatsapp_manual', 'WhatsApp'],
                  ].map(([value, label]) => (
                    <button key={value} type="button" onClick={() => setOrderFilter(value)} className={`rounded-full border px-4 py-2 text-sm ${orderFilter === value ? 'border-[var(--gold)]/30 bg-[var(--gold)] text-[#111]' : 'border-[var(--line)] text-[var(--text-primary)]'}`}>
                      {label}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => setRecordModalOpen(true)} className="rounded-full border border-[var(--line)] px-4 py-2 text-sm text-[var(--text-primary)]">Record WhatsApp sale</button>
              </div>

              {filteredOrders.map((order) => (
                <div key={order.id} className="rounded-[1.5rem] border border-[var(--line)] bg-white/[0.03] p-4">
                  <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-3xl text-[var(--text-primary)]">{order.customerName}</h3>
                        <Badge value={order.paymentStatus} />
                        <Badge value={order.fulfilmentStatus} />
                      </div>
                      <p className="mt-2 text-sm text-[var(--text-secondary)]">{order.orderRef} • {titleCase(order.paymentMethod)} • {formatDateTime(order.createdAt)}</p>
                      <p className="mt-2 text-sm text-[var(--text-secondary)]">Phone: {order.customerPhone} • Email: {order.customerEmail || '—'}</p>
                      <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">Address: {order.shippingAddress}</p>
                      {order.notes ? <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">Customer note: {order.notes}</p> : null}
                      {order.adminNote ? <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">Admin note: {order.adminNote}</p> : null}
                      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {order.items.map((item) => (
                          <div key={`${order.id}-${item.name}`} className="rounded-[1.2rem] border border-[var(--line)] bg-[#111314] p-3 text-sm text-[var(--text-secondary)]">
                            <p className="text-[var(--text-primary)]">{item.name}</p>
                            <p className="mt-1">{item.quantity} × {formatPrice(item.price)}</p>
                            <p className="mt-1 text-[var(--gold)]">{formatPrice(item.total)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-3 xl:w-[260px]">
                      <div className="rounded-[1.2rem] border border-[var(--line)] bg-[#111314] p-4 text-sm text-[var(--text-secondary)]">
                        <p>Total</p>
                        <p className="mt-2 font-display text-3xl text-[var(--gold)]">{formatPrice(order.totalAmount)}</p>
                      </div>
                      <label className="space-y-2 text-sm text-[var(--text-primary)]">
                        <span>Payment status</span>
                        <select className="input-style" value={order.paymentStatus} onChange={(e) => updateOrder(order.id, { paymentStatus: e.target.value })} disabled={savingOrderId === order.id}>
                          {['initiated', 'pending', 'paid', 'failed', 'cancelled', 'recorded'].map((status) => (
                            <option key={status} value={status}>{titleCase(status)}</option>
                          ))}
                        </select>
                      </label>
                      <label className="space-y-2 text-sm text-[var(--text-primary)]">
                        <span>Fulfilment status</span>
                        <select className="input-style" value={order.fulfilmentStatus} onChange={(e) => updateOrder(order.id, { fulfilmentStatus: e.target.value })} disabled={savingOrderId === order.id}>
                          {['new', 'processing', 'ready', 'shipped', 'delivered', 'cancelled'].map((status) => (
                            <option key={status} value={status}>{titleCase(status)}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
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
        onSave={saveProduct}
        product={editingProduct}
      />
      <WhatsAppOrderModal
        open={recordModalOpen}
        onClose={() => setRecordModalOpen(false)}
        products={products}
        onSave={saveWhatsAppOrder}
        saving={busy}
      />
    </div>
  );
}

function SidebarItem({ label, icon, active, onClick, compact = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${compact ? '' : 'w-full'} ${
        active
          ? 'border-[var(--gold)]/30 bg-[var(--gold)] text-[#111]'
          : 'border-[var(--line)] text-[var(--text-primary)]'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <div className="rounded-[1.6rem] border border-[var(--line)] bg-white/[0.03] p-5">
      <div className="mb-5">
        <p className="text-lg font-semibold text-[var(--text-primary)]">{title}</p>
        {subtitle ? <p className="mt-1 text-sm text-[var(--text-secondary)]">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}
