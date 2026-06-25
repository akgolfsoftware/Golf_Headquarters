/**
 * npx tsx --test src/lib/training/skills/skills.test.ts
 */

import test from "node:test";
import assert from "node:assert/strict";
import { runPyramidSkill } from "./pyramid";
import { runWeaknessSkill } from "./weakness";
import { runPeriodizationSkill } from "./periodization";
import { runProgressionSkill } from "./progression";
import { runDrillSelectionSkill } from "./drill-selection";
import { runJuniorGuardSkill } from "./junior-guard";

test("pyramid skill finner gap under terskel", () => {
  const out = runPyramidSkill({
    sessions: [
      { pyramidArea: "SLAG", durationMin: 50 },
      { pyramidArea: "TEK", durationMin: 18 },
      { pyramidArea: "SPILL", durationMin: 18 },
      { pyramidArea: "TURN", durationMin: 9 },
      { pyramidArea: "FYS", durationMin: 5 },
    ],
    thresholdPp: 8,
  });
  assert.ok(out.primaryGap);
  assert.equal(out.primaryGap.omrade, "FYS");
});

test("weakness skill velger laveste SG", () => {
  const out = runWeaknessSkill({
    sgSnitt: { OTT: -0.2, APP: -1.1, ARG: 0.1, PUTT: -0.5 },
    pyramidSessions: [],
  });
  assert.equal(out.primarySgArea, "APP");
  assert.ok(out.anbefaling.includes("Innspill") || out.anbefaling.includes("APP"));
});

test("periodization skill — turnering innen 7 dager", () => {
  const out = runPeriodizationSkill({
    ukeStart: new Date(),
    dagerTilTurnering: 5,
  });
  assert.equal(out.weekType, "PRE_TOURNAMENT");
  assert.equal(out.tillatTekniskeEndringer, false);
});

test("periodization skill — skade trumfer", () => {
  const out = runPeriodizationSkill({
    ukeStart: new Date(),
    skadeAktiv: true,
    dagerTilTurnering: 3,
  });
  assert.equal(out.weekType, "INJURY_MODIFIED");
});

test("progression skill øker CS gjennom periode", () => {
  const tidlig = runProgressionSkill({
    ukeIPeriode: 0,
    totaleUker: 10,
    akKategori: "F",
  });
  const sent = runProgressionSkill({
    ukeIPeriode: 8,
    totaleUker: 10,
    akKategori: "F",
  });
  assert.ok(sent.csTarget >= tidlig.csTarget);
  assert.equal(tidlig.lFase, "L_KROPP");
});

test("drill-selection ekskluderer siste 4 duplikater", () => {
  const out = runDrillSelectionSkill({
    skillArea: "PUTTING",
    sisteDrillIds: ["d1", "d2"],
    kandidater: [
      { id: "d1", name: "Putt A" },
      { id: "d2", name: "Putt B" },
      { id: "d3", name: "Putt C" },
    ],
    maxDrills: 2,
  });
  assert.equal(out.valgte.length, 1);
  assert.equal(out.valgte[0].id, "d3");
});

test("junior-guard blokkerer for mange økter", () => {
  const dob = new Date();
  dob.setFullYear(dob.getFullYear() - 14);
  const out = runJuniorGuardSkill({
    dateOfBirth: dob,
    planlagteOkterNesteUke: 4,
    sessionsToAdd: 1,
  });
  assert.equal(out.erJunior, true);
  assert.equal(out.tillatt, false);
});

test("junior-guard tillater voksen", () => {
  const dob = new Date();
  dob.setFullYear(dob.getFullYear() - 20);
  const out = runJuniorGuardSkill({
    dateOfBirth: dob,
    planlagteOkterNesteUke: 5,
    sessionsToAdd: 2,
  });
  assert.equal(out.erJunior, false);
  assert.equal(out.tillatt, true);
});