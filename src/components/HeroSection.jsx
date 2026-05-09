import { ArrowRight, MessageCircle, ShieldCheck, Sparkles, Wallet } from 'lucide-react';
import { brand } from '../data/store';

export function HeroSection({ notice = 'Nationwide delivery available' }) {
  return (
    <section className="relative overflow-hidden border-b border-[var(--line)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(199,164,93,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(24,181,106,0.12),transparent_24%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 text-center md:px-6 lg:px-8 lg:py-20">
        <span className="inline-flex rounded-full border border-[var(--line)] bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-green)]">
          Premium fragrance storefront
        </span>
        <p className="mt-6 text-sm uppercase tracking-[0.34em] text-[var(--gold)]">{brand.name}</p>
        <h1 className="mx-auto mt-5 max-w-5xl font-display text-5xl leading-[0.95] text-[var(--text-primary)] md:text-7xl">
          Luxury scents for body, home, and everyday confidence.
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-[var(--text-secondary)] md:text-lg">
          Discover curated perfume, body sprays, roll ons, diffusers, and humidifiers in a centered storefront experience inspired by your portfolio layout while keeping the Hovaluxe luxury identity intact.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#collections"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-6 py-3 text-sm font-semibold text-[#0e0d0b] transition hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(199,164,93,.28)]"
          >
            Browse collections
            <ArrowRight size={16} />
          </a>
          <a
            href="#payments"
            className="rounded-full border border-[var(--line)] bg-white/5 px-6 py-3 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--gold)]/45 hover:bg-white/10"
          >
            Payment options
          </a>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
          <MetaChip label={notice} />
          <MetaChip label="Centered premium storefront" />
          <MetaChip label="Sticky header navigation" />
        </div>

        <div className="mx-auto mt-12 max-w-5xl rounded-[2rem] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(20,20,22,.95),rgba(11,11,12,.98))] p-6 shadow-[0_25px_70px_rgba(0,0,0,.45)] md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:text-left">
            <div className="text-center lg:text-left">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-green)]">Storefront direction</p>
              <h2 className="mt-3 font-display text-4xl text-[var(--text-primary)] md:text-5xl">
                Clean sections, balanced spacing, and luxury presentation.
              </h2>
              <p className="mt-4 text-sm leading-8 text-[var(--text-secondary)] md:text-base">
                This update keeps your Hovaluxe header consistent, removes the top WhatsApp CTA, centers key copy, and makes the product browsing experience cleaner across mobile and desktop.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <FeatureCard icon={<Wallet size={18} />} title="Flutterwave checkout" text="Secure online payments when shoppers are ready to complete an order." />
              <FeatureCard icon={<MessageCircle size={18} />} title="WhatsApp ordering" text="Direct manual support stays available inside checkout instead of the header." />
              <FeatureCard icon={<ShieldCheck size={18} />} title="Protected admin access" text="Admin access is hidden until the allowed Google account signs in." />
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-3">
          <StatTile label="Categories" value="5 premium groups" />
          <StatTile label="Checkout" value="WhatsApp + Flutterwave" />
          <StatTile label="Layout" value="Centered and responsive" />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <div className="rounded-[1.4rem] border border-[var(--line)] bg-white/[0.03] p-4 text-center lg:text-left">
      <span className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--gold)]/10 text-[var(--gold)] lg:mx-0">
        {icon}
      </span>
      <h3 className="mt-4 font-display text-2xl text-[var(--text-primary)]">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{text}</p>
    </div>
  );
}

function MetaChip({ label }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--line)] bg-white/5 px-4 py-2 text-sm text-[var(--text-secondary)]">
      <Sparkles size={14} className="mr-2 text-[var(--gold)]" />
      {label}
    </span>
  );
}

function StatTile({ label, value }) {
  return (
    <div className="rounded-[1.4rem] border border-[var(--line)] bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-secondary)]">{label}</p>
      <p className="mt-3 font-display text-2xl text-[var(--text-primary)]">{value}</p>
    </div>
  );
}
