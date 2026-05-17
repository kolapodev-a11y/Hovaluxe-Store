import { ArrowRight, CreditCard, Sparkles } from 'lucide-react';
import { brand } from '../data/store';

export function HeroSection({
  notice = 'Nationwide delivery available',
  cartCount = 0,
  onCartOpen,
  onShopCollection,
}) {
  return (
    <section className="relative overflow-hidden border-b border-[var(--line)]">
      <div className="pointer-events-none absolute -left-20 -top-24 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(216,192,122,0.14),transparent_60%)] blur-[80px] sm:h-[380px] sm:w-[380px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(37,211,102,0.08),transparent_60%)] blur-[80px] sm:h-[380px] sm:w-[380px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-12 lg:px-8 lg:py-14">
        <div className="grid items-center gap-6 lg:grid-cols-[1.06fr_0.94fr] lg:gap-8">
          <div className="text-center lg:text-left">
            <p className="eyebrow inline-flex justify-center lg:justify-start">{notice}</p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.24em] text-[var(--text-secondary)] sm:text-xs sm:tracking-[0.3em]">
              {brand.name}
            </p>
            <h1 className="mx-auto mt-3 max-w-[12ch] font-display text-[clamp(2rem,8vw,4.25rem)] leading-[0.96] text-[var(--text-primary)] lg:mx-0 lg:max-w-[10ch]">
              <span className="block">Luxury scents</span>
              <span className="block">for body, home</span>
              <span className="block">and daily confidence.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[0.95rem] leading-7 text-[var(--text-secondary)] sm:text-[0.98rem] sm:leading-7 lg:mx-0">
              Premium perfumes, sprays, roll ons, diffusers, and humidifiers in a refined storefront built for quick browsing and smooth checkout.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
              <button
                type="button"
                onClick={onShopCollection}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--gold-soft),var(--gold))] px-5 py-3 text-sm font-semibold text-[#1b140b] shadow-[0_10px_24px_rgba(216,192,122,0.18)] transition hover:-translate-y-0.5 sm:min-h-12 sm:px-6"
              >
                Shop collection
                <ArrowRight size={16} />
              </button>
              {cartCount > 0 ? (
                <button
                  type="button"
                  onClick={onCartOpen}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--gold)]/30 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-[var(--gold-soft)] transition hover:-translate-y-0.5 sm:min-h-12 sm:px-6"
                >
                  Checkout options
                  <CreditCard size={16} />
                </button>
              ) : null}
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-2.5 text-sm lg:justify-start">
              <MetaChip label="Premium fragrance picks" />
              <MetaChip label="Nationwide delivery" />
            </div>
          </div>

          <div className="mx-auto w-full max-w-[470px] luxe-panel rounded-[1.35rem] p-3.5 md:p-4.5 lg:mx-0 lg:max-w-[500px] lg:rounded-[1.55rem] lg:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-[11px] text-[var(--text-muted)] sm:text-xs">Featured store preview</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-green)]/30 bg-[var(--accent-green)]/10 px-2.5 py-1 text-[10px] text-[var(--accent-green)] sm:px-3 sm:text-[11px]">
                <span className="h-2 w-2 rounded-full bg-current" />
                Online orders
              </span>
            </div>

            <div className="relative min-h-[200px] overflow-hidden rounded-[1.15rem] border border-white/8 bg-[radial-gradient(circle_at_50%_20%,rgba(216,192,122,0.18),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] sm:min-h-[228px] lg:min-h-[240px]">
              <BottleVisual className="left-[11%] bottom-4 h-[128px] w-[92px] sm:bottom-5 sm:h-[146px] sm:w-[104px]" />
              <BottleVisual className="left-1/2 bottom-4 h-[164px] w-[112px] -translate-x-1/2 sm:bottom-5 sm:h-[188px] sm:w-[124px]" featured />
              <BottleVisual className="right-[11%] bottom-4 h-[138px] w-[94px] sm:bottom-5 sm:h-[158px] sm:w-[106px]" />
            </div>

            <div className="pt-3 text-center sm:pt-4">
              <h2 className="font-display text-[1.7rem] leading-[1.02] text-[var(--gold-soft)] sm:text-[1.9rem] md:text-[2.1rem]">
                Hovaluxe Signature Collection
              </h2>
              <p className="mt-1.5 text-[13px] leading-6 text-[var(--text-secondary)] sm:text-sm sm:leading-6">
                Elegant scent storytelling with a cleaner, product-first storefront layout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MetaChip({ label }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-[11px] text-[var(--text-secondary)] sm:px-4 sm:text-xs">
      <Sparkles size={13} className="text-[var(--gold)]" />
      {label}
    </span>
  );
}

function BottleVisual({ className = '', featured = false }) {
  return (
    <div className={`absolute ${className}`}>
      <div
        className={`absolute left-1/2 top-[-20px] h-6 w-[40px] -translate-x-1/2 rounded-[12px_12px_8px_8px] bg-[linear-gradient(180deg,var(--gold-soft),var(--gold-deep))] ${featured ? 'w-[48px]' : ''}`}
      />
      <div className="absolute inset-0 rounded-[22px_22px_16px_16px] border border-white/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.28),rgba(255,255,255,0.04))] shadow-[inset_0_8px_20px_rgba(255,255,255,0.08),0_20px_26px_rgba(0,0,0,0.22)]" />
      <div className="absolute inset-[18px] rounded-[16px] bg-[linear-gradient(180deg,rgba(216,192,122,0.22),rgba(0,0,0,0))]" />
      <div className="absolute bottom-[-12px] left-1/2 h-5 w-[78%] -translate-x-1/2 rounded-full bg-black/30 blur-sm" />
    </div>
  );
}
