import { categories } from '../data/store';

export function CategoryStrip({ activeCategory, onChangeCategory }) {
  return (
    <div className="flex flex-wrap gap-3">
      <FilterButton isActive={activeCategory === 'All'} onClick={() => onChangeCategory('All')}>
        All products
      </FilterButton>
      {categories.map((category) => (
        <FilterButton
          key={category}
          isActive={activeCategory === category}
          onClick={() => onChangeCategory(category)}
        >
          {category}
        </FilterButton>
      ))}
    </div>
  );
}

function FilterButton({ children, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm transition ${
        isActive
          ? 'border-[var(--gold)]/30 bg-[var(--gold)] text-[#11110f]'
          : 'border-[var(--line)] bg-white/5 text-[var(--text-secondary)] hover:border-[var(--gold)]/35 hover:text-[var(--text-primary)]'
      }`}
    >
      {children}
    </button>
  );
}
