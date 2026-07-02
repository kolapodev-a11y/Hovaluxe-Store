import { ArrowRight, CreditCard, Sparkles } from 'lucide-react';
import { brand } from '../data/store';

export function HeroSection({
  notice = 'Nationwide delivery available',
  cartCount = 0,
  onCartOpen,
}) {
  return (
    <section className="relative overflow-hidden border-b border-[var(--line)]">
      <div className="pointer-events-none absolute -left-20 -top-24 h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle,rgba(216,192,122,0.14),transparent_60%)] blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle,rgba(37,211,102,0.08),transparent_60%)] blur-[80px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:py-12 md:px-6 lg:px-8 lg:py-14">
        <div className="grid items-center gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-8">
          <div className="min-w-0 text-center lg:text-left">
            <p className="eyebrow inline-flex max-w-full justify-center text-center lg:justify-start">{notice}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)] sm:text-sm sm:tracking-[0.32em]">
              {brand.name}
            </p>
            <h1 className="mx-auto mt-4 max-w-[12ch] font-display text-[clamp(2.45rem,10vw,4.9rem)] leading-[0.92] text-[var(--text-primary)] lg:mx-0 lg:max-w-[11ch]">
              <span className="block">Luxury scents</span>
              <span className="block">for body, home</span>
              <span className="block">&amp; everyday confidence.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[0.95rem] leading-7 text-[var(--text-secondary)] md:text-base lg:mx-0">
              Perfume, body sprays, roll-ons, diffusers, and humidifiers built for faster browsing and smooth checkout.
            </p>

            <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row sm:flex-wrap lg:justify-start">
              <a
                href="#catalog"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--gold-soft),var(--gold))] px-5 py-3 text-sm font-semibold text-[#1b140b] shadow-[0_10px_24px_rgba(216,192,122,0.18)] transition hover:-translate-y-0.5 sm:w-auto"
              >
                Shop collection
                <ArrowRight size={16} />
              </a>
              {cartCount > 0 ? (
                <button
                  type="button"
                  onClick={onCartOpen}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[var(--gold)]/30 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-[var(--gold-soft)] transition hover:-translate-y-0.5 sm:w-auto"
                >
                  Checkout options
                  <CreditCard size={16} />
                </button>
              ) : null}
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-2.5 text-xs lg:justify-start sm:text-sm">
              <MetaChip label="Premium fragrance picks" />
              <MetaChip label="Nationwide delivery" />
            </div>
          </div>

          <div className="mx-auto w-full max-w-[28.5rem] luxe-panel rounded-[1.5rem] p-3.5 sm:p-4 md:p-5 lg:mx-0 lg:max-w-none">
            <div className="mb-3 flex flex-col gap-2 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
              <span className="text-xs text-[var(--text-muted)] sm:text-sm">Featured store preview</span>
              <span className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--accent-green)]/30 bg-[var(--accent-green)]/10 px-3 py-1 text-[11px] text-[var(--accent-green)] sm:justify-start sm:text-xs">
                <span className="h-2 w-2 rounded-full bg-current" />
                Online orders
              </span>
            </div>

            <div className="relative min-h-[210px] overflow-hidden rounded-[1.3rem] border border-white/8 bg-[radial-gradient(circle_at_50%_20%,rgba(216,192,122,0.18),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] sm:min-h-[240px]">
              <BottleVisual className="left-[9%] bottom-4 h-[128px] w-[94px] sm:left-[10%] sm:bottom-5 sm:h-[146px] sm:w-[104px]" />
              <BottleVisual className="left-1/2 bottom-4 h-[162px] w-[108px] -translate-x-1/2 sm:bottom-5 sm:h-[188px] sm:w-[122px]" featured />
              <BottleVisual className="right-[9%] bottom-4 h-[136px] w-[94px] sm:right-[10%] sm:bottom-5 sm:h-[156px] sm:w-[104px]" />
            </div>

            <div className="py-4 text-center">
              <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--text-secondary)] sm:text-[11px]">
                {brand.name}
              </p>
              <h2 className="mt-2 font-display text-[1.8rem] leading-none text-[var(--gold-soft)] sm:text-[2.2rem] md:text-[2.45rem]">
                Signature collection
              </h2>
              <p className="mt-2 text-xs leading-6 text-[var(--text-secondary)] sm:text-sm sm:leading-6">
                Elegant bestsellers preview with a luxury finish and quicker product discovery.
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
    <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3.5 py-1.5 text-xs text-[var(--text-secondary)] sm:px-4 sm:py-2 sm:text-sm">
      <Sparkles size={13} className="shrink-0 text-[var(--gold)]" />
      <span className="truncate">{label}</span>
    </span>
  );
}

function BottleVisual({ className = '', featured = false }) {
  return (
    <div className={`absolute ${className}`}>
      <div
        className={`absolute left-1/2 top-[-22px] h-6 w-[42px] -translate-x-1/2 rounded-[12px_12px_8px_8px] bg-[linear-gradient(180deg,var(--gold-soft),var(--gold-deep))] ${featured ? 'w-[50px]' : ''}`}
      />
      <div className="absolute inset-0 rounded-[22px_22px_16px_16px] border border-white/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.28),rgba(255,255,255,0.04))] shadow-[inset_0_8px_20px_rgba(255,255,255,0.08),0_20px_28px_rgba(0,0,0,0.22)]" />
      <div className="absolute inset-[17px] rounded-[16px] bg-[linear-gradient(180deg,rgba(216,192,122,0.22),rgba(0,0,0,0))]" />
      <div className="absolute bottom-[-12px] left-1/2 h-5 w-[78%] -translate-x-1/2 rounded-full bg-black/30 blur-sm" />
    </div>
  );
}
