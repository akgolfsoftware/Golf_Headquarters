import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { tnProtocol } from "@/lib/portal-tester/tn-catalog";
import { tnScore } from "@/lib/portal-tester/tn-scoring";
import { tnValiderRader } from "./tn-test-validering";

const putt = tnProtocol("putt-1-3m")!;
const values = Object.fromEntries(putt.rows.map((_, i) => [String(i + 1), { strokes: 1 }]));
const gyldig = tnScore(putt, values);

describe("tnValiderRader (A10: antall er gyldige forsøk overalt)", () => {
  it("teller et reberegnbart forsøk", () => {
    const r = tnValiderRader([{ id: "a", takenAt: new Date("2026-09-10"), score: gyldig.score, details: gyldig }], putt);
    assert.equal(r.gyldige.length, 1);
    assert.equal(r.utelatt, 0);
  });
  it("teller ikke et forsøk der lagret score ikke stemmer med de rå verdiene", () => {
    const r = tnValiderRader([{ id: "a", takenAt: new Date("2026-09-10"), score: gyldig.score + 5, details: gyldig }], putt);
    assert.equal(r.gyldige.length, 0);
    assert.equal(r.utelatt, 1);
  });
  it("teller ikke et forsøk uten gyldig resultat-JSON", () => {
    const r = tnValiderRader([{ id: "a", takenAt: new Date("2026-09-10"), score: 1, details: { hei: "du" } }], putt);
    assert.equal(r.gyldige.length, 0);
    assert.equal(r.utelatt, 1);
  });
});
