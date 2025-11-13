class Cache {
  constructor(maxItems = 1000) {
    this.maxItems = maxItems;
    this.store = new Map(); // key → { value, expiry }
    this.hits = 0;
    this.misses = 0;
    this.expired = 0;
  }

  set(key, base64Value, ttlSeconds = null) {
    const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    const exists = this.store.has(key);

    this.store.set(key, { value: base64Value, expiry });

    // LRU eviction (remove oldest)
    if (this.store.size > this.maxItems) {
      const oldest = this.store.keys().next().value;
      this.store.delete(oldest);
    }

    return { updated: exists };
  }

  get(key) {
    const entry = this.store.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    if (entry.expiry && entry.expiry <= Date.now()) {
      this.store.delete(key);
      this.expired++;
      this.misses++;
      return null;
    }

    // LRU promote: delete + reinsert
    this.store.delete(key);
    this.store.set(key, entry);

    this.hits++;
    return entry.value;
  }

  del(key) {
    return this.store.delete(key);
  }

  cleanupExpired() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.expiry && entry.expiry <= now) {
        this.store.delete(key);
        this.expired++;
      }
    }
  }

  stats() {
    return {
      hits: this.hits,
      misses: this.misses,
      items: this.store.size,
      expired: this.expired
    };
  }
}

module.exports = Cache;
