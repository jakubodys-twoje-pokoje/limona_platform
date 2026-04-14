import { LRUCache } from 'lru-cache';

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000');

const cache = new LRUCache<string, number>({ max: 500, ttl: WINDOW_MS });

export function checkRateLimit(token: string, limit: number): { allowed: boolean } {
  const count = (cache.get(token) ?? 0) + 1;
  cache.set(token, count);
  return { allowed: count <= limit };
}

export async function rateLimit(token: string, limit: number): Promise<void> {
  const { allowed } = checkRateLimit(token, limit);
  if (!allowed) throw new Error('Rate limit exceeded');
}
