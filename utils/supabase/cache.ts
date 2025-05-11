import { LRUCache } from 'lru-cache'

const cache = new LRUCache<string, any>({
  max: 500, // Maximum number of items to store in cache
  ttl: 1000 * 60 * 5, // Time to live: 5 minutes
})

export function getCacheKey(key: string, params?: Record<string, any>): string {
  return `${key}:${JSON.stringify(params || {})}`
}

export async function getCachedData<T>(
  key: string,
  params: Record<string, any> | undefined,
  fetchFn: () => Promise<T>
): Promise<T> {
  const cacheKey = getCacheKey(key, params)
  const cached = cache.get(cacheKey)
  
  if (cached !== undefined) {
    return cached as T
  }

  const data = await fetchFn()
  cache.set(cacheKey, data)
  return data
}

export function invalidateCache(key: string, params?: Record<string, any>): void {
  const cacheKey = getCacheKey(key, params)
  cache.delete(cacheKey)
} 