/**
 * Unit-test: rate-limit no-op fallback uten Upstash-config.
 *
 * Kjøres med node:test + tsx:
 *   npx tsx --test src/lib/__tests__/rate-limit.test.ts
 *
 * Verifiserer at rateLimit() returnerer { ok: true } når
 * UPSTASH_REDIS_REST_URL/TOKEN ikke er satt (lokal dev uten Upstash).
 */

import test from "node:test";
import assert from "node:assert/strict";

// Mock env FØR vi importerer rate-limit
delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;

test("rateLimit returnerer ok=true når Upstash ikke er konfigurert", async () => {
  // Dynamic import sikrer at modulen leses etter at env er fjernet
  const { rateLimit } = await import("../rate-limit");
  const result = await rateLimit({
    key: "test:user-1",
    max: 5,
    windowMs: 60_000,
  });

  assert.equal(result.ok, true, "fallback skal slippe gjennom");
  assert.equal(result.remaining, 4, "remaining = max - 1 i fallback");
  assert.ok(result.resetAt > Date.now(), "resetAt skal være fremtidig");
});

test("rateLimit honorerer max-parameteren i no-op fallback", async () => {
  const { rateLimit } = await import("../rate-limit");
  const result = await rateLimit({
    key: "test:user-2",
    max: 100,
    windowMs: 1000,
  });
  assert.equal(result.remaining, 99);
});
