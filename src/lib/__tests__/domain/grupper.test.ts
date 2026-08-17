/**
 * G5 · Gruppemedlem-roller — zod-porten ved action-grensen og
 * trener-innsynsfragmentet. `GroupMember.role` er String i DB, så schemaet
 * er det eneste som hindrer at en vilkårlig klientverdi blir en rolle.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  GRUPPEMEDLEM_ROLLER,
  gruppemedlemRolleSchema,
  aktivtTrenerMedlemskapWhere,
} from "@/lib/domain/grupper";

test("rolle-kanon er nøyaktig PLAYER, ASSISTANT og COACH", () => {
  assert.deepEqual([...GRUPPEMEDLEM_ROLLER], ["PLAYER", "ASSISTANT", "COACH"]);
});

test("schemaet godtar alle kanoniske roller", () => {
  for (const rolle of GRUPPEMEDLEM_ROLLER) {
    const res = gruppemedlemRolleSchema.safeParse(rolle);
    assert.ok(res.success, `${rolle} skal være gyldig`);
  }
});

test("schemaet avviser alt utenfor kanon", () => {
  for (const ugyldig of ["ADMIN", "player", "coach", "", "TRENER", null, undefined, 1]) {
    const res = gruppemedlemRolleSchema.safeParse(ugyldig);
    assert.equal(res.success, false, `${String(ugyldig)} skal avvises`);
  }
});

test("aktivtTrenerMedlemskapWhere: aktivt COACH/ASSISTANT-medlemskap for gitt bruker", () => {
  assert.deepEqual(aktivtTrenerMedlemskapWhere("coach-1"), {
    userId: "coach-1",
    role: { in: ["COACH", "ASSISTANT"] },
    endedAt: null,
  });
});
