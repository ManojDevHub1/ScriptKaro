interface RateLimitRecord {
  timestamps: number[];
}

// In-memory token storage (per IP)
const ipStore = new Map<string, RateLimitRecord>();

// Clean up stale IPs every 5 minutes to prevent memory leaks
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

/**
 * Sliding Window Rate Limiter
 * @param identifier - Client IP or user identifier
 * @param limit - Maximum requests allowed in the window (default: 10)
 * @param windowMs - Time window in milliseconds (default: 60,000ms / 1 min)
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60 * 1000
): RateLimitResult {
  const now = Date.now();
  const record = ipStore.get(identifier) || { timestamps: [] };

  // Remove timestamps outside the sliding window
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
