import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { byggWangPlanData, trengerDeg, visPct, type WangPlanGrunnlag, type WangPlanOkt } from "./wang-plan-visning";

const GRUPPE = "wang-fredrikstad";
const NAA = new Date("2026-10-18T12:00:00Z");
const dagerSiden = (d: number) => new Date(NAA.getTime() - d * 86_400_000);

const okt = (d: number, status: WangPlanOkt["status"], extra: Partial<WangPlanOkt> = {}): WangPlanOkt => ({
  scheduledAt: dagerSiden(d),
  durationMin: 60,
  status,
  akse: "TEK",
  fraGruppa: false,
  ...extra,
});

// 3 av 4 timer gjennomført, 1 av 2 gruppeøkter.
const OKTER = [
  okt(2, "COMPLETED", { fraGruppa: true }),
  okt(3, "COMPLETED"),
  okt(4, "COMPLETED", { akse: "FYS" }),
  okt(5, "SKIPPED", { fraGruppa: true }),
];

const ja = (rolle: "SELV" | "FORESATT", d = 10, gruppe = GRUPPE) => ({
  scope: "TRENINGSPLAN",
  mottakerGruppeId: gruppe,
  gitt: true,
  gittAvRolle: rolle,
  createdAt: dagerSiden(d),
});

const elev = (id: string, rader: WangPlanGrunnlag["samtykkeRader"], kreverForesatt = false): WangPlanGrunnlag => ({
  id,
  kreverForesatt,
  fodselsdato: null,
  samtykkeRader: rader,
  okter: OKTER,
});

describe("byggWangPlanData", () => {
  it("treneren ser etterlevelse for en elev som har delt planen, og «—» for en som ikke har", () => {
    const data = byggWangPlanData([elev("delt", [ja("SELV")]), elev("ikke-delt", [])], GRUPPE, NAA);
    assert.deepEqual(data.delerIder, ["delt"]);
    assert.equal(visPct(data.perElev.delt.etterlevelse), "75 %");
    assert.equal(visPct(data.perElev.delt.morgen), "50 %");
    assert.equal(visPct(data.perElev["ikke-delt"]?.etterlevelse), "—");
    assert.equal(visPct(data.perElev["ikke-delt"]?.morgen), "—");
    // Gruppetallet regnes bare av den som har delt.
    assert.deepEqual(data.samlet, { pct: 75, gjennomfortMin: 180, planlagtMin: 240 });
    assert.deepEqual(data.perAkse.FYS, { pct: 100, gjennomfortMin: 60, planlagtMin: 60 });
  });

  it("testsamtykket alene deler ikke planen", () => {
    const data = byggWangPlanData([elev("test", [{ ...ja("SELV"), scope: "TEST_RESULTATER" }])], GRUPPE, NAA);
    assert.deepEqual(data.delerIder, []);
    assert.equal(data.samlet.pct, null);
  });

  it("under 16 år deler bare forelderens ja planen", () => {
    const data = byggWangPlanData(
      [elev("bare-selv", [ja("SELV")], true), elev("foresatt", [ja("FORESATT")], true)],
      GRUPPE,
      NAA,
    );
    assert.deepEqual(data.delerIder, ["foresatt"]);
  });

  it("et trekk stopper delingen, og en deling med en annen gruppe teller ikke", () => {
    const trukket = { ...ja("SELV", 2), gitt: false };
    const data = byggWangPlanData(
      [elev("trukket", [ja("SELV", 10), trukket]), elev("annen", [ja("SELV", 10, "annen-skole")])],
      GRUPPE,
      NAA,
    );
    assert.deepEqual(data.delerIder, []);
  });

  it("trenger deg under 80 % av planen eller av gruppas økter", () => {
    const data = byggWangPlanData([elev("delt", [ja("SELV")])], GRUPPE, NAA);
    assert.equal(trengerDeg(data.perElev.delt), true);
  });
});
