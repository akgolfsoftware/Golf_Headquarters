import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { flyttPlanUke, gyldigPlanDato, osloPlanDato, parsePlanKontekst, planIsoUke } from "./plan-kontekst";
import { workbenchUrl } from "./visning-url";

const now = new Date("2026-10-02T10:00:00Z");

describe("felles Workbench-plan-kontekst", () => {
  it("avviser datoer som ikke finnes og godtar ekte skuddårsdager", () => {
    for (const raw of ["2026-02-29", "2026-02-31", "2026-04-31", "2026-13-01", "2026-00-01", "2026-10-00", "0000-01-01", "2026-1-1", "x", "2026-10-02T10:00:00Z"]) {
      assert.equal(gyldigPlanDato(raw), undefined, raw);
      assert.equal(parsePlanKontekst({ uke: raw }, { now }).weekStart, "2026-09-28", raw);
    }
    assert.equal(gyldigPlanDato("2024-02-29"), "2024-02-29");
    assert.equal(parsePlanKontekst({ uke: "2024-02-29" }, { now }).weekStart, "2024-02-26");
  });

  it("skiller ISO-ukeår fra kalenderåret rundt nyttår", () => {
    for (const [dato, year, week, weekStart] of [
      ["2021-01-01", 2020, 53, "2020-12-28"],
      ["2021-01-04", 2021, 1, "2021-01-04"],
      ["2025-12-29", 2026, 1, "2025-12-29"],
      ["2027-01-03", 2026, 53, "2026-12-28"],
    ] as const) {
      const kontekst = parsePlanKontekst({ uke: dato }, { now });
      assert.deepEqual(planIsoUke(dato), { year, week });
      assert.equal(kontekst.isoWeekYear, year);
      assert.equal(kontekst.weekNumber, week);
      assert.equal(kontekst.weekStart, weekStart);
      assert.equal(kontekst.year, year);
    }
    assert.equal(parsePlanKontekst({ uke: "2025-12-29", aar: "2025" }, { now }).year, 2025, "eksplisitt planår bevares");
  });

  it("uke40 → 41 → 40 og offset blir absolutt dato uten dobbel flytting", () => {
    const forste = parsePlanKontekst({ uke: "0" }, { now });
    assert.equal(forste.weekNumber, 40);
    const neste = parsePlanKontekst({ uke: "1" }, { now });
    assert.equal(neste.weekStart, "2026-10-05");
    assert.equal(neste.weekNumber, 41);
    const url = new URL(workbenchUrl("p1", "aar", neste.referanse), "https://test.invalid");
    assert.equal(parsePlanKontekst(url.searchParams, { now }).weekStart, neste.weekStart);
    assert.equal(flyttPlanUke(forste.weekStart, 1), neste.weekStart);
    assert.equal(flyttPlanUke(neste.weekStart, -1), forste.weekStart);
    assert.equal(parsePlanKontekst({ uke: "-1" }, { now }).weekStart, "2026-09-21");
    assert.equal(parsePlanKontekst({ uke: "1.9" }, { now }).weekStart, "2026-10-05");
    assert.equal(parsePlanKontekst({ uke: "9999" }, { now }).weekStart, flyttPlanUke(forste.weekStart, 52));
  });

  it("bruker Europe/Oslo ved midnatt og begge sommertidsskifter", () => {
    for (const [instant, dato, uke] of [
      ["2026-03-28T23:30:00Z", "2026-03-29", "2026-03-23"],
      ["2026-03-29T22:30:00Z", "2026-03-30", "2026-03-30"],
      ["2026-10-24T22:30:00Z", "2026-10-25", "2026-10-19"],
      ["2026-10-25T23:30:00Z", "2026-10-26", "2026-10-26"],
      ["2025-12-31T23:30:00Z", "2026-01-01", "2025-12-29"],
    ]) {
      const klokke = new Date(instant);
      assert.equal(osloPlanDato(klokke), dato);
      assert.equal(parsePlanKontekst({}, { now: klokke }).weekStart, uke);
    }
    for (const uke of ["2026-03-23", "2026-10-19", "2026-12-28"]) {
      const neste = flyttPlanUke(uke, 1);
      assert.equal(Date.parse(neste) - Date.parse(uke), 7 * 86_400_000);
      assert.equal(flyttPlanUke(neste, -1), uke);
    }
  });

  it("utleder manglende uke fra valgt måned eller autorisert periode", () => {
    assert.equal(parsePlanKontekst({ maned: "2026-10" }, { now }).weekStart, "2026-09-28");
    assert.equal(parsePlanKontekst({ maned: "2026-11" }, { now }).weekStart, "2026-10-26");
    const periode = { id: "p-1", startDate: "2026-10-12", endDate: "2026-11-08" };
    const kontekst = parsePlanKontekst({ aar: "2026", periode: "p-1" }, { now, periode });
    assert.equal(kontekst.weekStart, "2026-10-12");
    assert.equal(kontekst.referanse.periode, "p-1");
    assert.equal(parsePlanKontekst({ periode: "p-1" }, { now: new Date("2026-10-27T10:00:00Z"), periode }).weekStart, "2026-10-26");
    assert.equal(parsePlanKontekst({ uke: "2026-09-28", periode: "p-1" }, { now, periode }).weekStart, "2026-09-28");
    assert.equal(parsePlanKontekst({ uke: "2026-02-31", maned: "2026-11" }, { now }).weekStart, "2026-10-26");
    assert.equal(parsePlanKontekst({ aar: "2025" }, { now }).weekStart, "2024-12-30");
  });

  it("bevarer identisk kontekst gjennom fire perspektiver, frem og tilbake", () => {
    const initial = parsePlanKontekst({ uke: "2026-10-05", aar: "2026", maned: "2026-10", periode: "p-1", okt: "o-1" }, { now });
    for (const surface of ["agency", "player"] as const) {
      let kontekst = initial;
      for (const visning of ["aar", "periode", "maned", "uke", "maned", "periode", "aar", "uke"] as const) {
        const url = new URL(workbenchUrl("p1", visning, kontekst.referanse, surface), "https://test.invalid");
        kontekst = parsePlanKontekst(url.searchParams, { now: new Date("2027-02-01T10:00:00Z") });
        assert.deepEqual(kontekst.referanse, initial.referanse);
        assert.equal(kontekst.visning, visning);
        assert.equal(kontekst.weekNumber, 41);
      }
    }
  });

  it("tolker gamle alias og gjentatte Next-queryverdier likt", () => {
    const aliases = { ar: "aar", mnd: "maned", volum: "vol", malsetninger: "mal", stall: "stall", live: "live", min: "min" };
    for (const [alias, visning] of Object.entries(aliases)) assert.equal(parsePlanKontekst({ vis: alias }, { now }).visning, visning);
    const input = { uke: ["2026-10-05", "2026-10-12"], aar: ["2026", "2027"], niva: ["ar", "maned"], okt: ["o-1", "o-2"] };
    const sp = new URLSearchParams();
    for (const [key, values] of Object.entries(input)) for (const value of values) sp.append(key, value);
    assert.deepEqual(parsePlanKontekst(input, { now }), parsePlanKontekst(sp, { now }));
    assert.equal(parsePlanKontekst(input, { now }).weekStart, "2026-10-05");
    assert.equal(parsePlanKontekst({ niva: "maned", vis: "ar", maned: "2026-99", aar: "NaN" }, { now }).year, 2026);
  });
});
