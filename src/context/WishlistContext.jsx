import { createContext, useContext, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const WISHLIST_STORAGE_KEY = 'kunleluxe_wishlist';
const WishlistContext = createContext(null);

function normalizeWishlistItem(product = {}) {
  return {
    ...product,
    id: String(product.id || ''),
  };
}

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useLocalStorage(WISHLIST_STORAGE_KEY, []);

  const items = useMemo(
    () => (Array.isArray(wishlist) ? wishlist.map((item) => normalizeWishlistItem(item)).filter((item) => item.id) : []),
    [wishlist],
  );

  const ids = useMemo(() => new Set(items.map((item) => item.id)), [items]);

  const toggleWishlist = (product) => {
    const normalized = normalizeWishlistItem(product);
    if (!normalized.id) return false;

    let added = false;

    setWishlist((current) => {
      const safeCurrent = Array.isArray(current) ? current.map((item) => normalizeWishlistItem(item)).filter((item) => item.id) : [];
      const exists = safeCurrent.some((item) => item.id === normalized.id);

      if (exists) {
        added = false;
        return safeCurrent.filter((item) => item.id !== normalized.id);
      }

      added = true;
      return [normalized, ...safeCurrent];
    });

    return added;
  };

  const removeFromWishlist = (productId) => {
    const normalizedId = String(productId || '');
    setWishlist((current) =>
      (Array.isArray(current) ? current : []).filter((item) => String(item?.id || '') !== normalizedId),
    );
  };

  const clearWishlist = () => setWishlist([]);
  const isWishlisted = (productId) => ids.has(String(productId || ''));

  const value = useMemo(
    () => ({
      items,
      wishlist: items,
      count: items.length,
      isWishlisted,
      toggleWishlist,
      removeFromWishlist,
      clearWishlist,
    }),
    [items, ids],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider.');
  }
  return context;
}
