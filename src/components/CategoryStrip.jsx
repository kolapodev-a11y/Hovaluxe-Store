import {
  Cloud,
  Droplets,
  Flame,
  Gem,
  Sparkles,
  Wind,
} from 'lucide-react';
import { categories } from '../data/store';

const categoryIcons = {
  Perfume: Gem,
  'Body Spray': Wind,
  'Roll Ons': Droplets,
  Diffusers: Flame,
  Humidifiers: Cloud,
};

export function CategoryStrip({ activeCategory, onChangeCategory }) {
  return (
    <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
      <FilterButton
        isActive={activeCategory === 'All'}
        onClick={() => onChangeCategory('All')}
        icon={Sparkles}
      >
        All products
      </FilterButton>
      {categories.map((category) => (
        <FilterButton
          key={category}
          isActive={activeCategory === category}
          onClick={() => onChangeCategory(category)}
          icon={categoryIcons[category]}
        >
          {category}
        </FilterButton>
      ))}
    </div>
  );
}

function FilterButton({ children, isActive, onClick, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs transition sm:gap-2 sm:px-4 sm:text-sm ${
        isActive
          ? 'border-[var(--gold)]/35 bg-[var(--gold)] text-[#11110f] shadow-[0_10px_24px_rgba(216,192,122,0.14)]'
          : 'border-[var(--line)] bg-white/5 text-[var(--text-secondary)] hover:border-[var(--gold)]/35 hover:text-[var(--text-primary)]'
      }`}
    >
      {Icon ? <Icon size={14} /> : null}
      {children}
    </button>
  );
}
