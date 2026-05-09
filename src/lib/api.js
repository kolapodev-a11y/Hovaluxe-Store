const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000/api').replace(/\/$/, '');

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({ success: false, message: 'Invalid server response.' }));

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || 'Request failed.');
  }

  return payload;
}

export const api = {
  // ---------- Auth ----------
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  googleLogin: (body) => request('/auth/google', { method: 'POST', body: JSON.stringify(body) }),
  getMe: (token) => request('/auth/me', { method: 'GET', token }),

  // ---------- Public storefront ----------
  getPublicConfig: () => request('/config/public', { method: 'GET' }),
  getProducts: () => request('/products', { method: 'GET' }),
  createFlutterwaveCheckout: (body, token) =>
    request('/payments/flutterwave/checkout', { method: 'POST', body: JSON.stringify(body), token }),
  verifyFlutterwavePayment: ({ transactionId, txRef }) =>
    request(
      `/payments/flutterwave/verify?transactionId=${encodeURIComponent(transactionId || '')}&txRef=${encodeURIComponent(txRef || '')}`,
      { method: 'GET' },
    ),

  // ---------- Admin ----------
  adminLogin: (body) => request('/admin/login', { method: 'POST', body: JSON.stringify(body) }),
  getAdminSummary: (token) => request('/admin/summary', { method: 'GET', token }),
  getAdminProducts: (token) => request('/admin/products', { method: 'GET', token }),
  createProduct: (token, body) => request('/admin/products', { method: 'POST', token, body: JSON.stringify(body) }),
  updateProduct: (token, id, body) =>
    request(`/admin/products/${id}`, { method: 'PUT', token, body: JSON.stringify(body) }),
  deleteProduct: (token, id) => request(`/admin/products/${id}`, { method: 'DELETE', token }),
  getOrders: (token, paymentMethod = 'all') =>
    request(`/admin/orders?paymentMethod=${encodeURIComponent(paymentMethod)}`, { method: 'GET', token }),
  updateOrder: (token, id, body) =>
    request(`/admin/orders/${id}`, { method: 'PATCH', token, body: JSON.stringify(body) }),
  recordWhatsAppOrder: (token, body) =>
    request('/admin/orders/whatsapp', { method: 'POST', token, body: JSON.stringify(body) }),
  getAdminConfig: (token) => request('/admin/config', { method: 'GET', token }),
  updateAdminConfig: (token, body) =>
    request('/admin/config', { method: 'PATCH', token, body: JSON.stringify(body) }),
};
