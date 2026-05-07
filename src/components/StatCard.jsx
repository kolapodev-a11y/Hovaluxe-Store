export function StatCard({ label, value, helper }) {
  return (
    <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/[0.03] p-5 shadow-[0_12px_30px_rgba(0,0,0,.16)]">
      <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-secondary)]">{label}</p>
      <p className="mt-4 font-display text-4xl text-[var(--text-primary)]">{value}</p>
      {helper ? <p className="mt-2 text-sm text-[var(--text-secondary)]">{helper}</p> : null}
    </div>
  );
}
