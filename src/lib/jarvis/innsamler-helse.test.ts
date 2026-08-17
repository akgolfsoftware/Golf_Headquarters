/**
 * npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/jarvis/innsamler-helse.test.ts
 */
import test from "node:test";
import assert from "node:assert/strict";
import { avledInnsamlerHelse } from "./innsamler-helse";

const NA = new Date("2026-08-16T12:00:00Z");
const TI_MIN_MS = 10 * 60 * 1000;

test("ingen kjøring funnet → UKJENT", () => {
  assert.equal(avledInnsamlerHelse(null, NA, TI_MIN_MS), "UKJENT");
});

test("siste kjøring ERROR → FEILET uansett alder", () => {
  assert.equal(
    avledInnsamlerHelse({ status: "ERROR", createdAt: new Date("2026-08-16T11:59:00Z") }, NA, TI_MIN_MS),
    "FEILET",
  );
});

test("siste kjøring OK og fersk (innenfor intervall) → OK", () => {
  assert.equal(
    avledInnsamlerHelse({ status: "OK", createdAt: new Date("2026-08-16T11:55:00Z") }, NA, TI_MIN_MS),
    "OK",
  );
});

test("siste kjøring OK men eldre enn 3× forventet intervall → FEILET (stille kollektor)", () => {
  // 10 min intervall × 3 = 30 min grense. 09:00 er 3t gammelt.
  assert.equal(
    avledInnsamlerHelse({ status: "OK", createdAt: new Date("2026-08-16T09:00:00Z") }, NA, TI_MIN_MS),
    "FEILET",
  );
});

test("siste kjøring OK rett på grensen (3× intervall) → fortsatt OK", () => {
  const paGrensen = new Date(NA.getTime() - TI_MIN_MS * 3 + 1000);
  assert.equal(avledInnsamlerHelse({ status: "OK", createdAt: paGrensen }, NA, TI_MIN_MS), "OK");
});

test("ingen kjøreplan (manuelt script) — fersk OK innenfor 48t-vinduet → OK", () => {
  assert.equal(
    avledInnsamlerHelse({ status: "OK", createdAt: new Date("2026-08-15T12:00:00Z") }, NA, null),
    "OK",
  );
});

test("ingen kjøreplan — OK men eldre enn 48t-vinduet → FEILET", () => {
  assert.equal(
    avledInnsamlerHelse({ status: "OK", createdAt: new Date("2026-08-10T12:00:00Z") }, NA, null),
    "FEILET",
  );
});
