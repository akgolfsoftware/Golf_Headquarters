import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { byggDelRunde, delFilnavn, initialer, motParOrd, sgTekst } from "./del-runde";

const hull18 = Array.from({ length: 18 }, (_, i) => ({ nr: i + 1, par: 4, slag: 4 }));
const inn = { id: "r1", score: 72, playedAt: new Date("2026-10-04T10:00:00Z"), bane: "Fredrikstad GK", sg: { ott: 0.4, app: -0.6, arg: null, putt: 0 }, hull: hull18, sharedWithCoach: true };

describe("Del runde (pakke 13)", () => {
  it("til par fra hullene, aldri fra banens par", () => {
    assert.equal(byggDelRunde(inn).motPar, 0);
    const ni = Array.from({ length: 9 }, (_, i) => ({ nr: i + 1, par: 4, slag: 5 }));
    assert.equal(byggDelRunde({ ...inn, score: 45, hull: ni }).motPar, 9);
    assert.equal(byggDelRunde({ ...inn, hull: [] }).motPar, null);
    assert.equal(byggDelRunde({ ...inn, score: 73 }).motPar, null, "hullene summerer ikke til scoren");
  });
  it("tekst og filnavn", () => {
    assert.equal(motParOrd(0), "på par");
    assert.equal(motParOrd(3), "3 over par");
    assert.equal(motParOrd(null), "—");
    assert.equal(sgTekst(-0.6), "−0,6");
    assert.equal(sgTekst(null), "—");
    assert.equal(initialer("Øyvind Rohjan"), "ØR");
    assert.equal(delFilnavn(byggDelRunde(inn), "story"), "runde-2026-10-04-story.png");
    assert.equal(delFilnavn(byggDelRunde(inn), "pdf"), "runde-2026-10-04-scorekort.pdf");
  });
});
