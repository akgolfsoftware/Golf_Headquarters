import { test } from "node:test";
import assert from "node:assert/strict";
import { AK_PROFIL_SCOPE, AK_PROFIL_VERSJON, delerAkProfil, type AkProfilRad, type AkProfilKrav } from "./ak-profil-regler";
const krav: AkProfilKrav = { spillerId: "spiller", gruppeId: "gruppe", dateOfBirth: new Date("1984-01-01"),
  requiresGuardianConsent: false, foresattIder: ["foresatt"], naa: new Date("2026-10-23T12:00Z") };
const ja: AkProfilRad = { scope: AK_PROFIL_SCOPE, mottakerGruppeId: "gruppe", mottakerUserId: null,
  gitt: true, gittAvRolle: "SELV", gittAvUserId: "spiller", tekstVersjon: AK_PROFIL_VERSJON, createdAt: new Date("2026-10-23T10:00Z") };
const les = (rader: AkProfilRad[], k = krav) => delerAkProfil(rader, k);
test("bare uttrykkelig ja til eksakt formål, gruppe og giver åpner", () => {
  assert.equal(les([ja]), true);
  assert.equal(les([]), false);
  for (const feil of [{ scope: "AK_GOLF_GRUPPEANALYSE" }, { scope: "KOMPLETT_PROFIL" }, { scope: "NAVNGITT_KOMPLETT_PROFIL" },
    { mottakerGruppeId: "annen" }, { mottakerUserId: "trener" }, { gittAvUserId: "annen" }, { gittAvRolle: "ADMIN" }, { tekstVersjon: "gammel" }]) {
    assert.equal(les([{ ...ja, ...feil }]), false, JSON.stringify(feil));
  }
});
test("trekk, lik tid, ugyldig tid og nyere ukjent versjon kan ikke gjenopplive et gammelt ja", () => {
  for (const feil of [{ gitt: false }, { tekstVersjon: "ukjent" }, { gittAvRolle: "UKJENT" },
    { createdAt: new Date("2030-01-01") }, { createdAt: new Date(NaN) }]) {
    assert.equal(les([ja, { ...ja, createdAt: new Date("2026-10-23T11:00Z"), ...feil }]), false);
  }
  assert.equal(les([ja, ja]), false);
  assert.equal(les([{ ...ja, gitt: false }, { ...ja, createdAt: new Date("2026-10-23T11:00Z") }]), true);
});
test("barn og ukjent alder kan ikke gi selv; bare nåværende godkjent foresatt teller", () => {
  const forelderJa = { ...ja, gittAvRolle: "FORESATT", gittAvUserId: "foresatt" };
  for (const dateOfBirth of [new Date("2013-01-01"), null]) {
    const barn = { ...krav, dateOfBirth };
    assert.equal(les([ja], barn), false);
    assert.equal(les([forelderJa], barn), true);
    assert.equal(les([forelderJa], { ...barn, foresattIder: [] }), false);
    assert.equal(les([forelderJa, { ...ja, gitt: false, createdAt: new Date("2026-10-23T11:00Z") }], barn), false);
  }
});
test("16-årsgrensen: gammelt foreldre-ja kan bestå, men nye foreldrehandlinger endrer ikke valget", () => {
  const ungdom = { ...krav, dateOfBirth: new Date("2010-10-23") };
  assert.equal(les([{ ...ja, createdAt: new Date("2026-10-22") }], ungdom), false);
  const gammeltJa = { ...ja, gittAvRolle: "FORESATT", gittAvUserId: "foresatt", createdAt: new Date("2026-10-22") };
  assert.equal(les([gammeltJa], ungdom), true);
  assert.equal(les([{ ...gammeltJa, createdAt: new Date("2026-10-23T11:00Z") }], ungdom), false);
  assert.equal(les([gammeltJa, { ...gammeltJa, gitt: false, createdAt: new Date("2026-10-23T11:00Z") }], ungdom), true);
  assert.equal(les([gammeltJa, { ...ja, gitt: false }], ungdom), false);
});
