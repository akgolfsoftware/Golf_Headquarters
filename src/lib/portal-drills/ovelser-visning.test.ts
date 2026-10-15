import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  TOMT_FILTER, antallPerAkse, breakTabell, omraadeHorerTil, ovelseVisning, passer, skillAreaFor, ukeDager, type OvelseRad,
} from "./ovelser-visning";

const rad = (p: Partial<OvelseRad>): OvelseRad => ({
  id: "x", name: "Øvelse", description: null, imageUrl: null, pyramidArea: "SLAG", skillArea: null, omraadeKode: null, motorikk: null,
  press: null, durationMin: null, environment: [], utstyr: [], defaultSets: null, defaultReps: null, defaultRepsSets: null, source: "SYSTEM", ...p,
});

describe("ovelseVisning", () => {
  it("bruker treningsområdet, ellers slagområdet, ellers null", () => {
    assert.equal(ovelseVisning(rad({ omraadeKode: "INNSPILL_100", skillArea: "PUTTING" })).omraade, "Innspill 100–150 m");
    assert.equal(ovelseVisning(rad({ skillArea: "AROUND_GREEN" })).omraade, "Nærspill");
    assert.equal(ovelseVisning(rad({})).omraade, null);
  });
  it("lager mengde fra serier og reps, og dikter ikke opp mål eller mengde", () => {
    assert.equal(ovelseVisning(rad({ defaultSets: 4, defaultReps: 6 })).mengde, "4 × 6");
    assert.equal(ovelseVisning(rad({ defaultRepsSets: " 30 slag " })).mengde, "30 slag");
    assert.equal(ovelseVisning(rad({})).mengde, null);
  });
  it("merker egne øvelser og oversetter miljø og press", () => {
    const o = ovelseVisning(rad({ source: "PLAYER", environment: ["GYM", "UKJENT"], press: "OBSERVERT", motorikk: "LAV_HAST" }));
    assert.equal(o.egen, true);
    assert.deepEqual(o.miljo, ["Styrkerom"]);
    assert.equal(o.press, "Observert");
    assert.equal(o.motorikk, "Lav hastighet");
  });
  it("godtar bare https-bilder fra øvelsen", () => {
    assert.equal(ovelseVisning(rad({ imageUrl: "javascript:alert(1)" })).bilde.src.startsWith("/images/playerhq/"), true);
    assert.equal(ovelseVisning(rad({ imageUrl: "https://x.supabase.co/a.jpg" })).bilde.src, "https://x.supabase.co/a.jpg");
  });
});

describe("filter", () => {
  const liste = [
    ovelseVisning(rad({ id: "a", pyramidArea: "TEK", omraadeKode: "TEE_TOTAL", name: "Startretning" })),
    ovelseVisning(rad({ id: "b", pyramidArea: "FYS", omraadeKode: "STYRKE", name: "Knebøy" })),
  ];
  it("teller per akse og filtrerer på akse og søk", () => {
    assert.deepEqual(antallPerAkse(liste), { fys: 1, tek: 1, slag: 0, spill: 0, turn: 0 });
    assert.equal(liste.filter((o) => passer(o, { ...TOMT_FILTER, akse: "tek" })).length, 1);
    assert.equal(liste.filter((o) => passer(o, { ...TOMT_FILTER, sok: "styrke" })).length, 1);
  });
});

describe("ny egen øvelse", () => {
  it("lar bare aksens treningsområder gjelde og gir riktig slagområde", () => {
    assert.equal(omraadeHorerTil("fys", "STYRKE"), true);
    assert.equal(omraadeHorerTil("fys", "CHIP"), false);
    assert.equal(skillAreaFor("PUTT_3_5"), "PUTTING");
    assert.equal(skillAreaFor("STYRKE"), null);
  });
});

describe("ukeDager", () => {
  it("gir mandag til søndag i Oslo-tid og merker passerte dager", () => {
    const d = ukeDager(new Date("2026-10-06T22:30:00Z")); // onsdag 7. oktober kl. 00:30 i Oslo
    assert.equal(d[0].iso, "2026-10-05");
    assert.equal(d[6].iso, "2026-10-11");
    assert.deepEqual(d.map((x) => x.forbi), [true, true, false, false, false, false, false]);
  });
});

describe("breakTabell", () => {
  it("har åtte avstander med uthevet 5–10 fot", () => {
    const t = breakTabell(10);
    assert.equal(t.length, 8);
    assert.deepEqual(t.filter((r) => r.uthevet).map((r) => r.fot), [5, 8, 10]);
    assert.equal(t.find((r) => r.fot === 10)?.cm[1], 11);
  });
});
