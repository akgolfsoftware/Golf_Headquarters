import { test } from "node:test";
import assert from "node:assert/strict";
import {
  hentMasterbrainKunnskap,
  oppgavetypeForAksjon,
  formatMasterbrainBlokk,
  type Oppgavetype,
} from "./hent-kunnskap";

const ALLE: Oppgavetype[] = [
  "plan-generering",
  "sg-diagnose",
  "drill-forslag",
  "periodisering",
  "terminologi",
];

test("alle oppgavetyper gir minst én kunnskapsblokk og minst én kilde", () => {
  for (const t of ALLE) {
    const k = hentMasterbrainKunnskap(t);
    assert.ok(k.blokker.length > 0, `${t} ga ingen blokker`);
    assert.ok(k.kilder.length > 0, `${t} ga ingen kilder`);
    assert.equal(k.oppgavetype, t);
  }
});

test("versjonsnokkel navngir hver kilde med versjon", () => {
  const k = hentMasterbrainKunnskap("periodisering");
  assert.match(k.versjonsnokkel, /canon-methodology@/);
  assert.match(k.versjonsnokkel, /mikroperiodisering-og-tidsdimensjon@/);
  // Ingen kilde skal rapportere ukjent versjon — da er sync gått galt.
  assert.ok(
    k.kilder.every((kilde) => kilde.versjon !== "ukjent"),
    "en kilde mangler versjonsfelt",
  );
});

test("tom drill-bank gir eksplisitt forbud, ikke stillhet", () => {
  const k = hentMasterbrainKunnskap("drill-forslag");
  const tekst = k.blokker.join("\n");
  assert.match(tekst, /Drill-banken er TOM/);
  assert.match(tekst, /aldri/i);
});

test("sg-diagnose bærer med seg hypotese-regelen", () => {
  const k = hentMasterbrainKunnskap("sg-diagnose");
  const tekst = k.blokker.join("\n");
  assert.match(tekst, /HYPOTESE/i);
  // Bekreftelseskravene fra faults.diagnose_regel må være med, ellers kan en
  // agent presentere et SG-tall som en ferdig diagnose.
  assert.match(tekst, /video/i);
});

test("periodisering inkluderer oversettelsestabellen for periodenavn", () => {
  const k = hentMasterbrainKunnskap("periodisering");
  const tekst = k.blokker.join("\n");
  assert.match(tekst, /SPESIALISERING/);
  assert.match(tekst, /Skriv aldri CANON-strengen rått/);
});

test("plan-generering inkluderer invariantene", () => {
  const k = hentMasterbrainKunnskap("plan-generering");
  const tekst = k.blokker.join("\n");
  assert.match(tekst, /inv_5/);
  assert.match(tekst, /inv_3/);
});

test("oppgavetypeForAksjon mapper kjente actionTypes", () => {
  assert.equal(oppgavetypeForAksjon("WEEKLY_PROPOSAL"), "plan-generering");
  assert.equal(oppgavetypeForAksjon("PYRAMID_ADJUST"), "plan-generering");
  assert.equal(oppgavetypeForAksjon("DRILL_SWAP"), "drill-forslag");
  assert.equal(oppgavetypeForAksjon("PERIOD_SWITCH"), "periodisering");
  assert.equal(oppgavetypeForAksjon("FOCUS_CHANGE"), "sg-diagnose");
});

test("ukjent actionType faller trygt til plan-generering", () => {
  assert.equal(oppgavetypeForAksjon("NOE_HELT_NYTT"), "plan-generering");
  assert.equal(oppgavetypeForAksjon(""), "plan-generering");
});

test("formatMasterbrainBlokk pakker inn og gir forrang", () => {
  const blokk = formatMasterbrainBlokk(hentMasterbrainKunnskap("terminologi"));
  assert.match(blokk, /<masterbrain-fasit>/);
  assert.match(blokk, /<\/masterbrain-fasit>/);
  assert.match(blokk, /denne gjelder/);
});

test("formatMasterbrainBlokk gir tom streng når ingenting er relevant", () => {
  const blokk = formatMasterbrainBlokk({
    oppgavetype: "terminologi",
    blokker: [],
    kilder: [],
    versjonsnokkel: "",
    utelatt: [],
  });
  assert.equal(blokk, "");
});

test("uten budsjett utelates ingenting", () => {
  for (const t of ALLE) {
    assert.equal(hentMasterbrainKunnskap(t).utelatt.length, 0, `${t}`);
  }
});

test("stramt budsjett dropper hele blokker fra slutten, ikke midt i", () => {
  const full = hentMasterbrainKunnskap("sg-diagnose");
  const kuttet = hentMasterbrainKunnskap("sg-diagnose", { maksTegn: 5000 });

  assert.ok(kuttet.kilder.length < full.kilder.length, "ingenting ble kuttet");
  assert.ok(kuttet.utelatt.length > 0, "utelatt ble ikke rapportert");
  assert.equal(
    kuttet.kilder.length + kuttet.utelatt.length,
    full.kilder.length,
    "en fil forsvant sporløst",
  );
  // Blokkene som ER med må være uavkortet — sammenlign mot full versjon.
  for (let i = 0; i < kuttet.blokker.length; i++) {
    assert.equal(kuttet.blokker[i], full.blokker[i], "blokk ble avkortet");
  }
});

test("den viktigste blokken beholdes selv om den alene sprenger budsjettet", () => {
  const k = hentMasterbrainKunnskap("sg-diagnose", { maksTegn: 10 });
  assert.equal(k.blokker.length, 1, "kritisk blokk ble kastet");
  assert.equal(k.kilder[0].fil, "knowledge/concepts/sg-principles.json");
});

test("utelatte filer navngis i prompt-blokken", () => {
  const blokk = formatMasterbrainBlokk(
    hentMasterbrainKunnskap("sg-diagnose", { maksTegn: 5000 }),
  );
  assert.match(blokk, /fikk ikke plass/);
  assert.match(blokk, /positions\.json/);
  assert.match(blokk, /si det i stedet for å gjette/);
});
