import assert from "node:assert/strict";
import { test } from "node:test";
import { trenerEpostDomene, gjeldendeNavngittSamtykke, NAVNGITT_PROFIL_SCOPE, NAVNGITT_PROFIL_TEKST_VERSJON, NyTrenerInvitasjonSchema, type NavngittSamtykkeRad } from "./navngitt-regler";
const krav = { gruppeId: "g", trenerId: "t", spillerId: "s", kreverForesatt: false, foresattIder: ["f"] };
const rad = (over: Partial<NavngittSamtykkeRad> = {}): NavngittSamtykkeRad => ({
  id: "r", scope: NAVNGITT_PROFIL_SCOPE, mottakerGruppeId: "g", mottakerUserId: "t", gitt: true,
  gittAvRolle: "SELV", gittAvUserId: "s", tekstVersjon: NAVNGITT_PROFIL_TEKST_VERSJON, createdAt: new Date("2026-10-02T02:00:00Z"), ...over,
});
test("bare de to nøyaktige trenerdomenene godtas", () => {
  assert.equal(trenerEpostDomene(" coach@WANG.NO "), "WANG");
  assert.equal(trenerEpostDomene("coach@golfforbundet.no"), "TEAM_NORWAY");
  for (const e of ["c@wang.no.example.test", "c@sub.wang.no", "c@wang-no.test", "wang.no", "c@@wang.no", "c@example.test"]) assert.equal(trenerEpostDomene(e), null);
});
test("gammelt gruppesamtykke og feil mottaker eller tekstversjon gir aldri nytt innsyn", () => {
  assert.ok(gjeldendeNavngittSamtykke([rad()], krav));
  for (const over of [{ scope: "KOMPLETT_PROFIL" }, { mottakerUserId: null }, { mottakerUserId: "annen" }, { mottakerGruppeId: "annen" }, { tekstVersjon: "2026-08-16" }, { gittAvUserId: "annen" }]) {
    assert.equal(gjeldendeNavngittSamtykke([rad(over)], krav), null);
  }
});
test("barn trenger godkjent foresatt; barnets egen tilbaketrekking stopper innsyn", () => {
  const barn = { ...krav, kreverForesatt: true };
  assert.equal(gjeldendeNavngittSamtykke([rad()], barn), null);
  const forelder = rad({ gittAvRolle: "FORESATT", gittAvUserId: "f" });
  assert.ok(gjeldendeNavngittSamtykke([forelder], barn));
  assert.equal(gjeldendeNavngittSamtykke([forelder], { ...barn, foresattIder: [] }), null);
  assert.equal(gjeldendeNavngittSamtykke([forelder, rad({ gitt: false, createdAt: new Date("2026-10-02T02:01:00Z") })], barn), null);
});
test("samtidig gi/trekk stenger uavhengig av rekkefølge", () => {
  for (const rows of [[rad(), rad({ gitt: false })], [rad({ gitt: false }), rad()]]) assert.equal(gjeldendeNavngittSamtykke(rows, krav), null);
});
test("eksplisitt ny samtykketekst og bekreftelse kreves; ekstra rettighetsfelt avvises", () => {
  const p = { requestId: "47f7b8b0-716e-4e55-b3b2-e4fddf8a6622", spillerId: "s", gruppeId: "g", epost: "c@wang.no", tekstVersjon: NAVNGITT_PROFIL_TEKST_VERSJON, godkjent: true };
  assert.ok(NyTrenerInvitasjonSchema.safeParse(p).success);
  for (const over of [{ godkjent: false }, { tekstVersjon: "2026-08-16" }, { gittAvRolle: "FORESATT" }, { mottakerUserId: "annen" }]) assert.equal(NyTrenerInvitasjonSchema.safeParse({ ...p, ...over }).success, false);
});
