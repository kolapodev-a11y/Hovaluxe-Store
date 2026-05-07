import { ShoppingBag, Star } from 'lucide-react';
import { Badge } from './Badge';
import { formatPrice } from '../utils/format';

export function ProductCard({ product, onAddToCart }) {
  const disabled = product.status === 'out-of-stock' || product.status === 'sold';

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,.01))] shadow-[0_18px_45px_rgba(0,0,0,.18)] transition duration-300 hover:-translate-y-1 hover:border-[var(--gold)]/28">
      <div className="relative aspect-[4/4.6] overflow-hidden border-b border-[var(--line)] bg-[#0c0d0d]">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <Badge value={product.status} />
          {product.featured ? <Badge value="featured">Featured</Badge> : null}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-secondary)]">{product.category}</p>
            <h3 className="mt-2 font-display text-3xl text-[var(--text-primary)]">{product.name}</h3>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-[var(--line)] bg-white/5 px-2.5 py-1 text-xs text-[var(--gold)]">
            <Star size={12} fill="currentColor" />
            Luxe
          </div>
        </div>

        <p className="text-sm leading-7 text-[var(--text-secondary)]">{product.description}</p>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-secondary)]">Volume</p>
            <p className="mt-1 text-sm text-[var(--text-primary)]">{product.volume}</p>
          </div>
          <p className="font-display text-3xl text-[var(--gold)]">{formatPrice(product.price)}</p>
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onAddToCart(product)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--gold)]/20 bg-[var(--gold)] px-4 py-3 text-sm font-semibold text-[#12110f] transition hover:shadow-[0_14px_35px_rgba(199,164,93,.28)] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-[var(--text-secondary)] disabled:shadow-none"
        >
          <ShoppingBag size={16} />
          {disabled ? 'Unavailable' : 'Add to bag'}
        </button>
      </div>
    </article>
  );
}
