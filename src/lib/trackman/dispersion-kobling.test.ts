/**
 * PH-08-kontroll 21.09.2026: et slag som mangler side eller carry filtreres bort
 * av `trackmanToPoints`, men `computeTrackManDispersionMap` indekserte punktene
 * med posisjonen i den UFILTRERTE slaglista. Ett hull tidlig i økta forskjøv
 * dermed alle senere slag: prikken på kartet og bøtta tilhørte et annet slag enn
 * raden i tabellen. Da kan ikke «velg punkt fra kart eller tabell» fungere.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  computeTrackManDispersionMap,
  type TrackManDispersionShot,
} from "./dispersion-map";

const slag = (
  n: number,
  side: number | null,
  carry: number | null,
  club = "7-jern",
): TrackManDispersionShot => ({
  id: `s${n}`,
  shotNumber: n,
  club,
  side,
  carryDistance: carry,
  totalDistance: carry,
  smashFactor: 1.4,
  launchAngle: 18,
});

describe("slag og kartpunkt henger sammen når en måling mangler", () => {
  it("kobler hvert kartpunkt til sitt eget slag, også etter et hull i dataene", () => {
    const shots = [
      slag(1, -5, 140),
      slag(2, null, 141), // mangler side — kan ikke plasseres
      slag(3, 12, 142),
      slag(4, 3, null), // mangler carry — kan ikke plasseres
      slag(5, 1, 139),
    ];
    const r = computeTrackManDispersionMap(shots);

    assert.deepEqual(
      r.shots.map((s) => s.id),
      ["s1", "s3", "s5"],
      "bare slag med både side og carry kan plasseres på kartet",
    );
    for (const s of r.shots) {
      assert.equal(
        s.point.lateral,
        s.side,
        `slag ${s.id} må ligge på sin egen side-verdi, ikke på et annet slags`,
      );
    }
  });

  it("tegner ingen ellipse når for få slag har komplette målinger", () => {
    // Ni rader, men bare fire har både side og carry.
    const shots = Array.from({ length: 9 }, (_, i) =>
      slag(i + 1, i < 4 ? i - 2 : null, 140 + i),
    );
    const r = computeTrackManDispersionMap(shots);
    assert.equal(r.n, 4);
    assert.equal(r.hasEllipse, false, "antall komplette slag avgjør, ikke antall rader");
    assert.equal(r.oneSigmaEllipse, null);
    assert.equal(r.twoSigmaEllipse, null);
  });

  it("uten et eneste komplett slag tegnes verken punkt eller ellipse", () => {
    const r = computeTrackManDispersionMap([slag(1, null, null), slag(2, 4, null)]);
    assert.equal(r.n, 0);
    assert.equal(r.hasEllipse, false);
    assert.deepEqual(r.shots, []);
    assert.equal(r.offlineBias, null);
  });
});

describe("ett kart per kølle", () => {
  it("navngir køllen når alle slag er samme kølle", () => {
    const r = computeTrackManDispersionMap([
      slag(1, -2, 140, "7-jern"),
      slag(2, 3, 143, "7-jern"),
    ]);
    assert.equal(r.kolle, "7-jern");
    assert.equal(r.blandedeKoller, false);
  });

  it("flagger blanding og oppgir ingen kølle når flere køller er med", () => {
    const r = computeTrackManDispersionMap([
      slag(1, -2, 140, "7-jern"),
      slag(2, 3, 250, "Driver"),
    ]);
    assert.equal(r.blandedeKoller, true);
    assert.equal(r.kolle, null, "en spredning over to køller kan ikke tilskrives én kølle");
  });

  it("slag uten plasserbar måling teller ikke med i kølle-vurderingen", () => {
    const r = computeTrackManDispersionMap([
      slag(1, -2, 140, "7-jern"),
      slag(2, null, null, "Driver"),
    ]);
    assert.equal(r.kolle, "7-jern");
    assert.equal(r.blandedeKoller, false);
  });
});
