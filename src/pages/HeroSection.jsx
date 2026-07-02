import { ArrowRight, CreditCard, Sparkles } from 'lucide-react';
import { brand } from '../data/store';

export function HeroSection({
  notice = 'Nationwide delivery available',
  cartCount = 0,
  onCartOpen,
}) {
  return (
    <section className="relative overflow-hidden border-b border-[var(--line)]">
      <div className="pointer-events-none absolute -left-20 -top-24 h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(216,192,122,0.14),transparent_60%)] blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(37,211,102,0.08),transparent_60%)] blur-[80px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:py-16 md:px-6 lg:px-8 lg:py-20">
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          <div className="min-w-0 text-center lg:text-left">
            <p className="eyebrow inline-flex max-w-full justify-center text-center lg:justify-start">{notice}</p>
            <p className="mt-4 text-sm uppercase tracking-[0.28em] text-[var(--text-secondary)] sm:tracking-[0.32em]">
              {brand.name}
            </p>
            <h1 className="mx-auto mt-5 max-w-[10ch] font-display text-[clamp(2.9rem,12vw,5.8rem)] leading-[0.95] text-[var(--text-primary)] lg:mx-0 lg:max-w-[11ch]">
              Luxury scents for body, home and everyday confidence.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[var(--text-secondary)] md:text-lg lg:mx-0">
              Premium perfume, body spray, roll ons, diffusers, and humidifiers in a polished storefront built for fast product discovery and confident checkout.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap lg:justify-start">
              <a
                href="#collections"
                className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--gold-soft),var(--gold))] px-6 py-3 text-sm font-semibold text-[#1b140b] shadow-[0_10px_24px_rgba(216,192,122,0.18)] transition hover:-translate-y-0.5 sm:w-auto"
              >
                Shop collection
                <ArrowRight size={16} />
              </a>
              {cartCount > 0 ? (
                <button
                  type="button"
                  onClick={onCartOpen}
                  className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full border border-[var(--gold)]/30 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-[var(--gold-soft)] transition hover:-translate-y-0.5 sm:w-auto"
                >
                  Checkout options
                  <CreditCard size={16} />
                </button>
              ) : null}
            </div>

            <div className="mt-7 flex flex-wrap justify-center gap-3 text-sm lg:justify-start">
              <MetaChip label="Premium fragrance picks" />
              <MetaChip label="Nationwide delivery" />
            </div>
          </div>

          <div className="mx-auto w-full max-w-[32rem] luxe-panel rounded-[1.75rem] p-4 sm:p-5 md:p-6 lg:mx-0 lg:max-w-none">
            <div className="mb-4 flex flex-col gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
              <span className="text-sm text-[var(--text-muted)]">Featured store preview</span>
              <span className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--accent-green)]/30 bg-[var(--accent-green)]/10 px-3 py-1 text-xs text-[var(--accent-green)] sm:justify-start">
                <span className="h-2 w-2 rounded-full bg-current" />
                Online orders
              </span>
            </div>

            <div className="relative min-h-[260px] overflow-hidden rounded-[1.5rem] border border-white/8 bg-[radial-gradient(circle_at_50%_20%,rgba(216,192,122,0.18),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] sm:min-h-[290px]">
              <BottleVisual className="left-[8%] bottom-5 h-[150px] w-[108px] sm:left-[10%] sm:bottom-6 sm:h-[170px] sm:w-[120px]" />
              <BottleVisual className="left-1/2 bottom-5 h-[190px] w-[124px] -translate-x-1/2 sm:bottom-6 sm:h-[220px] sm:w-[140px]" featured />
              <BottleVisual className="right-[8%] bottom-5 h-[162px] w-[108px] sm:right-[10%] sm:bottom-6 sm:h-[185px] sm:w-[120px]" />
            </div>

            <div className="py-5 text-center">
              <h2 className="font-display text-[2rem] text-[var(--gold-soft)] sm:text-3xl md:text-4xl">
                Kunleluxe Signature Collection
              </h2>
              <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)] md:text-base">
                Dark luxury visuals, elegant scent storytelling, and conversion-focused storefront sections.
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
    <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-4 py-2 text-sm text-[var(--text-secondary)]">
      <Sparkles size={14} className="shrink-0 text-[var(--gold)]" />
      <span className="truncate">{label}</span>
    </span>
  );
}

function BottleVisual({ className = '', featured = false }) {
  return (
    <div className={`absolute ${className}`}>
      <div
        className={`absolute left-1/2 top-[-24px] h-7 w-[46px] -translate-x-1/2 rounded-[12px_12px_8px_8px] bg-[linear-gradient(180deg,var(--gold-soft),var(--gold-deep))] ${featured ? 'w-[54px]' : ''}`}
      />
      <div className="absolute inset-0 rounded-[24px_24px_18px_18px] border border-white/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.28),rgba(255,255,255,0.04))] shadow-[inset_0_8px_20px_rgba(255,255,255,0.08),0_25px_30px_rgba(0,0,0,0.24)]" />
      <div className="absolute inset-[20px] rounded-[18px] bg-[linear-gradient(180deg,rgba(216,192,122,0.22),rgba(0,0,0,0))]" />
      <div className="absolute bottom-[-14px] left-1/2 h-6 w-[80%] -translate-x-1/2 rounded-full bg-black/30 blur-sm" />
    </div>
  );
}
