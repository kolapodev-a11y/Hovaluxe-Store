import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Gem, Heart, LogOut, Menu, Shield, ShoppingBag, User, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { brand } from '../data/store';
import { formatRoleLabel } from '../utils/auth';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

export function Header({ cartCount, onCartOpen, showTransactionSection = false }) {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, requestLogout } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = useMemo(
    () => [
      { label: 'Store', href: '/' },
      { label: 'Wishlist', href: '/wishlist' },
      ...(showTransactionSection ? [{ label: 'Transactions', href: '/transactions' }] : []),
    ],
    [showTransactionSection],
  );

  const navLinkClass = ({ isActive }) =>
    `transition ${
      isActive
        ? 'text-[var(--gold)]'
        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
    }`;

  const closeMenu = () => setOpen(false);

  const openCart = () => {
    closeMenu();
    if (typeof onCartOpen === 'function') {
      onCartOpen();
      return;
    }
    navigate('/');
  };

  const handleLogout = () => {
    const didLogout = requestLogout();
    if (didLogout) {
      closeMenu();
      navigate('/', { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-40 overflow-x-clip border-b border-[var(--line)] bg-[rgba(9,10,11,0.9)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl min-w-0 items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-4 md:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3 lg:flex-none">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1.15rem] border border-[var(--gold)]/25 bg-[linear-gradient(135deg,#181613,#0c0c0d)] text-[var(--gold)] shadow-[0_0_30px_rgba(199,164,93,.16)] sm:h-11 sm:w-11">
            <Gem size={18} className="sm:hidden" />
            <Gem size={20} className="hidden sm:block" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-[1.45rem] leading-none text-[var(--text-primary)] sm:text-2xl">{brand.name}</p>
            <p className="mt-1 truncate text-[9px] uppercase tracking-[0.28em] text-[var(--text-secondary)] sm:text-[10px] sm:tracking-[0.34em]">
              Luxury fragrance
            </p>
          </div>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-8 lg:flex">
          {navItems.map((item) => (
            <NavLink key={item.label} to={item.href} className={navLinkClass} end={item.href === '/'}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <NavLink
            to="/wishlist"
            className={({ isActive }) =>
              `inline-flex h-10 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium whitespace-nowrap transition sm:h-11 sm:gap-2 sm:px-4 sm:text-sm ${
                isActive
                  ? 'border-[var(--gold)]/35 bg-[var(--gold)]/10 text-[var(--text-primary)]'
                  : 'border-[var(--line)] bg-white/5 text-[var(--text-primary)] hover:border-[var(--gold)]/40 hover:bg-white/10'
              }`
            }
          >
            <Heart size={15} className="shrink-0 sm:hidden" />
            <Heart size={16} className="hidden shrink-0 sm:block" />
            <span className="sm:hidden">{wishlistCount}</span>
            <>
              <span className="hidden sm:inline">Wishlist</span>
              <span>({wishlistCount})</span>
            </>
          </NavLink>
          <button
            type="button"
            onClick={openCart}
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[var(--line)] bg-white/5 px-2.5 text-xs font-medium text-[var(--text-primary)] whitespace-nowrap transition hover:border-[var(--gold)]/40 hover:bg-white/10 sm:h-11 sm:gap-2 sm:px-4 sm:text-sm"
          >
            <ShoppingBag size={15} className="shrink-0 sm:hidden" />
            <ShoppingBag size={16} className="hidden shrink-0 sm:block" />
            <span className="sm:hidden">{cartCount}</span>
            <>
              <span className="hidden sm:inline">Cart</span>
              <span>({cartCount})</span>
            </>
          </button>
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-white/5 text-[var(--text-primary)] transition hover:border-[var(--gold)]/40 hover:bg-white/10 sm:h-11 sm:w-11"
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
                {navItems.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.href}
                    end={item.href === '/'}
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
                ))}

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
                      onClick={handleLogout}
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
                    Sign in with email or Google to complete Flutterwave checkout, manage your wishlist, and review transaction history from the same account.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/login"
                      state={{ from: location.pathname }}
                      onClick={closeMenu}
                      className="inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[#111]"
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/register"
                      state={{ from: location.pathname }}
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
