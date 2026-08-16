/**
 * G2 · Valgt coach — fallback-kjeden er en KONTRAKT (varsling G4 og
 * V2-økt-speiling bygger på den). Testene låser rekkefølge, determinisme og
 * tvetydighets-regelen for backfill — endres noe av dette, skal en test
 * tvinge en bevisst beslutning.
 *
 * Kjernen er ren (valgt-coach-kjerne.ts), så alt testes uten prisma-mocks.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  velgValgtCoach,
  velgValgtCoachEllerFallback,
  velgEnrollmentCoach,
  velgGruppeCoach,
  vurderBackfillKandidat,
  type ValgtCoachKandidater,
} from "@/lib/domain/valgt-coach-kjerne";

const TOM: ValgtCoachKandidater = {
  primaer: null,
  enrollments: [],
  grupper: [],
  planCoachId: null,
};

const d = (iso: string) => new Date(iso);

test("primaryCoachId vinner over alle andre nivåer", () => {
  const valg = velgValgtCoach({
    primaer: { coachId: "coach-primaer", gyldig: true },
    enrollments: [{ coachId: "coach-enrollment", enrolledAt: d("2026-08-01") }],
    grupper: [{ coachId: "coach-gruppe", managedByAkGolf: true, joinedAt: d("2026-01-01") }],
    planCoachId: "coach-plan",
  });
  assert.deepEqual(valg, { coachId: "coach-primaer", kilde: "PRIMAER" });
});

test("ugyldig (død/slettet/feil rolle) primærcoach hoppes over — kjeden fortsetter", () => {
  const valg = velgValgtCoach({
    ...TOM,
    primaer: { coachId: "coach-slettet", gyldig: false },
    enrollments: [{ coachId: "coach-enrollment", enrolledAt: d("2026-08-01") }],
  });
  assert.deepEqual(valg, { coachId: "coach-enrollment", kilde: "ENROLLMENT" });
});

test("nyeste aktive enrollment vinner — uavhengig av input-rekkefølge", () => {
  const a = { coachId: "coach-gammel", enrolledAt: d("2026-01-01") };
  const b = { coachId: "coach-ny", enrolledAt: d("2026-08-01") };
  assert.equal(velgEnrollmentCoach([a, b]), "coach-ny");
  assert.equal(velgEnrollmentCoach([b, a]), "coach-ny", "determinisme: samme svar begge veier");
});

test("enrollment slår gruppe", () => {
  const valg = velgValgtCoach({
    ...TOM,
    enrollments: [{ coachId: "coach-enrollment", enrolledAt: d("2026-03-01") }],
    grupper: [{ coachId: "coach-gruppe", managedByAkGolf: true, joinedAt: d("2026-01-01") }],
  });
  assert.deepEqual(valg, { coachId: "coach-enrollment", kilde: "ENROLLMENT" });
});

test("AK-administrert gruppe slår andre grupper — selv med senere joinedAt", () => {
  const adhoc = { coachId: "coach-adhoc", managedByAkGolf: false, joinedAt: d("2026-01-01") };
  const ak = { coachId: "coach-ak", managedByAkGolf: true, joinedAt: d("2026-06-01") };
  assert.equal(velgGruppeCoach([adhoc, ak]), "coach-ak");
  assert.equal(velgGruppeCoach([ak, adhoc]), "coach-ak", "determinisme: samme svar begge veier");
});

test("blant like grupper vinner eldste medlemskap", () => {
  const nyere = { coachId: "coach-nyere", managedByAkGolf: true, joinedAt: d("2026-06-01") };
  const eldst = { coachId: "coach-eldst", managedByAkGolf: true, joinedAt: d("2026-01-01") };
  assert.equal(velgGruppeCoach([nyere, eldst]), "coach-eldst");
});

test("gruppe slår plan; plan brukes som siste ledd", () => {
  const medGruppe = velgValgtCoach({
    ...TOM,
    grupper: [{ coachId: "coach-gruppe", managedByAkGolf: false, joinedAt: d("2026-01-01") }],
    planCoachId: "coach-plan",
  });
  assert.deepEqual(medGruppe, { coachId: "coach-gruppe", kilde: "GRUPPE" });

  const kunPlan = velgValgtCoach({ ...TOM, planCoachId: "coach-plan" });
  assert.deepEqual(kunPlan, { coachId: "coach-plan", kilde: "PLAN" });
});

test("null når ingenting finnes — ALDRI «første coach alfabetisk»", () => {
  assert.deepEqual(velgValgtCoach(TOM), { coachId: null, kilde: "INGEN" });
});

test("EllerFallback: faller til eldste ADMIN, og aller sist til siste utvei", () => {
  assert.equal(velgValgtCoachEllerFallback(TOM, "admin-eldst", "spiller-1"), "admin-eldst");
  assert.equal(velgValgtCoachEllerFallback(TOM, null, "spiller-1"), "spiller-1");
  // Finnes en valgt coach, brukes ADMIN-fallbacken aldri.
  const medCoach: ValgtCoachKandidater = {
    ...TOM,
    enrollments: [{ coachId: "coach-1", enrolledAt: d("2026-08-01") }],
  };
  assert.equal(velgValgtCoachEllerFallback(medCoach, "admin-eldst", "spiller-1"), "coach-1");
});

test("backfill: entydig kandidat på første nivå med treff skrives", () => {
  const vurdering = vurderBackfillKandidat({
    enrollments: [
      { coachId: "coach-1", enrolledAt: d("2026-01-01") },
      { coachId: "coach-1", enrolledAt: d("2026-08-01") },
    ],
    grupper: [{ coachId: "coach-2", managedByAkGolf: true, joinedAt: d("2026-01-01") }],
    planCoachId: "coach-3",
  });
  assert.deepEqual(vurdering, { status: "ENTYDIG", coachId: "coach-1", kilde: "ENROLLMENT" });
});

test("backfill: to aktive enrollments med ULIKE coacher er tvetydig — skrives ikke", () => {
  const vurdering = vurderBackfillKandidat({
    enrollments: [
      { coachId: "coach-b", enrolledAt: d("2026-08-01") },
      { coachId: "coach-a", enrolledAt: d("2026-01-01") },
    ],
    grupper: [],
    planCoachId: null,
  });
  assert.deepEqual(vurdering, {
    status: "TVETYDIG",
    kilde: "ENROLLMENT",
    kandidater: ["coach-a", "coach-b"],
  });
});

test("backfill: gruppe-nivået vurderes når enrollments er tomme; ingen kandidat gir INGEN", () => {
  const gruppe = vurderBackfillKandidat({
    enrollments: [],
    grupper: [
      { coachId: "coach-g", managedByAkGolf: true, joinedAt: d("2026-01-01") },
      { coachId: "coach-g", managedByAkGolf: false, joinedAt: d("2026-02-01") },
    ],
    planCoachId: null,
  });
  assert.deepEqual(gruppe, { status: "ENTYDIG", coachId: "coach-g", kilde: "GRUPPE" });

  assert.deepEqual(vurderBackfillKandidat({ enrollments: [], grupper: [], planCoachId: null }), {
    status: "INGEN",
  });
});
