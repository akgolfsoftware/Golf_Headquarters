import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { byggWagrLeaderboard, plassVedAarsslutt, type WagrRefMedlem } from "./tn-referanse-wagr-regler";

const medlem = (m: Partial<WagrRefMedlem> & { wagrId: number; navn: string }): WagrRefMedlem => ({
  nivaa: null,
  land: "Norway",
  plass: null,
  snittPoeng: null,
  bestePlass: null,
  seire: null,
  aarsslutt: {},
  sisteTurnering: null,
  ...m,
});

describe("plassVedAarsslutt", () => {
  it("leser året som tekstnøkkel", () => {
    assert.equal(plassVedAarsslutt({ "2025": 846 }, 2025), 846);
  });
  it("gir null for manglende år og ugyldige verdier", () => {
    assert.equal(plassVedAarsslutt({ "2024": 2239 }, 2025), null);
    assert.equal(plassVedAarsslutt({ "2025": "846" }, 2025), null);
    assert.equal(plassVedAarsslutt(null, 2025), null);
    assert.equal(plassVedAarsslutt([846], 2025), null);
  });
});

describe("byggWagrLeaderboard", () => {
  const dato = new Date(Date.UTC(2026, 9, 20));

  it("sorterer på plass med spillere uten plass sist", () => {
    const rader = byggWagrLeaderboard(
      [medlem({ wagrId: 1, navn: "Uten plass" }), medlem({ wagrId: 2, navn: "B", plass: 500 }), medlem({ wagrId: 3, navn: "A", plass: 280 })],
      dato,
    );
    assert.deepEqual(rader.map((r) => r.wagrId), [3, 2, 1]);
  });

  it("regner endring mot årsslutt året før rankinguka", () => {
    const [rad] = byggWagrLeaderboard([medlem({ wagrId: 39218, navn: "Spiller", plass: 280, aarsslutt: { "2024": 2239, "2025": 846 } })], dato);
    assert.equal(rad!.plassAarsslutt, 846);
    assert.equal(rad!.endring, 566);
  });

  it("gir ingen endring når et av tallene mangler, i stedet for å anta", () => {
    const [utenAarsslutt] = byggWagrLeaderboard([medlem({ wagrId: 1, navn: "X", plass: 280, aarsslutt: { "2024": 2239 } })], dato);
    const [utenPlass] = byggWagrLeaderboard([medlem({ wagrId: 2, navn: "Y", aarsslutt: { "2025": 846 } })], dato);
    assert.equal(utenAarsslutt!.endring, null);
    assert.equal(utenPlass!.endring, null);
  });
});
