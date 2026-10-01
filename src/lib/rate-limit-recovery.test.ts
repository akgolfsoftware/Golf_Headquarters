import assert from "node:assert/strict";
import { mock, test } from "node:test";

const originalEnv = new Map(["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", "RATE_LIMIT_FAIL_CLOSED"]
  .map((key) => [key, process.env[key]]));
process.env.UPSTASH_REDIS_REST_URL = "https://synthetic.example.invalid";
process.env.UPSTASH_REDIS_REST_TOKEN = "synthetic-redis-token";
delete process.env.RATE_LIMIT_FAIL_CLOSED;
let now = 100_000;
let calls = 0;
let failure: Error | null = null;
let pending: Promise<{ success: boolean; remaining: number; reset: number }> | null = null;
let messages: string[] = [];
const remoteResult = { success: false, remaining: 0, reset: 999_999 };
mock.method(Date, "now", () => now);
mock.method(console, "error", (message: string) => { messages.push(message); });
mock.module("@upstash/redis", { namedExports: { Redis: class {} } });
mock.module("@upstash/ratelimit", { namedExports: { Ratelimit: class {
  static slidingWindow() { return {}; }
  async limit() {
    calls++;
    if (failure) throw failure;
    return pending ?? remoteResult;
  }
} } });
let rateLimit: typeof import("./rate-limit").rateLimit;
const input = { key: "synthetic:key", max: 1, windowMs: 60_000 };

test.before(async () => { ({ rateLimit } = await import("./rate-limit")); });
test.beforeEach(async () => {
  delete process.env.RATE_LIMIT_FAIL_CLOSED;
  now += 120_000;
  failure = null;
  pending = null;
  await rateLimit({ ...input, key: "synthetic:reset" });
  calls = 0;
  messages = [];
});
test.after(() => {
  mock.restoreAll();
  for (const [key, value] of originalEnv) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

test("Redis-avslag beholdes og utløser ikke lokal reserve", async () => {
  assert.deepEqual(await rateLimit(input), { ok: false, remaining: 0, resetAt: 999_999 });
  assert.equal(calls, 1);
  assert.equal(messages.length, 0);
});

test("transportfeil gir lokal begrensning i 60 sekunder og gjenopptar Redis", async () => {
  failure = new Error("fetch failed");
  assert.equal((await rateLimit(input)).ok, true);
  assert.equal((await rateLimit(input)).ok, false);
  assert.equal(calls, 1);
  failure = null;
  now += 59_999;
  assert.equal((await rateLimit(input)).ok, false);
  assert.equal(calls, 1);
  now++;
  assert.deepEqual(await rateLimit(input), { ok: false, remaining: 0, resetAt: 999_999 });
  assert.equal(calls, 2);
  await rateLimit(input);
  assert.equal(calls, 3);
});

test("mislykket gjenforsøk starter en ny pause, ikke permanent frakobling", async () => {
  failure = new Error("ETIMEDOUT");
  await rateLimit(input);
  now += 60_000;
  await rateLimit(input);
  assert.equal(calls, 2);
  await rateLimit(input);
  assert.equal(calls, 2);
  now += 60_000;
  failure = null;
  await rateLimit(input);
  assert.equal(calls, 3);
});

test("bare ett gjenforsøk kjører samtidig etter pausen", async () => {
  failure = new Error("fetch failed");
  await rateLimit(input);
  now += 60_000;
  failure = null;
  let resolve!: (value: typeof remoteResult) => void;
  pending = new Promise((done) => { resolve = done; });
  const probe = rateLimit({ ...input, key: "synthetic:probe" });
  const concurrent = await rateLimit({ ...input, key: "synthetic:parallel" });
  assert.equal(concurrent.ok, true);
  assert.equal(calls, 2);
  resolve(remoteResult);
  assert.equal((await probe).ok, false);
  pending = null;
  await rateLimit(input);
  assert.equal(calls, 3);
});

test("lukket feilmodus kaster og slipper ikke gjennom via lokal reserve", async () => {
  process.env.RATE_LIMIT_FAIL_CLOSED = "1";
  failure = new Error("synthetic Redis failure");
  await assert.rejects(rateLimit(input), /synthetic Redis failure/);
  await assert.rejects(rateLimit(input), /synthetic Redis failure/);
  assert.equal(calls, 2);
  assert.equal(messages.length, 0);
});

test("Redis-feiltekst og klientnøkkel havner ikke i loggen", async () => {
  failure = new Error("fetch failed bearer synthetic-secret spiller@example.invalid");
  await rateLimit({ ...input, key: "health:192.0.2.15" });
  assert.equal(messages.length, 1);
  const message = messages.join(" ");
  assert.match(message, /retry after 60 seconds/);
  for (const value of ["synthetic-secret", "spiller@example.invalid", "192.0.2.15", "bearer"])
    assert.equal(message.includes(value), false);
});
