/** C1: kontrakten til felles kandidatfilter. Faktisk radutvalg prøves i Postgres. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { coachedPlayerWhere, coachScopedPlayerWhere, coachSkrivbarPlayerWhere } from "@/lib/auth/coached";
import { TEAM_NORWAY_SLUG, ikkeOrgGruppeWhere, orgGruppeWhere } from "@/lib/domain/grupper";

for (const role of ["COACH", "ADMIN"]) {
  test(`${role}: bare aktiv spiller i aktiv AK-gruppe, aldri enrollment alene`, () => {
    const w = coachScopedPlayerWhere({ id: "syntetisk-trener", role });
    assert.equal(w.role, "PLAYER");
    assert.equal(w.deletedAt, null);
    assert.equal(JSON.stringify(w).includes("enrollmentsAsPlayer"), false);
    assert.ok(w.groupMemberships?.some);
    const m = w.groupMemberships.some;
    assert.equal(m.role, "PLAYER");
    assert.equal(m.endedAt, null);
    assert.ok(m.group);
    assert.equal(m.group.managedByAkGolf, true);
    assert.equal(m.group.arkivertAt, null);
    assert.deepEqual(m.group.AND, ikkeOrgGruppeWhere().AND);
  });
}

test("ADMIN bruker samme medlemsport for lesing og skriving", () => {
  const viewer = { id: "syntetisk-admin", role: "ADMIN" };
  assert.deepEqual(coachScopedPlayerWhere(viewer), coachedPlayerWhere());
  assert.deepEqual(coachSkrivbarPlayerWhere(viewer), coachedPlayerWhere());
});

test("rolle uten trenerrettigheter eller tom trener-ID får ikke kandidater", () => {
  for (const role of ["PLAYER", "PARENT", "GUEST", "ukjent"]) {
    assert.deepEqual(coachScopedPlayerWhere({ id: "x", role }), { id: { in: [] } });
    assert.deepEqual(coachSkrivbarPlayerWhere({ id: "x", role }), { id: { in: [] } });
  }
  for (const role of ["COACH", "ADMIN"]) {
    assert.deepEqual(coachScopedPlayerWhere({ id: "", role }), { id: { in: [] } });
    assert.deepEqual(coachSkrivbarPlayerWhere({ id: "", role }), { id: { in: [] } });
  }
});

test("org-grupper (D-04): WANG-programmene og Team Norway er utenfor medlemskapsinnsynet, adhoc-grupper (null) er innenfor", () => {
  assert.deepEqual(orgGruppeWhere(), {
    OR: [{ program: { in: ["WANG_UNG", "WANG_TOPPIDRETT"] } }, { slug: TEAM_NORWAY_SLUG }],
  });
  assert.deepEqual(ikkeOrgGruppeWhere(), {
    AND: [
      { OR: [{ program: null }, { program: { notIn: ["WANG_UNG", "WANG_TOPPIDRETT"] } }] },
      { OR: [{ slug: null }, { slug: { not: TEAM_NORWAY_SLUG } }] },
    ],
  }, "skrevet positivt: NOT over null-kolonner ville stengt ute adhoc-grupper");
});
