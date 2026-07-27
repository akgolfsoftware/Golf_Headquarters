/**
 * Tester for samtykke-regler.ts — helsedata-samtykke (GDPR art. 9-2 a).
 * Kjøres med: npx tsx --test src/lib/__tests__/samtykke-regler.test.ts
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  HELSE_SAMTYKKE_VERSJON,
  HELSE_SAMTYKKE_TEKST,
  alderVed,
  maaHaForesattSamtykke,
  validerSamtykkeHandling,
  beregnSamtykkeStatus,
  erHelseSamtykkeType,
  type SamtykkeRad,
} from "../health/samtykke-regler";

const NAA = new Date("2026-07-27T12:00:00Z");

/* ── alderVed ──────────────────────────────────────────────────────── */

test("alderVed teller ikke bursdagen som passert før den er passert", () => {
  // Fyller 16 dagen etter referansetidspunktet → fortsatt 15.
  assert.equal(alderVed(new Date("2010-07-28"), NAA), 15);
  // Fyller 16 samme dag → 16.
  assert.equal(alderVed(new Date("2010-07-27"), NAA), 16);
  // Fylte 16 dagen før → 16.
  assert.equal(alderVed(new Date("2010-07-26"), NAA), 16);
});

/* ── maaHaForesattSamtykke ─────────────────────────────────────────── */

test("under 16 krever foresatt-samtykke", () => {
  assert.equal(
    maaHaForesattSamtykke(
      { requiresGuardianConsent: false, dateOfBirth: new Date("2012-01-01") },
      NAA,
    ),
    true,
  );
});

test("16 år eller eldre kan samtykke selv", () => {
  assert.equal(
    maaHaForesattSamtykke(
      { requiresGuardianConsent: false, dateOfBirth: new Date("2008-01-01") },
      NAA,
    ),
    false,
  );
});

test("flagget requiresGuardianConsent vinner selv om fødselsdato mangler", () => {
  assert.equal(
    maaHaForesattSamtykke({ requiresGuardianConsent: true, dateOfBirth: null }, NAA),
    true,
  );
});

test("flagget vinner også når fødselsdatoen sier voksen (strengeste signal gjelder)", () => {
  assert.equal(
    maaHaForesattSamtykke(
      { requiresGuardianConsent: true, dateOfBirth: new Date("1990-01-01") },
      NAA,
    ),
    true,
  );
});

test("ukjent fødselsdato uten flagg antas voksen", () => {
  assert.equal(
    maaHaForesattSamtykke({ requiresGuardianConsent: false, dateOfBirth: null }, NAA),
    false,
  );
});

/* ── validerSamtykkeHandling ───────────────────────────────────────── */

const mindreaarig = { requiresGuardianConsent: true, dateOfBirth: new Date("2012-01-01") };
const voksen = { requiresGuardianConsent: false, dateOfBirth: new Date("1995-01-01") };

test("mindreårig kan ikke gi samtykket selv", () => {
  const feil = validerSamtykkeHandling({
    bruker: mindreaarig,
    rolle: "SELV",
    gitt: true,
    naa: NAA,
  });
  assert.match(feil ?? "", /under 16/);
});

test("foresatt kan gi samtykket for en mindreårig", () => {
  assert.equal(
    validerSamtykkeHandling({ bruker: mindreaarig, rolle: "FORESATT", gitt: true, naa: NAA }),
    null,
  );
});

test("voksen kan gi samtykket selv", () => {
  assert.equal(
    validerSamtykkeHandling({ bruker: voksen, rolle: "SELV", gitt: true, naa: NAA }),
    null,
  );
});

test("tilbaketrekking er alltid tillatt — også for mindreårig selv (art. 7-3)", () => {
  assert.equal(
    validerSamtykkeHandling({ bruker: mindreaarig, rolle: "SELV", gitt: false, naa: NAA }),
    null,
  );
});

/* ── beregnSamtykkeStatus ──────────────────────────────────────────── */

function rad(
  type: string,
  gitt: boolean,
  dag: string,
  tekstVersjon = HELSE_SAMTYKKE_VERSJON,
): SamtykkeRad {
  return { type, gitt, tekstVersjon, createdAt: new Date(dag) };
}

test("ingen rader = ingen samtykke", () => {
  const s = beregnSamtykkeStatus([]);
  assert.equal(s.wearable, false);
  assert.equal(s.coachInnsyn, false);
  assert.equal(s.wearableGittAt, null);
  assert.equal(s.wearableVersjon, null);
});

test("nyeste rad vinner — tilbaketrekking slår tidligere ja", () => {
  const s = beregnSamtykkeStatus([
    rad("WEARABLE_HELSE", true, "2026-07-01"),
    rad("WEARABLE_HELSE", false, "2026-07-20"),
  ]);
  assert.equal(s.wearable, false);
});

test("nyeste rad vinner uavhengig av rekkefølgen de kommer i", () => {
  const s = beregnSamtykkeStatus([
    rad("WEARABLE_HELSE", false, "2026-07-20"),
    rad("WEARABLE_HELSE", true, "2026-07-25"),
    rad("WEARABLE_HELSE", true, "2026-07-01"),
  ]);
  assert.equal(s.wearable, true);
  assert.deepEqual(s.wearableGittAt, new Date("2026-07-25"));
});

test("coach-innsyn faller bort når wearable-samtykket trekkes", () => {
  const s = beregnSamtykkeStatus([
    rad("WEARABLE_HELSE", false, "2026-07-25"),
    rad("COACH_INNSYN", true, "2026-07-01"),
  ]);
  assert.equal(s.wearable, false);
  assert.equal(
    s.coachInnsyn,
    false,
    "coach skal ikke ha innsyn i data vi ikke lenger har lov til å hente",
  );
});

test("coach-innsyn krever sitt eget ja — wearable alene holder ikke", () => {
  const s = beregnSamtykkeStatus([rad("WEARABLE_HELSE", true, "2026-07-01")]);
  assert.equal(s.wearable, true);
  assert.equal(s.coachInnsyn, false);
});

test("begge samtykker gitt gir fullt innsyn", () => {
  const s = beregnSamtykkeStatus([
    rad("WEARABLE_HELSE", true, "2026-07-01"),
    rad("COACH_INNSYN", true, "2026-07-02"),
  ]);
  assert.equal(s.wearable, true);
  assert.equal(s.coachInnsyn, true);
});

test("versjonen samtykket ble gitt til følger med ut", () => {
  const s = beregnSamtykkeStatus([rad("WEARABLE_HELSE", true, "2026-07-01", "2026-01-01")]);
  assert.equal(s.wearableVersjon, "2026-01-01");
});

/* ── typer og tekst ────────────────────────────────────────────────── */

test("erHelseSamtykkeType avviser ukjente verdier", () => {
  assert.equal(erHelseSamtykkeType("WEARABLE_HELSE"), true);
  assert.equal(erHelseSamtykkeType("COACH_INNSYN"), true);
  assert.equal(erHelseSamtykkeType("ALT"), false);
});

test("samtykketekst finnes for begge typer og nevner hva som hentes", () => {
  assert.ok(HELSE_SAMTYKKE_TEKST.WEARABLE_HELSE.punkter.length > 0);
  assert.ok(HELSE_SAMTYKKE_TEKST.COACH_INNSYN.punkter.length > 0);
  assert.match(HELSE_SAMTYKKE_TEKST.WEARABLE_HELSE.punkter.join(" "), /søvn/i);
});
