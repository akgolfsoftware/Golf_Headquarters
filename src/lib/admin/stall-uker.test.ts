import { test } from "node:test";
import assert from "node:assert/strict";
import { etterlevelseUker } from "./stall-uker";

const naa = new Date("2026-10-20T12:00:00Z");
const dagerSiden = (d: number) => new Date(naa.getTime() - d * 86_400_000);

test("fire uker, eldste først, null for uke uten forfalte økter", () => {
  const okter = [
    { scheduledAt: dagerSiden(25), durationMin: 60, status: "COMPLETED" as const },
    { scheduledAt: dagerSiden(24), durationMin: 60, status: "SKIPPED" as const },
    { scheduledAt: dagerSiden(10), durationMin: 90, status: "COMPLETED" as const },
    { scheduledAt: dagerSiden(9), durationMin: 10, status: "SKIPPED" as const },
    { scheduledAt: dagerSiden(2), durationMin: 60, status: "COMPLETED" as const },
  ];
  assert.deepEqual(etterlevelseUker(okter, naa), [50, null, 90, 100]);
});

test("økter eldre enn fire uker teller ikke", () => {
  const okter = [{ scheduledAt: dagerSiden(40), durationMin: 60, status: "COMPLETED" as const }];
  assert.deepEqual(etterlevelseUker(okter, naa), [null, null, null, null]);
});
