import assert from "node:assert/strict";
import test from "node:test";
import { beskrivKandidatFeil, sgKandidatFeil } from "@/lib/training/skills/morad-fault";

test("sgKandidatFeil returnerer kandidater for APP", () => {
  const kandidater = sgKandidatFeil("APP");
  assert.ok(Array.isArray(kandidater));
  assert.ok(kandidater.length > 0);
  for (const k of kandidater) assert.equal(typeof k, "string");
});

test("sgKandidatFeil returnerer tom liste for PUTT — MORAD dekker ikke putting", () => {
  assert.deepEqual(sgKandidatFeil("PUTT"), []);
});

test("beskrivKandidatFeil formulerer funnet som hypotese som må bekreftes", () => {
  const tekst = beskrivKandidatFeil("APP");
  assert.ok(tekst);
  assert.match(tekst, /må bekreftes med video, sikte og køllevalg/);
});

test("beskrivKandidatFeil returnerer null når fasiten ikke har kandidater", () => {
  assert.equal(beskrivKandidatFeil("PUTT"), null);
});
