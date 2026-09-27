import assert from "node:assert/strict";
import { beforeEach, mock, test } from "node:test";

// Rolle for gruppe-stien: viewerId -> GroupMember.role ("COACH" | "ASSISTANT" | "PLAYER" | "GUEST" | fraværende).
let groupRoller: Record<string, string> = { coach: "COACH" };
let spillerIder = ["spiller-1"];
let slug = "team-norway";
let mottaker: string | null = null;
let foresatt = false;
let trener = false;

mock.module("@/lib/prisma", { namedExports: { prisma: {
  tnPostAttachment: { findUnique: async ({ where }: { where: { id: string } }) => where.id === "vedlegg-1" ? {
    id: where.id, path: "privat-lagringssti", fileName: "treningsplan.pdf", fileType: "application/pdf", fileSize: 100,
    post: { id: "post-1", groupId: mottaker ? null : "gruppe-tn", mottakerUserId: mottaker },
  } : null },
  group: { findUnique: async () => ({ slug }) },
  groupMember: {
    // To ulike kallformer skilles på where-formen: hentViewerRolleIGruppe
    // spør etter { groupId, userId, endedAt: null } uten nestet `group`,
    // erAktivTrenerIGruppeMedSpiller spør med en nestet `group`-relasjon.
    findFirst: async ({ where }: { where: { groupId?: string; group?: unknown } }) => {
      if (where.groupId && !where.group) {
        const rolle = groupRoller[(where as { userId?: string }).userId ?? ""];
        return rolle ? { role: rolle } : null;
      }
      if (where.group) return trener ? { id: "m1" } : null;
      return null;
    },
    findMany: async () => spillerIder.map((userId) => ({ userId })),
  },
  parentRelation: {
    findFirst: async ({ where }: { where: { childId?: string | { in: string[] } } }) => {
      if (!foresatt) return null;
      const childId = where.childId;
      const treffer = typeof childId === "string" ? childId === mottaker : Array.isArray(childId?.in) && childId.in.length > 0;
      return treffer ? { id: "p1" } : null;
    },
  },
} } });

beforeEach(() => { groupRoller = { coach: "COACH" }; spillerIder = ["spiller-1"]; slug = "team-norway"; mottaker = null; foresatt = false; trener = false; });

const hent = async (id = "vedlegg-1", viewer = "coach") => (await import("./tn-post")).hentTnVedleggForViewer(id, viewer);

test("gruppemedlem (trener) kan hente eksakt vedlegg fra sin TN-post", async () => { assert.equal((await hent())?.path, "privat-lagringssti"); });
test("outsider får ikke gruppens vedlegg", async () => { groupRoller = {}; assert.equal(await hent(), null); });
test("medlem i fremmed gruppe får ikke vedlegg gjennom TN-ruten", async () => { slug = "wang"; assert.equal(await hent(), null); });
test("manipulert vedleggs-id gir ikke en annen lagringssti", async () => { assert.equal(await hent("../../privat"), null); });

test("spiller-medlem i gruppen kan hente gruppens vedlegg", async () => {
  groupRoller = { "spiller-1": "PLAYER" };
  assert.ok(await hent("vedlegg-1", "spiller-1"));
});
test("GUEST-medlem i gruppen avvises (ikke trener, ikke spiller, ikke foresatt)", async () => {
  groupRoller = { gjest: "GUEST" };
  assert.equal(await hent("vedlegg-1", "gjest"), null);
});
test("godkjent foresatt uten eget gruppemedlemskap kan hente gruppens vedlegg", async () => {
  groupRoller = {};
  foresatt = true;
  assert.ok(await hent("vedlegg-1", "forelder-1"));
});
test("ikke-godkjent foresatt avvises for gruppens vedlegg", async () => {
  groupRoller = {};
  foresatt = false;
  assert.equal(await hent("vedlegg-1", "forelder-1"), null);
});

test("individuell post avviser uvedkommende og tillater spiller, godkjent foresatt og tilknyttet trener", async () => {
  mottaker = "spiller-1";
  assert.equal(await hent(), null);
  assert.ok(await hent("vedlegg-1", "spiller-1"));
  foresatt = true; assert.ok(await hent());
  foresatt = false; trener = true; assert.ok(await hent());
});
