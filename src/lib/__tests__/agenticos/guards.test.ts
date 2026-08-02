import assert from "node:assert/strict";
import test from "node:test";
import {
  kjorGuards,
  sjekkHypoteseSpraak,
  sjekkInvarianter,
  sjekkMotFasit,
} from "@/lib/agenticos/guards";

test("fanger språk som gjør en anbefaling om til en sperre", () => {
  const treff = sjekkInvarianter("Denne regelen kan ikke brytes.");
  assert.equal(treff.length, 1);
  assert.equal(treff[0].guard, "invariant-sperrer-aldri");
});

test("fanger at spilleren nektes trening", () => {
  const treff = sjekkInvarianter("Du kan ikke trene teknikk i denne perioden.");
  assert.ok(treff.length > 0);
});

test("slipper gjennom en normal anbefaling", () => {
  assert.deepEqual(
    sjekkInvarianter("Jeg anbefaler at du prioriterer nærspill de neste to ukene."),
    [],
  );
});

test("fanger SG-påstand formulert som diagnose", () => {
  const treff = sjekkHypoteseSpraak("SG APP er svak. Feilen er at du kaster køllehodet.");
  assert.equal(treff.length, 1);
  assert.equal(treff[0].guard, "sg-er-hypotese");
});

test("godtar SG-påstand med forbehold", () => {
  assert.deepEqual(
    sjekkHypoteseSpraak(
      "SG APP peker mot et par kandidater, men det må bekreftes med video før vi konkluderer.",
    ),
    [],
  );
});

test("ignorerer tekst som ikke handler om SG", () => {
  assert.deepEqual(sjekkHypoteseSpraak("Feilen er at bookingen ble dobbeltført."), []);
});

test("flagger navngitt øvelse mens drill-banken er tom", () => {
  const treff = sjekkMotFasit("Kjør øvelsen «hip_lead_drill» tre ganger i uka.");
  assert.ok(
    treff.some((t) => t.guard === "tom-drill-bank"),
    "skal flagge foreskrevet øvelse",
  );
});

test("flagger fault-id som ikke finnes i fasiten", () => {
  const treff = sjekkMotFasit("Dette ser ut som klassisk over_the_moon_move.");
  assert.ok(treff.some((t) => t.guard === "ukjent-fault-id" && t.detalj === "over_the_moon_move"));
});

test("godtar fault-id som finnes i fasiten", () => {
  const treff = sjekkMotFasit("Kandidaten er over_the_top.");
  assert.deepEqual(
    treff.filter((t) => t.guard === "ukjent-fault-id"),
    [],
  );
});

test("kjorGuards samler treff fra alle guards", () => {
  const treff = kjorGuards("SG er svak. Feilen er over_the_moon_move, og det kan ikke brytes.");
  const guards = new Set(treff.map((t) => t.guard));
  assert.ok(guards.has("invariant-sperrer-aldri"));
  assert.ok(guards.has("sg-er-hypotese"));
  assert.ok(guards.has("ukjent-fault-id"));
});

test("rent svar gir ingen treff", () => {
  assert.deepEqual(
    kjorGuards(
      "SG APP peker mot noen kandidater — det må bekreftes med video, sikte og køllevalg. Prioriter innspill de neste to ukene.",
    ),
    [],
  );
});
