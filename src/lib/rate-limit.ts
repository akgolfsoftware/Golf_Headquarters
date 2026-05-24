// Rate-limit på Upstash Redis (sliding window). Multi-instance-safe.
//
// Krever env-variabler UPSTASH_REDIS_REST_URL og UPSTASH_REDIS_REST_TOKEN.
// I produksjon feiler kallet (ikke modul-initialiseringen) hvis disse mangler —
// stille no-op er ikke akseptabelt i produksjonsmiljø (H6 security audit).
// Feilen utsettes til rateLimit() kalles for å unngå at Next.js-build feiler
// (npm run build kjøres i NODE_ENV=production uten kjøre-miljø-secrets).
// I utvikling/test logges én advarsel og alle requests slipper gjennom.

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
const IS_PROD = process.env.NODE_ENV === "production";

let redis: Redis | null = null;

// S-8 / H6: manglende config i produksjon → deferred error (ikke module-init throw).
// Årsak: module-level throw krasjer Next.js-build fordi build-fasen kjøres med
// NODE_ENV=production men uten kjøre-miljø-secrets. Feilen kastes istedet fra
// rateLimit() når den faktisk kalles i kjørende produksjonsmiljø.
let initError: string | null = null;

if (REST_URL && REST_TOKEN) {
  redis = new Redis({ url: REST_URL, token: REST_TOKEN });
} else if (IS_PROD) {
  initError =
    "[rate-limit] UPSTASH_REDIS_REST_URL og/eller UPSTASH_REDIS_REST_TOKEN mangler i produksjon. " +
    "Legg til disse som Vercel Environment Variables.";
} else {
  // Kun i dev/test: vis én advarsel og fall tilbake til no-op.
  console.warn("[rate-limit] UPSTASH_REDIS_REST_URL/TOKEN ikke satt — rate-limit er no-op i dev.");
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
  // S-8 / H6: deferred error — kast nå når vi faktisk kjøres i produksjon
  // uten Upstash-konfigurasjon (init-koden over fant ikke env-vars).
  if (initError) throw new Error(initError);

  const limiter = getLimiter(max, windowMs);

  // No-op fallback når Upstash ikke er konfigurert (kun dev/test).
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
