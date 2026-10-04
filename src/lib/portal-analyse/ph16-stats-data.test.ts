import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  beregnSpredning,
  byggPH16Stats,
  formaterDesimal,
  formaterSg,
  PGA_REFERANSE,
  type PH16RundeInn,
} from "./ph16-stats-data";

const TOMME_SG = {
  sgTee: null,
  sgApp200: null,
  sgApp150: null,
  sgApp100: null,
  sgApp50: null,
  sgChip: null,
  sgPitch: null,
  sgLob: null,
  sgBunker: null,
  sgPutt0_3: null,
  sgPutt3_5: null,
  sgPutt5_10: null,
  sgPutt10_15: null,
  sgPutt15_25: null,
  sgPutt25_40: null,
  sgPutt40plus: null,
};

/** Runde nr. i (0 = nyeste) med gitt score og hullantall (par 4 på hvert hull). */
function runde(i: number, score: number, hull = 18, over: Partial<PH16RundeInn> = {}): PH16RundeInn {
  return {
    id: `r${i}`,
    playedAt: new Date(Date.UTC(2026, 8, 30 - i)),
    score,
    roundType: null,
    courseName: "Testbane",
    sgTotal: null,
    sgSource: null,
    benchmarkLevelSnapshot: null,
    holeScores: Array.from({ length: hull }, () => ({ par: 4 })),
    ...TOMME_SG,
    ...over,
  };
}

describe("ph16-stats-data: formatering", () => {
  it("formaterer desimaltall korrekt uten .toFixed med komma som skilletegn", () => {
    assert.equal(formaterDesimal(null), "—");
    assert.equal(formaterDesimal(undefined), "—");
    assert.equal(formaterDesimal(0, 1), "0,0");
    assert.equal(formaterDesimal(75.2, 1), "75,2");
    assert.equal(formaterDesimal(-1.6, 1), "−1,6");
    assert.equal(formaterDesimal(101.25, 2), "101,25");
  });

  it("formaterer Strokes Gained med fortegn og norsk komma", () => {
    assert.equal(formaterSg(null), "—");
    assert.equal(formaterSg(0), "0,0");
    assert.equal(formaterSg(0.3), "+0,3");
    assert.equal(formaterSg(-1.6), "−1,6");
    assert.equal(formaterSg(-0.02), "0,0");
  });

  it("beregner 2D spredning og standardavvik for TrackMan-slag", () => {
    const { mx, my, sdx, sdy } = beregnSpredning([
      [-2, 140],
      [0, 145],
      [2, 150],
    ]);
    assert.equal(mx, 0);
    assert.equal(my, 145);
    assert.ok(sdx > 1.6 && sdx < 1.7);
    assert.ok(sdy > 4.0 && sdy < 4.2);
  });
});

describe("byggPH16Stats: ingen demotall", () => {
  it("0 runder gir ingen tall, ingen demospiller og tomme lister", () => {
    const d = byggPH16Stats({ navn: "Ola Nordmann", runder: [], tmSlag: [] });
    assert.equal(d.spiller.navn, "Ola Nordmann");
    assert.equal(d.spiller.snittBrutto, null);
    assert.equal(d.spiller.forrigeSnitt, null);
    assert.equal(d.spiller.kategori, null);
    assert.equal(d.spiller.nesteKategori, null);
    assert.equal(d.spiller.slagTilNesteKategori, null);
    assert.equal(d.spiller.antallSnittRunder, 0);
    assert.deepEqual(d.runder, []);
    assert.deepEqual(d.tester, []);
    assert.deepEqual(d.trening.pyramide.rows, []);
    assert.equal(d.trening.pyramide.totalHours, null);
    assert.deepEqual(d.trening.trackman.koller, []);
    for (const r of d.sg.flatMap((g) => g.rows)) {
      assert.equal(r.c, null, r.id);
      assert.equal(r.pga, null, r.id);
      assert.equal(r.d, null, r.id);
      assert.equal(r.n, 0, r.id);
    }
    assert.ok(!JSON.stringify(d).includes("Tobias Lindvik"));
  });

  it("demodataen og demonavnet finnes ikke lenger i produksjonsmodulene", () => {
    for (const fil of [
      "src/lib/portal-analyse/ph16-stats-data.ts",
      "src/lib/portal-analyse/load-ph16-stats.ts",
      "src/components/portal/precision/PH16Stats.tsx",
      "src/components/portal/precision/PH16bSkillMap.tsx",
    ]) {
      const kilde = readFileSync(fil, "utf8");
      assert.ok(!kilde.includes("STANDARD_PH16_DATA"), fil);
      assert.ok(!kilde.includes("Tobias Lindvik"), fil);
    }
  });

  it("under 4 18-hullsrunder gir ingen snitt", () => {
    const d = byggPH16Stats({ navn: "x", runder: [runde(0, 75), runde(1, 77), runde(2, 79)], tmSlag: [] });
    assert.equal(d.spiller.snittBrutto, null);
    assert.equal(d.spiller.antallSnittRunder, 3);
    assert.equal(d.runder.length, 3);
  });

  it("forrige snitt er de 10 rundene før — ikke snitt + 0,3", () => {
    const siste = Array.from({ length: 10 }, (_, i) => runde(i, 76));
    const d1 = byggPH16Stats({ navn: "x", runder: siste, tmSlag: [] });
    assert.equal(d1.spiller.snittBrutto, 76);
    assert.equal(d1.spiller.forrigeSnitt, null, "uten runder før vinduet finnes ikke noe forrige snitt");

    const foer = Array.from({ length: 10 }, (_, i) => runde(10 + i, 80));
    const d2 = byggPH16Stats({ navn: "x", runder: [...siste, ...foer], tmSlag: [] });
    assert.equal(d2.spiller.snittBrutto, 76);
    assert.equal(d2.spiller.forrigeSnitt, 80);
  });

  it("snittet teller bare 18-hullsrunder", () => {
    const runder = [
      runde(0, 40, 9),
      runde(1, 70, 0), // ukjent hullantall
      ...Array.from({ length: 4 }, (_, i) => runde(2 + i, 78)),
    ];
    const d = byggPH16Stats({ navn: "x", runder, tmSlag: [] });
    assert.equal(d.spiller.snittBrutto, 78);
    assert.equal(d.spiller.antallSnittRunder, 4);
  });

  it("par kommer fra hullscore, aldri fra baneregisteret", () => {
    const d = byggPH16Stats({
      navn: "x",
      runder: [runde(0, 40, 9), runde(1, 76, 0), runde(2, 74, 18)],
      tmSlag: [],
    });
    assert.equal(d.runder[0].par, 36);
    assert.equal(d.runder[0].diff, 4);
    assert.equal(d.runder[1].par, null, "uten hullscore er par ukjent");
    assert.equal(d.runder[1].diff, null);
    assert.equal(d.runder[2].par, 72);
    assert.equal(d.runder[2].diff, 2);
    const loader = readFileSync("src/lib/portal-analyse/load-ph16-stats.ts", "utf8");
    assert.ok(!/course:\s*\{\s*select:\s*\{[^}]*par/.test(loader), "loaderen henter ikke course.par");
  });

  it("SG kommer bare fra runder beregnet mot PGA Tour, med minst 4 runder", () => {
    const pga = (i: number, v: number) => runde(i, 76, 18, { benchmarkLevelSnapshot: PGA_REFERANSE, sgTee: v });
    const tre = byggPH16Stats({ navn: "x", runder: [pga(0, -1), pga(1, -1), pga(2, -1)], tmSlag: [] });
    const tee3 = tre.sg[0].rows[0];
    assert.equal(tee3.pga, null);
    assert.equal(tee3.n, 3);

    const runder = [
      ...Array.from({ length: 10 }, (_, i) => pga(i, -0.5)),
      ...Array.from({ length: 10 }, (_, i) => pga(10 + i, -1)),
      runde(20, 76, 18, { sgTee: 5 }), // ukjent referanse teller ikke
    ];
    const d = byggPH16Stats({ navn: "x", runder, tmSlag: [] });
    const tee = d.sg[0].rows[0];
    assert.equal(tee.pga, -0.5);
    assert.equal(tee.d, 0.5);
    assert.equal(tee.c, null, "neste kategori har ingen vedtatt referanse");
  });

  it("TrackMan bruker bare ekte slag og ingen oppdiktede mål", () => {
    const d = byggPH16Stats({
      navn: "x",
      runder: [],
      tmSlag: [
        { club: "7-jern", side: 1, carryDistance: 140, clubPath: 2, faceAngle: null, faceToPath: null, attackAngle: null, dynamicLoft: null, clubSpeed: 80, outlier: false },
        { club: "7-jern", side: -1, carryDistance: 144, clubPath: 4, faceAngle: null, faceToPath: null, attackAngle: null, dynamicLoft: null, clubSpeed: 82, outlier: false },
        { club: "Driver", side: 50, carryDistance: 50, clubPath: 30, faceAngle: null, faceToPath: null, attackAngle: null, dynamicLoft: null, clubSpeed: 10, outlier: true },
      ],
    });
    assert.deepEqual(d.trening.trackman.koller, ["7-jern"]);
    const k = d.trening.trackman.data["7-jern"];
    assert.equal(k.antallSlag, 2);
    assert.deepEqual(k.params.map((p) => p.navn), ["Club Path", "Club Speed"]);
    assert.equal(k.params[0].snitt, 3);
    assert.ok(k.params.every((p) => p.mal == null));
  });
});
