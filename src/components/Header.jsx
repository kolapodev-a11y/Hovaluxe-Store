import { Link, NavLink } from 'react-router-dom';
import { Gem, LogOut, Menu, Shield, ShoppingBag, User, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { brand } from '../data/store';
import { formatRoleLabel } from '../utils/auth';
import { useAuth } from '../context/AuthContext';

export function Header({
  cartCount,
  onCartOpen,
  canAccessCheckout = false,
  showTransactionSection = false,
}) {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const navItems = useMemo(
    () => [
      { label: 'Store', href: '/', type: 'route' },
      ...(canAccessCheckout ? [{ label: 'Payments', href: '#payments', type: 'anchor' }] : []),
      ...(showTransactionSection ? [{ label: 'Transactions', href: '#transactions', type: 'anchor' }] : []),
    ],
    [canAccessCheckout, showTransactionSection],
  );

  const navLinkClass = ({ isActive }) =>
    `transition ${
      isActive
        ? 'text-[var(--gold)]'
        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
    }`;

  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[rgba(9,10,11,0.86)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--gold)]/25 bg-[linear-gradient(135deg,#181613,#0c0c0d)] text-[var(--gold)] shadow-[0_0_30px_rgba(199,164,93,.16)]">
            <Gem size={20} />
          </div>
          <div>
            <p className="font-display text-2xl leading-none text-[var(--text-primary)]">{brand.name}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.38em] text-[var(--text-secondary)]">
              Luxury fragrance
            </p>
          </div>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-8 lg:flex">
          {navItems.map((item) =>
            item.type === 'route' ? (
              <NavLink key={item.label} to={item.href} className={navLinkClass} end>
                {item.label}
              </NavLink>
            ) : (
              <a key={item.label} href={item.href} className="text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]">
                {item.label}
              </a>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onCartOpen}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/5 px-4 py-2 text-sm text-[var(--text-primary)] transition hover:border-[var(--gold)]/40 hover:bg-white/10"
          >
            <ShoppingBag size={16} />
            Cart ({cartCount})
          </button>
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-white/5 text-[var(--text-primary)] transition hover:border-[var(--gold)]/40 hover:bg-white/10"
            aria-label="Toggle navigation menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-[var(--line)] bg-[rgba(9,10,11,0.97)]">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-5 md:px-6 lg:grid-cols-[1fr_1.05fr] lg:px-8">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-green)]">Menu</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {navItems.map((item) =>
                  item.type === 'route' ? (
                    <NavLink
                      key={item.label}
                      to={item.href}
                      end
                      onClick={closeMenu}
                      className={({ isActive }) =>
                        `rounded-[1.2rem] border px-4 py-3 text-sm transition ${
                          isActive
                            ? 'border-[var(--gold)]/35 bg-[var(--gold)]/10 text-[var(--text-primary)]'
                            : 'border-[var(--line)] bg-white/[0.03] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ) : (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={closeMenu}
                      className="rounded-[1.2rem] border border-[var(--line)] bg-white/[0.03] px-4 py-3 text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                    >
                      {item.label}
                    </a>
                  ),
                )}

                {isAdmin ? (
                  <NavLink
                    to="/admin"
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `rounded-[1.2rem] border px-4 py-3 text-sm transition ${
                        isActive
                          ? 'border-[var(--gold)]/35 bg-[var(--gold)]/10 text-[var(--text-primary)]'
                          : 'border-[var(--line)] bg-white/[0.03] text-[var(--text-primary)] hover:border-[var(--gold)]/35'
                      }`
                    }
                  >
                    Admin Panel
                  </NavLink>
                ) : null}
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-[var(--line)] bg-white/[0.03] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-green)]">Account</p>
                  <h3 className="mt-2 font-display text-3xl text-[var(--text-primary)]">
                    {isAuthenticated ? 'Signed in' : 'Sign in or register'}
                  </h3>
                </div>
                <User className="mt-1 text-[var(--gold)]" size={20} />
              </div>

              {isAuthenticated ? (
                <div className="mt-4 space-y-4">
                  <div className="rounded-[1.2rem] border border-[var(--line)] bg-[#111314] p-4 text-sm leading-7 text-[var(--text-secondary)]">
                    <p className="text-[var(--text-primary)]">{user?.name || brand.name}</p>
                    <p className="mt-1 break-all">{user?.email}</p>
                    <p className="mt-1 uppercase tracking-[0.18em] text-[var(--gold)]">{formatRoleLabel(user?.role || 'user')}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {isAdmin ? (
                      <Link
                        to="/admin"
                        onClick={closeMenu}
                        className="inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[#111]"
                      >
                        <Shield size={16} />
                        Open admin panel
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        closeMenu();
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-5 py-3 text-sm text-[var(--text-primary)]"
                    >
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  <p className="text-sm leading-7 text-[var(--text-secondary)]">
                    Sign in with email or Google to complete checkout and review your transaction history from the same account.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/login"
                      onClick={closeMenu}
                      className="inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[#111]"
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/register"
                      onClick={closeMenu}
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-5 py-3 text-sm text-[var(--text-primary)]"
                    >
                      Create account
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
