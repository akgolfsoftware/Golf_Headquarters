/**
 * npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/domain/maal-fremdrift.test.ts
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
  beregnMaalFremdrift,
  lesSgMaal,
  HCP_START,
  SG_OMRADE_NAVN,
  type MaalFremdriftInput,
} from "./maal-fremdrift";

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

// ── SG_AREA ────────────────────────────────────────────────────────

function sgMaal(over: Partial<MaalFremdriftInput> = {}): MaalFremdriftInput {
  return maal({ type: "SG_AREA", targetValue: 0.5, ...over });
}

test("SG_AREA: reise fra baseline til målverdi regnes fra ekte SG", () => {
  // Baseline −0,5 → mål +0,5 er en reise på 1,0. Nå 0,0 = halvveis.
  const out = beregnMaalFremdrift(
    sgMaal({ payload: { sgOmrade: "PUTT", sgStart: -0.5 } }),
    { sgSnitt: { PUTT: 0 } },
  );
  assert.equal(out.kilde, "sg");
  assert.equal(out.sgOmrade, "PUTT");
  assert.equal(out.pct, 50);
  assert.equal(out.status, "on-track");
});

test("SG_AREA: virker når både baseline og mål er negative", () => {
  // Fra −1,5 mot −0,5 (reise 1,0). Nå −1,25 = 25 %.
  const out = beregnMaalFremdrift(
    sgMaal({ targetValue: -0.5, payload: { sgOmrade: "APP", sgStart: -1.5 } }),
    { sgSnitt: { APP: -1.25 } },
  );
  assert.equal(out.kilde, "sg");
  assert.equal(out.pct, 25);
  assert.equal(out.status, "behind");
});

test("SG_AREA: nådd målverdi gir 100 og achieved", () => {
  const out = beregnMaalFremdrift(
    sgMaal({ payload: { sgOmrade: "OTT", sgStart: -0.2 } }),
    { sgSnitt: { OTT: 0.7 } },
  );
  assert.equal(out.pct, 100);
  assert.equal(out.status, "achieved");
});

test("SG_AREA: tilbakegang under baseline klemmes til 0, aldri negativ", () => {
  const out = beregnMaalFremdrift(
    sgMaal({ payload: { sgOmrade: "ARG", sgStart: 0 } }),
    { sgSnitt: { ARG: -0.9 } },
  );
  assert.equal(out.pct, 0);
  assert.equal(out.status, "behind");
});

test("SG_AREA uten område: ingen fabrikkert prosent — tid mot frist + trengerOmrade", () => {
  const out = beregnMaalFremdrift(
    sgMaal({ targetDate: D("2026-01-11T00:00:00Z") }),
    { naa: D("2026-01-06T00:00:00Z"), sgSnitt: { PUTT: 0.4 } },
  );
  assert.equal(out.kilde, "tid");
  assert.equal(out.pct, 50);
  assert.equal(out.trengerOmrade, true);
  assert.equal(out.sgOmrade, undefined);
});

test("SG_AREA uten område og uten frist: 0 %, kilde ingen, trengerOmrade", () => {
  const out = beregnMaalFremdrift(sgMaal());
  assert.equal(out.pct, 0);
  assert.equal(out.kilde, "ingen");
  assert.equal(out.trengerOmrade, true);
});

test("SG_AREA med område, men ingen runder ennå: tid mot frist, ikke trengerOmrade", () => {
  const out = beregnMaalFremdrift(
    sgMaal({
      payload: { sgOmrade: "PUTT", sgStart: -0.3 },
      targetDate: D("2026-01-11T00:00:00Z"),
    }),
    { naa: D("2026-01-06T00:00:00Z"), sgSnitt: { PUTT: null } },
  );
  assert.equal(out.kilde, "tid");
  assert.equal(out.sgOmrade, "PUTT");
  assert.equal(out.trengerOmrade, undefined);
});

test("SG_AREA der baseline er lik målverdi: ingen deling på null", () => {
  const out = beregnMaalFremdrift(
    sgMaal({ targetValue: 0.4, payload: { sgOmrade: "APP", sgStart: 0.4 } }),
    { sgSnitt: { APP: 0.9 } },
  );
  assert.notEqual(out.kilde, "sg");
  assert.ok(Number.isFinite(out.pct));
});

test("lesSgMaal tåler søppel i payload uten å kaste", () => {
  assert.equal(lesSgMaal(null), null);
  assert.equal(lesSgMaal("PUTT"), null);
  assert.equal(lesSgMaal([{ sgOmrade: "PUTT" }]), null);
  assert.equal(lesSgMaal({ sgOmrade: "TULL" }), null);
  assert.equal(lesSgMaal({ abandonReason: "gikk videre" }), null);
  assert.deepEqual(lesSgMaal({ sgOmrade: "ARG" }), { omrade: "ARG", start: null });
  assert.deepEqual(lesSgMaal({ sgOmrade: "ARG", sgStart: "-0.4" }), { omrade: "ARG", start: null });
  assert.deepEqual(lesSgMaal({ sgOmrade: "ARG", sgStart: -0.4 }), { omrade: "ARG", start: -0.4 });
});

test("SG-områdenavnene følger AK-fasiten", () => {
  assert.equal(SG_OMRADE_NAVN.OTT, "Tee Total");
  assert.equal(SG_OMRADE_NAVN.APP, "Innspill");
  assert.equal(SG_OMRADE_NAVN.ARG, "Nærspill");
  assert.equal(SG_OMRADE_NAVN.PUTT, "Putting");
});
