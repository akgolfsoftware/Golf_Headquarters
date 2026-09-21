import assert from "node:assert/strict";
import { test } from "node:test";
import { weekLockedBlocks } from "./locked-blocks";

const school = { id: "school", title: "Skole", kind: "SKOLE", isPrivate: false, recurring: null,
  startAt: new Date("2026-09-16T06:00:00Z"), endAt: new Date("2026-09-16T12:00:00Z") };

test("skoletid ligger på norsk dag og klokkeslett", () => {
  const days = weekLockedBlocks("2026-09-14", [school], []);
  assert.equal(days.flat().length, 1);
  assert.equal(days[2][0].startMinute, 480);
  assert.equal(days[2][0].durationMinutes, 360);
});

test("private titler og kategorier deles aldri i ukevisningen", () => {
  const block = weekLockedBlocks("2026-09-14", [{ ...school, title: "Privat detalj", kind: "HELSE", isPrivate: true }], [])[2][0];
  assert.equal(block.title, "Opptatt");
  assert.equal(block.kind, "OPPTATT");
  assert.doesNotMatch(JSON.stringify(block), /Privat detalj|HELSE/);
});

test("ukentlig avtale beholder veggklokken over vintertid", () => {
  const days = weekLockedBlocks("2026-10-26", [{ ...school, recurring: "WEEKLY" }], []);
  assert.equal(days[2][0].startMinute, 480);
  assert.equal(days[2][0].durationMinutes, 360);
});

test("opptatt over midnatt klippes og slutten regnes eksklusivt", () => {
  const row = { ...school, startAt: new Date("2026-09-13T21:00:00Z"), endAt: new Date("2026-09-14T23:00:00Z") };
  const days = weekLockedBlocks("2026-09-14", [row], []);
  assert.equal(days[0][0].durationMinutes, 1440);
  assert.equal(days[1][0].durationMinutes, 60);
  assert.equal(days[2].length, 0);
  assert.equal(weekLockedBlocks("2026-09-21", [row], []).flat().length, 0);
});

test("heldagsprøve vises, ferie og fremtidig ukentlig avtale utelates", () => {
  const days = weekLockedBlocks("2026-09-14", [{ ...school, recurring: "WEEKLY", startAt: new Date("2026-09-23T06:00:00Z"), endAt: new Date("2026-09-23T12:00:00Z") }], [
    { id: "1", title: "Heldagsprøve", date: new Date("2026-09-15T00:00:00Z"), category: "HELDAGSPROVE" },
    { id: "2", title: "Ferie", date: new Date("2026-09-16T00:00:00Z"), category: "FERIE" },
  ]);
  assert.equal(days.flat().length, 1);
  assert.equal(days[1][0].durationMinutes, 1440);
});
