import { GenerateResponse } from './types';

interface CacheEntry {
  data: GenerateResponse;
  expiresAt: number;
}

// In-memory cache store
const cacheStore = new Map<string, CacheEntry>();
const MAX_CACHE_SIZE = 250;
const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function createCacheKey(
  topic: string,
  language: string,
  length: number,
  tone: string
): string {
  const normalizedTopic = topic
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 150);

  return `${language}:${length}:${tone}:${normalizedTopic}`;
}

export function getCachedResponse(key: string): GenerateResponse | null {
  const entry = cacheStore.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cacheStore.delete(key);
    return null;
  }

  return entry.data;
}

export function setCachedResponse(
  key: string,
  data: GenerateResponse,
  ttlMs: number = DEFAULT_TTL_MS
): void {
  // Enforce max size with LRU pruning if map grows too large
  if (cacheStore.size >= MAX_CACHE_SIZE) {
    const oldestKey = cacheStore.keys().next().value;
    if (oldestKey) cacheStore.delete(oldestKey);
  }

  cacheStore.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}
