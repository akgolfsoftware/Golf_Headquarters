import assert from "node:assert/strict";
import { test } from "node:test";
import { summerTreningsvolum, VOLUM_AKSER, type TreningsvolumOkt } from "./treningsvolum";

const vindu = {
  fraDato: new Date("2026-09-28T00:00:00Z"),
  tilDato: new Date("2026-10-05T00:00:00Z"),
  naa: new Date("2026-10-02T10:00:00Z"),
};
function okt(patch: Partial<TreningsvolumOkt> = {}): TreningsvolumOkt {
  return { id: "syntetisk-okt", date: new Date("2026-10-01T00:00:00Z"), startMinute: 540,
    pyramid: "TEK", durationMinutes: 60, actualMinutes: 45, status: "COMPLETED", ...patch };
}

test("60 planlagt og 45 registrert summeres separat, med øktantall", () => {
  const v = summerTreningsvolum([okt()], vindu);
  assert.equal(v.total.planlagtMinutter, 60);
  assert.equal(v.total.faktiskMinutter, 45);
  assert.equal(v.total.gjennomforteOkter, 1);
  assert.equal(v.total.faktiskRegistrerteOkter, 1);
  assert.equal(v.total.forventetRegistreringOkter, 1);
  assert.equal(v.total.legacyAnslagMinutter, null);
  assert.equal(v.akser.find(a => a.akse === "tek")?.faktiskMinutter, 45);
});

test("registrert 0 bevares; null og tomt grunnlag blir aldri 0 faktisk", () => {
  assert.equal(summerTreningsvolum([okt({ actualMinutes: 0 })], vindu).total.faktiskMinutter, 0);
  const ukjent = summerTreningsvolum([okt({ actualMinutes: null })], vindu);
  assert.equal(ukjent.total.faktiskMinutter, null);
  assert.equal(ukjent.total.ukjentOkter, 1);
  assert.equal(ukjent.total.gjennomforteOkter, 1);
  assert.equal(ukjent.total.legacyAnslagMinutter, null);
  assert.equal(summerTreningsvolum([], vindu).total.faktiskMinutter, null);
});

test("delvis dekning har bare registrert sum og eget antall ukjente økter", () => {
  const v = summerTreningsvolum([okt(), okt({ id: "ukjent", actualMinutes: null })], vindu);
  assert.equal(v.total.planlagtMinutter, 120);
  assert.equal(v.total.faktiskMinutter, 45);
  assert.equal(v.total.faktiskRegistrerteOkter, 1);
  assert.equal(v.total.ukjentOkter, 1);
  assert.equal(v.total.gjennomforteOkter, 2);
});

test("legacyanslag er en egen kildeverdi, aldri automatisk planlagt eller målt tid", () => {
  const v = summerTreningsvolum([
    okt({ id: "legacy", kilde: "legacy", actualMinutes: null, legacyAnslagMinutter: 50 }),
    okt({ id: "legacy-ukjent", kilde: "legacy", actualMinutes: null }),
    okt({ id: "registrert", legacyAnslagMinutter: 90 }),
  ], vindu);
  assert.equal(v.total.planlagtMinutter, 180);
  assert.equal(v.total.faktiskMinutter, 45);
  assert.equal(v.total.legacyAnslagMinutter, 50);
  assert.equal(v.total.legacyAnslagOkter, 1);
  assert.equal(v.total.ukjentOkter, 1);
  assert.equal(v.total.gjennomforteOkter, 3);
});

test("alle fem akser beholder sine egne plan-/faktisk-/ukjentverdier", () => {
  const v = summerTreningsvolum(VOLUM_AKSER.map((akse, i) => okt({
    id: akse, pyramid: akse.toUpperCase(), actualMinutes: i === 4 ? null : i * 15,
  })), vindu);
  assert.deepEqual(v.akser.map(a => a.akse), [...VOLUM_AKSER]);
  assert.deepEqual(v.akser.map(a => a.faktiskMinutter), [0, 15, 30, 45, null]);
  assert.deepEqual(v.akser.map(a => a.planlagtMinutter), [60, 60, 60, 60, 60]);
  assert.equal(v.total.faktiskMinutter, 90);
  assert.equal(v.total.ukjentOkter, 1);
});

test("planlagt og faktisk bruker identisk datovindu med eksklusive sluttgrenser", () => {
  const v = summerTreningsvolum([
    okt({ id: "for", date: new Date("2026-09-27T00:00:00Z") }),
    okt({ id: "fra", date: vindu.fraDato }),
    okt({ id: "etter", date: vindu.tilDato }),
    okt({ id: "ugyldig", date: new Date(NaN) }),
  ], vindu);
  assert.equal(v.total.planlagteOkter, 1);
  assert.equal(v.total.planlagtMinutter, 60);
  assert.equal(v.total.faktiskMinutter, 45);
  assert.deepEqual(v.vindu, {
    fraDato: vindu.fraDato.toISOString(), tilDato: vindu.tilDato.toISOString(), naa: vindu.naa.toISOString(),
  });
});

test("framtidige dager og senere klokkeslett i Oslo blir aldri faktisk, selv med COMPLETED", () => {
  const v = summerTreningsvolum([
    okt({ id: "i-morgen", date: new Date("2026-10-03T00:00:00Z") }),
    okt({ id: "senere-idag", date: new Date("2026-10-02T00:00:00Z"), startMinute: 13 * 60 }),
  ], vindu);
  assert.equal(v.total.planlagtMinutter, 120);
  assert.equal(v.total.framtidigPlanlagtMinutter, 120);
  assert.equal(v.total.framtidigeOkter, 2);
  assert.equal(v.total.faktiskMinutter, null);
  assert.equal(v.total.gjennomforteOkter, 0);
  assert.equal(v.total.ukjentOkter, 0);
});

test("annullert, ikke utført, utkast og pågående gir ikke faktisk tid", () => {
  const v = summerTreningsvolum(["CANCELLED", "SKIPPED", "ABANDONED", "DRAFT", "PUBLISHED", "IN_PROGRESS"]
    .map(status => okt({ id: status, status })), vindu);
  assert.equal(v.total.faktiskMinutter, null);
  assert.equal(v.total.gjennomforteOkter, 0);
  assert.equal(v.total.planlagteOkter, 4);
  assert.equal(v.total.forventetRegistreringOkter, 2);
  assert.equal(v.total.ukjentOkter, 2);
  assert.equal(v.total.ikkeUtforteOkter, 1);
  assert.equal(v.total.avbrutteOkter, 1);
});

test("historisk publisert, planlagt og pågående økt mangler registrering ved planlagt slutt", () => {
  const v = summerTreningsvolum(["PUBLISHED", "SCHEDULED", "IN_PROGRESS"]
    .map(status => okt({ id: status, status, actualMinutes: null })), vindu);
  assert.equal(v.total.forventetRegistreringOkter, 3);
  assert.equal(v.total.ukjentOkter, 3);
  assert.equal(v.total.faktiskRegistrerteOkter, 0);
  assert.equal(v.total.gjennomforteOkter, 0);
  assert.equal(v.total.faktiskMinutter, null);
});

test("start før nå og Oslo-slutt etter nå gir ingen manglende registrering", () => {
  for (const status of ["PUBLISHED", "SCHEDULED", "IN_PROGRESS"]) {
    const rader = [okt({ date: new Date("2026-10-02T00:00:00Z"), startMinute: 11 * 60 + 30, status, actualMinutes: null })];
    const aktiv = summerTreningsvolum(rader, vindu);
    assert.equal(aktiv.total.framtidigeOkter, 0);
    assert.equal(aktiv.total.forventetRegistreringOkter, 0);
    assert.equal(aktiv.total.ukjentOkter, 0);
    const slutt = summerTreningsvolum(rader, { ...vindu, naa: new Date("2026-10-02T10:30:00Z") });
    assert.equal(slutt.total.forventetRegistreringOkter, 1);
    assert.equal(slutt.total.ukjentOkter, 1);
  }
});

test("planlagt slutt over midnatt bruker Oslo-start og øktens varighet", () => {
  const rader = [okt({ startMinute: 23 * 60 + 30, status: "IN_PROGRESS", actualMinutes: null })];
  const aktiv = summerTreningsvolum(rader, { ...vindu, naa: new Date("2026-10-01T22:15:00Z") });
  assert.equal(aktiv.total.forventetRegistreringOkter, 0);
  assert.equal(aktiv.total.ukjentOkter, 0);
  const slutt = summerTreningsvolum(rader, { ...vindu, naa: new Date("2026-10-01T22:30:00Z") });
  assert.equal(slutt.total.forventetRegistreringOkter, 1);
  assert.equal(slutt.total.ukjentOkter, 1);
});

test("tidlig ferdigmelding med registrert null teller før planlagt slutt", () => {
  const v = summerTreningsvolum([okt({ date: new Date("2026-10-02T00:00:00Z"), startMinute: 11 * 60 + 30, actualMinutes: 0 })], vindu);
  assert.equal(v.total.forventetRegistreringOkter, 1);
  assert.equal(v.total.faktiskRegistrerteOkter, 1);
  assert.equal(v.total.faktiskMinutter, 0);
  assert.equal(v.total.gjennomforteOkter, 1);
});

test("to registrerte av tre forventede økter beholder publisert manglende som ukjent", () => {
  const v = summerTreningsvolum([
    okt(), okt({ id: "registrert-null", actualMinutes: 0 }),
    okt({ id: "mangler", status: "PUBLISHED", actualMinutes: null }),
    okt({ id: "framtid", date: new Date("2026-10-04T00:00:00Z"), status: "PUBLISHED", actualMinutes: null }),
    okt({ id: "aktiv", date: new Date("2026-10-02T00:00:00Z"), startMinute: 690, status: "IN_PROGRESS", actualMinutes: null }),
  ], vindu);
  assert.equal(v.total.planlagteOkter, 5);
  assert.equal(v.total.forventetRegistreringOkter, 3);
  assert.equal(v.total.faktiskRegistrerteOkter, 2);
  assert.equal(v.total.ukjentOkter, 1);
  assert.equal(v.total.faktiskMinutter, 45);
});

test("ikke-eksisterende Oslo-tid beholdes som plan uten å krasje eller gjette registrering", () => {
  const sommerVindu = { fraDato: new Date("2026-03-23T00:00:00Z"), tilDato: new Date("2026-03-30T00:00:00Z"), naa: new Date("2026-03-29T12:00:00Z") };
  for (const status of ["PUBLISHED", "COMPLETED"]) {
    const v = summerTreningsvolum([
      okt({ id: "sommertidshull", date: new Date("2026-03-29T00:00:00Z"), startMinute: 150, status }),
      okt({ id: "normal", date: new Date("2026-03-29T00:00:00Z"), startMinute: 240 }),
    ], sommerVindu);
    assert.equal(v.total.planlagteOkter, 2);
    assert.equal(v.total.planlagtMinutter, 120);
    assert.equal(v.total.ugyldigTidOkter, 1);
    assert.equal(v.total.forventetRegistreringOkter, 1);
    assert.equal(v.total.faktiskMinutter, 45);
    assert.equal(v.total.faktiskRegistrerteOkter, 1);
    assert.equal(v.total.gjennomforteOkter, 1);
    assert.equal(v.total.ukjentOkter, 0);
    assert.equal(v.akser.find(a => a.akse === "tek")?.ugyldigTidOkter, 1);
  }
});

test("25-timersdagen bruker første Oslo-forekomst og reelle varighetsminutter", () => {
  const hostVindu = { fraDato: new Date("2026-10-19T00:00:00Z"), tilDato: new Date("2026-10-26T00:00:00Z"), naa: new Date("2026-10-25T00:45:00Z") };
  const rader = [okt({ date: new Date("2026-10-25T00:00:00Z"), startMinute: 150, status: "IN_PROGRESS", actualMinutes: null })];
  const aktiv = summerTreningsvolum(rader, hostVindu);
  assert.equal(aktiv.total.ugyldigTidOkter, 0);
  assert.equal(aktiv.total.framtidigeOkter, 0);
  assert.equal(aktiv.total.forventetRegistreringOkter, 0);
  assert.equal(aktiv.total.ukjentOkter, 0);
  const slutt = summerTreningsvolum(rader, { ...hostVindu, naa: new Date("2026-10-25T01:30:00Z") });
  assert.equal(slutt.total.forventetRegistreringOkter, 1);
  assert.equal(slutt.total.ukjentOkter, 1);
});

test("maler, skjulte, ubesvarte og avviste forslag er utenfor grunnlaget", () => {
  const v = summerTreningsvolum([
    okt({ id: "mal", isTemplate: true }), okt({ id: "skjult", hiddenByPlayer: true }),
    okt({ id: "ubesvart", needsPlayerApproval: true }), okt({ id: "venter", approvalStatus: "PENDING" }),
    okt({ id: "avvist", approvalStatus: "REJECTED" }),
  ], vindu);
  assert.equal(v.total.planlagteOkter, 0);
  assert.equal(v.total.faktiskMinutter, null);
});

test("samme stabile ID teller én gang; nyere revisjon vinner", () => {
  const gammel = okt({ updatedAt: new Date("2026-10-01T08:00:00Z") });
  const ny = okt({ actualMinutes: 30, updatedAt: new Date("2026-10-01T09:00:00Z") });
  for (const rader of [[gammel, ny, ny], [ny, gammel]]) {
    const v = summerTreningsvolum(rader, vindu);
    assert.equal(v.total.planlagteOkter, 1);
    assert.equal(v.total.faktiskMinutter, 30);
  }
});

test("migrert Workbench-ID vinner over legacy, også når migreringskobling mangler på en kopi", () => {
  const legacy = okt({ id: "legacy", kilde: "legacy", actualMinutes: null, legacyAnslagMinutter: 60 });
  const migrert = okt({ id: "wb", migrertFraTrainingPlanSessionId: "legacy" });
  for (const rader of [[legacy, migrert], [migrert, legacy], [legacy, migrert, okt({ id: "wb" })]]) {
    const v = summerTreningsvolum(rader, vindu);
    assert.equal(v.total.planlagteOkter, 1);
    assert.equal(v.total.faktiskMinutter, 45);
    assert.equal(v.total.legacyAnslagOkter, 0);
  }
});

test("flyttet, annullert eller skjult migrert økt gjenoppliver aldri gammel legacyrad", () => {
  const legacy = okt({ id: "legacy", kilde: "legacy" });
  for (const patch of [{ date: vindu.tilDato }, { status: "CANCELLED" }, { hiddenByPlayer: true }]) {
    const v = summerTreningsvolum([legacy, okt({ id: "wb", migrertFraTrainingPlanSessionId: "legacy", ...patch })], vindu);
    assert.equal(v.total.planlagteOkter, 0);
    assert.equal(v.total.faktiskMinutter, null);
  }
});

test("samme navn/dato eller gruppeopphav er ingen duplikat-ID; ukjent akse beholdes i totalen", () => {
  const v = summerTreningsvolum([okt({ id: "en" }), okt({ id: "to", pyramid: "UKJENT" })], vindu);
  assert.equal(v.total.planlagteOkter, 2);
  assert.equal(v.total.faktiskMinutter, 90);
  assert.equal(v.utenAkse.faktiskMinutter, 45);
});

test("ugyldig registrert tid behandles som ukjent, ikke som 0 eller planlagt", () => {
  for (const actualMinutes of [-1, NaN, Infinity]) {
    const v = summerTreningsvolum([okt({ actualMinutes })], vindu);
    assert.equal(v.total.faktiskMinutter, null);
    assert.equal(v.total.ukjentOkter, 1);
  }
});
