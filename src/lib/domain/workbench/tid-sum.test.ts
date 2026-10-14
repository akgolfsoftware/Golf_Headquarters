import test from "node:test";
import assert from "node:assert/strict";
import { gjennomfortMinutter, planlagtMinutter } from "./tid-sum";
import { computeWeeklyLoad } from "./load";

const okter = [
  { durationMinutes: 60, status: "COMPLETED" },
  { durationMinutes: 45, status: "PUBLISHED" },
  { durationMinutes: 30, status: "COMPLETED" },
];

test("lagt inn er summen av planlagt varighet, gjennomført bare COMPLETED", () => {
  assert.equal(planlagtMinutter(okter), 135);
  assert.equal(gjennomfortMinutter(okter), 90);
});

test("uka og de andre nivåene gir samme gjennomførte tall for samme økter", () => {
  const uke = computeWeeklyLoad(
    okter.map((o) => ({ ...o, actualMinutes: 10, perceivedEffort: null })),
  );
  assert.equal(uke.completedMinutes, gjennomfortMinutter(okter));
});

test("negativ varighet teller som null", () => {
  assert.equal(planlagtMinutter([{ durationMinutes: -5 }]), 0);
});

import { tellerIFremdrift } from "./tid-sum";
import { buildMonthViewModel } from "./operations";

test("hoppet over teller som avvik i fremdriften, avlyst gjør det ikke", () => {
  assert.equal(tellerIFremdrift({ status: "SKIPPED" }), true);
  assert.equal(tellerIFremdrift({ status: "CANCELLED" }), false);
});

test("måneden: hoppet over øker planlagt hittil men ikke gjennomført", () => {
  const mal = { pyramid: "TEK", coachId: "c", playerId: "p", title: "t" };
  const maned = buildMonthViewModel(
    "2026-10-01",
    [
      { ...mal, id: "a", date: "2026-10-05", durationMinutes: 60, status: "COMPLETED" },
      { ...mal, id: "b", date: "2026-10-06", durationMinutes: 60, status: "SKIPPED" },
      { ...mal, id: "c", date: "2026-10-07", durationMinutes: 60, status: "CANCELLED" },
    ] as never,
    "player" as never,
    0,
    "Oktober",
    "2026-10-10",
  );
  assert.equal(maned.plannedToDateMinutes, 120);
  assert.equal(maned.completedMinutes, 60);
});
