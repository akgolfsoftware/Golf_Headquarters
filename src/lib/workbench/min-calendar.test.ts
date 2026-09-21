import assert from "node:assert/strict";
import test from "node:test";

import { osloDatoOgMinutt } from "./min-calendar";

test("Min kalender mapper bookinger til norsk dato og klokkeslett om sommeren", () => {
  assert.deepEqual(osloDatoOgMinutt(new Date("2026-09-16T14:30:00Z")), {
    date: "2026-09-16",
    minute: 16 * 60 + 30,
  });
});

test("Min kalender mapper bookinger til norsk dato og klokkeslett om vinteren", () => {
  assert.deepEqual(osloDatoOgMinutt(new Date("2026-01-16T15:30:00Z")), {
    date: "2026-01-16",
    minute: 16 * 60 + 30,
  });
});
