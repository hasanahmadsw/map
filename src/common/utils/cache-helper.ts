import type { Cache } from 'cache-manager';

export class CacheHelper {
  constructor(private readonly cache: Cache) {}

  async getOrSet<T>(key: string, ttlMs: number, factory: () => Promise<T>): Promise<T> {
    const cached = await this.cache.get<T>(key);
    if (cached !== undefined && cached !== null) return cached;

    const value = await factory();
    await this.cache.set(key, value, ttlMs);
    return value;
  }
}
