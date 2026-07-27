/**
 * npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/domain/maal-fremdrift.test.ts
 */

import test from "node:test";
import assert from "node:assert/strict";
import { beregnMaalFremdrift, HCP_START, type MaalFremdriftInput } from "./maal-fremdrift";

const D = (iso: string) => new Date(iso);

function maal(over: Partial<MaalFremdriftInput> = {}): MaalFremdriftInput {
  return {
    type: "FREE_TEXT",
    status: "ACTIVE",
    targetValue: null,
    targetDate: null,
    createdAt: D("2026-01-01T00:00:00Z"),
    ...over,
  };
}

test("ACHIEVED gir alltid 100 % uansett type og kontekst", () => {
  const out = beregnMaalFremdrift(maal({ type: "HCP_TARGET", status: "ACHIEVED", targetValue: 10 }));
  assert.equal(out.pct, 100);
  assert.equal(out.status, "achieved");
});

test("HCP_TARGET: reise fra 54 mot mål, målt på nåværende hcp", () => {
  // Mål 14 → reisen er 40 slag. HCP 24 → 30 av 40 = 75 %.
  const out = beregnMaalFremdrift(maal({ type: "HCP_TARGET", targetValue: 14 }), { hcp: 24 });
  assert.equal(out.kilde, "hcp");
  assert.equal(out.pct, 75);
  assert.equal(out.status, "on-track");
});

test("HCP_TARGET: mål nådd (hcp under målverdi) klemmes til 100 og achieved", () => {
  const out = beregnMaalFremdrift(maal({ type: "HCP_TARGET", targetValue: 20 }), { hcp: 18.5 });
  assert.equal(out.pct, 100);
  assert.equal(out.status, "achieved");
});

test("HCP_TARGET: under halvveis i reisen = behind", () => {
  // Mål 4 → reise 50. HCP 34 → 20 av 50 = 40 %.
  const out = beregnMaalFremdrift(maal({ type: "HCP_TARGET", targetValue: 4 }), { hcp: 34 });
  assert.equal(out.pct, 40);
  assert.equal(out.status, "behind");
});

test("HCP_TARGET uten hcp i kontekst faller tilbake til tid mot frist", () => {
  const out = beregnMaalFremdrift(
    maal({ type: "HCP_TARGET", targetValue: 14, targetDate: D("2026-01-11T00:00:00Z") }),
    { naa: D("2026-01-06T00:00:00Z") },
  );
  assert.equal(out.kilde, "tid");
  assert.equal(out.pct, 50);
});

test("ROUNDS_PER_MONTH: faktiske runder mot målverdi — ikke lenger 0 %", () => {
  const out = beregnMaalFremdrift(
    maal({ type: "ROUNDS_PER_MONTH", targetValue: 8 }),
    { runderDenneMnd: 6 },
  );
  assert.equal(out.kilde, "runder");
  assert.equal(out.pct, 75);
  assert.equal(out.status, "on-track");
});

test("ROUNDS_PER_MONTH: null runder gir 0 % og behind", () => {
  const out = beregnMaalFremdrift(
    maal({ type: "ROUNDS_PER_MONTH", targetValue: 4 }),
    { runderDenneMnd: 0 },
  );
  assert.equal(out.pct, 0);
  assert.equal(out.status, "behind");
});

test("ROUNDS_PER_MONTH: flere runder enn målet klemmes til 100/achieved", () => {
  const out = beregnMaalFremdrift(
    maal({ type: "ROUNDS_PER_MONTH", targetValue: 4 }),
    { runderDenneMnd: 9 },
  );
  assert.equal(out.pct, 100);
  assert.equal(out.status, "achieved");
});

test("tid mot frist: halvveis i perioden = 50 %, og status er aldri behind", () => {
  const out = beregnMaalFremdrift(
    maal({ targetDate: D("2026-03-01T00:00:00Z"), createdAt: D("2026-01-01T00:00:00Z") }),
    { naa: D("2026-01-30T12:00:00Z") },
  );
  assert.equal(out.kilde, "tid");
  assert.equal(out.pct, 50);
  assert.equal(out.status, "on-track");
});

test("tid mot frist: passert frist klemmes til 100 uten å bli achieved", () => {
  const out = beregnMaalFremdrift(
    maal({ targetDate: D("2026-02-01T00:00:00Z") }),
    { naa: D("2026-06-01T00:00:00Z") },
  );
  assert.equal(out.pct, 100);
  assert.equal(out.status, "on-track");
});

test("uten målbar kontekst og uten frist: 0 % og kilde ingen", () => {
  const out = beregnMaalFremdrift(maal());
  assert.equal(out.pct, 0);
  assert.equal(out.kilde, "ingen");
  assert.equal(out.status, "on-track");
});

test("HCP_START er 54 (kontrakten mot gamle /portal/mal-beregningen)", () => {
  assert.equal(HCP_START, 54);
});
