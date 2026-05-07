export function SectionTitle({ eyebrow, title, description, align = 'left' }) {
  const alignment = align === 'center' ? 'text-center items-center mx-auto' : 'text-left items-start';

  return (
    <div className={`mb-8 flex max-w-2xl flex-col gap-3 ${alignment}`}>
      {eyebrow ? (
        <span className="inline-flex w-fit rounded-full border border-[var(--line)] bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-green)]">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="font-display text-4xl font-semibold tracking-tight text-[var(--text-primary)] md:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="text-sm leading-7 text-[var(--text-secondary)] md:text-base">{description}</p>
      ) : null}
    </div>
  );
}
