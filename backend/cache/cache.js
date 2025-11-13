class Cache {
  constructor(maxItems = 1000) {
    this.maxItems = maxItems;
    this.map = new Map();
  }

  _now() { return Date.now(); }

  _isExpired(entry) {
    return entry.expiresAt !== null && entry.expiresAt <= this._now();
  }

  _touch(key) {
    const v = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, v);
  }

  set(key, value, ttlSeconds = null) {
    const expiresAt = ttlSeconds ? (this._now() + ttlSeconds * 1000) : null;

    if (this.map.has(key)) {
      this.map.set(key, { value, expiresAt });
      this._touch(key);
      return { updated: true };
    }

    // LRU eviction
    while (this.map.size >= this.maxItems) {
      const lruKey = this.map.keys().next().value;
      this.map.delete(lruKey);
    }

    this.map.set(key, { value, expiresAt });
    return { created: true };
  }

  get(key) {
    const entry = this.map.get(key);
    if (!entry) return null;
    if (this._isExpired(entry)) {
      this.map.delete(key);
      return null;
    }
    this._touch(key);
    return entry.value;
  }

  del(key) {
    return this.map.delete(key);
  }

  cleanupExpired() {
    const now = this._now();
    for (const [k, v] of this.map.entries()) {
      if (v.expiresAt !== null && v.expiresAt <= now) {
        this.map.delete(k);
      }
    }
  }

  stats() {
    const now = this._now();
    let expired = 0;
    for (const v of this.map.values()) {
      if (v.expiresAt !== null && v.expiresAt <= now) expired++;
    }
    return {
      items: this.map.size,
      expired
    };
  }
}

module.exports = Cache;
