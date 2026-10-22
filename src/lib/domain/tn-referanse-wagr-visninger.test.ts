import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  antallWagrTurneringer,
  byggWagrSesong,
  byggWagrTurneringer,
  erWagrSeier,
  parseWagrVisning,
  wagrPrikkStorrelse,
  type WagrResultatInn,
} from "./tn-referanse-wagr-regler";

const res = (r: Partial<WagrResultatInn> & { wagrId: number; eventId: number; navn: string }): WagrResultatInn => ({
  spillerNavn: `Spiller ${r.wagrId}`,
  dato: null,
  finish: null,
  power: null,
  points: null,
  rankBefore: null,
  rankAfter: null,
  ...r,
});

describe("Referanse › WAGR, visningene Turneringer og Sesong", () => {
  it("visningsvalget faller tilbake til leaderboard", () => {
    assert.equal(parseWagrVisning(undefined), "leaderboard");
    assert.equal(parseWagrVisning("turneringer"), "turneringer");
    assert.equal(parseWagrVisning(["sesong", "x"]), "sesong");
    assert.equal(parseWagrVisning("rart"), "leaderboard");
  });

  it("seier er plassering 1, ikke delt førsteplass eller T4", () => {
    assert.equal(erWagrSeier("1"), true);
    assert.equal(erWagrSeier("W"), true);
    assert.equal(erWagrSeier("T1"), false);
    assert.equal(erWagrSeier("T4"), false);
    assert.equal(erWagrSeier(null), false);
  });

  it("turneringslista er nyeste først, uten dato sist, og teller hver turnering én gang", () => {
    const liste = [
      res({ wagrId: 1, eventId: 10, navn: "Gammel", dato: new Date(Date.UTC(2026, 4, 5)) }),
      res({ wagrId: 2, eventId: 11, navn: "Ny", dato: new Date(Date.UTC(2026, 8, 21)) }),
      res({ wagrId: 1, eventId: 12, navn: "Uten dato" }),
      res({ wagrId: 2, eventId: 10, navn: "Gammel", dato: new Date(Date.UTC(2026, 4, 5)) }),
    ];
    assert.deepEqual(byggWagrTurneringer(liste).map((r) => r.navn), ["Ny", "Gammel", "Gammel", "Uten dato"]);
    assert.equal(antallWagrTurneringer(liste), 3);
  });

  it("sesongen har én rad per spiller i gitt rekkefølge, prikker eldst først, og tom rad uten turneringer", () => {
    const rader = byggWagrSesong(
      [{ wagrId: 1, navn: "A" }, { wagrId: 2, navn: "B" }],
      [
        res({ wagrId: 1, eventId: 2, navn: "Senere", dato: new Date(Date.UTC(2026, 8, 1)), finish: "T4", points: 20 }),
        res({ wagrId: 1, eventId: 1, navn: "Tidligere", dato: new Date(Date.UTC(2026, 4, 1)), finish: "1", points: 40 }),
      ],
    );
    assert.equal(rader.length, 2);
    assert.deepEqual(rader[0]!.prikker.map((p) => p.navn), ["Tidligere", "Senere"]);
    assert.equal(rader[0]!.seire, 1);
    assert.equal(rader[0]!.prikker[0]!.seier, true);
    assert.equal(rader[1]!.prikker.length, 0);
  });

  it("prikkstørrelsen vokser med poeng og har faste grenser", () => {
    assert.equal(wagrPrikkStorrelse(null, 100), 10);
    assert.equal(wagrPrikkStorrelse(0, 100), 10);
    assert.equal(wagrPrikkStorrelse(100, 100), 24);
    assert.equal(wagrPrikkStorrelse(500, 100), 24);
    assert.ok(wagrPrikkStorrelse(50, 100) > 10 && wagrPrikkStorrelse(50, 100) < 24);
  });
});
