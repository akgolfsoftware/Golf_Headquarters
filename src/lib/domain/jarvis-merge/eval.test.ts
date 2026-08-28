import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ACWR_MAX,
  ACWR_MIN,
  drillErKomplett,
  evaluerMerge,
  type JarvisEvalInput,
  type JarvisOktForslag,
} from "./eval";

function okt(overstyr: Partial<JarvisOktForslag> = {}): JarvisOktForslag {
  return {
    id: "okt-1",
    dato: "2026-08-24",
    startMin: 8 * 60,
    sluttMin: 10 * 60,
    motorikk: ["LAV_HAST"],
    drills: [{ id: "d1", tittel: "Gate", varighetMin: 20 }],
    ...overstyr,
  };
}

/** Fasit JV-01: Filip 4/4 åpen, ACWR 1,18. */
function filip(): JarvisEvalInput {
  return {
    acwr: 1.18,
    forslag: [okt()],
    eksisterende: [],
  };
}

/** Fasit JV-02: Jonas rød, ACWR 1,46. */
function jonas(): JarvisEvalInput {
  return {
    acwr: 1.46,
    forslag: [okt({ id: "okt-jonas" })],
    eksisterende: [],
  };
}

describe("jarvis-merge · evaluerMerge", () => {
  it("Filip 4/4 er ÅPEN", () => {
    const ev = evaluerMerge(filip());
    assert.equal(ev.status, "AAPEN");
    assert.equal(ev.sjekker.length, 4);
    assert.ok(ev.sjekker.every((s) => s.ok));
  });

  it("Jonas med ACWR 1,46 er STENGT på volum", () => {
    const ev = evaluerMerge(jonas());
    assert.equal(ev.status, "STENGT");
    const acwr = ev.sjekker.find((s) => s.id === "ACWR");
    assert.equal(acwr?.ok, false);
    assert.match(acwr?.detalj ?? "", /1,46/);
  });

  it("ACWR-vinduet er 0,8–1,3", () => {
    assert.equal(ACWR_MIN, 0.8);
    assert.equal(ACWR_MAX, 1.3);
    assert.equal(evaluerMerge({ ...filip(), acwr: 0.8 }).status, "AAPEN");
    assert.equal(evaluerMerge({ ...filip(), acwr: 1.3 }).status, "AAPEN");
    assert.equal(evaluerMerge({ ...filip(), acwr: 0.79 }).status, "STENGT");
    assert.equal(evaluerMerge({ ...filip(), acwr: 1.31 }).status, "STENGT");
  });

  it("mangler ACWR er STENGT (fail-closed)", () => {
    assert.equal(evaluerMerge({ ...filip(), acwr: null }).status, "STENGT");
  });

  it("tidskollisjon mot eksisterende økt stenger", () => {
    const ev = evaluerMerge({
      ...filip(),
      eksisterende: [{ id: "eks", dato: "2026-08-24", startMin: 9 * 60, sluttMin: 11 * 60 }],
    });
    assert.equal(ev.status, "STENGT");
    assert.equal(ev.sjekker.find((s) => s.id === "KOLLISJON")?.ok, false);
  });

  it("to motorikker i samme økt stenger", () => {
    const ev = evaluerMerge({
      ...filip(),
      forslag: [okt({ motorikk: ["UTEN_BALL", "AUTO"] })],
    });
    assert.equal(ev.status, "STENGT");
    assert.equal(ev.sjekker.find((s) => s.id === "MOTOR")?.ok, false);
  });

  it("tom drill-liste stenger", () => {
    const ev = evaluerMerge({
      ...filip(),
      forslag: [okt({ drills: [] })],
    });
    assert.equal(ev.status, "STENGT");
    assert.equal(ev.sjekker.find((s) => s.id === "DRILLS")?.ok, false);
  });
});

describe("jarvis-merge · drillErKomplett", () => {
  it("krever tittel og varighet", () => {
    assert.equal(drillErKomplett({ id: "a", tittel: "Gate", varighetMin: 15 }), true);
    assert.equal(drillErKomplett({ id: "a", tittel: "  ", varighetMin: 15 }), false);
    assert.equal(drillErKomplett({ id: "a", tittel: "Gate", varighetMin: null }), false);
    assert.equal(drillErKomplett({ id: "a", tittel: "Gate", varighetMin: 0 }), false);
  });
});
