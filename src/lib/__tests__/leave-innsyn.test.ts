/**
 * Tester for leave-innsyn.ts — hvor mye av en permisjon/skade coachen ser.
 * Kjøres med: npx tsx --test src/lib/__tests__/leave-innsyn.test.ts
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  erHelseLeave,
  innsynsNivaaFra,
  maskerLeave,
  maskerLeaves,
  type RaaLeave,
} from "../health/leave-innsyn";

const START = new Date("2026-06-01");

function leave(over: Partial<RaaLeave> = {}): RaaLeave {
  return {
    reason: "SKADE",
    startAt: START,
    endAt: null,
    isInjury: true,
    returnedAt: null,
    description: "Vondt i venstre håndledd etter bunkerslag",
    ...over,
  };
}

/* ── erHelseLeave ──────────────────────────────────────────────────── */

test("skade og sykdom er helseopplysninger", () => {
  assert.equal(erHelseLeave({ reason: "SKADE", isInjury: false }), true);
  assert.equal(erHelseLeave({ reason: "SYKDOM", isInjury: false }), true);
});

test("reise, jobb og studier er ikke helseopplysninger", () => {
  for (const reason of ["REISE", "JOBB", "STUDIER"]) {
    assert.equal(erHelseLeave({ reason, isInjury: false }), false, reason);
  }
});

test("isInjury-flagget gjør den til helse selv med nøytral grunn", () => {
  assert.equal(erHelseLeave({ reason: "ANNET", isInjury: true }), true);
});

/* ── maskerLeave ───────────────────────────────────────────────────── */

test("ikke-helse-fravær vises uendret på alle nivåer", () => {
  const reise = leave({ reason: "REISE", isInjury: false, description: "Ferie i Spania" });
  for (const nivaa of ["INGEN", "STATUS", "DETALJ"] as const) {
    const sett = maskerLeave(reise, nivaa);
    assert.equal(sett.reason, "REISE", nivaa);
    assert.equal(sett.description, "Ferie i Spania", nivaa);
    assert.equal(sett.skjult, false, nivaa);
  }
});

test("DETALJ gir grunn og beskrivelse som den er", () => {
  const sett = maskerLeave(leave(), "DETALJ");
  assert.equal(sett.reason, "SKADE");
  assert.equal(sett.description, "Vondt i venstre håndledd etter bunkerslag");
  assert.equal(sett.erHelse, true);
  assert.equal(sett.skjult, false);
});

test("STATUS skjuler beskrivelsen og slår sammen skade og sykdom", () => {
  const skade = maskerLeave(leave({ reason: "SKADE" }), "STATUS");
  const sykdom = maskerLeave(leave({ reason: "SYKDOM" }), "STATUS");

  assert.equal(skade.description, null, "fritekst er den mest sensitive delen");
  assert.equal(
    skade.reason,
    sykdom.reason,
    "skillet skade/sykdom antyder i seg selv en diagnose",
  );
  assert.equal(skade.erHelse, true, "coach må vite AT treningen må tilpasses");
  assert.equal(skade.skjult, true);
});

test("INGEN fjerner selve helseopplysningen, men beholder perioden", () => {
  const sett = maskerLeave(leave({ endAt: new Date("2026-06-20") }), "INGEN");
  assert.equal(sett.erHelse, false, "coach skal ikke kunne utlede at det er helse");
  assert.equal(sett.description, null);
  assert.deepEqual(sett.startAt, START, "fraværsperioden er ikke art. 9-data");
  assert.deepEqual(sett.endAt, new Date("2026-06-20"));
  assert.equal(sett.skjult, true);
});

test("beskrivelsen lekker aldri ut på lavere nivåer enn DETALJ", () => {
  const hemmelig = "Depresjon, sykmeldt av fastlege";
  for (const nivaa of ["INGEN", "STATUS"] as const) {
    const sett = maskerLeave(leave({ reason: "SYKDOM", description: hemmelig }), nivaa);
    assert.equal(JSON.stringify(sett).includes(hemmelig), false, nivaa);
  }
});

test("maskerLeaves behandler hele lista likt", () => {
  const sett = maskerLeaves([leave(), leave({ reason: "JOBB", isInjury: false })], "STATUS");
  assert.equal(sett.length, 2);
  assert.equal(sett[0].skjult, true);
  assert.equal(sett[1].skjult, false);
});

/* ── innsynsNivaaFra ───────────────────────────────────────────────── */

test("nivået utledes av samtykkestatusen", () => {
  assert.equal(innsynsNivaaFra({ coachInnsyn: false, coachDetalj: false }), "INGEN");
  assert.equal(innsynsNivaaFra({ coachInnsyn: true, coachDetalj: false }), "STATUS");
  assert.equal(innsynsNivaaFra({ coachInnsyn: true, coachDetalj: true }), "DETALJ");
});
