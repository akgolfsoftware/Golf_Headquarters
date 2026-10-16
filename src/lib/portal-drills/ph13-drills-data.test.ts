import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  beregnBreakCm,
  filtrerDrills,
  konverterExerciseTilPH13,
  SYNTETISKE_PH13_DRILLS,
  SYNTETISKE_PH13_CADDIE_FORSLAG,
} from "./ph13-drills-data";
import type { DrillDetail } from "./drills-data";

describe("ph13-drills-data", () => {
  it("beregner break i cm korrekt i henhold til stimp og avstand", () => {
    // 10 fot, 2% helning, stimp 10 -> 0.55 * 10 * 2 * 1 = 11 cm
    assert.equal(beregnBreakCm(10, 2, 10), 11);

    // 10 fot, 2% helning, stimp 12 -> 0.55 * 10 * 2 * 1.2 = 13.2 -> 13 cm
    assert.equal(beregnBreakCm(10, 2, 12), 13);

    // 20 fot, 3% helning, stimp 8 -> 0.55 * 20 * 3 * 0.8 = 26.4 -> 26 cm
    assert.equal(beregnBreakCm(20, 3, 8), 26);
  });

  it("filtrerer drills etter kilde, akse og søketekst", () => {
    const drills = SYNTETISKE_PH13_DRILLS;

    // Filtrer på akse
    const fysDrills = filtrerDrills(drills, "Alle", "fys", "");
    assert.ok(fysDrills.length > 0);
    assert.ok(fysDrills.every((d) => d.axis === "fys"));

    // Filtrer på kilde
    const mineDrills = filtrerDrills(drills, "Mine", "alle", "");
    assert.ok(mineDrills.length > 0);
    assert.ok(mineDrills.every((d) => d.src === "mine"));

    const coachDrills = filtrerDrills(drills, "Fra coach", "alle", "");
    assert.ok(coachDrills.length > 0);
    assert.ok(coachDrills.every((d) => d.src === "coach"));

    // Søk
    const sokHits = filtrerDrills(drills, "Alle", "alle", "Knebøy");
    assert.equal(sokHits.length, 1);
    assert.equal(sokHits[0].id, "o8");
  });

  it("konverterer DrillDetail til PH13Drill korrekt", () => {
    const dummyDetail: DrillDetail = {
      id: "test-1",
      title: "Testdrill innspill",
      description: "Instruksjon for testen",
      imageUrl: null,
      videoUrl: null,
      axis: "SLAG",
      skillArea: "TILNAERMING",
      lPhase: "SPESIAL",
      practiceType: "VARIABEL",
      csMin: null,
      csMax: null,
      durationMin: 20,
      environment: ["RANGE"],
      utstyr: ["7-jern"],
      muscleGroups: [],
      defaultSets: 3,
      defaultReps: 10,
      defaultRepsSets: "3 × 10",
      minKategori: null,
      maxKategori: null,
      csTargetByKategori: null,
      fasilitetKrav: [],
      source: "COACH",
    };

    const ph13 = konverterExerciseTilPH13(dummyDetail, 2);
    assert.equal(ph13.id, "test-1");
    assert.equal(ph13.axis, "slag");
    assert.equal(ph13.name, "Testdrill innspill");
    assert.equal(ph13.qty, "3 × 10");
    assert.equal(ph13.min, 20);
    assert.equal(ph13.src, "coach");
    assert.equal(ph13.bruktTekst, "brukt i 2 økter siste 30 dager");
  });

  it("har valide syntetiske drills og Caddie-forslag", () => {
    assert.equal(SYNTETISKE_PH13_DRILLS.length, 11);
    assert.equal(SYNTETISKE_PH13_CADDIE_FORSLAG.length, 2);

    for (const d of SYNTETISKE_PH13_DRILLS) {
      assert.ok(d.id);
      assert.ok(d.name);
      assert.ok(d.code);
      assert.ok(d.axis);
    }

    for (const c of SYNTETISKE_PH13_CADDIE_FORSLAG) {
      assert.equal(c.draft, true);
      assert.equal(c.src, "caddie");
      assert.ok(c.why);
    }
  });
});
