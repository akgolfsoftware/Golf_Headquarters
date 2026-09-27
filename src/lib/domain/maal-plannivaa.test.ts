import { test } from "node:test";
import assert from "node:assert/strict";

import {
  beregnMaalSpor,
  foreslaNesteTiltak,
  foreslaPlanNivaa,
  lesPlanNivaa,
  losPlanNivaa,
  medPlanNivaa,
  planVindu,
} from "@/lib/domain/maal-plannivaa";

const IDAG = "2026-09-23"; // onsdag

test("lesPlanNivaa godtar kun kjente nivåer", () => {
  assert.equal(lesPlanNivaa({ planNivaa: "UKE" }), "UKE");
  assert.equal(lesPlanNivaa({ planNivaa: "ukjent" }), null);
  assert.equal(lesPlanNivaa(null), null);
  assert.equal(lesPlanNivaa([]), null);
  assert.equal(lesPlanNivaa({ sgOmrade: "PUTT" }), null);
});

test("medPlanNivaa bevarer andre nøkler og kan fjerne nivået", () => {
  const satt = medPlanNivaa({ sgOmrade: "PUTT", sgStart: -0.4 }, "MANED");
  assert.deepEqual(satt, { sgOmrade: "PUTT", sgStart: -0.4, planNivaa: "MANED" });
  assert.deepEqual(medPlanNivaa(satt, null), { sgOmrade: "PUTT", sgStart: -0.4 });
  assert.deepEqual(medPlanNivaa({ planNivaa: "UKE" }, "OKT"), { planNivaa: "OKT" });
});

test("foreslaPlanNivaa: nivå følger avstanden til fristen", () => {
  assert.equal(foreslaPlanNivaa(null, IDAG), "AAR");
  assert.equal(foreslaPlanNivaa("2026-09-24", IDAG), "OKT");
  assert.equal(foreslaPlanNivaa("2026-09-30", IDAG), "UKE");
  assert.equal(foreslaPlanNivaa("2026-10-20", IDAG), "MANED");
  assert.equal(foreslaPlanNivaa("2026-12-15", IDAG), "PERIODE");
  assert.equal(foreslaPlanNivaa("2027-06-01", IDAG), "AAR");
  assert.equal(foreslaPlanNivaa("2026-09-01", IDAG), "UKE"); // forfalt
});

test("losPlanNivaa: valgt nivå vinner over forslag, og kilden oppgis", () => {
  assert.deepEqual(losPlanNivaa({ planNivaa: "PERIODE" }, "2026-09-30", IDAG), {
    nivaa: "PERIODE",
    kilde: "valgt",
  });
  assert.deepEqual(losPlanNivaa(null, "2026-09-30", IDAG), { nivaa: "UKE", kilde: "foreslatt" });
});

test("planVindu: uke starter mandag, måned og år følger kalenderen", () => {
  assert.deepEqual(planVindu("OKT", IDAG), { fra: IDAG, til: IDAG });
  assert.deepEqual(planVindu("UKE", IDAG), { fra: "2026-09-21", til: "2026-09-27" });
  assert.deepEqual(planVindu("UKE", "2026-09-27"), { fra: "2026-09-21", til: "2026-09-27" }); // søndag
  assert.deepEqual(planVindu("MANED", "2026-02-10"), { fra: "2026-02-01", til: "2026-02-28" });
  assert.deepEqual(planVindu("AAR", IDAG), { fra: "2026-01-01", til: "2026-12-31" });
  assert.deepEqual(planVindu("PERIODE", IDAG), { fra: "2026-08-12", til: "2026-11-04" });
});

test("beregnMaalSpor: utkast og avlyste teller ikke, uteblitt skilles fra gjenstår", () => {
  const spor = beregnMaalSpor(
    [
      { date: "2026-09-21", status: "COMPLETED" },
      { date: "2026-09-22", status: "PUBLISHED" }, // passert, ikke gjort
      { date: "2026-09-22", status: "SKIPPED" }, // passert, hoppet over
      { date: "2026-09-25", status: "SCHEDULED" }, // fremover
      { date: "2026-09-23", status: "PUBLISHED" }, // i dag teller som gjenstår
      { date: "2026-09-24", status: "DRAFT" },
      { date: "2026-09-26", status: "CANCELLED" },
    ],
    IDAG,
  );
  assert.deepEqual(spor, { planlagt: 5, gjennomfort: 1, uteblitt: 2, gjenstar: 2 });
});

test("foreslaNesteTiltak: ingen kobling gir ingen konklusjon om økter", () => {
  assert.match(foreslaNesteTiltak({ fremdriftStatus: "no-data", spor: null }), /Følg opp manuelt/);
  assert.match(foreslaNesteTiltak({ fremdriftStatus: "achieved", spor: null }), /Sett neste mål/);
  assert.match(foreslaNesteTiltak({ fremdriftStatus: "behind", spor: null }), /dekker målet/);
});

test("foreslaNesteTiltak: spor styrer anbefalingen", () => {
  const tom = { planlagt: 0, gjennomfort: 0, uteblitt: 0, gjenstar: 0 };
  assert.match(foreslaNesteTiltak({ fremdriftStatus: "behind", spor: tom }), /Planlegg minst én/);
  const uteblitt = { planlagt: 3, gjennomfort: 1, uteblitt: 2, gjenstar: 0 };
  assert.match(foreslaNesteTiltak({ fremdriftStatus: "behind", spor: uteblitt }), /uteblitte økter/i);
  const ok = { planlagt: 3, gjennomfort: 2, uteblitt: 0, gjenstar: 1 };
  assert.match(foreslaNesteTiltak({ fremdriftStatus: "on-track", spor: ok }), /Fortsett/);
});
