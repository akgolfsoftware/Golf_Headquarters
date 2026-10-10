/**
 * I0 · Tilgangsskillet selvbetjent vs. coachet — negative tester på
 * where-porten (NORDSTJERNE-regel: selvbetjente er usynlige i AgencyOS).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { coachedPlayerWhere, coachScopedPlayerWhere, coachSkrivbarPlayerWhere } from "@/lib/auth/coached";
import { TEAM_NORWAY_SLUG, ikkeOrgGruppeWhere, orgGruppeWhere } from "@/lib/domain/grupper";

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

test("gruppemedlemskap er den andre lovlige veien inn — kun AKTIVE spiller-medlemskap", () => {
  const w = coachedPlayerWhere();
  const gruppe = (w.OR ?? []).find((g) => "groupMemberships" in g);
  assert.ok(gruppe, "gruppe-grenen finnes");
  const some = (gruppe as { groupMemberships: { some: Record<string, unknown> } })
    .groupMemberships.some;
  assert.equal(some.endedAt, null, "utmeldte (endedAt satt) er stengt ute — soft-end, plan G1");
  assert.equal(some.role, "PLAYER", "trenere/hjelpetrenere i gruppa er ikke coachede spillere");
});

test("coach-scoping: ADMIN ser alle coachede (identisk med basisporten)", () => {
  const w = coachScopedPlayerWhere({ id: "admin-1", role: "ADMIN" });
  assert.deepEqual(w, coachedPlayerWhere(), "ADMIN faller tilbake til coachedPlayerWhere");
});

test("coach-scoping: COACH ser kun egne via enrollment (coachId på aktiv enrollment)", () => {
  const w = coachScopedPlayerWhere({ id: "coach-1", role: "COACH" });
  assert.equal(w.role, "PLAYER");
  assert.equal(w.deletedAt, null, "myk-slettede spillere er stengt ute for COACH");
  const grener = w.OR;
  assert.ok(Array.isArray(grener) && grener.length === 3, "tre lovlige veier inn for lesing (G5)");
  const enrollment = grener.find((g) => "enrollmentsAsPlayer" in g);
  assert.ok(enrollment, "enrollment-grenen finnes");
  const some = (enrollment as { enrollmentsAsPlayer: { some: Record<string, unknown> } })
    .enrollmentsAsPlayer.some;
  assert.equal(some.coachId, "coach-1", "enrollment må tilhøre coachen selv");
  assert.deepEqual(some.program, { not: "PLATFORM_ONLY" }, "PLATFORM_ONLY er fortsatt stengt ute");
  assert.equal(some.endedAt, null, "kun AKTIV enrollment teller");
});

// To gruppe-grener siden G5 — skill dem på formen til `group`-filteret:
// eier-grenen filtrerer på group.coachId, medlemskaps-grenen på group.members.
function gruppeGrener(w: ReturnType<typeof coachScopedPlayerWhere>) {
  return (w.OR ?? [])
    .filter((g) => "groupMemberships" in g)
    .map(
      (g) =>
        (g as { groupMemberships: { some: Record<string, unknown> } }).groupMemberships.some,
    );
}

test("coach-scoping: COACH ser kun egne via gruppe (Group.coachId) — kun aktive medlemskap", () => {
  const w = coachScopedPlayerWhere({ id: "coach-1", role: "COACH" });
  const some = gruppeGrener(w).find(
    (s) => typeof s.group === "object" && s.group != null && "coachId" in s.group,
  );
  assert.ok(some, "eier-grenen finnes");
  assert.deepEqual(some.group, { coachId: "coach-1" }, "gruppen må eies av coachen selv");
  assert.equal(some.endedAt, null, "utmeldte er stengt ute (soft-end, plan G1)");
  assert.equal(some.role, "PLAYER", "kun spiller-medlemskap gir coach-innsyn");
});

test("coach-scoping (G5): tredje gren — AK-grupper der vieweren selv er aktivt trener-medlem, aldri org-grupper", () => {
  const w = coachScopedPlayerWhere({ id: "coach-1", role: "COACH" });
  const some = gruppeGrener(w).find(
    (s) => typeof s.group === "object" && s.group != null && "members" in s.group,
  );
  assert.ok(some, "trener-medlemskaps-grenen finnes");
  // Spilleren må fortsatt være aktivt SPILLER-medlem — trenerkolleger i samme
  // gruppe blir aldri «coachede spillere», og utmeldte er stengt ute.
  assert.equal(some.endedAt, null, "kun aktive spiller-medlemskap (soft-end)");
  assert.equal(some.role, "PLAYER", "kun spiller-medlemskap gir innsyn");
  assert.deepEqual(
    some.group,
    {
      ...ikkeOrgGruppeWhere(),
      members: {
        some: { userId: "coach-1", role: { in: ["COACH", "ASSISTANT"] }, endedAt: null },
      },
    },
    "viewerens EGET medlemskap må være aktivt og ha trenerrolle, og gruppa kan ikke være WANG/TN (D-04)",
  );
});

test("coach-scoping (G5): både COACH- og ASSISTANT-medlemskap gir innsyn i gruppens spillere", () => {
  const w = coachScopedPlayerWhere({ id: "coach-1", role: "COACH" });
  const some = gruppeGrener(w).find(
    (s) => typeof s.group === "object" && s.group != null && "members" in s.group,
  );
  assert.ok(some, "trener-medlemskaps-grenen finnes");
  const eget = (
    some.group as { members: { some: { userId: string; role: { in: string[] } } } }
  ).members.some;
  assert.equal(eget.userId, "coach-1", "innsynet er knyttet til viewerens eget medlemskap");
  assert.ok(eget.role.in.includes("COACH"), "COACH-medlem ser gruppens spillere");
  assert.ok(eget.role.in.includes("ASSISTANT"), "ASSISTANT-medlem ser gruppens spillere");
  assert.ok(!eget.role.in.includes("PLAYER"), "spiller-medlemskap gir aldri trener-innsyn");
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

test("skrive-scope (D-25): bare enrollment og eid gruppe — trener-medlemskap gir aldri skriverett", () => {
  const w = coachSkrivbarPlayerWhere({ id: "coach-1", role: "COACH" });
  assert.equal(w.role, "PLAYER");
  assert.equal(w.deletedAt, null);
  const grener = w.OR ?? [];
  assert.equal(grener.length, 2, "to veier inn: egen enrollment og eid gruppe");
  assert.ok(
    gruppeGrener(w).every((s) => !(typeof s.group === "object" && s.group != null && "members" in s.group)),
    "ingen gren slipper inn via gruppemedlemskap",
  );
  assert.deepEqual(gruppeGrener(w)[0]?.group, { coachId: "coach-1" });
});

test("skrive-scope: lese-scope er skrive-scope pluss medlemskapsgrenen, ingenting annet", () => {
  const viewer = { id: "coach-1", role: "COACH" };
  const les = coachScopedPlayerWhere(viewer);
  const skriv = coachSkrivbarPlayerWhere(viewer);
  assert.deepEqual((les.OR ?? []).slice(0, 2), skriv.OR);
  assert.equal((les.OR ?? []).length, 3);
});

test("skrive-scope: ADMIN faller tilbake til basisporten", () => {
  assert.deepEqual(coachSkrivbarPlayerWhere({ id: "admin-1", role: "ADMIN" }), coachedPlayerWhere());
});
