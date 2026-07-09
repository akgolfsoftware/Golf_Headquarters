import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { occurrenceInWeek } from "@/lib/gruppe/propager-gruppeplan";

describe("occurrenceInWeek", () => {
  it("plasserer WEEKLY-rad på riktig ukedag i måluka", () => {
    // Onsdag 19. aug 2026 08:00–10:00 (anker fra seed)
    const startAt = new Date("2026-08-19T08:00:00+02:00");
    const endAt = new Date("2026-08-19T10:00:00+02:00");
    const weekMonday = new Date("2026-09-07T00:00:00+02:00");

    const occ = occurrenceInWeek({ startAt, endAt }, weekMonday);
    assert.equal(occ.durationMin, 120);
    assert.equal(occ.scheduledAt.getDay(), 3); // onsdag
    assert.equal(occ.scheduledAt.getHours(), 8);
  });
});