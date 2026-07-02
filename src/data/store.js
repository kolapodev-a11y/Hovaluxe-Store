export const brand = {
  name: 'Kunleluxe',
  tagline: 'Luxury scents for elevated daily rituals.',
  description: 'A premium fragrance storefront for perfumes, body sprays, roll-ons, diffusers, and humidifiers.',
};

export const categories = ['Perfume', 'Body Spray', 'Roll Ons', 'Diffusers', 'Humidifiers'];

export const statusOptions = [
  { value: 'in-stock', label: 'In Stock' },
  { value: 'low-stock', label: 'Low Stock' },
  { value: 'out-of-stock', label: 'Out of Stock' },
  { value: 'sold', label: 'Sold' },
];

export const paymentMethods = ['WhatsApp', 'Flutterwave'];

const svgToDataUri = (svg) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

export function createProductArtwork({
  title = 'Kunleluxe',
  subtitle = 'Luxury Scent',
  accentA = '#c7a45d',
  accentB = '#18b56a',
  bottle = 'LUXE',
}) {
  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 900">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#090a0b"/>
          <stop offset="60%" stop-color="#161311"/>
          <stop offset="100%" stop-color="#221d17"/>
        </linearGradient>
        <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${accentA}"/>
          <stop offset="100%" stop-color="${accentB}"/>
        </linearGradient>
        <radialGradient id="glow" cx="70%" cy="15%" r="65%">
          <stop offset="0%" stop-color="#fff0bb" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#fff0bb" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="800" height="900" fill="url(#bg)" rx="42"/>
      <circle cx="620" cy="180" r="170" fill="url(#glow)"/>
      <circle cx="180" cy="220" r="130" fill="${accentB}" opacity="0.08"/>
      <rect x="70" y="70" width="660" height="760" rx="34" fill="#11100f" stroke="#3b3329" stroke-width="3"/>
      <text x="120" y="155" fill="#ecd79d" font-family="Georgia, serif" font-size="44" letter-spacing="7">KUNLELUXE</text>
      <text x="120" y="202" fill="#9b9078" font-family="Arial, sans-serif" font-size="22" letter-spacing="9">${subtitle.toUpperCase()}</text>
      <g transform="translate(160 250)">
        <rect x="108" y="10" width="164" height="56" rx="18" fill="#2e2619" stroke="#6d5b3b" stroke-width="3"/>
        <rect x="134" y="66" width="110" height="38" rx="12" fill="#17120e" stroke="#8c7852" stroke-width="3"/>
        <path d="M58 164 C58 94 322 94 322 164 L352 438 C362 530 300 610 190 620 C80 610 18 530 28 438 Z" fill="#0f1010" stroke="url(#accent)" stroke-width="10"/>
        <path d="M89 184 C89 146 291 146 291 184 L310 412 C318 470 270 536 190 544 C110 536 62 470 70 412 Z" fill="#181614" stroke="#453d31" stroke-width="3"/>
        <rect x="115" y="220" width="150" height="126" rx="20" fill="url(#accent)" opacity="0.92"/>
        <text x="190" y="274" fill="#101213" font-family="Arial, sans-serif" font-weight="700" font-size="28" text-anchor="middle">${bottle}</text>
        <text x="190" y="308" fill="#101213" font-family="Arial, sans-serif" font-size="18" text-anchor="middle">EAU DE</text>
        <text x="190" y="338" fill="#101213" font-family="Arial, sans-serif" font-size="18" text-anchor="middle">PARFUM</text>
        <path d="M130 194 C146 170 180 160 214 166" fill="none" stroke="#fff7d1" stroke-opacity="0.55" stroke-width="8" stroke-linecap="round"/>
        <ellipse cx="190" cy="560" rx="128" ry="26" fill="#000" opacity="0.28"/>
      </g>
      <text x="120" y="750" fill="#f5efe5" font-family="Arial, sans-serif" font-size="42" font-weight="700">${title}</text>
      <text x="120" y="795" fill="#a39a8b" font-family="Arial, sans-serif" font-size="22">Luxury fragrance collection • Premium finish • Kunleluxe</text>
    </svg>
  `);
}

export function getProductImages(product) {
  const gallery = [
    ...(Array.isArray(product?.images) ? product.images : []),
    ...(Array.isArray(product?.gallery) ? product.gallery : []),
    product?.image,
  ]
    .map((item) => String(item || '').trim())
    .filter(Boolean);

  const uniqueGallery = [...new Set(gallery)].slice(0, 4);

  if (uniqueGallery.length) return uniqueGallery;

  return [
    createProductArtwork({
      title: product?.name || 'Kunleluxe',
      subtitle: product?.category || 'Luxury Scent',
      bottle: String(product?.name || 'LUXE').split(' ')[0].toUpperCase().slice(0, 8),
    }),
  ];
}

export function resolveProductImage(product) {
  return getProductImages(product)[0];
}

export function slugifyProductName(name = '') {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'product';
}

export function buildProductPath(product = {}) {
  const productId = encodeURIComponent(String(product.id || product._id || '').trim());
  const slug = encodeURIComponent(slugifyProductName(product.name));

  if (!productId) {
    return `/products/${slug}`;
  }

  return `/products/${productId}/${slug}`;
}

export function normalizeProduct(product) {
  const images = getProductImages(product);
  return {
    ...product,
    images,
    image: images[0],
  };
}
