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

      <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="text-center lg:text-left">
            <p className="eyebrow inline-flex justify-center lg:justify-start">{notice}</p>
            <p className="mt-4 text-sm uppercase tracking-[0.32em] text-[var(--text-secondary)]">
              {brand.name}
            </p>
            <h1 className="mx-auto mt-5 max-w-[11ch] font-display text-[clamp(3.2rem,11vw,5.8rem)] leading-[0.95] text-[var(--text-primary)] lg:mx-0">
              Luxury scents for body, home and everyday confidence.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[var(--text-secondary)] md:text-lg lg:mx-0">
              Premium perfume, body spray, roll ons, diffusers, and humidifiers in a polished storefront built for fast product discovery and confident checkout.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
              <a
                href="#collections"
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--gold-soft),var(--gold))] px-6 py-3 text-sm font-semibold text-[#1b140b] shadow-[0_10px_24px_rgba(216,192,122,0.18)] transition hover:-translate-y-0.5"
              >
                Shop collection
                <ArrowRight size={16} />
              </a>
              {cartCount > 0 ? (
                <button
                  type="button"
                  onClick={onCartOpen}
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-[var(--gold)]/30 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-[var(--gold-soft)] transition hover:-translate-y-0.5"
                >
                  Checkout options
                  <CreditCard size={16} />
                </button>
              ) : null}
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm lg:justify-start">
              <MetaChip label="Premium fragrance picks" />
              <MetaChip label="Nationwide delivery" />
            </div>
          </div>

          <div className="mx-auto w-full luxe-panel rounded-[1.75rem] p-5 md:p-6 lg:mx-0">
            <div className="mb-4 flex items-center justify-between gap-4">
              <span className="text-sm text-[var(--text-muted)]">Featured store preview</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-green)]/30 bg-[var(--accent-green)]/10 px-3 py-1 text-xs text-[var(--accent-green)]">
                <span className="h-2 w-2 rounded-full bg-current" />
                Online orders
              </span>
            </div>

            <div className="relative min-h-[290px] overflow-hidden rounded-[1.5rem] border border-white/8 bg-[radial-gradient(circle_at_50%_20%,rgba(216,192,122,0.18),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))]">
              <BottleVisual className="left-[10%] bottom-6 h-[170px] w-[120px]" />
              <BottleVisual className="left-1/2 bottom-6 h-[220px] w-[140px] -translate-x-1/2" featured />
              <BottleVisual className="right-[10%] bottom-6 h-[185px] w-[120px]" />
            </div>

            <div className="py-5 text-center">
              <h2 className="font-display text-3xl text-[var(--gold-soft)] md:text-4xl">
                Hovaluxe Signature Collection
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
    <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-4 py-2 text-sm text-[var(--text-secondary)]">
      <Sparkles size={14} className="text-[var(--gold)]" />
      {label}
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
