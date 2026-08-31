import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  OPPGAVE_FANER,
  OPPGAVE_STANDARDFANE,
  RUTINE_FREKVENSER,
  automatiseringLabel,
  erOppgaveFaneId,
  erRutineFrekvens,
  frekvensLabel,
  oppgaveHref,
  synligeOppgaveFaner,
  velgOppgaveFane,
} from "./faner";

const ADMIN = synligeOppgaveFaner(true);
const COACH = synligeOppgaveFaner(false);

test("tre faner, i rekkefølgen fra canvasen Anders godkjente", () => {
  assert.deepEqual(OPPGAVE_FANER.map((f) => f.id), ["prosjekter", "rutiner", "tildelt"]);
  assert.deepEqual(OPPGAVE_FANER.map((f) => f.label), ["Prosjekter", "Rutiner", "Tildelt meg"]);
});

test("hver fane peker på adressen den erstattet — Rutiner er ny og har ingen", () => {
  const m = Object.fromEntries(OPPGAVE_FANER.map((f) => [f.id, f.gammelHref]));
  assert.equal(m.prosjekter, "/admin/workspace/prosjekter");
  assert.equal(m.tildelt, "/admin/handlingssenter");
  assert.equal(m.rutiner, null);
});

test("ukjent, tom eller manglende ?fane= faller til standardfanen", () => {
  for (const f of [undefined, "", "tull", "queue", "../admin", "Prosjekter"]) {
    assert.equal(velgOppgaveFane(f, ADMIN), OPPGAVE_STANDARDFANE, String(f));
  }
});

test("gyldig ?fane= respekteres", () => {
  assert.equal(velgOppgaveFane("rutiner", ADMIN), "rutiner");
  assert.equal(velgOppgaveFane("tildelt", ADMIN), "tildelt");
});

test("Prosjekter krever ADMIN — /admin/workspace/prosjekter gatet på ADMIN alene", () => {
  assert.equal(OPPGAVE_FANER.find((f) => f.id === "prosjekter")?.kreverAdmin, true);
  assert.deepEqual(ADMIN.map((f) => f.id), ["prosjekter", "rutiner", "tildelt"]);
  assert.deepEqual(COACH.map((f) => f.id), ["rutiner", "tildelt"]);
});

test("?fane=prosjekter kan ALDRI åpnes av en coach", () => {
  assert.equal(velgOppgaveFane("prosjekter", COACH), "rutiner");
});

test("coach uten standardfanen lander på første synlige", () => {
  assert.equal(velgOppgaveFane(undefined, COACH), "rutiner");
});

test("erOppgaveFaneId avviser alt som ikke er en fane", () => {
  assert.equal(erOppgaveFaneId("rutiner"), true);
  for (const s of [undefined, "", "Rutiner", "oppgaver", "ko"]) {
    assert.equal(erOppgaveFaneId(s), false, String(s));
  }
});

test("standardfanen har ren adresse, resten har ?fane=", () => {
  assert.equal(oppgaveHref("prosjekter"), "/admin/oppgaver");
  assert.equal(oppgaveHref("rutiner"), "/admin/oppgaver?fane=rutiner");
  assert.equal(oppgaveHref("tildelt"), "/admin/oppgaver?fane=tildelt");
});

test("tre frekvenser, norsk merkelapp", () => {
  assert.deepEqual([...RUTINE_FREKVENSER], ["daglig", "ukentlig", "manedlig"]);
  assert.equal(frekvensLabel("daglig"), "Daglig");
  assert.equal(frekvensLabel("manedlig"), "Månedlig");
  // Ukjent frekvens vises som den er — aldri oversatt til noe den ikke er.
  assert.equal(frekvensLabel("kvartalsvis"), "kvartalsvis");
});

test("erRutineFrekvens slipper bare gjennom de tre", () => {
  for (const f of RUTINE_FREKVENSER) assert.equal(erRutineFrekvens(f), true, f);
  for (const f of ["", "Daglig", "årlig", "manedelig"]) {
    assert.equal(erRutineFrekvens(f), false, f);
  }
});

test("automatiserings-merket er ordrett fra beslutning 6.6", () => {
  assert.equal(automatiseringLabel(true), "Kan automatiseres");
  assert.equal(automatiseringLabel(false), "Må gjøres fysisk");
});

/**
 * Kildeskann: låser at siden faktisk bruker modulen og gater likt som de
 * fire sidene den erstatter (alle hadde requirePortalUser ADMIN/COACH).
 */
test("/admin/oppgaver gater ADMIN/COACH og bruker fanemodulen", () => {
  const src = readFileSync(join(process.cwd(), "src/app/admin/oppgaver/page.tsx"), "utf8");
  const uten = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
  assert.match(uten, /requirePortalUser\(\{\s*allow:\s*\["ADMIN",\s*"COACH"\]\s*\}\)/);
  assert.match(uten, /velgOppgaveFane\(/);
});
