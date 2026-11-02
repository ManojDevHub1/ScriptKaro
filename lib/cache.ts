import { Redis } from '@upstash/redis';
import { GenerateResponse } from './types';

interface CacheEntry {
  data: GenerateResponse;
  expiresAt: number;
}

// In-memory fallback cache store
const memoryCacheStore = new Map<string, CacheEntry>();
const MAX_CACHE_SIZE = 250;
const DEFAULT_TTL_SECONDS = 10 * 60; // 10 minutes (600 seconds)

let redisClient: Redis | null = null;

function getRedisClient(): Redis | null {
  if (redisClient) return redisClient;

  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (url && token) {
    try {
      redisClient = new Redis({ url, token });
      return redisClient;
    } catch (e) {
      console.warn('[Cache] Failed to initialize Upstash Redis, falling back to in-memory cache:', e);
      return null;
    }
  }

  return null;
}

export function createCacheKey(
  topic: string,
  language: string,
  length: number,
  tone: string,
  keyFacts?: string
): string {
  const normalizedTopic = topic
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 150);

  const normalizedFacts = keyFacts
    ? keyFacts.toLowerCase().trim().replace(/\s+/g, ' ').slice(0, 100)
    : '';

  return `scriptkaro:cache:${language}:${length}:${tone}:${normalizedTopic}:${normalizedFacts}`;
}

export async function getCachedResponse(key: string): Promise<GenerateResponse | null> {
  const redis = getRedisClient();

  if (redis) {
    try {
      const data = await redis.get<GenerateResponse>(key);
      if (data) return data;
    } catch (err) {
      console.warn('[Cache] Upstash Redis get error, falling back to memory:', err);
    }
  }

  // Fallback: in-memory cache check
  const entry = memoryCacheStore.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    memoryCacheStore.delete(key);
    return null;
  }

  return entry.data;
}

export async function setCachedResponse(
  key: string,
  data: GenerateResponse,
  ttlSeconds: number = DEFAULT_TTL_SECONDS
): Promise<void> {
  const redis = getRedisClient();

  if (redis) {
    try {
      await redis.set(key, data, { ex: ttlSeconds });
    } catch (err) {
      console.warn('[Cache] Upstash Redis set error, saving to memory fallback:', err);
    }
  }

  // Always mirror to in-memory fallback
  if (memoryCacheStore.size >= MAX_CACHE_SIZE) {
    const oldestKey = memoryCacheStore.keys().next().value;
    if (oldestKey) memoryCacheStore.delete(oldestKey);
  }

  memoryCacheStore.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}
