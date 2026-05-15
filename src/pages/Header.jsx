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
    <header className="sticky top-0 z-40 w-full max-w-full overflow-x-clip border-b border-[var(--line)] bg-[rgba(9,10,11,0.86)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-3 py-3 sm:justify-between sm:px-4 md:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 flex-1 items-center gap-2.5 sm:flex-none sm:gap-3" onClick={closeMenu}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[var(--gold)]/25 bg-[linear-gradient(135deg,#181613,#0c0c0d)] text-[var(--gold)] shadow-[0_0_30px_rgba(199,164,93,.16)] sm:h-11 sm:w-11">
            <Gem size={18} className="sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-[1.8rem] leading-none text-[var(--text-primary)] sm:text-2xl">
              {brand.name}
            </p>
            <p className="mt-1 hidden truncate text-[10px] uppercase tracking-[0.24em] text-[var(--text-secondary)] min-[420px]:block sm:tracking-[0.32em]">
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

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <NavLink
            to="/wishlist"
            aria-label={`Wishlist, ${wishlistCount} item${wishlistCount === 1 ? '' : 's'}`}
            className={({ isActive }) =>
              `inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs transition sm:px-4 sm:text-sm ${
                isActive
                  ? 'border-[var(--gold)]/35 bg-[var(--gold)]/10 text-[var(--text-primary)]'
                  : 'border-[var(--line)] bg-white/5 text-[var(--text-primary)] hover:border-[var(--gold)]/40 hover:bg-white/10'
              }`
            }
            onClick={closeMenu}
          >
            <Heart size={15} className="shrink-0 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Wishlist</span>
            <span>({wishlistCount})</span>
          </NavLink>
          <button
            type="button"
            onClick={openCart}
            aria-label={`Cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/5 px-3 py-2 text-xs text-[var(--text-primary)] transition hover:border-[var(--gold)]/40 hover:bg-white/10 sm:px-4 sm:text-sm"
          >
            <ShoppingBag size={15} className="shrink-0 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Cart</span>
            <span>({cartCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-white/5 text-[var(--text-primary)] transition hover:border-[var(--gold)]/40 hover:bg-white/10 sm:h-11 sm:w-11"
            aria-label="Toggle navigation menu"
            aria-expanded={open}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="w-full border-t border-[var(--line)] bg-[rgba(9,10,11,0.97)]">
          <div className="mx-auto grid w-full max-w-7xl gap-5 px-3 py-4 sm:px-4 md:px-6 lg:grid-cols-[1fr_1.05fr] lg:px-8">
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
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-green)]">Account</p>
                  <h3 className="mt-2 font-display text-[2rem] leading-none text-[var(--text-primary)] sm:text-3xl">
                    {isAuthenticated ? 'Signed in' : 'Sign in or register'}
                  </h3>
                </div>
                <User className="mt-1 shrink-0 text-[var(--gold)]" size={20} />
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
                    Sign in with email or Google to complete checkout, manage your wishlist, and review transaction history from the same account.
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
