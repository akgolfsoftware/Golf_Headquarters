import { test } from "node:test";
import assert from "node:assert/strict";

import {
  PYRAMIDE_NIVAAER,
  PYRAMIDE_DETALJER,
  FYS_PILARER,
  FYS_PILAR_INFO,
  GOLFKOLLE_KODER,
  GOLFKOLLE_LABEL,
  SLAGKURVE_KODER,
  SLAGHOYDE_KODER,
  SLAGHOYDE_INFO,
  ALLE_POSISJONER,
  finnPosisjonsInfo,
  formaterSlagBeskrivelse,
  type SlagSpesifikasjon,
  type TekniskPosisjonsOppgave,
} from "@/lib/domain/ak-kategorisystem";

test("Pyramiden har 5 kanoniske nivåer med farger og beskrivelser", () => {
  assert.equal(PYRAMIDE_NIVAAER.length, 5);
  assert.deepEqual(PYRAMIDE_NIVAAER, ["FYS", "TEK", "SLAG", "SPILL", "TURN"]);

  for (const nivaa of PYRAMIDE_NIVAAER) {
    const detalj = PYRAMIDE_DETALJER[nivaa];
    assert.ok(detalj.tittel.length > 0);
    assert.ok(detalj.beskrivelse.length > 0);
    assert.ok(detalj.farge.startsWith("#"));
  }
});

test("Fysisk har 4 pilarer inkludert Power & Speed", () => {
  assert.equal(FYS_PILARER.length, 4);
  assert.deepEqual(FYS_PILARER, [
    "STYRKE",
    "KONDISJON",
    "BEVEGELIGHET",
    "POWER_SPEED",
  ]);

  assert.equal(FYS_PILAR_INFO.POWER_SPEED.label, "Power & Speed");
  assert.ok(FYS_PILAR_INFO.POWER_SPEED.parametere.includes("Køllehastighet (mph)"));
});

test("Katalog over golfkøller dekker hele bagen fra Driver til Putter", () => {
  assert.equal(GOLFKOLLE_KODER.length, 20);
  assert.ok(GOLFKOLLE_KODER.includes("DRIVER"));
  assert.ok(GOLFKOLLE_KODER.includes("JERN_7"));
  assert.ok(GOLFKOLLE_KODER.includes("PW"));
  assert.ok(GOLFKOLLE_KODER.includes("PUTTER"));
  assert.equal(GOLFKOLLE_LABEL.JERN_7, "7-jern");
});

test("5 slagkurver er definert", () => {
  assert.equal(SLAGKURVE_KODER.length, 5);
  assert.deepEqual(SLAGKURVE_KODER, ["RETT", "DRAW", "FADE", "HOOK", "SLICE"]);
});

test("De 9 slaghøydene dekker 3x3 ballbane-gridet", () => {
  assert.equal(SLAGHOYDE_KODER.length, 9);
  assert.deepEqual(SLAGHOYDE_KODER, [
    "LOW_LOW",
    "LOW_MEDIUM",
    "LOW_HIGH",
    "MEDIUM_LOW",
    "MEDIUM_MEDIUM",
    "MEDIUM_HIGH",
    "HIGH_LOW",
    "HIGH_MEDIUM",
    "HIGH_HIGH",
  ]);

  assert.equal(SLAGHOYDE_INFO.LOW_LOW.hovedNivaa, "LAV");
  assert.equal(SLAGHOYDE_INFO.MEDIUM_MEDIUM.hovedNivaa, "MEDIUM");
  assert.equal(SLAGHOYDE_INFO.HIGH_HIGH.hovedNivaa, "HOY");
});

test("Svingposisjoner dekker P1.0 til P10.0 med 10 underposisjoner per P1–P9 (totalt 91 posisjoner)", () => {
  // P1 til P9 har 10 hver (90), pluss P10.0 (1) = 91 posisjoner
  assert.equal(ALLE_POSISJONER.length, 91);

  // Sjekk P1.0 til P1.9
  const p1 = ALLE_POSISJONER.filter((p) => p.hovedP === 1);
  assert.equal(p1.length, 10);
  assert.equal(p1[0].kode, "P1.0");
  assert.equal(p1[9].kode, "P1.9");

  // Sjekk P3.4 underarmrotasjon
  const p34 = finnPosisjonsInfo("P3.4");
  assert.ok(p34);
  assert.equal(p34?.kode, "P3.4");
  assert.equal(p34?.hovedP, 3);
  assert.ok(p34?.fokus.length > 0);

  // Sjekk P7.0 treffpunkt
  const p70 = finnPosisjonsInfo("P7.0");
  assert.ok(p70);
  assert.equal(p70?.hovedP, 7);

  // Sjekk P10.0 finish
  const p100 = finnPosisjonsInfo("P10.0");
  assert.ok(p100);
  assert.equal(p100?.hovedP, 10);
});

test("Eksempel fra Anders: 7-jern, medium høyde, 5m draw koblet til P3.4", () => {
  const slag: SlagSpesifikasjon = {
    omraade: "INNSPILL_150_200",
    kolle: "JERN_7",
    kurve: "DRAW",
    kurveMeter: 5,
    hoyde: "MEDIUM_MEDIUM",
    tekniskPlanReferanse: {
      posisjonKode: "P3.4",
      oppgaveTittel: "Brystrotasjon og stabil underarm",
    },
  };

  const tekst = formaterSlagBeskrivelse(slag);
  assert.equal(tekst, "7-jern · Medium-Medium (Standard) · 5 m draw");
});

test("Teknisk oppgave støtter før/etter-slider, referansebilde og repetisjoner i læringstrappen", () => {
  const oppgave: TekniskPosisjonsOppgave = {
    id: "oppgave-p34-1",
    posisjonKode: "P3.4",
    overskrift: "Bevaring av underarmrotasjon i baksving",
    beskrivelse: "Unngå tidlig åpning av bladet ved P3.4 for å sikre square face ved impact.",
    forEtter: {
      forBildeUrl: "https://storage.local/p34-for.jpg",
      etterBildeUrl: "https://storage.local/p34-etter.jpg",
      beskrivelse: "Før: åpent blad (+12 grader). Etter: nøytral (0 grader).",
    },
    referanseBildeUrl: "https://storage.local/pro-referanse-p34.jpg",
    repsMaal: {
      speilLavFartReps: 1000,
      speilAutoReps: 1000,
      nettLavFartReps: 1000,
      nettAutoReps: 1000,
      rangeFullFartReps: 500,
      baneSpillReps: 200,
    },
    repsLogget: {
      speilLavFart: 850,
      speilAuto: 400,
      nettLavFart: 200,
      nettAuto: 0,
      rangeFullFart: 0,
      baneSpill: 0,
    },
  };

  assert.equal(oppgave.repsMaal.speilLavFartReps, 1000);
  assert.equal(oppgave.forEtter?.forBildeUrl, "https://storage.local/p34-for.jpg");
  assert.ok(oppgave.repsLogget.speilLavFart <= oppgave.repsMaal.speilLavFartReps);
});
