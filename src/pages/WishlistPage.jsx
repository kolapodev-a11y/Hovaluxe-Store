import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { useWishlist } from '../context/WishlistContext';
import { useLocalStorage } from '../hooks/useLocalStorage';

export function WishlistPage() {
  const navigate = useNavigate();
  const { items } = useWishlist();
  const [cart, setCart] = useLocalStorage('kunleluxe_cart', []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product) => {
    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.id === product.id);
      if (existing) {
        return currentCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      <Header cartCount={cartCount} onCartOpen={() => navigate('/', { state: { openCart: true } })} />

      <main className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-[var(--line)] bg-[#0f1010] p-6 shadow-[0_24px_70px_rgba(0,0,0,.36)] lg:p-8">
          <div className="border-b border-[var(--line)] pb-5">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-green)]">Wishlist</p>
            <h1 className="mt-2 font-display text-4xl text-[var(--text-primary)] md:text-5xl">Saved products</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
              Keep track of the fragrances you love, compare options later, and move your favourites into the cart whenever you are ready.
            </p>
          </div>

          {items.length ? (
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {items.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                  showWishlistToggle
                  showAddToCartButton
                />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-[1.6rem] border border-dashed border-[var(--line)] bg-white/[0.03] p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--gold)]/10 text-[var(--gold)]">
                <Heart size={22} />
              </div>
              <h2 className="mt-4 font-display text-3xl text-[var(--text-primary)]">Your wishlist is empty</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                Open any product to save it to your wishlist, then return here when you are ready to compare or purchase.
              </p>
              <Link to="/" className="mt-6 inline-flex rounded-full bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[#111]">
                Browse the store
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
