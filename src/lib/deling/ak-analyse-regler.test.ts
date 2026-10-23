import { test } from "node:test";
import assert from "node:assert/strict";
import { AK_ANALYSE_SCOPE, AK_ANALYSE_VERSJON, delerAkAnalyse, forelderKanEndreAkAnalyse, type AkAnalyseRad } from "./ak-analyse-regler";

const naa = new Date("2026-10-23T12:00:00Z");
const voksen = new Date("1984-01-01");
const barn = new Date("2014-01-01");
const rad = (endring: Partial<AkAnalyseRad> = {}): AkAnalyseRad => ({
  scope: AK_ANALYSE_SCOPE, mottakerGruppeId: "gruppe-a", mottakerUserId: null,
  gitt: true, gittAvRolle: "SELV", tekstVersjon: AK_ANALYSE_VERSJON,
  createdAt: new Date("2026-10-22T12:00:00Z"), ...endring,
});
const deler = (rader: AkAnalyseRad[]) => delerAkAnalyse(rader, "gruppe-a", false, voksen, naa);

test("ingen tillatelse uten aktivt ja til riktig formål, versjon og mottaker", () => {
  assert.equal(deler([]), false);
  assert.equal(deler([rad()]), true);
  for (const feil of [
    { scope: "KOMPLETT_PROFIL" }, { scope: "TRENINGSPLAN" }, { mottakerGruppeId: "gruppe-b" },
    { tekstVersjon: "gammel" }, { mottakerUserId: "navngitt-trener" }, { gittAvRolle: "ADMIN" },
    { createdAt: new Date("2026-10-24") }, { createdAt: new Date("ugyldig") },
  ]) assert.equal(deler([rad(feil)]), false, JSON.stringify(feil));
});
test("nytt eller samtidig nei vinner, også fra eldre tekst; senere nytt ja kan gjenåpne", () => {
  assert.equal(deler([rad(), rad({ gitt: false })]), false);
  const nei = rad({ gitt: false, tekstVersjon: "gammel", createdAt: new Date("2026-10-23T10:00:00Z") });
  assert.equal(deler([nei, rad()]), false);
  assert.equal(deler([nei, rad({ createdAt: new Date("2026-10-23T11:00:00Z") })]), true);
});
test("barn og ukjent fødselsdato krever foresatt; barnet kan alltid trekke selv", () => {
  for (const dob of [barn, null]) {
    assert.equal(delerAkAnalyse([rad()], "gruppe-a", true, dob, naa), false);
    const ja = rad({ gittAvRolle: "FORESATT" });
    assert.equal(delerAkAnalyse([ja], "gruppe-a", true, dob, naa), true);
    assert.equal(delerAkAnalyse([ja, rad({ gitt: false })], "gruppe-a", true, dob, naa), false);
  }
});
test("forelderens nei etter 16 overstyrer ikke spillerens eget valg", () => {
  assert.equal(deler([rad(), rad({ gitt: false, gittAvRolle: "FORESATT" })]), true);
});

test("foresattmyndighet avsluttes på 16-årsdagen, også ved gammelt flagg", () => {
  const dob = new Date("2010-10-23");
  assert.equal(forelderKanEndreAkAnalyse(true, dob, new Date("2026-10-22T23:59:59Z")), true);
  assert.equal(forelderKanEndreAkAnalyse(true, dob, new Date("2026-10-23T00:00:00Z")), false);
  assert.equal(forelderKanEndreAkAnalyse(true, null, naa), true);
  assert.equal(forelderKanEndreAkAnalyse(false, barn, naa), false);
});
