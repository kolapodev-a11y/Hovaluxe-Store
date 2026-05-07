import { Link, NavLink } from 'react-router-dom';
import { Gem, Menu, Shield, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';

export function Header({ brandName, cartCount, onCartOpen }) {
  const [open, setOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `transition ${
      isActive
        ? 'text-[var(--gold)]'
        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[rgba(9,10,11,0.82)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--gold)]/25 bg-[linear-gradient(135deg,#181613,#0c0c0d)] text-[var(--gold)] shadow-[0_0_30px_rgba(199,164,93,.16)]">
            <Gem size={20} />
          </div>
          <div>
            <p className="font-display text-2xl leading-none text-[var(--text-primary)]">{brandName}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.38em] text-[var(--text-secondary)]">
              Luxury fragrance
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/" className={navLinkClass} end>
            Storefront
          </NavLink>
          <a href="#collections" className="text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]">
            Collections
          </a>
          <a href="#payments" className="text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]">
            Payments
          </a>
          <NavLink to="/admin" className={navLinkClass}>
            Admin
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCartOpen}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/5 px-4 py-2 text-sm text-[var(--text-primary)] transition hover:border-[var(--gold)]/40 hover:bg-white/10"
          >
            <ShoppingBag size={16} />
            Cart ({cartCount})
          </button>
          <Link
            to="/admin"
            className="hidden rounded-full border border-[var(--accent-green)]/35 bg-[var(--accent-green)]/10 px-4 py-2 text-sm font-medium text-[var(--accent-green)] transition hover:bg-[var(--accent-green)]/15 md:inline-flex"
          >
            <Shield size={16} className="mr-2" />
            Admin Panel
          </Link>
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-white/5 text-[var(--text-primary)] md:hidden"
            aria-label="Toggle navigation"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-[var(--line)] bg-[rgba(9,10,11,0.95)] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <NavLink to="/" className={navLinkClass} end onClick={() => setOpen(false)}>
              Storefront
            </NavLink>
            <a href="#collections" className="text-[var(--text-secondary)]" onClick={() => setOpen(false)}>
              Collections
            </a>
            <a href="#payments" className="text-[var(--text-secondary)]" onClick={() => setOpen(false)}>
              Payments
            </a>
            <NavLink to="/admin" className={navLinkClass} onClick={() => setOpen(false)}>
              Admin Panel
            </NavLink>
          </div>
        </div>
      ) : null}
    </header>
  );
}
