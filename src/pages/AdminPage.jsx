import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Boxes,
  LoaderCircle,
  PackagePlus,
  Pencil,
  Settings2,
  ShieldAlert,
  ShoppingBag,
  Store,
  Trash2,
} from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { brand, getProductImages } from '../data/store';
import { useAuth } from '../context/AuthContext';
import { formatDateTime, formatPrice, titleCase } from '../utils/format';
import { Badge } from '../components/Badge';
import { ProductFormModal } from '../components/ProductFormModal';
import { StatCard } from '../components/StatCard';
import { api } from '../lib/api';

const initialSummary = {
  productsCount: 0,
  lowStockCount: 0,
  flutterwaveOrders: 0,
  paidRevenue: 0,
};

const initialConfig = {
  businessName: 'Hovaluxe',
  whatsappNumber: '',
  supportEmail: '',
  deliveryFee: 2500,
  currency: 'NGN',
  heroNotice: 'Nationwide delivery available',
  flutterwavePublicKey: '',
};

const sectionMeta = {
  dashboard: {
    title: 'Dashboard',
    description: 'Overview of storefront activity, sales performance, and recent orders.',
  },
  products: {
    title: 'Product Management',
    description: 'View, add, edit, and remove products from the storefront catalog.',
  },
  orders: {
    title: 'Orders',
    description: 'Track Flutterwave payment records, customer details, and fulfilment progress.',
  },
  settings: {
    title: 'Settings',
    description: 'Update live storefront settings used across customer-facing pages.',
  },
};

export function AdminPage() {
  const { session, token, user, isAuthenticated, isAdmin, logout, requestLogout } = useAuth();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [summary, setSummary] = useState(initialSummary);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [storeConfig, setStoreConfig] = useState(initialConfig);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [savingOrderId, setSavingOrderId] = useState('');

  const currentSection = sectionMeta[activeTab] || sectionMeta.dashboard;

  const syncProductSummary = (productList) => {
    const activeProducts = productList.filter((product) => product.isActive);
    const lowStockProducts = activeProducts.filter(
      (product) => product.status === 'low-stock' || Number(product.inventoryQuantity || 0) <= 5,
    );

    setSummary((prev) => ({
      ...prev,
      productsCount: activeProducts.length,
      lowStockCount: lowStockProducts.length,
    }));
  };

  const loadDashboard = async () => {
    if (!token || !isAdmin) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [summaryResponse, productsResponse, ordersResponse, configResponse] = await Promise.all([
        api.getAdminSummary(token),
        api.getAdminProducts(token),
        api.getOrders(token),
        api.getAdminConfig(token),
      ]);
      const nextProducts = productsResponse.data || [];
      setSummary(summaryResponse.data || initialSummary);
      setProducts(nextProducts);
      syncProductSummary(nextProducts);
      setOrders(ordersResponse.data || []);
      setStoreConfig({ ...initialConfig, ...(configResponse.data || {}) });
      setError('');
    } catch (loadError) {
      const message = loadError.message || 'Unable to load admin data.';
      setError(message);
      if (/authorization|required|expired|invalid|unauthorized|forbidden/i.test(message)) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [token, isAdmin]);

  const saveProduct = async (product) => {
    if (busy) return;

    try {
      setBusy(true);
      setError('');

      const response = editingProduct
        ? await api.updateProduct(token, editingProduct.id, product)
        : await api.createProduct(token, product);

      const savedProduct = response.data;

      setProducts((currentProducts) => {
        const existingIndex = currentProducts.findIndex((item) => item.id === savedProduct.id);
        const nextProducts = existingIndex >= 0
          ? currentProducts.map((item) => (item.id === savedProduct.id ? savedProduct : item))
          : [savedProduct, ...currentProducts];

        syncProductSummary(nextProducts);
        return nextProducts;
      });

      setModalOpen(false);
      setEditingProduct(null);
    } catch (saveError) {
      setError(saveError.message || 'Unable to save product.');
    } finally {
      setBusy(false);
    }
  };

  const deleteProduct = async (id) => {
    const shouldDelete = window.confirm('Delete this product from the catalog?');
    if (!shouldDelete || busy) return;

    try {
      setBusy(true);
      setError('');
      await api.deleteProduct(token, id);
      setProducts((currentProducts) => {
        const nextProducts = currentProducts.filter((product) => product.id !== id);
        syncProductSummary(nextProducts);
        return nextProducts;
      });
    } catch (deleteError) {
      setError(deleteError.message || 'Unable to delete product.');
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

  const clearAllTransactions = async () => {
    const shouldClear = window.confirm(
      'Clear all transaction records? This permanently removes all stored orders from the admin panel and customer transaction history.',
    );
    if (!shouldClear) return;

    try {
      setBusy(true);
      const response = await api.clearOrders(token);
      setError('');
      await loadDashboard();
      window.alert(response.message || 'All transactions were cleared successfully.');
    } catch (clearError) {
      setError(clearError.message || 'Unable to clear transactions.');
    } finally {
      setBusy(false);
    }
  };

  const saveConfig = async (event) => {
    event.preventDefault();
    try {
      setBusy(true);
      const response = await api.updateAdminConfig(token, storeConfig);
      setStoreConfig({ ...initialConfig, ...(response.data || {}) });
      setError('');
    } catch (saveError) {
      setError(saveError.message || 'Unable to save store settings.');
    } finally {
      setBusy(false);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: '/admin' }} />;
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl rounded-[2rem] border border-[var(--line)] bg-[#0c0d0d] p-8 text-center shadow-[0_24px_90px_rgba(0,0,0,.48)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/12 text-rose-300">
            <ShieldAlert size={24} />
          </div>
          <p className="mt-5 text-xs uppercase tracking-[0.24em] text-[var(--accent-green)]">Restricted area</p>
          <h1 className="mt-3 font-display text-4xl text-[var(--text-primary)]">Admin access only</h1>
          <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
            You are signed in as <span className="text-[var(--text-primary)]">{session?.user?.email}</span>, but this account does not have admin access.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/" className="rounded-full border border-[var(--line)] px-5 py-3 text-sm text-[var(--text-primary)]">
              Back to storefront
            </Link>
            <button type="button" onClick={() => requestLogout()} className="rounded-full bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[#111]">
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-6 md:px-6 lg:px-8">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 lg:flex lg:flex-col">
          <div className="flex flex-1 flex-col rounded-[2rem] border border-[var(--line)] bg-[#0c0d0d] p-5">
            {/* Brand + Back to Store */}
            <div className="border-b border-[var(--line)] pb-5">
              <p className="font-display text-2xl text-[var(--text-primary)]">{brand.name}</p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">Admin Panel</p>
              <Link
                to="/"
                className="mt-4 inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
              >
                <Store size={14} />
                Back to Store
              </Link>
            </div>

            {/* Navigation sections */}
            <nav className="mt-5 flex-1 space-y-1.5 text-sm">
              <SidebarItem label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<BarChart3 size={15} />} />
              <SidebarItem label="Products" active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={<Boxes size={15} />} />
              <SidebarItem label="Orders" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<ShoppingBag size={15} />} />
              <SidebarItem label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings2 size={15} />} />
            </nav>

            {/* Admin info + Logout at bottom */}
            <div className="mt-auto space-y-3 border-t border-[var(--line)] pt-5">
              <div className="rounded-[1.2rem] border border-[var(--line)] bg-white/[0.03] p-3 text-xs text-[var(--text-secondary)]">
                <p className="font-medium text-[var(--text-primary)]">{user?.name || brand.name}</p>
                <p className="mt-1 break-all">{user?.email}</p>
              </div>
              <Link
                to="/"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white/[0.03] px-4 py-2.5 text-sm text-[var(--text-primary)] transition hover:border-[var(--gold)]/35"
              >
                <Store size={14} />
                Back to Store
              </Link>
            </div>
          </div>
        </aside>

        {/* Main content area */}
        <div className="min-w-0 flex-1 rounded-[2rem] border border-[var(--line)] bg-[#0c0d0d] p-5 md:p-6">
          {/* Page header */}
          <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-green)]">Admin Panel</p>
              <h1 className="mt-2 font-display text-3xl text-[var(--text-primary)]">{currentSection.title}</h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">{currentSection.description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {activeTab === 'orders' ? (
                <button
                  type="button"
                  onClick={clearAllTransactions}
                  disabled={busy || !orders.length}
                  className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 px-5 py-2.5 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 size={15} />
                  Clear transactions
                </button>
              ) : null}
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/[0.03] px-5 py-2.5 text-sm text-[var(--text-primary)] lg:hidden"
              >
                <Store size={14} />
                Back to Store
              </Link>
            </div>
          </div>

          {/* Mobile navigation tabs */}
          <div className="mt-5 flex flex-wrap gap-2 lg:hidden">
            <SidebarItem label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<BarChart3 size={14} />} compact />
            <SidebarItem label="Products" active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={<Boxes size={14} />} compact />
            <SidebarItem label="Orders" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<ShoppingBag size={14} />} compact />
            <SidebarItem label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings2 size={14} />} compact />
          </div>

          {error ? (
            <div className="mt-5 rounded-[1.4rem] border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="mt-8 flex items-center justify-center rounded-[1.5rem] border border-[var(--line)] bg-white/[0.03] p-8 text-sm text-[var(--text-secondary)]">
              <LoaderCircle size={18} className="mr-2 animate-spin" /> Loading...
            </div>
          ) : null}

          {/* Dashboard */}
          {!loading && activeTab === 'dashboard' ? (
            <div className="mt-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Products" value={summary.productsCount} helper="Active catalog items" />
                <StatCard label="Low stock" value={summary.lowStockCount} helper="Needs attention" />
                <StatCard label="Orders" value={summary.flutterwaveOrders} helper="Flutterwave orders" />
                <StatCard label="Revenue" value={formatPrice(summary.paidRevenue)} helper="Paid orders only" />
              </div>
              <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <Panel title="Recent orders" subtitle="Latest Flutterwave payment activity">
                  {orders.length ? (
                    <div className="space-y-3">
                      {orders.slice(0, 6).map((order) => (
                        <div key={order.id} className="rounded-[1.3rem] border border-[var(--line)] bg-white/[0.03] p-4">
                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="text-sm font-medium text-[var(--text-primary)]">{order.customerName}</p>
                              <p className="mt-1 text-sm text-[var(--text-secondary)]">{order.orderRef}</p>
                              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">{formatDateTime(order.createdAt)}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge value={order.paymentStatus} />
                              <Badge value={order.fulfilmentStatus} />
                              <span className="font-display text-xl text-[var(--gold)]">{formatPrice(order.totalAmount)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState message="No orders yet. New payment activity will appear here." />
                  )}
                </Panel>

                <Panel title="Store snapshot" subtitle="Current live settings">
                  <div className="space-y-3 text-sm text-[var(--text-secondary)]">
                    <InfoRow label="Business" value={storeConfig.businessName} />
                    <InfoRow label="WhatsApp" value={storeConfig.whatsappNumber || 'Not set'} />
                    <InfoRow label="Support email" value={storeConfig.supportEmail || 'Not set'} />
                    <InfoRow label="Delivery fee" value={formatPrice(storeConfig.deliveryFee || 0)} />
                  </div>
                </Panel>
              </div>
            </div>
          ) : null}

          {/* Products */}
          {!loading && activeTab === 'products' ? (
            <div className="mt-6 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[var(--text-secondary)]">{products.length} product{products.length !== 1 ? 's' : ''} in catalog</p>
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 self-start rounded-full bg-[var(--gold)] px-5 py-2.5 text-sm font-semibold text-[#111]"
                >
                  <PackagePlus size={15} />
                  Add product
                </button>
              </div>

              {products.length ? (
                products.map((product) => {
                  const gallery = getProductImages(product);
                  return (
                    <div key={product.id} className="grid gap-4 rounded-[1.5rem] border border-[var(--line)] bg-white/[0.03] p-4 lg:grid-cols-[100px_1fr_auto] lg:items-center">
                      <img src={gallery[0]} alt={product.name} loading="lazy" decoding="async" className="h-24 w-full rounded-[1rem] object-cover lg:h-[100px] lg:w-[100px]" />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-2xl text-[var(--text-primary)]">{product.name}</h3>
                          <Badge value={product.status} />
                          <span className="rounded-full border border-[var(--line)] px-2 py-0.5 text-xs text-[var(--text-secondary)]">{gallery.length} img{gallery.length > 1 ? 's' : ''}</span>
                          {product.featured ? <span className="rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-2 py-0.5 text-xs text-[var(--gold-soft)]">Featured</span> : null}
                        </div>
                        <p className="mt-1 text-sm text-[var(--text-secondary)]">{product.category}{product.volume ? ` • ${product.volume}` : ''}{product.sku ? ` • SKU ${product.sku}` : ''}</p>
                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--text-secondary)]">{product.description}</p>
                        <div className="mt-2 flex flex-wrap gap-4 text-sm">
                          <span>Price: <strong className="text-[var(--gold)]">{formatPrice(product.price)}</strong></span>
                          <span className="text-[var(--text-secondary)]">Qty: <strong className="text-[var(--text-primary)]">{product.inventoryQuantity}</strong></span>
                          <span className="text-[var(--text-secondary)]">Visibility: <strong className="text-[var(--text-primary)]">{product.isActive ? 'Visible' : 'Hidden'}</strong></span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 lg:flex-col lg:items-end">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct(product);
                            setModalOpen(true);
                          }}
                          className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2 text-sm text-[var(--text-primary)] transition hover:border-[var(--gold)]/35"
                        >
                          <Pencil size={13} /> Edit
                        </button>
                        <button type="button" onClick={() => deleteProduct(product.id)} className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 px-4 py-2 text-sm text-rose-200 transition hover:bg-rose-500/10">
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState message="No products found. Click 'Add product' to populate the catalog." />
              )}
            </div>
          ) : null}

          {/* Orders — Flutterwave only */}
          {!loading && activeTab === 'orders' ? (
            <div className="mt-6 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[var(--text-secondary)]">{orders.length} order{orders.length !== 1 ? 's' : ''} found</p>
                <button
                  type="button"
                  onClick={clearAllTransactions}
                  disabled={busy || !orders.length}
                  className="inline-flex items-center gap-2 self-start rounded-full border border-rose-500/30 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-50 md:hidden"
                >
                  <Trash2 size={14} />
                  Clear transactions
                </button>
              </div>

              {orders.length ? (
                orders.map((order) => (
                  <div key={order.id} className="rounded-[1.5rem] border border-[var(--line)] bg-white/[0.03] p-4">
                    <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-2xl text-[var(--text-primary)]">{order.customerName}</h3>
                          <Badge value={order.paymentStatus} />
                          <Badge value={order.fulfilmentStatus} />
                        </div>
                        <p className="mt-1 text-sm text-[var(--text-secondary)]">{order.orderRef} • {formatDateTime(order.createdAt)}</p>
                        <p className="mt-1 text-sm text-[var(--text-secondary)]">Phone: {order.customerPhone}</p>
                        {order.customerEmail ? <p className="mt-0.5 text-sm text-[var(--text-secondary)]">Email: {order.customerEmail}</p> : null}
                        <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">Address: {order.shippingAddress}</p>
                        {order.notes ? <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">Note: {order.notes}</p> : null}
                        <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                          {order.items.map((item) => (
                            <div key={`${order.id}-${item.name}`} className="rounded-[1.2rem] border border-[var(--line)] bg-[#111314] p-3 text-sm text-[var(--text-secondary)]">
                              <p className="text-[var(--text-primary)]">{item.name}</p>
                              <p className="mt-0.5">{item.quantity} × {formatPrice(item.price)}</p>
                              <p className="mt-0.5 text-[var(--gold)]">{formatPrice(item.total)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-3 xl:w-[240px]">
                        <div className="rounded-[1.2rem] border border-[var(--line)] bg-[#111314] p-4">
                          <p className="text-xs text-[var(--text-secondary)]">Total</p>
                          <p className="mt-1 font-display text-2xl text-[var(--gold)]">{formatPrice(order.totalAmount)}</p>
                        </div>
                        <label className="space-y-1.5 text-sm text-[var(--text-primary)]">
                          <span>Payment status</span>
                          <select className="input-style" value={order.paymentStatus} onChange={(e) => updateOrder(order.id, { paymentStatus: e.target.value })} disabled={savingOrderId === order.id}>
                            {['initiated', 'pending', 'paid', 'failed', 'cancelled'].map((status) => (
                              <option key={status} value={status}>{titleCase(status)}</option>
                            ))}
                          </select>
                        </label>
                        <label className="space-y-1.5 text-sm text-[var(--text-primary)]">
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
                ))
              ) : (
                <EmptyState message="No Flutterwave orders yet." />
              )}
            </div>
          ) : null}

          {/* Settings */}
          {!loading && activeTab === 'settings' ? (
            <div className="mt-6">
              <Panel title="Store settings" subtitle="These values control what customers see on the storefront and how checkout behaves.">
                <form className="grid gap-4 md:grid-cols-2" onSubmit={saveConfig}>
                  <Field label="Business name">
                    <input className="input-style" value={storeConfig.businessName} onChange={(e) => setStoreConfig((prev) => ({ ...prev, businessName: e.target.value }))} />
                  </Field>
                  <Field label="WhatsApp number">
                    <input className="input-style" value={storeConfig.whatsappNumber} onChange={(e) => setStoreConfig((prev) => ({ ...prev, whatsappNumber: e.target.value }))} placeholder="2348000000000" />
                  </Field>
                  <Field label="Support email">
                    <input className="input-style" value={storeConfig.supportEmail} onChange={(e) => setStoreConfig((prev) => ({ ...prev, supportEmail: e.target.value }))} type="email" />
                  </Field>
                  <Field label="Delivery fee">
                    <input className="input-style" value={storeConfig.deliveryFee} onChange={(e) => setStoreConfig((prev) => ({ ...prev, deliveryFee: e.target.value }))} type="number" min="0" />
                  </Field>
                  <Field label="Currency">
                    <input className="input-style" value={storeConfig.currency} onChange={(e) => setStoreConfig((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }))} />
                  </Field>
                  <Field label="Flutterwave public key">
                    <input className="input-style" value={storeConfig.flutterwavePublicKey} onChange={(e) => setStoreConfig((prev) => ({ ...prev, flutterwavePublicKey: e.target.value }))} />
                  </Field>
                  <Field label="Hero notice" className="md:col-span-2">
                    <input className="input-style" value={storeConfig.heroNotice} onChange={(e) => setStoreConfig((prev) => ({ ...prev, heroNotice: e.target.value }))} />
                  </Field>
                  <div className="flex justify-end md:col-span-2">
                    <button type="submit" disabled={busy} className="rounded-full bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[#111] disabled:opacity-70">
                      {busy ? 'Saving...' : 'Save settings'}
                    </button>
                  </div>
                </form>
              </Panel>
            </div>
          ) : null}
        </div>
      </div>

      <ProductFormModal
        open={modalOpen}
        onClose={() => {
          if (busy) return;
          setModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={saveProduct}
        product={editingProduct}
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
          ? 'border-[var(--gold)]/30 bg-[var(--gold)] text-[#111] font-medium'
          : 'border-[var(--line)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
        <p className="text-base font-semibold text-[var(--text-primary)]">{title}</p>
        {subtitle ? <p className="mt-1 text-sm text-[var(--text-secondary)]">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="rounded-[1.2rem] border border-[var(--line)] bg-white/[0.03] px-4 py-3">
      <span className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">{label}</span>
      <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

function Field({ label, children, className = '' }) {
  return (
    <label className={`block space-y-2 ${className}`}>
      <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
      {children}
    </label>
  );
}

function EmptyState({ message }) {
  return (
    <div className="rounded-[1.4rem] border border-dashed border-[var(--line)] bg-white/[0.03] px-4 py-8 text-center text-sm text-[var(--text-secondary)]">
      {message}
    </div>
  );
}
