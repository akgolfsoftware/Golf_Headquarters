import assert from "node:assert/strict";
import test from "node:test";
import { getUpstashRedisConfig } from "./upstash-redis";

test("bruker Vercel-integrasjonens REDIS_URL som REST-konfigurasjon", () => {
  assert.deepEqual(
    getUpstashRedisConfig({
      REDIS_URL: "rediss://default:synthetic%2Dtoken@synthetic.upstash.io:6379",
    }),
    { url: "https://synthetic.upstash.io", token: "synthetic-token" },
  );
});

test("prioriterer ny REDIS_URL foran gamle REST-variabler", () => {
  assert.deepEqual(
    getUpstashRedisConfig({
      REDIS_URL: "rediss://default:new-token@new.upstash.io:6379",
      UPSTASH_REDIS_REST_URL: "https://old.upstash.io",
      UPSTASH_REDIS_REST_TOKEN: "old-token",
    }),
    { url: "https://new.upstash.io", token: "new-token" },
  );
});

test("støtter eksisterende REST-variabler som reserve", () => {
  assert.deepEqual(
    getUpstashRedisConfig({
      UPSTASH_REDIS_REST_URL: "https://rest.upstash.io",
      UPSTASH_REDIS_REST_TOKEN: "rest-token",
    }),
    { url: "https://rest.upstash.io", token: "rest-token" },
  );
});

test("avviser ukryptert eller ufullstendig REDIS_URL", () => {
  assert.equal(
    getUpstashRedisConfig({
      REDIS_URL: "redis://default:token@localhost:6379",
    }),
    null,
  );
  assert.equal(
    getUpstashRedisConfig({ REDIS_URL: "rediss://synthetic.upstash.io:6379" }),
    null,
  );
});
