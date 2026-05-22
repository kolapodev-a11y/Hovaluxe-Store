const STOREFRONT_CACHE_PREFIX = 'hovaluxe_storefront_cache_v1';
const PRODUCTS_CACHE_KEY = `${STOREFRONT_CACHE_PREFIX}:products`;
const CONFIG_CACHE_KEY = `${STOREFRONT_CACHE_PREFIX}:config`;
const FRESH_TTL_MS = 5 * 60 * 1000;
const MAX_STALE_MS = 24 * 60 * 60 * 1000;

const memoryCache = new Map();

function getStorage() {
  if (typeof window === 'undefined') return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isCacheEntryValid(entry) {
  return Boolean(
    entry
    && typeof entry === 'object'
    && Number.isFinite(entry.updatedAt)
    && Object.prototype.hasOwnProperty.call(entry, 'data'),
  );
}

function readCacheEntry(key, { maxAgeMs = Infinity } = {}) {
  const now = Date.now();
  const cachedEntry = memoryCache.get(key);

  if (isCacheEntryValid(cachedEntry) && now - cachedEntry.updatedAt <= maxAgeMs) {
    return cachedEntry;
  }

  const storage = getStorage();
  if (!storage) return null;

  try {
    const rawEntry = storage.getItem(key);
    if (!rawEntry) return null;

    const parsedEntry = JSON.parse(rawEntry);
    if (!isCacheEntryValid(parsedEntry)) return null;

    memoryCache.set(key, parsedEntry);
    if (now - parsedEntry.updatedAt > maxAgeMs) return null;

    return parsedEntry;
  } catch {
    return null;
  }
}

function writeCacheEntry(key, data) {
  const entry = {
    updatedAt: Date.now(),
    data,
  };

  memoryCache.set(key, entry);

  const storage = getStorage();
  if (!storage) return entry;

  try {
    storage.setItem(key, JSON.stringify(entry));
  } catch {
    // Ignore storage quota or serialization issues.
  }

  return entry;
}

function hasFreshCache(key) {
  return Boolean(readCacheEntry(key, { maxAgeMs: FRESH_TTL_MS }));
}

export function readCachedProducts({ freshOnly = false } = {}) {
  const entry = readCacheEntry(PRODUCTS_CACHE_KEY, { maxAgeMs: freshOnly ? FRESH_TTL_MS : MAX_STALE_MS });
  return Array.isArray(entry?.data) ? entry.data : [];
}

export function writeCachedProducts(products) {
  return writeCacheEntry(PRODUCTS_CACHE_KEY, Array.isArray(products) ? products : []);
}

export function hasFreshProductsCache() {
  return hasFreshCache(PRODUCTS_CACHE_KEY);
}

export function readCachedConfig({ freshOnly = false } = {}) {
  const entry = readCacheEntry(CONFIG_CACHE_KEY, { maxAgeMs: freshOnly ? FRESH_TTL_MS : MAX_STALE_MS });
  return entry?.data && typeof entry.data === 'object' ? entry.data : null;
}

export function writeCachedConfig(config) {
  return writeCacheEntry(CONFIG_CACHE_KEY, config && typeof config === 'object' ? config : {});
}

export function hasFreshConfigCache() {
  return hasFreshCache(CONFIG_CACHE_KEY);
}
