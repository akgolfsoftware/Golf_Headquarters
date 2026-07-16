import test from "node:test";
import assert from "node:assert/strict";
import { kanBrukeCredits } from "./credits-tilgang";

test("kanBrukeCredits: null-abonnement kan ikke bruke credits", () => {
  assert.equal(kanBrukeCredits(null), false);
});

test("kanBrukeCredits: ACTIVE kan alltid bruke credits, uansett currentPeriodEnd", () => {
  assert.equal(
    kanBrukeCredits({ status: "ACTIVE", currentPeriodEnd: null }),
    true,
  );
  assert.equal(
    kanBrukeCredits({
      status: "ACTIVE",
      currentPeriodEnd: new Date("2000-01-01"),
    }),
    true,
  );
});

test("kanBrukeCredits: CANCELLED uten currentPeriodEnd er stengt", () => {
  assert.equal(
    kanBrukeCredits({ status: "CANCELLED", currentPeriodEnd: null }),
    false,
  );
});

test("kanBrukeCredits: CANCELLED med currentPeriodEnd frem i tid kan fortsatt brukes", () => {
  const now = new Date("2026-07-16T12:00:00Z");
  const periodeSlutt = new Date("2026-07-20T00:00:00Z");
  assert.equal(
    kanBrukeCredits(
      { status: "CANCELLED", currentPeriodEnd: periodeSlutt },
      now,
    ),
    true,
  );
});

test("kanBrukeCredits: CANCELLED med currentPeriodEnd passert er stengt", () => {
  const now = new Date("2026-07-16T12:00:00Z");
  const periodeSlutt = new Date("2026-07-10T00:00:00Z");
  assert.equal(
    kanBrukeCredits(
      { status: "CANCELLED", currentPeriodEnd: periodeSlutt },
      now,
    ),
    false,
  );
});

test("kanBrukeCredits: CANCELLED med currentPeriodEnd nøyaktig nå er stengt (strict >, ikke >=)", () => {
  const now = new Date("2026-07-16T12:00:00Z");
  assert.equal(
    kanBrukeCredits({ status: "CANCELLED", currentPeriodEnd: now }, now),
    false,
  );
});

test("kanBrukeCredits: andre statuser (PAST_DUE, TRIALING) kan ikke bruke credits", () => {
  const now = new Date("2026-07-16T12:00:00Z");
  const periodeSlutt = new Date("2026-08-01T00:00:00Z");
  assert.equal(
    kanBrukeCredits({ status: "PAST_DUE", currentPeriodEnd: periodeSlutt }, now),
    false,
  );
  assert.equal(
    kanBrukeCredits({ status: "TRIALING", currentPeriodEnd: periodeSlutt }, now),
    false,
  );
});
