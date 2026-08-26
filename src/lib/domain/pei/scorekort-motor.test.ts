/**
 * Paritetstester — beviser at den høstede motoren gir SAMME tall som
 * ak-golf-talenthq (shared/protocols/{sg-reference,scorecard-compute,
 * protocol-definitions}.js) på kjente eksempler.
 *
 * Referanseverdiene under er hentet ved å kjøre talenthq sin egen kode
 * direkte (node --input-type=module mot en lokal kopi med relative imports
 * fikset til ".js"-suffiks — talenthq-repoet er IKKE endret), se
 * docs/natt/N3-DONE.md for kommandoene og full output. Tallene er limt inn
 * her uendret — dette er selve parity-beviset, ikke en gjetning.
 *
 * Kjør med: npm test
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  avstandTilMal,
  avvikFraMal,
  beregnPeiForRad,
  erPeiBedre,
  PEI_LAVERE_ER_BEDRE,
} from "./pei-beregning";
import { sgFraLengde, forventedePutter, gronnePutter } from "./broadie-sg-tabeller";
import { poeng8Ball, poengLengdePutt } from "./poeng-tabeller";
import { hovlandPei } from "./pei-tabeller";
import {
  beregnCelle,
  beregnPeiCelle,
  beregnSgCelle,
  beregnPoengCelle,
  beregnTotal,
} from "./scorekort-motor";
import { hentProtokoll, TEST_PROTOKOLLER } from "./protokoll-definisjoner";

describe("PEI-retning — lavere skal alltid bety bedre (avklaring 2026-08-26)", () => {
  it("PEI_LAVERE_ER_BEDRE er sann", () => {
    assert.equal(PEI_LAVERE_ER_BEDRE, true);
  });

  it("en lavere PEI-verdi regnes som bedre enn en høyere", () => {
    assert.equal(erPeiBedre(0.05, 0.1), true);
    assert.equal(erPeiBedre(0.1, 0.05), false);
  });

  it("PEI = resultat / lengde (ikke (Rand - avstand)/Rand — den konkurrerende formelen er forbudt)", () => {
    // 5 m fra hull på en 10 m-lengde: den avklarte formelen gir 0,5 (dårlig,
    // høyt tall = langt fra hull). Den forbudte formelen ville gitt 0,5 også
    // her ved en tilfeldighet — testen pei-fra-fast-lengde under bruker tall
    // som skiller de to formlene tydelig fra hverandre.
    const pei = beregnPeiForRad({ resultat: 5, radLengde: 10 });
    assert.equal(pei, 0.5);
    // Med den forbudte (Rand-avstand)/Rand-formelen ville "nærmere hull er
    // høyere tall" — her ville f.eks. 1 m fra hull på 10 m gi 0,9 (høyt og
    // "bra"). Den avklarte formelen gir i stedet 0,1 (lavt og bra).
    const peiNaer = beregnPeiForRad({ resultat: 1, radLengde: 10 });
    assert.equal(peiNaer, 0.1);
    assert.ok(peiNaer < pei, "nærmere hull skal gi LAVERE PEI, ikke høyere");
  });
});

describe("Referansetabeller — paritet mot talenthq sg-reference.js", () => {
  it("sgFraLengde (tee) matcher talenthq", () => {
    assert.equal(sgFraLengde(0, "tee"), 2.92);
    assert.equal(sgFraLengde(90, "tee"), 2.92);
    assert.equal(sgFraLengde(91.01, "tee"), 2.9235);
  });

  it("forventedePutter (grov tabell) matcher talenthq", () => {
    assert.equal(forventedePutter(0), 0);
    assert.equal(forventedePutter(0.02), 1.04);
    assert.equal(forventedePutter(3), 1.61);
    assert.equal(forventedePutter(3.01), 1.78);
  });

  it("gronnePutter (fin green-tabell) matcher talenthq", () => {
    assert.equal(gronnePutter(0), 1);
    assert.equal(gronnePutter(2), 1.4);
  });

  it("poeng8Ball matcher talenthq", () => {
    assert.equal(poeng8Ball(0), 4);
    assert.equal(poeng8Ball(0.1), 3);
    assert.equal(poeng8Ball(1), 2);
    assert.equal(poeng8Ball(2), 1);
    assert.equal(poeng8Ball(3), 0);
  });

  it("poengLengdePutt matcher talenthq", () => {
    assert.equal(poengLengdePutt(0), 6);
    assert.equal(poengLengdePutt(1), 3);
    assert.equal(poengLengdePutt(1.1), 1);
    assert.equal(poengLengdePutt(-2.1), 0.5);
    assert.equal(poengLengdePutt(5), 0);
  });

  it("hovlandPei matcher talenthq", () => {
    assert.equal(hovlandPei(75), 0.0736);
    assert.equal(hovlandPei(120), 0.0536);
    assert.equal(hovlandPei(180), 0.0511);
    assert.equal(hovlandPei(500), 0.0597);
  });
});

describe("scorekort-motor — paritet mot talenthq computeCell", () => {
  it("8-ball-variation rad 0 (Chip10, lengde 10, resultat 2 m)", () => {
    const proto = hentProtokoll("8-ball-variation")!;
    const row = proto.rows[0];
    assert.deepEqual(row, { slag: "Chip10", lengde: 10 });
    const vals = { resultat: "2" };
    const peiCol = proto.columns.find(c => c.key === "pei")!;
    const pgaCol = proto.columns.find(c => c.key === "pgaPutts")!;
    const poengCol = proto.columns.find(c => c.key === "poeng")!;
    assert.equal(beregnCelle(proto, peiCol, row, vals), 0.2);
    assert.equal(beregnCelle(proto, pgaCol, row, vals), 1.4);
    assert.equal(beregnCelle(proto, poengCol, row, vals), 1);
    // familiefunksjonene isolert skal gi samme svar som dispatcheren
    assert.equal(beregnPeiCelle(peiCol, row, vals), 0.2);
    assert.equal(beregnSgCelle(proto, pgaCol, row, vals), 1.4);
    assert.equal(beregnPoengCelle(poengCol, vals), 1);
  });

  it("driver-basic rad 0 (mål 270 m, carry 265, side 3)", () => {
    const proto = hentProtokoll("driver-basic")!;
    const row = proto.rows[0];
    assert.deepEqual(row, { maal: 270 });
    const vals = { carry: "265", side: "3" };
    const tilMaalCol = proto.columns.find(c => c.key === "tilMaal")!;
    const peiCol = proto.columns.find(c => c.key === "pei")!;
    const sgCol = proto.columns.find(c => c.key === "sg")!;
    assert.equal(beregnCelle(proto, tilMaalCol, row, vals), 5.830951894845301);
    assert.equal(beregnCelle(proto, peiCol, row, vals), 0.02159611812905667);
    assert.equal(beregnCelle(proto, sgCol, row, vals), 1.87);
    // avstandTilMal alene skal gi samme tall som "tilMaal"-cellen
    assert.equal(avstandTilMal(270, 265, 3), 5.830951894845301);
  });

  it("pei-test-bane rad 0 (lengdeInn 150, tilHull 10)", () => {
    const proto = hentProtokoll("pei-test-bane")!;
    const row = proto.rows[0];
    const vals = { lengdeInn: "150", tilHull: "10" };
    const peiCol = proto.columns.find(c => c.key === "pei")!;
    assert.equal(beregnCelle(proto, peiCol, row, vals), 0.06666666666666667);
  });

  it("golfslag-bane rad 0 (hull 1, lengde 129 m, resultat 5 m, lie fw)", () => {
    const proto = hentProtokoll("golfslag-bane")!;
    const row = proto.rows[0];
    assert.deepEqual(row, { hull: 1, lengde: 129, lie: undefined });
    const vals = { resultat: "5", lieInn: "fw" };
    const sgFraLengdeCol = proto.columns.find(c => c.key === "sgFraLengde")!;
    const peiCol = proto.columns.find(c => c.key === "pei")!;
    const sgCol = proto.columns.find(c => c.key === "sg")!;
    assert.equal(beregnCelle(proto, sgFraLengdeCol, row, vals), 2.9135);
    assert.equal(beregnCelle(proto, peiCol, row, vals), 0.03875968992248062);
    const sg = beregnCelle(proto, sgCol, row, vals) as number;
    assert.ok(Math.abs(sg - 0.04349999999999987) < 1e-9);
  });

  it("pei-st-leon rad 0 (mål 129 m, carry 125, side 4) — diff/tilMaal/pei", () => {
    const proto = hentProtokoll("pei-st-leon")!;
    const row = proto.rows[0];
    assert.deepEqual(row, { maal: 129 });
    const vals = { carry: "125", side: "4" };
    const diffCol = proto.columns.find(c => c.key === "diff")!;
    const tilMaalCol = proto.columns.find(c => c.key === "tilMaal")!;
    const peiCol = proto.columns.find(c => c.key === "pei")!;
    assert.equal(beregnCelle(proto, diffCol, row, vals), -4);
    assert.equal(avvikFraMal(125, 129), -4);
    assert.equal(beregnCelle(proto, tilMaalCol, row, vals), 5.656854249492381);
    assert.equal(beregnCelle(proto, peiCol, row, vals), 0.0438515833293983);
  });

  it("8-ball-variation total 'Chip PEI' (rad 0+1 fylt ut) matcher talenthq computeTotal", () => {
    const proto = hentProtokoll("8-ball-variation")!;
    const rows = proto.rows;
    const allVals = { 0: { resultat: "2" }, 1: { resultat: "3" } };
    const chipTotal = proto.totals.find(t => t.label === "Chip PEI")!;
    const totalPoeng = proto.totals.find(t => t.label === "Total poeng")!;
    assert.equal(beregnTotal(proto, chipTotal, allVals, rows), 0.15000000000000002);
    assert.equal(beregnTotal(proto, totalPoeng, allVals, rows), 1);
  });
});

describe("Motorene er strukturelt adskilt (CLAUDE.md-invariant)", () => {
  it("beregnPeiCelle returnerer aldri noe for SG- eller poeng-kolonner", () => {
    const proto = hentProtokoll("golfslag-bane")!;
    const row = proto.rows[0];
    const vals = { resultat: "5", lieInn: "fw" };
    const sgCol = proto.columns.find(c => c.key === "sg")!;
    const sgFraLengdeCol = proto.columns.find(c => c.key === "sgFraLengde")!;
    assert.equal(beregnPeiCelle(sgCol, row, vals), null);
    assert.equal(beregnPeiCelle(sgFraLengdeCol, row, vals), null);
  });

  it("beregnSgCelle returnerer aldri noe for PEI-kolonner", () => {
    const proto = hentProtokoll("golfslag-bane")!;
    const row = proto.rows[0];
    const vals = { resultat: "5", lieInn: "fw" };
    const peiCol = proto.columns.find(c => c.key === "pei")!;
    assert.equal(beregnSgCelle(proto, peiCol, row, vals), null);
  });

  it("beregnPoengCelle returnerer aldri noe for PEI- eller SG-kolonner", () => {
    const proto = hentProtokoll("golfslag-bane")!;
    const peiCol = proto.columns.find(c => c.key === "pei")!;
    const sgCol = proto.columns.find(c => c.key === "sg")!;
    assert.equal(beregnPoengCelle(peiCol, { resultat: "5" }), null);
    assert.equal(beregnPoengCelle(sgCol, { resultat: "5" }), null);
  });
});

describe("Katalogen — protokollantall", () => {
  it("23 protokoller høstet (Golfslag 9 + Teknikk 7 + PEI 7 — Fysisk bevisst utelatt, se N3-DONE.md)", () => {
    assert.equal(TEST_PROTOKOLLER.length, 23);
    assert.equal(TEST_PROTOKOLLER.filter(p => p.group === "Golfslag").length, 9);
    assert.equal(TEST_PROTOKOLLER.filter(p => p.group === "Teknikk").length, 7);
    assert.equal(TEST_PROTOKOLLER.filter(p => p.group === "PEI").length, 7);
  });

  it("ukjent protokoll-id gir null", () => {
    assert.equal(hentProtokoll("finnes-ikke"), null);
  });
});
