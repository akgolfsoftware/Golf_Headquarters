import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { rateLimit } from "./rate-limit";

describe("rate-limit fail-open", () => {
  it("rateLimit resolves without throwing", async () => {
    const r = await rateLimit({ key: "test:circuit", max: 100, windowMs: 60_000 });
    assert.equal(typeof r.ok, "boolean");
    assert.equal(typeof r.remaining, "number");
    assert.equal(typeof r.resetAt, "number");
  });
});
