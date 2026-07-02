export function SectionTitle({ eyebrow, title, description, align = 'left' }) {
  const alignment = align === 'center' ? 'text-center items-center mx-auto' : 'text-left items-start';

  return (
    <div className={`mb-6 flex max-w-2xl flex-col gap-2.5 ${alignment}`}>
      {eyebrow ? (
        <span className="inline-flex w-fit rounded-full border border-[var(--line)] bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--accent-green)] sm:text-xs sm:tracking-[0.28em]">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="font-display text-[2.25rem] font-semibold leading-none tracking-tight text-[var(--text-primary)] sm:text-[2.6rem] md:text-[3.25rem]">
        {title}
      </h2>
      {description ? (
        <p className="text-sm leading-6 text-[var(--text-secondary)] md:text-[0.95rem] md:leading-7">{description}</p>
      ) : null}
    </div>
  );
}
