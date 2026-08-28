import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { evaluerMerge, type JarvisEvalInput, type JarvisOktForslag } from "./eval";
import { kanMerge, registrerMerge } from "./proveniens";

function filip(): JarvisEvalInput {
  const okt: JarvisOktForslag = {
    id: "okt-1",
    dato: "2026-08-24",
    startMin: 480,
    sluttMin: 600,
    motorikk: ["LAV_HAST"],
    drills: [{ id: "d1", tittel: "Gate", varighetMin: 20 }],
  };
  return { acwr: 1.18, forslag: [okt], eksisterende: [] };
}

describe("jarvis-merge · proveniens", () => {
  it("coach kan merge når eval er ÅPEN", () => {
    const ev = evaluerMerge(filip());
    assert.equal(kanMerge(ev), true);
    const kv = registrerMerge({
      forslagId: "forslag-filip",
      eval: ev,
      utførtAv: "coach",
      utførtAtIso: "2026-08-28T10:00:00.000Z",
    });
    assert.equal(kv.ok, true);
    if (kv.ok) {
      assert.equal(kv.utførtAv, "coach");
      assert.equal(kv.evalStatus, "AAPEN");
    }
  });

  it("Jarvis kan ikke merge — avvist som IKKE_COACH", () => {
    const ev = evaluerMerge(filip());
    const kv = registrerMerge({
      forslagId: "x",
      eval: ev,
      utførtAv: "jarvis",
      utførtAtIso: "2026-08-28T10:00:00.000Z",
    });
    assert.deepEqual(kv, { ok: false, grunn: "IKKE_COACH" });
  });

  it("rød eval kan ikke merges", () => {
    const ev = evaluerMerge({ ...filip(), acwr: 1.46 });
    assert.equal(kanMerge(ev), false);
    const kv = registrerMerge({
      forslagId: "jonas",
      eval: ev,
      utførtAv: "coach",
      utførtAtIso: "2026-08-28T10:00:00.000Z",
    });
    assert.deepEqual(kv, { ok: false, grunn: "STENGT" });
  });
});
