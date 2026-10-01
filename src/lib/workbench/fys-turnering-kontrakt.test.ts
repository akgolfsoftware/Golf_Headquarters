import assert from "node:assert/strict";
import { test } from "node:test";
import {
  calculateExerciseTonnage,
  calculateSessionLoad,
  calculateSessionTonnage,
  dateRangesOverlap,
  hasChangedAfterPublish,
  PhysicalSessionSchema,
  TournamentPlanSchema,
  tournamentHasRoundOnDate,
  tournamentHasTravelOnDate,
} from "./fys-turnering-kontrakt";

test("calculateExerciseTonnage bruker faktisk reps og kg per sett", () => {
  assert.equal(
    calculateExerciseTonnage([
      { setNumber: 1, reps: 5, weightKg: 80, rir: 2 },
      { setNumber: 2, reps: 4, weightKg: 82.5, rir: 1 },
      { setNumber: 3, reps: null, weightKg: 90, rir: null },
    ]),
    730,
  );
});

test("calculateSessionTonnage summerer alle øvelser i fysisk økt", () => {
  const parsed = PhysicalSessionSchema.parse({
    date: "2026-10-05",
    title: "Styrke underkropp",
    status: "COMPLETED",
    type: "STYRKE",
    exercises: [
      { title: "Knebøy", logs: [{ setNumber: 1, reps: 5, weightKg: 80 }] },
      { title: "Markløft", logs: [{ setNumber: 1, reps: 3, weightKg: 100 }] },
    ],
  });

  assert.equal(calculateSessionTonnage(parsed), 700);
});

test("calculateSessionLoad returnerer sRPE-belastning når varighet og RPE finnes", () => {
  assert.equal(calculateSessionLoad({ durationMinutes: 45, perceivedEffort: 7 }), 315);
  assert.equal(calculateSessionLoad({ durationMinutes: 45, perceivedEffort: null }), null);
});

test("TournamentPlanSchema tillater bare brutto runde-score innen rimelig golfspenn", () => {
  assert.throws(() =>
    TournamentPlanSchema.parse({
      title: "Syntetisk Invitational",
      status: "PUBLISHED",
      focus: "PRESTASJON",
      startDate: "2026-10-08",
      endDate: "2026-10-11",
      rounds: [{ roundNumber: 1, date: "2026-10-08", grossScore: 39 }],
    }),
  );

  const parsed = TournamentPlanSchema.parse({
    title: "Syntetisk Invitational",
    status: "PUBLISHED",
    focus: "PRESTASJON",
    startDate: "2026-10-08",
    endDate: "2026-10-11",
    rounds: [{ roundNumber: 1, date: "2026-10-08", grossScore: 72 }],
  });

  assert.equal(parsed.rounds[0].grossScore, 72);
});

test("reise- og runde-datoer gir konfliktgrunnlag for flytting", () => {
  const plan = TournamentPlanSchema.parse({
    title: "Syntetisk Invitational",
    status: "PUBLISHED",
    focus: "UTVIKLING",
    startDate: "2026-10-08",
    endDate: "2026-10-11",
    travelStartDate: "2026-10-07",
    travelEndDate: "2026-10-12",
    rounds: [
      { roundNumber: 1, date: "2026-10-08" },
      { roundNumber: 2, date: "2026-10-09" },
    ],
  });

  assert.equal(tournamentHasTravelOnDate(plan, "2026-10-07"), true);
  assert.equal(tournamentHasTravelOnDate(plan, "2026-10-13"), false);
  assert.equal(tournamentHasRoundOnDate(plan, "2026-10-09"), true);
  assert.equal(tournamentHasRoundOnDate(plan, "2026-10-10"), false);
  assert.equal(dateRangesOverlap("2026-10-01", "2026-10-07", "2026-10-07", "2026-10-08"), true);
});

test("hasChangedAfterPublish krever både publisering og status", () => {
  assert.equal(hasChangedAfterPublish("CHANGED_AFTER_PUBLISH", "2026-10-01T10:00:00.000Z"), true);
  assert.equal(hasChangedAfterPublish("PUBLISHED", "2026-10-01T10:00:00.000Z"), false);
  assert.equal(hasChangedAfterPublish("CHANGED_AFTER_PUBLISH", null), false);
});

