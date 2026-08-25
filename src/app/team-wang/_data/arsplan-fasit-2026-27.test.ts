/**
 * Invariant-tester for den nye WANG Årsplan-datakontrakten (fasit levert 25.08.2026).
 * Dette er ren transkribert data — testene sjekker at transkriberingen er intern
 * konsistent (44 uker, fase-referanser finnes, pyramiden summerer til 100 %), ikke at
 * innholdet er "riktig" (det er fasitens README/DATA-KONTRAKT.md sitt ansvar).
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  UKER,
  PERIODER,
  FASER,
  AKSE_ORD,
  AKSER,
  OKTER,
  beregnPyramide,
  faseForPeriode,
  TRINN_ORD,
  TRINN,
  TRINN_KRO,
  KM,
  KM_KRO,
  KLASSER,
  PROVER,
  FORELDREMOTER,
  moteTekst,
  byggEvents,
} from "./arsplan-fasit-2026-27";

test("UKER dekker alle 44 uker i sesongen uke 34/2026 til uke 24/2027", () => {
  assert.equal(UKER.length, 44);
  assert.deepEqual(
    [UKER[0][0], UKER[0][1]],
    [34, "2026-08-17"],
  );
  assert.deepEqual(
    [UKER[UKER.length - 1][0], UKER[UKER.length - 1][1]],
    [24, "2027-06-14"],
  );
});

test("hver ukes fase finnes i FASER", () => {
  for (const [uke, , fase] of UKER) {
    assert.ok(fase in FASER, `uke ${uke} har ukjent fase ${fase}`);
  }
});

test("PERIODER dekker alle 5 periodene og faseForPeriode slår opp riktig", () => {
  const ider = PERIODER.map((p) => p.id).sort();
  assert.deepEqual(ider, ["GRUNN", "SPES", "TEST", "TURN", "TURN2"]);
  assert.equal(faseForPeriode("TURN2"), "TURN");
  assert.equal(faseForPeriode("GRUNN"), "GRUNN");
});

test("OKTER finnes for alle tre driftsperiodene GRUNN/SPES/TURN", () => {
  const perioder = OKTER.map((o) => o.periode).sort();
  assert.deepEqual(perioder, ["GRUNN", "SPES", "TURN"]);
});

test("beregnPyramide summerer til 100 % for hver periode", () => {
  for (const okt of OKTER) {
    const { pct } = beregnPyramide(okt.periode);
    assert.equal(pct.length, AKSE_ORD.length);
    const sum = pct.reduce((a, v) => a + v, 0);
    assert.equal(sum, 100, `${okt.periode} summerer til ${sum}, ikke 100`);
    for (const v of pct) assert.ok(v >= 0);
  }
});

test("AKSER dekker AKSE_ORD i samme rekkefølge", () => {
  assert.deepEqual(
    AKSER.map((a) => a.kode),
    AKSE_ORD,
  );
});

test("kompetansemål og klasser dekker alle tre trinn, ingen elevnavn i klassedata", () => {
  for (const trinn of TRINN_ORD) {
    assert.ok(TRINN[trinn]);
    assert.ok(TRINN_KRO[trinn]);
    assert.ok(KM[trinn].length > 0);
    assert.ok(KM_KRO[trinn].length > 0);
  }
  assert.equal(KLASSER.length, 6);
  assert.deepEqual(
    KLASSER.map((k) => k.id).sort(),
    ["VG1A", "VG1B", "VG2A", "VG2B", "VG3A", "VG3B"],
  );
  // KLASSER inneholder kun fag/lærer/rom — aldri elevnavn. Sjekk at ingen kjent
  // mønster for et personnavn dukker opp i friteksten utover lærerlisten selv.
  for (const klasse of KLASSER) {
    for (const rad of klasse.plan) {
      for (const celle of rad) {
        assert.ok(!celle.includes("Elev"), `mistenkelig elevreferanse: "${celle}"`);
      }
    }
  }
});

test("PROVER og FORELDREMOTER dekker alle tre trinn, entall/flertall er riktig", () => {
  for (const trinn of TRINN_ORD) {
    assert.ok(PROVER[trinn].length > 0);
    assert.ok(FORELDREMOTER[trinn].length > 0);
  }
  assert.equal(moteTekst(1), "1 møte");
  assert.equal(moteTekst(2), "2 møter");
  assert.equal(FORELDREMOTER.VG1.length, 4);
  assert.equal(FORELDREMOTER.VG2.length, 2);
  assert.equal(FORELDREMOTER.VG3.length, 1);
});

test("byggEvents merker hver golføkt med pyramideakse, aldri generisk 'golføkt'", () => {
  const ev = byggEvents();
  let oktTreff = 0;
  for (const dag of Object.values(ev)) {
    for (const hendelse of dag) {
      if (hendelse.type !== "okt") continue;
      if (hendelse.label.includes("Fellessamling")) continue;
      oktTreff++;
      assert.match(
        hendelse.label,
        /^(TEK|SLAG|SPILL|TURN|FYS)-økt · (GFGK|Treningslokalet)$/,
        `uventet øktetikett: "${hendelse.label}"`,
      );
    }
  }
  assert.ok(oktTreff > 0, "byggEvents() genererte ingen øktdager");
});

test("byggEvents produserer kjente nøkkeldatoer", () => {
  const ev = byggEvents();
  assert.ok(ev["2026-08-17"], "sesongstart uke 34 mangler hendelser");
  assert.ok(ev["2026-10-19"]?.some((h) => h.label.includes("IUP-baseline")), "testuke 43 mangler");
  assert.ok(ev["2027-06-18"]?.some((h) => h.label === "Siste skoledag"), "siste skoledag mangler");
});
