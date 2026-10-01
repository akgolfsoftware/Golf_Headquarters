// Rate-limit på Upstash Redis (sliding window). Multi-instance-safe.
//
// Bruker REDIS_URL fra Vercel-integrasjonen, med eldre REST-variabler som reserve.
// I produksjon: fail-open (logg + in-memory soft limit per instance) med mindre
// RATE_LIMIT_FAIL_CLOSED=1 er satt. Bygg feiler ikke uten secrets.
//
// Etter Redis-feil brukes lokal reserve i ett minutt. Deretter får bare ett
// kall prøve Redis igjen; en kort feil skal ikke koble tjenesten fra permanent.

import { Ratelimit } from "@upstash/ratelimit";
import { createUpstashRedis } from "@/lib/upstash-redis";

export type RateLimitOptions = {
  key: string;
  max: number;
  windowMs: number;
};

type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
};

const IS_PROD = process.env.NODE_ENV === "production";

const redis = createUpstashRedis();
let initError: string | null = null;
const REDIS_RETRY_MS = 60_000;
let retryAt = 0;
let recoveryInFlight = false;

if (!redis && IS_PROD) {
  initError =
    "[rate-limit] Gyldig REDIS_URL eller Upstash REST-konfigurasjon mangler i produksjon.";
} else if (!redis) {
  console.warn(
    "[rate-limit] Redis-konfigurasjon mangler — rate-limit bruker lokal reserve i dev.",
  );
}

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

const memoryWindows = new Map<string, number[]>();
let lastFailOpenLogAt = 0;

function memoryLimit(
  key: string,
  max: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const cutoff = now - windowMs;
  const prev = memoryWindows.get(key) ?? [];
  const kept = prev.filter((t) => t > cutoff);
  if (kept.length >= max) {
    const resetAt = (kept[0] ?? now) + windowMs;
    memoryWindows.set(key, kept);
    return { ok: false, remaining: 0, resetAt };
  }
  kept.push(now);
  memoryWindows.set(key, kept);
  return {
    ok: true,
    remaining: Math.max(0, max - kept.length),
    resetAt: now + windowMs,
  };
}

function logFailOpen(msg: string) {
  const now = Date.now();
  if (now - lastFailOpenLogAt > 60_000) {
    lastFailOpenLogAt = now;
    console.error(msg);
  }
}

function openCircuit() {
  retryAt = Date.now() + REDIS_RETRY_MS;
  limiterCache.clear();
  logFailOpen(
    "[rate-limit] Redis unavailable — local reserve; retry after 60 seconds.",
  );
}

export function rateLimit(opts: RateLimitOptions): Promise<RateLimitResult> {
  return rateLimitAsync(opts);
}

async function rateLimitAsync({
  key,
  max,
  windowMs,
}: RateLimitOptions): Promise<RateLimitResult> {
  if (initError) {
    if (process.env.RATE_LIMIT_FAIL_CLOSED === "1") {
      throw new Error(initError);
    }
    logFailOpen(
      `${initError} Soft in-memory limit (RATE_LIMIT_FAIL_CLOSED ikke satt).`,
    );
    return memoryLimit(key, max, windowMs);
  }

  if (Date.now() < retryAt || recoveryInFlight) {
    return memoryLimit(key, max, windowMs);
  }

  const limiter = getLimiter(max, windowMs);
  if (!limiter) {
    return memoryLimit(key, max, windowMs);
  }

  const recovering = retryAt > 0;
  if (recovering) recoveryInFlight = true;
  try {
    const result = await limiter.limit(key);
    retryAt = 0;
    return {
      ok: result.success,
      remaining: result.remaining,
      resetAt: result.reset,
    };
  } catch (err) {
    if (process.env.RATE_LIMIT_FAIL_CLOSED === "1") {
      throw err;
    }
    openCircuit();
    return memoryLimit(key, max, windowMs);
  } finally {
    if (recovering) recoveryInFlight = false;
  }
}
