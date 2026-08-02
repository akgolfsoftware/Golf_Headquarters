import assert from "node:assert/strict";
import test from "node:test";
import { erUsikker, klassifiser } from "@/lib/agenticos/ruter";

test("klassifiserer SG-spørsmål til tolk-tall/SG", () => {
  const k = klassifiser({ tekst: "Hva betyr strokes gained APP på -0,4?", rolle: "SPILLER" });
  assert.equal(k.intent, "tolk-tall");
  assert.equal(k.domene, "SG");
  assert.ok(!erUsikker(k));
});

test("TrackMan vinner over SG når begge nevnes — mest spesifikt domene først", () => {
  const k = klassifiser({ tekst: "TrackMan-økta mi viser lav smash factor", rolle: "SPILLER" });
  assert.equal(k.domene, "TRACKMAN");
});

test("planspørsmål havner på plan/PLAN", () => {
  const k = klassifiser({ tekst: "Bør jeg legge om ukeplanen før turneringen?", rolle: "COACH" });
  assert.equal(k.intent, "plan");
  assert.equal(k.domene, "PLAN");
});

test("ukjent spørsmål blir fritekst med lav confidence", () => {
  const k = klassifiser({ tekst: "Hva heter hovedstaden i Portugal?", rolle: "SPILLER" });
  assert.equal(k.intent, "fritekst");
  assert.ok(erUsikker(k), "usikker klassifisering skal falle tilbake til generell prompt");
});

test("tom tekst gir confidence 0", () => {
  const k = klassifiser({ tekst: "   ", rolle: "SPILLER" });
  assert.equal(k.confidence, 0);
  assert.ok(erUsikker(k));
});

test("matcher hele ord, ikke delstrenger", () => {
  // «designe» inneholder «sg», «planke» inneholder «plan». Ingen skal treffe.
  const k = klassifiser({ tekst: "Jeg skal designe en planke til garasjen", rolle: "ADMIN" });
  assert.equal(k.intent, "fritekst");
});

test("rolle og mindreårig-flagg føres videre uendret", () => {
  const k = klassifiser({ tekst: "hva bør jeg trene på?", rolle: "SPILLER", mindreaarig: true });
  assert.equal(k.rolle, "SPILLER");
  assert.equal(k.mindreaarig, true);
});

test("mindreårig defaulter til false — alder gjettes aldri fra teksten", () => {
  const k = klassifiser({ tekst: "jeg er 12 år, hva bør jeg trene?", rolle: "SPILLER" });
  assert.equal(k.mindreaarig, false);
});
