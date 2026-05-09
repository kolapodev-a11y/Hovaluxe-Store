export const formatPrice = (amount) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount || 0);

export const formatDateTime = (value) =>
  value
    ? new Intl.DateTimeFormat('en-NG', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value))
    : '—';

export const titleCase = (value = '') =>
  String(value)
    .replace(/_/g, ' ')
    .split('-')
    .join(' ')
    .split(' ')
    .filter(Boolean)
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(' ');

export const cn = (...classes) => classes.filter(Boolean).join(' ');
