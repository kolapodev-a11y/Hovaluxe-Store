import { cn, titleCase } from '../utils/format';

const badgeStyles = {
  'in-stock': 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  'low-stock': 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  'out-of-stock': 'border-slate-500/30 bg-slate-500/10 text-slate-200',
  sold: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
  paid: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  recorded: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  pending: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  initiated: 'border-sky-500/30 bg-sky-500/10 text-sky-200',
  failed: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
  cancelled: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
  new: 'border-sky-500/30 bg-sky-500/10 text-sky-200',
  processing: 'border-purple-500/30 bg-purple-500/10 text-purple-200',
  ready: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200',
  shipped: 'border-blue-500/30 bg-blue-500/10 text-blue-200',
  delivered: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  featured: 'border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold-soft)]',
};

export function Badge({ value, children }) {
  const normalizedValue = String(value || '').toLowerCase();
  const text = children || titleCase(normalizedValue);

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium',
        badgeStyles[normalizedValue] || 'border-white/15 bg-white/5 text-[var(--text-secondary)]',
      )}
    >
      {text}
    </span>
  );
}
