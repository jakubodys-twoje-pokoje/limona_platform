import { LRUCache } from 'lru-cache';

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000');
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? '100');

type TokenEntry = { count: number };

const cache = new LRUCache<string, TokenEntry>({
  max: 500,
  ttl: WINDOW_MS,
});

export function checkRateLimit(
  token: string,
  limit: number = MAX_REQUESTS,
): { allowed: boolean; remaining: number } {
  const entry = cache.get(token) ?? { count: 0 };
  entry.count++;
  cache.set(token, entry);

  const remaining = Math.max(0, limit - entry.count);
  return { allowed: entry.count <= limit, remaining };
}

export async function rateLimit(
  token: string,
  limit: number = MAX_REQUESTS,
): Promise<void> {
  const { allowed } = checkRateLimit(token, limit);
  if (!allowed) {
    throw new Error('Rate limit exceeded');
  }
}
