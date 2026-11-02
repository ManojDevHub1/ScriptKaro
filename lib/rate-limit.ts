import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

interface RateLimitRecord {
  timestamps: number[];
}

// In-memory token storage (per IP fallback)
const ipStore = new Map<string, RateLimitRecord>();

// Clean up stale IPs every 5 minutes to prevent memory leaks in dev/fallback
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    const windowMs = 60 * 1000;
    for (const [ip, record] of ipStore.entries()) {
      const activeTimestamps = record.timestamps.filter((ts) => now - ts < windowMs);
      if (activeTimestamps.length === 0) {
        ipStore.delete(ip);
      } else {
        record.timestamps = activeTimestamps;
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
}

let upstashRatelimit: Ratelimit | null = null;

function getUpstashRatelimit(): Ratelimit | null {
  if (upstashRatelimit) return upstashRatelimit;

  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (url && token) {
    try {
      const redis = new Redis({ url, token });
      upstashRatelimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '60 s'),
        prefix: 'scriptkaro:ratelimit',
        analytics: false,
      });
      return upstashRatelimit;
    } catch (e) {
      console.warn('[RateLimit] Failed to initialize Upstash Ratelimit, falling back to memory:', e);
      return null;
    }
  }

  return null;
}

/**
 * In-memory fallback rate limiter
 */
function checkRateLimitMemory(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60 * 1000
): RateLimitResult {
  const now = Date.now();
  const record = ipStore.get(identifier) || { timestamps: [] };

  const recentTimestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (recentTimestamps.length >= limit) {
    const oldest = recentTimestamps[0];
    const resetInSeconds = Math.ceil((oldest + windowMs - now) / 1000);

    return {
      success: false,
      limit,
      remaining: 0,
      resetInSeconds: Math.max(1, resetInSeconds),
    };
  }

  recentTimestamps.push(now);
  ipStore.set(identifier, { timestamps: recentTimestamps });

  const resetInSeconds = Math.ceil(windowMs / 1000);

  return {
    success: true,
    limit,
    remaining: limit - recentTimestamps.length,
    resetInSeconds,
  };
}

/**
 * Master rate limit checker:
 * Uses Upstash Redis (@upstash/ratelimit) if env vars are present,
 * gracefully falling back to in-memory sliding window limiter otherwise.
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60 * 1000
): Promise<RateLimitResult> {
  const ratelimiter = getUpstashRatelimit();

  if (ratelimiter) {
    try {
      const res = await ratelimiter.limit(identifier);
      const resetInSeconds = Math.max(1, Math.ceil((res.reset - Date.now()) / 1000));

      return {
        success: res.success,
        limit: res.limit,
        remaining: res.remaining,
        resetInSeconds,
      };
    } catch (err) {
      console.warn('[RateLimit] Upstash error, using in-memory fallback:', err);
    }
  }

  // Fallback to in-memory
  return checkRateLimitMemory(identifier, limit, windowMs);
}

/**
 * Extracts client IP from standard request headers
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0].trim();
    if (first) return first;
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  return '127.0.0.1';
}
