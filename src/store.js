export const brand = {
  name: 'Hovaluxe',
  tagline: 'Luxury scents for elevated daily rituals.',
  description:
    'A premium fragrance storefront for perfume, body spray, roll ons, diffusers, and humidifiers with WhatsApp and Flutterwave payment flows.',
  whatsappNumber: '2348123456789', // replace with your real business WhatsApp number
  flutterwaveLink: 'https://flutterwave.com/pay/hovaluxe', // replace with your real Flutterwave checkout link
  adminDemo: {
    email: 'admin@hovaluxe.com',
    password: 'admin123',
  },
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

export function createProductArtwork({ title = 'Hovaluxe', subtitle = 'Luxury Scent', accentA = '#c7a45d', accentB = '#18b56a', bottle = 'LUXE' }) {
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
      <text x="120" y="155" fill="#ecd79d" font-family="Georgia, serif" font-size="44" letter-spacing="7">HOVALUXE</text>
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
      <text x="120" y="795" fill="#a39a8b" font-family="Arial, sans-serif" font-size="22">Luxury fragrance collection • Premium finish • Hovaluxe</text>
    </svg>
  `);
}

export const seedProducts = [
  {
    id: 'hv-001',
    name: 'Midnight Oud Elixir',
    category: 'Perfume',
    price: 28500,
    status: 'in-stock',
    featured: true,
    volume: '100ml',
    description: 'Deep oud, warm amber, and soft vanilla layered for a rich evening signature.',
    image: createProductArtwork({
      title: 'Midnight Oud Elixir',
      subtitle: 'Noir Reserve',
      accentA: '#c7a45d',
      accentB: '#18b56a',
      bottle: 'OUD',
    }),
  },
  {
    id: 'hv-002',
    name: 'Velvet Bloom Mist',
    category: 'Body Spray',
    price: 9500,
    status: 'in-stock',
    featured: true,
    volume: '250ml',
    description: 'Fresh floral body mist with a soft musky finish for everyday luxury.',
    image: createProductArtwork({
      title: 'Velvet Bloom Mist',
      subtitle: 'Body Spray',
      accentA: '#e5b0c7',
      accentB: '#c7a45d',
      bottle: 'MIST',
    }),
  },
  {
    id: 'hv-003',
    name: 'Pocket Amber Roll On',
    category: 'Roll Ons',
    price: 4500,
    status: 'in-stock',
    featured: false,
    volume: '12ml',
    description: 'Compact perfume oil with amber warmth, smooth spice, and excellent portability.',
    image: createProductArtwork({
      title: 'Pocket Amber Roll On',
      subtitle: 'Travel Oil',
      accentA: '#f0d596',
      accentB: '#97734b',
      bottle: 'ROLL',
    }),
  },
  {
    id: 'hv-004',
    name: 'Maison Reed Diffuser',
    category: 'Diffusers',
    price: 16000,
    status: 'low-stock',
    featured: true,
    volume: '150ml',
    description: 'A home diffuser blending cedarwood, citrus peel, and herbal freshness.',
    image: createProductArtwork({
      title: 'Maison Reed Diffuser',
      subtitle: 'Home Ritual',
      accentA: '#18b56a',
      accentB: '#c7a45d',
      bottle: 'HOME',
    }),
  },
  {
    id: 'hv-005',
    name: 'Aura Glow Humidifier',
    category: 'Humidifiers',
    price: 22000,
    status: 'in-stock',
    featured: false,
    volume: 'USB Aroma',
    description: 'Compact ambient humidifier designed to pair beautifully with essential oils.',
    image: createProductArtwork({
      title: 'Aura Glow Humidifier',
      subtitle: 'Calm Air',
      accentA: '#7de6cb',
      accentB: '#18b56a',
      bottle: 'AURA',
    }),
  },
  {
    id: 'hv-006',
    name: 'Royal Citrus Signature',
    category: 'Perfume',
    price: 24500,
    status: 'sold',
    featured: false,
    volume: '100ml',
    description: 'Sparkling citrus on top with woody depth and a confident dry-down.',
    image: createProductArtwork({
      title: 'Royal Citrus Signature',
      subtitle: 'Collector Series',
      accentA: '#f5d377',
      accentB: '#4bbd95',
      bottle: 'CITRUS',
    }),
  },
];

export const seedTransactions = [
  {
    id: 'TXN-1001',
    customer: 'Adaeze Martins',
    channel: 'Flutterwave',
    amount: 38000,
    status: 'Paid',
    items: 'Midnight Oud Elixir × 1',
    date: '2026-05-05 10:12',
  },
  {
    id: 'TXN-1002',
    customer: 'Tunde Adebayo',
    channel: 'WhatsApp',
    amount: 16000,
    status: 'Pending',
    items: 'Maison Reed Diffuser × 1',
    date: '2026-05-06 14:48',
  },
  {
    id: 'TXN-1003',
    customer: 'Kemi Johnson',
    channel: 'Flutterwave',
    amount: 31500,
    status: 'Paid',
    items: 'Velvet Bloom Mist × 1, Pocket Amber Roll On × 1, Shipping',
    date: '2026-05-06 18:03',
  },
];
