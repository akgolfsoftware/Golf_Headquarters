/**
 * I0 · Tilgangsskillet selvbetjent vs. coachet — negative tester på
 * where-porten (NORDSTJERNE-regel: selvbetjente er usynlige i AgencyOS).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { coachedPlayerWhere } from "@/lib/auth/coached";

test("porten krever PLAYER-rolle", () => {
  const w = coachedPlayerWhere();
  assert.equal(w.role, "PLAYER");
});

test("porten slipper ALDRI gjennom PLATFORM_ONLY-enrollment alene", () => {
  const w = coachedPlayerWhere();
  const grener = w.OR;
  assert.ok(Array.isArray(grener) && grener.length === 2, "to lovlige veier inn");
  const enrollment = grener.find((g) => "enrollmentsAsPlayer" in g);
  assert.ok(enrollment, "enrollment-grenen finnes");
  const some = (enrollment as { enrollmentsAsPlayer: { some: Record<string, unknown> } })
    .enrollmentsAsPlayer.some;
  assert.deepEqual(some.program, { not: "PLATFORM_ONLY" }, "PLATFORM_ONLY er stengt ute");
  assert.equal(some.endedAt, null, "kun AKTIV enrollment teller");
});

test("gruppemedlemskap er den andre lovlige veien inn", () => {
  const w = coachedPlayerWhere();
  const gruppe = (w.OR ?? []).find((g) => "groupMemberships" in g);
  assert.ok(gruppe, "gruppe-grenen finnes");
});
