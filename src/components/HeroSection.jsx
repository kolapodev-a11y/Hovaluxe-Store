import { ArrowRight, CreditCard, Sparkles } from 'lucide-react';
import { brand } from '../data/store';

export function HeroSection({
  notice = 'Nationwide delivery available',
  cartCount = 0,
  onCartOpen,
  onBrowseCollection,
}) {
  return (
    <section className="relative overflow-hidden border-b border-[var(--line)]">
      <div className="pointer-events-none absolute -left-20 -top-24 h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle,rgba(216,192,122,0.14),transparent_60%)] blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle,rgba(37,211,102,0.08),transparent_60%)] blur-[80px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:py-12 md:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow inline-flex max-w-full justify-center text-center">{notice}</p>
          <p className="mt-3 text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)] sm:text-sm sm:tracking-[0.32em]">
            {brand.name}
          </p>
          <h1 className="mx-auto mt-4 max-w-[12ch] font-display text-[clamp(2.45rem,10vw,5rem)] leading-[0.92] text-[var(--text-primary)]">
            <span className="block">Luxury scents</span>
            <span className="block">for body, home</span>
            <span className="block">&amp; everyday confidence.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[0.95rem] leading-7 text-[var(--text-secondary)] md:text-base">
            Perfume, body sprays, roll-ons, diffusers, and humidifiers built for faster browsing and smooth checkout.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={onBrowseCollection}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--gold-soft),var(--gold))] px-5 py-3 text-sm font-semibold text-[#1b140b] shadow-[0_10px_24px_rgba(216,192,122,0.18)] transition hover:-translate-y-0.5 sm:w-auto"
            >
              Shop collection
              <ArrowRight size={16} />
            </button>
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

          <div className="mt-5 flex flex-wrap justify-center gap-2.5 text-xs sm:text-sm">
            <MetaChip label="Premium fragrance picks" />
            <MetaChip label="Nationwide delivery" />
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
