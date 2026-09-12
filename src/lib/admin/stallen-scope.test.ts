import assert from "node:assert/strict";
import { test } from "node:test";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { stallenPlayerWhere } from "./stallen-scope";

test("stall uten søk bruker samme spillerporte som hjem og spillerkort", () => {
  const coach = { id: "coach-1", role: "COACH" };
  assert.deepEqual(stallenPlayerWhere(coach), coachScopedPlayerWhere(coach));
  const admin = { id: "admin", role: "ADMIN" };
  assert.deepEqual(stallenPlayerWhere(admin), coachScopedPlayerWhere(admin));
});

test("søk begrenser innenfor coach-scope, ikke i stedet for det", () => {
  const where = stallenPlayerWhere({ id: "coach-1", role: "COACH" }, "  ole  ");
  assert.equal("AND" in where, true);
  const and = (where as { AND: unknown[] }).AND;
  assert.deepEqual(and[0], coachScopedPlayerWhere({ id: "coach-1", role: "COACH" }));
  assert.deepEqual(and[1], {
    OR: [
      { name: { contains: "ole", mode: "insensitive" } },
      { email: { contains: "ole", mode: "insensitive" } },
      { homeClub: { contains: "ole", mode: "insensitive" } },
    ],
  });
});

test("tomt søk gir ikke et åpent OR uten scope", () => {
  assert.deepEqual(
    stallenPlayerWhere({ id: "coach-1", role: "COACH" }, "   "),
    coachScopedPlayerWhere({ id: "coach-1", role: "COACH" }),
  );
});
