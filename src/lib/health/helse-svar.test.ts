import assert from "node:assert/strict";
import { test } from "node:test";
import {
  byggHelseSvar,
  helseHttpStatus,
  HELSE_TILLATTE_FELT,
} from "./helse-svar";

test("helsesvar ved ok database har bare tillatte felt og 200", () => {
  const body = byggHelseSvar({
    dbOk: true,
    timestamp: "2026-09-12T10:00:00.000Z",
    uptime: 12.5,
  });
  assert.equal(helseHttpStatus(true), 200);
  assert.deepEqual(body, {
    status: "ok",
    db: "up",
    timestamp: "2026-09-12T10:00:00.000Z",
    uptime: 12.5,
  });
  assert.deepEqual(Object.keys(body).sort(), [...HELSE_TILLATTE_FELT].sort());
});

test("helsesvar ved nede database er degradert 503 uten env", () => {
  const body = byggHelseSvar({
    dbOk: false,
    timestamp: "2026-09-12T10:00:00.000Z",
    uptime: 1,
  });
  assert.equal(helseHttpStatus(false), 503);
  assert.equal(body.status, "degraded");
  assert.equal(body.db, "down");
  const dump = JSON.stringify(body);
  assert.equal(dump.includes("postgres"), false);
  assert.equal(dump.includes("DATABASE"), false);
  assert.equal(dump.includes("supabase"), false);
  assert.equal(dump.includes("secret"), false);
});
