import { cn, titleCase } from '../utils/format';

const badgeStyles = {
  'in-stock': 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  'low-stock': 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  sold: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
  'out-of-stock': 'border-slate-500/30 bg-slate-500/10 text-slate-200',
  Paid: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  Pending: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  Initiated: 'border-sky-500/30 bg-sky-500/10 text-sky-200',
  Cancelled: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
};

export function Badge({ value, children }) {
  const text = children || titleCase(value);

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium',
        badgeStyles[value] || 'border-white/15 bg-white/5 text-[var(--text-secondary)]',
      )}
    >
      {text}
    </span>
  );
}
