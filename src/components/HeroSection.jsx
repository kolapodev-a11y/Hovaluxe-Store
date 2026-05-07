import { MessageCircle, Sparkles, Wallet } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--line)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(199,164,93,0.18),transparent_25%),radial-gradient(circle_at_left,rgba(24,181,106,0.14),transparent_22%)]" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-20">
        <div className="relative z-10">
          <span className="inline-flex rounded-full border border-[var(--line)] bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-green)]">
            Different style, same luxury energy
          </span>
          <h1 className="mt-6 max-w-3xl font-display text-5xl leading-tight text-[var(--text-primary)] md:text-7xl">
            Hovaluxe — a modern editorial storefront inspired by your WhatsApp business palette.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--text-secondary)] md:text-lg">
            Instead of copying FortuneHub one-to-one, this version keeps the conversion flow and shopping layout,
            then re-styles everything with a premium black, gold, and green system that feels richer and more
            fragrance-focused.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#collections"
              className="rounded-full bg-[var(--gold)] px-6 py-3 text-sm font-semibold text-[#0e0d0b] transition hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(199,164,93,.28)]"
            >
              Browse collections
            </a>
            <a
              href="#payments"
              className="rounded-full border border-[var(--line)] bg-white/5 px-6 py-3 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--gold)]/45 hover:bg-white/10"
            >
              Payment options
            </a>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <FeatureChip icon={<Sparkles size={16} />} label="Perfume, sprays, roll ons" />
            <FeatureChip icon={<MessageCircle size={16} />} label="WhatsApp checkout" />
            <FeatureChip icon={<Wallet size={16} />} label="Flutterwave handoff" />
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-center lg:justify-end">
          <div className="relative w-full max-w-md rounded-[2rem] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(20,20,22,.95),rgba(11,11,12,.98))] p-5 shadow-[0_25px_70px_rgba(0,0,0,.45)]">
            <div className="absolute inset-x-12 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(226,201,138,.75),transparent)]" />
            <div className="mt-5 grid gap-3 rounded-[1.4rem] border border-[var(--line)] bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-display text-3xl text-[var(--text-primary)]">Hovaluxe</p>
                  <p className="text-sm text-[var(--text-secondary)]">React storefront + local admin panel</p>
                </div>
                <span className="rounded-full border border-[var(--accent-green)]/30 bg-[var(--accent-green)]/10 px-3 py-1 text-xs text-[var(--accent-green)]">
                  Tailwind CSS
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <MiniStat label="Palette" value="Black / Gold / Green" />
                <MiniStat label="Checkout" value="WhatsApp + Flutterwave" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureChip({ icon, label }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-white/5 px-4 py-3 text-sm text-[var(--text-primary)]">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--gold)]/10 text-[var(--gold)]">
        {icon}
      </span>
      <span>{label}</span>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[#111314] p-3">
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-secondary)]">{label}</p>
      <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">{value}</p>
    </div>
  );
}
