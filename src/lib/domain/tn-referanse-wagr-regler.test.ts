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

it("parseWagrIder tar inntil fire unike, positive heltall", async () => {
  const { parseWagrIder } = await import("./tn-referanse-wagr-regler");
  assert.deepEqual(parseWagrIder(["3", "3", "x", "-1", "7", "8", "9", "10"]), [3, 7, 8, 9]);
  assert.deepEqual(parseWagrIder("12"), [12]);
  assert.deepEqual(parseWagrIder(undefined), []);
});

it("wagrAarForAar: årsslutt for tidligere år og plassen nå for i år, eldst først", async () => {
  const { wagrAarForAar } = await import("./tn-referanse-wagr-regler");
  const dato = new Date(Date.UTC(2026, 9, 19));
  assert.deepEqual(wagrAarForAar({ "2025": 846, "2024": 2239, "2026": 1 }, 412, dato), [{ aar: 2024, plass: 2239 }, { aar: 2025, plass: 846 }, { aar: 2026, plass: 412 }]);
  assert.deepEqual(wagrAarForAar(null, null, dato), []);
});

it("wagrAarsscore og fellesTurneringer", async () => {
  const { wagrAarsscore, fellesTurneringer } = await import("./tn-referanse-wagr-regler");
  assert.equal(wagrAarsscore({ "2026": { score: 72.1 } }, 2026), 72.1);
  assert.equal(wagrAarsscore({ "2026": { score: null } }, 2026), null);
  assert.equal(wagrAarsscore({}, 2026), null);
  assert.equal(fellesTurneringer([[1, 2, 3], [2, 3, 4], [3, 2]]), 2);
  assert.equal(fellesTurneringer([[1, 2]]), 0);
});
