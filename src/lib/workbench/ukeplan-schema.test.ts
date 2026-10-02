import assert from "node:assert/strict";
import { test } from "node:test";
import {
  isoUkeIdentitet, isoUkeMandag, parseWeekPlanData, SaveWeekPlanInputSchema,
  tommeUkeplandetaljer, UKEPLAN_TYPER, WeekPlanningDetailsSchema,
} from "./ukeplan-schema";

const key = { playerId: "syntetisk-spiller", isoYear: 2026, weekNumber: 40 };

test("fire eksakte uketyper fra X09 lagres uten endring av gamle enumverdier", () => {
  assert.deepEqual(UKEPLAN_TYPER.map((v) => v.navn), [
    "Grunnuke", "Spesialuke", "Turneringsuke med konkurranse", "Turneringsuke uten konkurranse",
  ]);
  for (const type of UKEPLAN_TYPER) {
    const planningDetails = { ...tommeUkeplandetaljer(), weekType: type.id };
    for (const weekType of ["UTVIKLING", "VEDLIKEHOLD", "TURNERING"]) {
      assert.ok(SaveWeekPlanInputSchema.safeParse({ ...key, weekType, planningDetails }).success);
    }
  }
});

test("hele skrivekontrakten validerer identitet, enum, merker, timer og heltall", () => {
  const invalid = [
    { playerId: "" }, { playerId: 42 }, { isoYear: 2026.5 }, { isoYear: Infinity },
    { isoYear: 2025, weekNumber: 53 }, { weekNumber: 0 }, { weekNumber: 54 },
    { weekNumber: 1.5 }, { weekType: "GRUNN" }, { notes: ["UKJENT"] },
    { customNotes: 9 }, { seasonPlanId: "" }, { ukjent: "avvis" },
  ];
  for (const fields of invalid) assert.equal(SaveWeekPlanInputSchema.safeParse({ ...key, ...fields }).success, false);
  for (const field of ["plannedHoursFys", "plannedHoursTek", "plannedHoursSlag", "plannedHoursSpill", "plannedHoursTurn"]) {
    for (const value of [-1, NaN, Infinity, -Infinity, "2"]) {
      assert.equal(SaveWeekPlanInputSchema.safeParse({ ...key, [field]: value }).success, false, `${field}: ${value}`);
    }
    for (const value of [0, 1.25, null, undefined]) {
      assert.ok(SaveWeekPlanInputSchema.safeParse({ ...key, [field]: value }).success);
    }
  }
  for (const field of ["repTargetDry", "repTargetLowSpeed", "repTargetFullSpeed", "repTargetPutting", "repTargetShortGame", "loadCeiling"]) {
    for (const value of [-1, 0.5, NaN, Infinity, 2_147_483_648]) {
      assert.equal(SaveWeekPlanInputSchema.safeParse({ ...key, [field]: value }).success, false);
    }
    for (const value of [0, 12, null, undefined]) assert.ok(SaveWeekPlanInputSchema.safeParse({ ...key, [field]: value }).success);
  }
});

test("JSON validerer versjon, alle fem områder, prioritet, fokus og øktbudsjett", () => {
  const details = tommeUkeplandetaljer();
  assert.ok(WeekPlanningDetailsSchema.safeParse(details).success);
  for (const invalid of [
    "{}", [], {}, { ...details, version: 2 }, { ...details, weekType: "TURNERING" },
    { ...details, areas: {} }, { ...details, location: 10 },
    { ...details, areas: { ...details.areas, TEK: { ...details.areas.TEK, priority: "HØY" } } },
    { ...details, areas: { ...details.areas, FYS: { ...details.areas.FYS, sessionBudget: 1.5 } } },
    { ...details, areas: { ...details.areas, SLAG: { ...details.areas.SLAG, sessionBudget: -1 } } },
    { ...details, areas: { ...details.areas, TURN: { ...details.areas.TURN, focus: 5 } } },
    { ...details, secret: "ukjent felt" },
  ]) assert.equal(WeekPlanningDetailsSchema.safeParse(invalid).success, false);
});

test("0, null og utelatt felt holdes atskilt, også fra gammel klient", () => {
  const old = SaveWeekPlanInputSchema.parse({ ...key, weekType: "TURNERING", notes: [] });
  assert.equal(Object.hasOwn(old, "planningDetails"), false);
  assert.equal(old.plannedHoursFys, undefined);
  const clear = SaveWeekPlanInputSchema.parse({ ...key, planningDetails: null, repTargetDry: 0, plannedHoursFys: null });
  assert.equal(clear.planningDetails, null);
  assert.equal(clear.repTargetDry, 0);
  assert.equal(clear.plannedHoursFys, null);
});

test("gjenlesing til trenerprofil avviser ugyldig JSON og slipper ikke med ukjente databasefelt", () => {
  const planningDetails = tommeUkeplandetaljer();
  planningDetails.areas.TEK = { priority: "UTVIKLE", focus: "Syntetisk fokus", sessionBudget: 0 };
  const row = { id: "uke-syntetisk", ...key, weekType: "VEDLIKEHOLD", notes: [], planningDetails, repetitionTargets: null, internalField: "skal bort" };
  const read = parseWeekPlanData(row);
  assert.ok(read);
  assert.deepEqual(read.planningDetails, planningDetails);
  assert.equal(Object.hasOwn(read, "internalField"), false);
  assert.equal(parseWeekPlanData({ ...row, planningDetails: { version: 77 } }), null);
  assert.equal(parseWeekPlanData({ ...row, repetitionTargets: [] }), null);
  assert.ok(parseWeekPlanData({ ...row, planningDetails: null }));
});

test("ISO-ukeår og mandag stemmer ved nyttår, uke 53 og alle uker 2020–2030", () => {
  assert.deepEqual(isoUkeIdentitet("2024-12-30"), { isoYear: 2025, weekNumber: 1 });
  assert.deepEqual(isoUkeIdentitet("2021-01-01"), { isoYear: 2020, weekNumber: 53 });
  assert.equal(isoUkeMandag(2020, 53), "2020-12-28");
  for (let isoYear = 2020; isoYear <= 2030; isoYear++) {
    const lastWeek = isoUkeIdentitet(`${isoYear}-12-28`).weekNumber;
    for (let weekNumber = 1; weekNumber <= lastWeek; weekNumber++) {
      assert.deepEqual(isoUkeIdentitet(isoUkeMandag(isoYear, weekNumber)), { isoYear, weekNumber });
      assert.ok(SaveWeekPlanInputSchema.safeParse({ ...key, isoYear, weekNumber }).success);
    }
    if (lastWeek === 52) assert.equal(SaveWeekPlanInputSchema.safeParse({ ...key, isoYear, weekNumber: 53 }).success, false);
  }
});
