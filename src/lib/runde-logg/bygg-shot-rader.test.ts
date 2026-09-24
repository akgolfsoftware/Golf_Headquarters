import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { byggShotRader, splitShotRader } from "@/lib/runde-logg/bygg-shot-rader";
import type { LoggetHull } from "@/lib/runde-logg/types";

describe("byggShotRader — endShotKategori og putt", () => {
  it("setter endShotKategori på et approach-slag, ikke på putten som følger", () => {
    const hull: LoggetHull = {
      holeNumber: 1,
      par: 4,
      lengdeMeter: 300,
      slag: [
        {
          resultat: { iHull: false, lie: "FAIRWAY", avstandTilHull: 150 },
          endShotKategori: "IN_PLAY",
        },
        {
          resultat: { iHull: false, lie: "GREEN", avstandTilHull: 4 },
          endShotKategori: "GREEN_HIT",
        },
        {
          resultat: { iHull: true },
          putt: {
            breakRetning: "VENSTRE_HOYRE",
            slopeAlvorlighet: "MODERAT",
            fartUtfall: "HOLED",
          },
        },
      ],
    };

    const rader = byggShotRader(hull);
    assert.equal(rader.length, 3);
    assert.equal(rader[0].shotType, "DRIVE");
    assert.equal(rader[0].endShotKategori, "IN_PLAY");
    assert.equal(rader[0].puttDetail, null);

    assert.equal(rader[1].shotType, "APPROACH");
    assert.equal(rader[1].endShotKategori, "GREEN_HIT");
    assert.equal(rader[1].puttDetail, null);

    // Putten starter fra GREEN (forrige slags resultat) → shotType PUTT.
    assert.equal(rader[2].shotType, "PUTT");
    assert.equal(rader[2].endShotKategori, null);
    assert.ok(rader[2].puttDetail);
    assert.equal(rader[2].puttDetail?.shotId, rader[2].id);
    // startAvstand for putten er 4 m → fot = round(4 * 3.28084) = 13.
    assert.equal(rader[2].puttDetail?.lengdeFot, 13);
    assert.equal(rader[2].puttDetail?.breakRetning, "VENSTRE_HOYRE");
    assert.equal(rader[2].puttDetail?.linjeMiss, null);
  });

  it("ignorerer endShotKategori satt på et slag som faktisk er en putt", () => {
    const hull: LoggetHull = {
      holeNumber: 2,
      par: 3,
      lengdeMeter: 150,
      slag: [
        { resultat: { iHull: false, lie: "GREEN", avstandTilHull: 6 } },
        {
          resultat: { iHull: true },
          // Feil bruk fra klienten — skal likevel ikke havne som endShotKategori
          // på en PUTT-rad.
          endShotKategori: "IN_PLAY",
        },
      ],
    };
    const rader = byggShotRader(hull);
    assert.equal(rader[1].shotType, "PUTT");
    assert.equal(rader[1].endShotKategori, null);
  });

  it("splitShotRader skiller Shot-felter fra PuttDetail-rader", () => {
    const hull: LoggetHull = {
      holeNumber: 3,
      par: 3,
      lengdeMeter: 140,
      slag: [
        { resultat: { iHull: false, lie: "GREEN", avstandTilHull: 3 } },
        {
          resultat: { iHull: true },
          putt: { breakRetning: "OPPOVER", slopeAlvorlighet: "SVAK", fartUtfall: "HOLED" },
        },
      ],
    };
    const { shots, putts } = splitShotRader(byggShotRader(hull));
    assert.equal(shots.length, 2);
    assert.equal(putts.length, 1);
    assert.equal("puttDetail" in shots[0], false);
    assert.equal(putts[0].shotId, shots[1].id);
  });

  it("støtter pinAvstand og targetAvstand (UpGame-mønster)", () => {
    const hull: LoggetHull = {
      holeNumber: 4,
      par: 4,
      lengdeMeter: 380,
      slag: [
        {
          resultat: { iHull: false, lie: "FAIRWAY", avstandTilHull: 155 },
          pinAvstand: 385,
          targetAvstand: 240,
        },
        {
          resultat: { iHull: true },
          pinAvstand: 155,
          targetAvstand: 150,
          notat: "Siktet senter green",
        },
      ],
    };
    const rader = byggShotRader(hull);
    assert.equal(rader[0].distanceToPin, 385);
    assert.equal(rader[0].notes, "[Mål: 240m]");
    assert.equal(rader[1].distanceToPin, 155);
    assert.equal(rader[1].notes, "[Mål: 150m] Siktet senter green");
  });
});
