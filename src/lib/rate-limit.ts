const buckets = new Map<string, { count: number; resetAt: number }>();

export const CHECKOUT_RATE_LIMIT = 5;
export const CHECKOUT_RATE_WINDOW_MS = 10 * 60 * 1000;
export const CHECKOUT_RATE_LIMIT_MESSAGE =
  'Too many orders submitted. Please wait a few minutes and try again.';

export const ADMIN_RATE_LIMIT = 60;
export const ADMIN_RATE_WINDOW_MS = 60_000;

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

export function pruneRateLimitBuckets(now = Date.now()): void {
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key);
  }
}

export function rateLimitBucketCount(): number {
  return buckets.size;
}

export function allowCheckout(ip: string): boolean {
  return rateLimit(`checkout:${ip}`, CHECKOUT_RATE_LIMIT, CHECKOUT_RATE_WINDOW_MS);
}

export function allowAdminMedia(userId: string): boolean {
  return rateLimit(`admin:${userId}`, ADMIN_RATE_LIMIT, ADMIN_RATE_WINDOW_MS);
}

// In-memory, process-local: correct only for a single running instance.
// Move to Upstash Redis (@upstash/ratelimit) before running more than one instance/region.
setInterval(() => {
  pruneRateLimitBuckets();
}, 60_000).unref?.();
