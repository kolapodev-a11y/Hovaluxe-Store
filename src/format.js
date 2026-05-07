export const formatPrice = (amount) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount || 0);

export const titleCase = (value = '') =>
  value
    .split('-')
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(' ');

export const cn = (...classes) => classes.filter(Boolean).join(' ');
