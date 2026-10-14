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
  assert.equal(planlagtMinutter([{ durationMinutes: -5, status: "COMPLETED" }]), 0);
});
