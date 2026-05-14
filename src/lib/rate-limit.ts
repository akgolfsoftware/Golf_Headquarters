// Rate-limit på Upstash Redis (sliding window). Multi-instance-safe.
//
// Krever env-variabler UPSTASH_REDIS_REST_URL og UPSTASH_REDIS_REST_TOKEN.
// Hvis disse mangler (typisk lokal dev uten Upstash) faller vi tilbake til
// no-op — alle requests slipper gjennom. Logges én gang ved oppstart.

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type RateLimitOptions = {
  key: string; // f.eks. "ai-chat:userId123"
  max: number; // antall tillatt
  windowMs: number; // tidsvindu
};

type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
};

const REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | null = null;
let warnedNoConfig = false;

if (REST_URL && REST_TOKEN) {
  redis = new Redis({ url: REST_URL, token: REST_TOKEN });
} else if (!warnedNoConfig) {
  warnedNoConfig = true;
  // eslint-disable-next-line no-console
  console.warn(
    "[rate-limit] UPSTASH_REDIS_REST_URL/TOKEN ikke satt — rate-limit er no-op."
  );
}

// Cache per (max, windowMs) — Ratelimit-instanser er rimelig å gjenbruke.
const limiterCache = new Map<string, Ratelimit>();

function getLimiter(max: number, windowMs: number): Ratelimit | null {
  if (!redis) return null;
  const cacheKey = `${max}:${windowMs}`;
  let limiter = limiterCache.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(max, `${windowMs} ms`),
      analytics: false,
      prefix: "rl",
    });
    limiterCache.set(cacheKey, limiter);
  }
  return limiter;
}

export function rateLimit(opts: RateLimitOptions): Promise<RateLimitResult> {
  return rateLimitAsync(opts);
}

async function rateLimitAsync({
  key,
  max,
  windowMs,
}: RateLimitOptions): Promise<RateLimitResult> {
  const limiter = getLimiter(max, windowMs);

  // No-op fallback når Upstash ikke er konfigurert.
  if (!limiter) {
    return { ok: true, remaining: max - 1, resetAt: Date.now() + windowMs };
  }

  const result = await limiter.limit(key);
  return {
    ok: result.success,
    remaining: result.remaining,
    resetAt: result.reset,
  };
}
