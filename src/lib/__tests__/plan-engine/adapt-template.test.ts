import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  adaptTemplateWeek,
  type MalOkt,
  type PlayerSignals,
  type FasilitetTilgang,
} from "@/lib/plan-engine/adapt-template";
import {
  byggStandardSkjelett,
  fordelOkterPaaOmrader,
  STANDARD_PYRAMIDE,
} from "@/lib/plan-engine/standard-fordeling";

const ALLE_FASILITETER: FasilitetTilgang = {
  range: true,
  putting: true,
  shortgame: true,
  trackman: true,
  course9: true,
  course18: true,
  gym: true,
  video: true,
};

const INGEN_SIGNALER: PlayerSignals = {
  fokus: null,
  aktivFase: null,
  adherencePct: null,
  fasiliteter: null,
  dagerTilTurnering: null,
  okterPerUke: null,
  foretrukneDager: null,
};

function mkOkt(over: Partial<MalOkt> = {}): MalOkt {
  return {
    ukeNr: 1,
    dagNr: 1,
    title: "Testøkt",
    varighetMin: 60,
    pyramidArea: "TEK",
    skillArea: null,
    environment: "RANGE",
    ...over,
  };
}

function standardUke(): MalOkt[] {
  return [
    mkOkt({ dagNr: 1, title: "Fysisk økt", pyramidArea: "FYS", environment: "GYM" }),
    mkOkt({ dagNr: 2, title: "Teknisk driver", pyramidArea: "TEK", skillArea: "TEE_TOTAL" }),
    mkOkt({ dagNr: 4, title: "Wedge-presisjon", pyramidArea: "SLAG", skillArea: "TILNAERMING" }),
    mkOkt({ dagNr: 5, title: "Putting på bane", pyramidArea: "SPILL", skillArea: "PUTTING", environment: "BANE" }),
  ];
}

describe("adaptTemplateWeek", () => {
  it("uten signaler: uendret uke, ingen justeringer", () => {
    const res = adaptTemplateWeek(standardUke(), "GRUNN", INGEN_SIGNALER);
    assert.equal(res.okter.length, 4);
    assert.deepEqual(res.justeringer, []);
  });

  it("taper: ≤7 dager til turnering kutter FYS og korter øktene", () => {
    const res = adaptTemplateWeek(standardUke(), "GRUNN", {
      ...INGEN_SIGNALER,
      dagerTilTurnering: 5,
    });
    assert.equal(res.okter.length, 3);
    assert.ok(res.okter.every((o) => o.pyramidArea !== "FYS"));
    assert.ok(res.okter.every((o) => o.varighetMin === 45)); // 60 × 0.75
    assert.equal(res.justeringer.length, 1);
    assert.match(res.justeringer[0], /Turnering om 5 dager/);
  });

  it("coach-fokus vinner: SLAG/TEK-økter vris mot fokusområdet", () => {
    const res = adaptTemplateWeek(standardUke(), "GRUNN", {
      ...INGEN_SIGNALER,
      fokus: { kilde: "coach", label: "Putting", kategori: "PUTT" },
    });
    const vridde = res.okter.filter(
      (o) => (o.pyramidArea === "TEK" || o.pyramidArea === "SLAG") && o.skillArea === "PUTTING",
    );
    assert.equal(vridde.length, 2);
    assert.match(res.justeringer[0], /coachens fokus/);
  });

  it("fasilitetsfilter: dropper økter uten anlegg, med begrunnelse", () => {
    const res = adaptTemplateWeek(standardUke(), "GRUNN", {
      ...INGEN_SIGNALER,
      fasiliteter: { ...ALLE_FASILITETER, gym: false, course9: false, course18: false },
    });
    assert.equal(res.okter.length, 2); // GYM- og BANE-øktene ute
    assert.equal(res.justeringer.length, 2);
    assert.ok(res.justeringer.every((j) => /tatt ut/.test(j)));
  });

  it("lav compliance (<50 %): én økt færre og kortere økter", () => {
    const res = adaptTemplateWeek(standardUke(), "GRUNN", {
      ...INGEN_SIGNALER,
      adherencePct: 30,
    });
    assert.equal(res.okter.length, 3);
    assert.ok(res.okter.every((o) => o.varighetMin === 45)); // 60 × 0.8 → rund 15
    assert.match(res.justeringer[0], /under halvparten/);
  });

  it("middels compliance (50–74 %): kun kortere økter", () => {
    const res = adaptTemplateWeek(standardUke(), "GRUNN", {
      ...INGEN_SIGNALER,
      adherencePct: 60,
    });
    assert.equal(res.okter.length, 4);
    assert.ok(res.okter.every((o) => o.varighetMin === 45)); // 60 × 0.85 → rund 15
  });

  it("CANON-merknad når mal-fase ≠ aktiv fase — rådgivende, aldri sperre", () => {
    const res = adaptTemplateWeek(standardUke(), "SPESIAL", {
      ...INGEN_SIGNALER,
      aktivFase: "GRUNN",
    });
    assert.equal(res.okter.length, 4); // ingenting fjernet
    assert.equal(res.justeringer.length, 1);
    assert.match(res.justeringer[0], /annen periode/);
    assert.match(res.justeringer[0], /FYS og TEK/);
  });

  it("taper trumfer compliance-skalering (ikke dobbel reduksjon)", () => {
    const res = adaptTemplateWeek(standardUke(), "GRUNN", {
      ...INGEN_SIGNALER,
      dagerTilTurnering: 3,
      adherencePct: 30,
    });
    // Kun taper-justering: FYS ute + 45 min, ingen ekstra compliance-kutt.
    assert.equal(res.okter.length, 3);
    assert.equal(res.justeringer.length, 1);
    assert.match(res.justeringer[0], /Turnering/);
  });

  describe("dag-flytting (foretrukneDager)", () => {
    it("no-op når ingen preferanse er satt", () => {
      const res = adaptTemplateWeek(standardUke(), "GRUNN", { ...INGEN_SIGNALER, foretrukneDager: null });
      assert.deepEqual(res.okter.map((o) => o.dagNr), [1, 2, 4, 5]);
      assert.deepEqual(res.justeringer, []);
    });

    it("no-op når alle 7 dager er «foretrukket» (ingen reell preferanse)", () => {
      const res = adaptTemplateWeek(standardUke(), "GRUNN", {
        ...INGEN_SIGNALER,
        foretrukneDager: [1, 2, 3, 4, 5, 6, 7],
      });
      assert.deepEqual(res.okter.map((o) => o.dagNr), [1, 2, 4, 5]);
      assert.deepEqual(res.justeringer, []);
    });

    it("no-op når øktene allerede ligger på foretrukne dager", () => {
      const res = adaptTemplateWeek(standardUke(), "GRUNN", {
        ...INGEN_SIGNALER,
        foretrukneDager: [1, 2, 4, 5, 6],
      });
      assert.deepEqual(res.okter.map((o) => o.dagNr).sort(), [1, 2, 4, 5]);
      assert.deepEqual(res.justeringer, []);
    });

    it("n=1: legges på midterste foretrukne dag", () => {
      const enOkt = [mkOkt({ dagNr: 3, ukeNr: 1 })];
      const res = adaptTemplateWeek(enOkt, "GRUNN", { ...INGEN_SIGNALER, foretrukneDager: [1, 4, 6, 7] });
      // k=4 → floor(4/2)=2 → P[2]=6
      assert.equal(res.okter[0].dagNr, 6);
      assert.equal(res.justeringer.length, 1);
      assert.match(res.justeringer[0], /man, tor, lør, søn/);
    });

    it("2≤n≤k: jevn spredning inkl. endepunktene, distinkte dager", () => {
      // standardUke ligger på dagNr [1,2,4,5] — foretrukneDager utelater dag 1,
      // så øktene IKKE allerede matcher (tvinger frem en reell flytting).
      const res = adaptTemplateWeek(standardUke(), "GRUNN", {
        ...INGEN_SIGNALER,
        foretrukneDager: [2, 3, 4, 5, 6],
      });
      const dager = res.okter.map((o) => o.dagNr);
      assert.equal(new Set(dager).size, 4, "alle dager skal være distinkte");
      assert.equal(dager[0], 2, "første økt på første foretrukne dag");
      assert.equal(dager[dager.length - 1], 6, "siste økt på siste foretrukne dag");
      assert.match(res.justeringer.at(-1)!, /foretrekker/);
    });

    it("n>k: balansert fylling, maks ⌈n/k⌉ økter per dag", () => {
      const seksOkter = [1, 2, 3, 4, 5, 6].map((dagNr) => mkOkt({ dagNr, ukeNr: 1, title: `Økt ${dagNr}` }));
      const res = adaptTemplateWeek(seksOkter, "GRUNN", { ...INGEN_SIGNALER, foretrukneDager: [1, 4] });
      const dager = res.okter.map((o) => o.dagNr);
      assert.ok(dager.every((d) => d === 1 || d === 4));
      const perDag = new Map<number, number>();
      for (const d of dager) perDag.set(d, (perDag.get(d) ?? 0) + 1);
      for (const antall of perDag.values()) assert.ok(antall <= 3, "maks ⌈6/2⌉=3 per dag");
    });

    it("okterPerUke kutter aldri økter — kun informativt", () => {
      const res = adaptTemplateWeek(standardUke(), "GRUNN", {
        ...INGEN_SIGNALER,
        okterPerUke: 2,
        foretrukneDager: [1, 3],
      });
      assert.equal(res.okter.length, 4, "alle 4 økter beholdes selv om okterPerUke=2");
    });

    it("respekterer ukeNr-grupper uavhengig (flytter hver uke for seg)", () => {
      const toUker = [
        mkOkt({ ukeNr: 1, dagNr: 2, title: "Uke1-økt" }),
        mkOkt({ ukeNr: 2, dagNr: 3, title: "Uke2-økt" }),
      ];
      const res = adaptTemplateWeek(toUker, "GRUNN", { ...INGEN_SIGNALER, foretrukneDager: [1, 5] });
      const uke1 = res.okter.find((o) => o.ukeNr === 1)!;
      const uke2 = res.okter.find((o) => o.ukeNr === 2)!;
      // n=1, k=2 → floor(k/2)=1 → P[1]=5 (samme regel appliseres uavhengig per uke).
      assert.equal(uke1.dagNr, 5);
      assert.equal(uke2.dagNr, 5);
    });
  });
});

describe("standard-fordeling", () => {
  it("fordelOkterPaaOmrader: summerer alltid til antall økter", () => {
    for (const kategori of ["A", "E", "L"] as const) {
      for (const antall of [2, 3, 4, 5, 6]) {
        const omrader = fordelOkterPaaOmrader(STANDARD_PYRAMIDE[kategori], antall);
        assert.equal(omrader.length, antall, `${kategori} × ${antall}`);
      }
    }
  });

  it("byggStandardSkjelett: 4 uker, deload-uke har maks 4 og kortere økter", () => {
    const skjelett = byggStandardSkjelett("A", "GRUNN");
    const uker = new Set(skjelett.map((s) => s.ukeNr));
    assert.deepEqual([...uker].sort(), [1, 2, 3, 4]);
    const deload = skjelett.filter((s) => s.ukeNr === 4);
    assert.ok(deload.length <= 4);
    assert.ok(deload.every((s) => s.ukeType === "DELOAD"));
    const bygg = skjelett.find((s) => s.ukeNr === 1)!;
    assert.ok(deload[0].varighetMin < bygg.varighetMin);
  });

  it("byggStandardSkjelett: unike (ukeNr, dagNr) — matcher @@unique-kravet", () => {
    for (const fase of ["GRUNN", "SPESIAL", "TURNERING"] as const) {
      const skjelett = byggStandardSkjelett("B", fase);
      const nokler = skjelett.map((s) => `${s.ukeNr}:${s.dagNr}`);
      assert.equal(new Set(nokler).size, nokler.length, fase);
    }
  });
});
