// Rate-limit på Upstash Redis (sliding window). Multi-instance-safe.
//
// Krever env-variabler UPSTASH_REDIS_REST_URL og UPSTASH_REDIS_REST_TOKEN.
// I produksjon: fail-open (logg + in-memory soft limit per instance) med mindre
// RATE_LIMIT_FAIL_CLOSED=1 er satt. Bygg feiler ikke uten secrets.
//
// Ved vedvarende Redis-feil (WRONGPASS, ENOTFOUND, …) skrus Redis AV for
// resten av prosessens levetid (circuit open) — unngår spam + ekstra latency.

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

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

const REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const IS_PROD = process.env.NODE_ENV === "production";

let redis: Redis | null = null;
let initError: string | null = null;
let circuitOpen = false;

if (REST_URL && REST_TOKEN) {
  if (/xxxx\.upstash\.io|YOUR_|placeholder/i.test(REST_URL + REST_TOKEN)) {
    initError =
      "[rate-limit] UPSTASH_REDIS_* ser ut som plassholder. Soft in-memory limit.";
  } else {
    redis = new Redis({ url: REST_URL, token: REST_TOKEN });
  }
} else if (IS_PROD) {
  initError =
    "[rate-limit] UPSTASH_REDIS_REST_URL og/eller UPSTASH_REDIS_REST_TOKEN mangler i produksjon. " +
    "Legg til disse som Vercel Environment Variables.";
} else {
  console.warn("[rate-limit] UPSTASH_REDIS_REST_URL/TOKEN ikke satt — rate-limit er no-op i dev.");
}

const limiterCache = new Map<string, Ratelimit>();

function getLimiter(max: number, windowMs: number): Ratelimit | null {
  if (!redis || circuitOpen) return null;
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

function memoryLimit(key: string, max: number, windowMs: number): RateLimitResult {
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

function logFailOpen(msg: string, key: string) {
  const now = Date.now();
  if (now - lastFailOpenLogAt > 60_000) {
    lastFailOpenLogAt = now;
    console.error(`${msg} key=${key}`);
  }
}

function shouldOpenCircuit(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /WRONGPASS|unauthorized|ENOTFOUND|getaddrinfo|fetch failed|ECONNREFUSED|ETIMEDOUT|invalid or missing auth/i.test(
    msg,
  );
}

function openCircuit(reason: string) {
  if (circuitOpen) return;
  circuitOpen = true;
  redis = null;
  limiterCache.clear();
  console.error(`[rate-limit] circuit OPEN — Redis disabled for process: ${reason}`);
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
    logFailOpen(`${initError} Soft in-memory limit (RATE_LIMIT_FAIL_CLOSED ikke satt).`, key);
    return memoryLimit(key, max, windowMs);
  }

  if (circuitOpen) {
    return memoryLimit(key, max, windowMs);
  }

  const limiter = getLimiter(max, windowMs);
  if (!limiter) {
    return memoryLimit(key, max, windowMs);
  }

  try {
    const result = await limiter.limit(key);
    return {
      ok: result.success,
      remaining: result.remaining,
      resetAt: result.reset,
    };
  } catch (err) {
    if (process.env.RATE_LIMIT_FAIL_CLOSED === "1") {
      throw err;
    }
    const msg = err instanceof Error ? err.message : String(err);
    if (shouldOpenCircuit(err)) {
      openCircuit(msg);
    }
    logFailOpen(`[rate-limit] Upstash call failed (${msg}) — soft in-memory limit.`, key);
    return memoryLimit(key, max, windowMs);
  }
}
