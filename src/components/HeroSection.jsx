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

      <div className="relative mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10 lg:px-8 lg:py-12">
        <div className="grid gap-5 lg:gap-8">
          <div className="text-center lg:max-w-3xl lg:text-left">
            <p className="eyebrow inline-flex justify-center lg:justify-start">{notice}</p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.24em] text-[var(--text-secondary)] sm:text-xs sm:tracking-[0.3em]">
              {brand.name}
            </p>
            <h1 className="mx-auto mt-3 max-w-none font-display text-[clamp(1.85rem,7vw,4.1rem)] leading-[0.92] tracking-[-0.015em] text-[var(--text-primary)] lg:mx-0">
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

          <div className="mx-auto w-full max-w-none luxe-panel rounded-[1.3rem] p-3 md:p-4 lg:mx-0 lg:w-full lg:rounded-[1.5rem] lg:p-4.5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-[11px] text-[var(--text-muted)] sm:text-xs">Featured store preview</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-green)]/30 bg-[var(--accent-green)]/10 px-2.5 py-1 text-[10px] text-[var(--accent-green)] sm:px-3 sm:text-[11px]">
                <span className="h-2 w-2 rounded-full bg-current" />
                Online orders
              </span>
            </div>

            <div className="relative min-h-[184px] overflow-hidden rounded-[1.1rem] border border-white/8 bg-[radial-gradient(circle_at_50%_20%,rgba(216,192,122,0.18),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] sm:min-h-[208px] lg:min-h-[248px] xl:min-h-[270px]">
              <BottleVisual className="left-[12%] bottom-3.5 h-[116px] w-[84px] sm:bottom-4 sm:h-[134px] sm:w-[96px] lg:left-[13%] lg:bottom-5 lg:h-[154px] lg:w-[108px] xl:h-[170px] xl:w-[118px]" />
              <BottleVisual className="left-1/2 bottom-3.5 h-[148px] w-[102px] -translate-x-1/2 sm:bottom-4 sm:h-[170px] sm:w-[114px] lg:bottom-5 lg:h-[198px] lg:w-[132px] xl:h-[218px] xl:w-[144px]" featured />
              <BottleVisual className="right-[12%] bottom-3.5 h-[124px] w-[86px] sm:bottom-4 sm:h-[144px] sm:w-[98px] lg:right-[13%] lg:bottom-5 lg:h-[166px] lg:w-[110px] xl:h-[184px] xl:w-[122px]" />
            </div>

            <div className="pt-3 text-center sm:pt-3.5">
              <h2 className="font-display text-[1.62rem] leading-[1.02] text-[var(--gold-soft)] sm:text-[1.82rem] md:text-[1.98rem]">
                Hovaluxe Signature Collection
              </h2>
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
