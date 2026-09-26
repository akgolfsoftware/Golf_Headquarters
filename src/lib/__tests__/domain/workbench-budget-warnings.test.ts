import test from "node:test";
import assert from "node:assert/strict";
import {
  computeSeasonVolume,
  computeBudgetWarnings,
  computeBudget,
  createSession,
} from "@/lib/domain/workbench/operations";

test("computeSeasonVolume beregner fremdrift mot 1250-timers målet", () => {
  // Uke 26 av 52 (halvveis i sesongen). Forventet: 625 timer.
  // Spiller har fullført 650 timer (39000 min) og har 600 timer (36000 min) planlagt igjen.
  const vol = computeSeasonVolume({
    completedMinutesSoFar: 39000,
    plannedMinutesRemaining: 36000,
    seasonTargetHours: 1250,
    currentWeekNumber: 26,
    totalWeeksInSeason: 52,
  });

  assert.equal(vol.seasonTargetHours, 1250);
  assert.equal(vol.completedHoursSoFar, 650);
  assert.equal(vol.plannedHoursRemaining, 600);
  assert.equal(vol.projectedTotalHours, 1250);
  assert.equal(vol.targetDiffHours, 0);
  assert.equal(vol.trajectoryExpectedHours, 625);
  assert.ok(vol.trajectoryDeviationPercent !== null && vol.trajectoryDeviationPercent > 0);
  assert.equal(vol.onTrack, true);
});

test("computeSeasonVolume flagger når spiller er mer enn 5% bak 1250-timers banen", () => {
  // Uke 20 av 52. Forventet: (20/52) * 1250 = 480.8 timer.
  // Spiller har kun fullført 400 timer (24000 min) -> ca -16.8% avvik.
  const vol = computeSeasonVolume({
    completedMinutesSoFar: 24000,
    plannedMinutesRemaining: 60000,
    seasonTargetHours: 1250,
    currentWeekNumber: 20,
    totalWeeksInSeason: 52,
  });

  assert.equal(vol.onTrack, false);
  assert.ok(vol.trajectoryDeviationPercent !== null && vol.trajectoryDeviationPercent < -5.0);
});

test("Advarsel 1: Akutt:kronisk belastning (>15% over 4-ukers snitt)", () => {
  // 1. Mangler data
  const m1 = computeBudgetWarnings({
    currentWeekLoad: 1200,
    previousWeeksLoads: [1000, 1000], // kun 2 uker
  });
  const w1Missing = m1.warnings.find((w) => w.id === "AKUTT_BELASTNING");
  assert.ok(w1Missing);
  assert.equal(w1Missing.manglerData, true);
  assert.equal(w1Missing.aktiv, false);
  assert.match(w1Missing.melding, /Mangler data/);

  // 2. Utløser advarsel (snitt 1000, nåværende 1250 -> +25% > 15%)
  const w1Active = computeBudgetWarnings({
    currentWeekLoad: 1250,
    previousWeeksLoads: [1000, 1000, 1000, 1000],
  }).warnings.find((w) => w.id === "AKUTT_BELASTNING");
  assert.ok(w1Active);
  assert.equal(w1Active.aktiv, true);
  assert.equal(w1Active.manglerData, false);
  assert.equal(w1Active.nivaa, "ADVARSEL");
  assert.match(w1Active.melding, /25% over 4-ukers snittet/);

  // 3. Normal innenfor rammer (nåværende 1080 -> +8% <= 15%)
  const w1Ok = computeBudgetWarnings({
    currentWeekLoad: 1080,
    previousWeeksLoads: [1000, 1000, 1000, 1000],
  }).warnings.find((w) => w.id === "AKUTT_BELASTNING");
  assert.ok(w1Ok);
  assert.equal(w1Ok.aktiv, false);
  assert.match(w1Ok.melding, /innenfor trygge rammer/);
});

test("Advarsel 2: Full-sving volum (+10% over forrige uke)", () => {
  // 1. Mangler data
  const w2Missing = computeBudgetWarnings({
    currentWeekFullSwingShots: 250,
    previousWeekFullSwingShots: null,
  }).warnings.find((w) => w.id === "FULL_SVING_VOLUM");
  assert.ok(w2Missing);
  assert.equal(w2Missing.manglerData, true);

  // 2. Utløser advarsel (forrige uke 200, denne uke 240 -> +20% > 10%)
  const w2Active = computeBudgetWarnings({
    currentWeekFullSwingShots: 240,
    previousWeekFullSwingShots: 200,
  }).warnings.find((w) => w.id === "FULL_SVING_VOLUM");
  assert.ok(w2Active);
  assert.equal(w2Active.aktiv, true);
  assert.match(w2Active.melding, /20% over forrige uke/);

  // 3. Normal (forrige uke 200, denne uke 210 -> +5% <= 10%)
  const w2Ok = computeBudgetWarnings({
    currentWeekFullSwingShots: 210,
    previousWeekFullSwingShots: 200,
  }).warnings.find((w) => w.id === "FULL_SVING_VOLUM");
  assert.ok(w2Ok);
  assert.equal(w2Ok.aktiv, false);
});

test("Advarsel 3: Akkumulert tretthet (4 uker på rad med økende belastning)", () => {
  // 1. Mangler data (< 4 uker)
  const w3Missing = computeBudgetWarnings({
    consecutiveWeeklyLoads: [600, 700, 800],
  }).warnings.find((w) => w.id === "AKKUMULERT_TRETHET");
  assert.ok(w3Missing);
  assert.equal(w3Missing.manglerData, true);

  // 2. Utløser advarsel (4 uker på rad med økning: 600 < 700 < 800 < 900)
  const w3Active = computeBudgetWarnings({
    consecutiveWeeklyLoads: [600, 700, 800, 900],
  }).warnings.find((w) => w.id === "AKKUMULERT_TRETHET");
  assert.ok(w3Active);
  assert.equal(w3Active.aktiv, true);
  assert.match(w3Active.melding, /4 uker på rad med økende/);

  // 3. Normal (variasjon: 600 < 800 > 650 < 800)
  const w3Ok = computeBudgetWarnings({
    consecutiveWeeklyLoads: [600, 800, 650, 800],
  }).warnings.find((w) => w.id === "AKKUMULERT_TRETHET");
  assert.ok(w3Ok);
  assert.equal(w3Ok.aktiv, false);
});

test("Advarsel 4: Egensjekk og smerte (3 røde dager)", () => {
  // 1. Mangler data
  const w4Missing = computeBudgetWarnings({}).warnings.find((w) => w.id === "SMERTE_EGENSJEKK");
  assert.ok(w4Missing);
  assert.equal(w4Missing.manglerData, true);

  // 2. Utløser kritisk advarsel ved 3 røde dager
  const w4Active = computeBudgetWarnings({
    redDaysCount: 3,
  }).warnings.find((w) => w.id === "SMERTE_EGENSJEKK");
  assert.ok(w4Active);
  assert.equal(w4Active.aktiv, true);
  assert.equal(w4Active.nivaa, "KRITISK");
  assert.match(w4Active.melding, /3 røde dager/);

  // 3. Normal ved 1 rød dag
  const w4Ok = computeBudgetWarnings({
    redDaysCount: 1,
  }).warnings.find((w) => w.id === "SMERTE_EGENSJEKK");
  assert.ok(w4Ok);
  assert.equal(w4Ok.aktiv, false);
});

test("Advarsel 5: Søvnunderskudd (<8 timer 3 netter på rad)", () => {
  // 1. Mangler data (< 3 netter)
  const w5Missing = computeBudgetWarnings({
    sleepRecords: [{ date: "2026-09-20", hours: 7 }],
  }).warnings.find((w) => w.id === "SOEVN_UNDERSKUDD");
  assert.ok(w5Missing);
  assert.equal(w5Missing.manglerData, true);

  // 2. Utløser advarsel (3 netter på rad: 6.5, 7.0, 7.5 < 8)
  const w5Active = computeBudgetWarnings({
    sleepRecords: [
      { date: "2026-09-21", hours: 6.5 },
      { date: "2026-09-22", hours: 7.0 },
      { date: "2026-09-23", hours: 7.5 },
    ],
  }).warnings.find((w) => w.id === "SOEVN_UNDERSKUDD");
  assert.ok(w5Active);
  assert.equal(w5Active.aktiv, true);
  assert.match(w5Active.melding, /sovet under 8 timer 3 netter på rad/);

  // 3. Normal (god søvn)
  const w5Ok = computeBudgetWarnings({
    sleepRecords: [
      { date: "2026-09-21", hours: 8.5 },
      { date: "2026-09-22", hours: 8.0 },
      { date: "2026-09-23", hours: 8.2 },
    ],
  }).warnings.find((w) => w.id === "SOEVN_UNDERSKUDD");
  assert.ok(w5Ok);
  assert.equal(w5Ok.aktiv, false);
});

test("Advarsel 6: Årsvolum vs 1250-timers bane (>5% bak rute)", () => {
  // Uke 15 av 52. Forventet: 360.6 t. Spiller har kun 300 t (ca -16.8% avvik).
  const w6Active = computeBudgetWarnings({
    currentWeekNumber: 15,
    completedMinutesSoFar: 18000, // 300 t
    plannedMinutesRemaining: 54000, // 900 t
    seasonTargetHours: 1250,
  }).warnings.find((w) => w.id === "AARSVOLUM_BANE");

  assert.ok(w6Active);
  assert.equal(w6Active.aktiv, true);
  assert.match(w6Active.melding, /under 1250-timers banen/);
});

test("computeBudget integrerer årsvolum og varsler sømløst", () => {
  const dummySession = createSession({
    playerId: "p_1",
    coachId: "c_1",
    date: "2026-09-26",
    startMinute: 600,
    durationMinutes: 90,
    title: "Slagtrening",
    pyramid: "SLAG",
    createdBy: "COACH",
  });

  const budget = computeBudget([dummySession], {
    currentWeekLoad: 1400,
    previousWeeksLoads: [1000, 1000, 1000, 1000],
    redDaysCount: 3,
  });

  assert.equal(budget.plannedMinutes, 90);
  assert.equal(budget.byPyramid.SLAG, 90);
  assert.ok(budget.seasonVolume);
  assert.equal(budget.seasonVolume.seasonTargetHours, 1250);
  assert.ok(budget.warnings);
  assert.equal(budget.warnings.length, 6);
  assert.ok(budget.activeWarningsCount !== undefined && budget.activeWarningsCount >= 2);
});
