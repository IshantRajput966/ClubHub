// cache.ts

/**
 * A simple caching system to store and retrieve data.
 */
class Cache {
    private cacheStore: Map<string, any>;

    constructor() {
        this.cacheStore = new Map<string, any>();
    }

    /**
     * Store a value in the cache.
     * @param key - The key to store the value under.
     * @param value - The value to store.
     */
    set(key: string, value: any): void {
        this.cacheStore.set(key, value);
    }

    /**
     * Retrieve a value from the cache.
     * @param key - The key for the value to retrieve.
     * @returns The cached value or undefined if not found.
     */
    get(key: string): any | undefined {
        return this.cacheStore.get(key);
    }

    /**
     * Check if a key exists in the cache.
     * @param key - The key to check for.
     * @returns True if the key exists, false otherwise.
     */
    has(key: string): boolean {
        return this.cacheStore.has(key);
    }

    /**
     * Remove a value from the cache.
     * @param key - The key for the value to remove.
     */
    delete(key: string): void {
        this.cacheStore.delete(key);
    }

    /**
     * Clear all entries in the cache.
     */
    clear(): void {
        this.cacheStore.clear();
    }
}

export default Cache;