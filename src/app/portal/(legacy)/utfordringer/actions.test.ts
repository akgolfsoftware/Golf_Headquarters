/**
 * Beslutning 22.09.2026 (§Utfordringer skal leve) og 16.10.2026 (§VENNER SKJULES …): deltakere
 * velges bare fra egne grupper (coach også fra stallen), aldri venner eller delt lenke. Bare eier
 * og valgte deltakere kan åpne og bli med. Scoren har en retning (higherIsBetter).
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

const EIER = { id: "eier-1", name: "Eier Eiersen", role: "PLAYER" as const };

let egneMedlemskap: { groupId: string; userId: string; endedAt: Date | null }[] = [];
let ovelseHigherIsBetter: boolean | null = null;
let opprettetChallenge: Record<string, unknown> | null = null;
let varslede: string[] = [];
let deltakerRader: { id: string; score: number | null }[] = [];
let sisteRankOrder: "asc" | "desc" | null = null;
let oppdaterteRanker: { id: string; rank: number }[] = [];
let utfordringHigherIsBetter = true;
let tilgangAvvist = false;
let erDeltaker = true;
let ovelseTilgjengelig = true;

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("next/navigation", {
  namedExports: {
    redirect: (to: string) => {
      throw new Error(`REDIRECT:${to}`);
    },
  },
});
mock.module("@/lib/auth/requireConsentingUser", {
  namedExports: { requireConsentingUser: async () => EIER },
});
mock.module("@/lib/auth/requirePortalUser", {
  namedExports: {
    requirePortalUser: async (options: unknown) => {
      assert.deepEqual(options, { allow: ["PLAYER", "COACH", "ADMIN"], kreverTilgang: "FULL" });
      if (tilgangAvvist) throw new Error("ACCESS_DENIED");
      return EIER;
    },
  },
});
mock.module("@/lib/auth/coached", { namedExports: { coachScopedPlayerWhere: () => ({ id: { in: [] } }) } });
mock.module("@/lib/portal-drills/drills-data", {
  namedExports: { drillAccessWhere: () => ({}), getMyCoachIds: async () => [] },
});
mock.module("@/lib/audit", { namedExports: { audit: async () => undefined } });
mock.module("@/lib/notifications", {
  namedExports: {
    notify: async ({ userId }: { userId: string }) => {
      varslede.push(userId);
    },
  },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      friendship: {
        findMany: async () => {
          throw new Error("Venner skal ikke leses (16.10.2026)");
        },
      },
      user: { findMany: async () => [] },
      groupMember: {
        findMany: async (args: { where: { userId?: string; groupId?: { in: string[] } } }) => {
          if (args.where.groupId) {
            const gruppeIder = args.where.groupId.in;
            return egneMedlemskap.filter((m) => gruppeIder.includes(m.groupId) && m.endedAt === null && m.userId !== EIER.id);
          }
          return egneMedlemskap.filter((m) => m.userId === args.where.userId && m.endedAt === null);
        },
      },
      exerciseDefinition: {
        findFirst: async () => (ovelseTilgjengelig ? { higherIsBetter: ovelseHigherIsBetter } : null),
      },
      drillChallenge: {
        create: async (args: { data: Record<string, unknown> }) => {
          opprettetChallenge = args.data;
          return { id: "utfordring-1", name: args.data.name, drillId: args.data.drillId };
        },
        findUnique: async () => ({ id: "utfordring-1", name: "Puttekonkurranse", status: "ACTIVE", ownerId: "annen-eier", higherIsBetter: utfordringHigherIsBetter }),
        findFirst: async () => (erDeltaker ? { id: "utfordring-1" } : null),
      },
      challengeParticipant: {
        findUnique: async () => ({ id: "eiers-egen-rad" }),
        upsert: async () => ({}),
        findMany: async (args: { orderBy: { score: "asc" | "desc" } }) => {
          sisteRankOrder = args.orderBy.score;
          const sortert = [...deltakerRader].sort((a, b) =>
            sisteRankOrder === "asc" ? (a.score ?? 0) - (b.score ?? 0) : (b.score ?? 0) - (a.score ?? 0),
          );
          return sortert;
        },
        update: async (args: { where: { id?: string }; data: { rank?: number } }) => {
          if (args.data.rank !== undefined && args.where.id) {
            oppdaterteRanker.push({ id: args.where.id, rank: args.data.rank });
          }
          return {};
        },
      },
    },
  },
});

async function actions() {
  return import("./actions");
}

test.beforeEach(() => {
  egneMedlemskap = [];
  ovelseHigherIsBetter = null;
  opprettetChallenge = null;
  varslede = [];
  deltakerRader = [];
  sisteRankOrder = null;
  oppdaterteRanker = [];
  utfordringHigherIsBetter = true;
  tilgangAvvist = false;
  erDeltaker = true;
  ovelseTilgjengelig = true;
});

test("opprettUtfordring avviser direkte kall uten full tilgang", async () => {
  tilgangAvvist = true;
  const { opprettUtfordring } = await actions();
  await assert.rejects(() => opprettUtfordring({ name: "Puttekonkurranse" }), /ACCESS_DENIED/);
  assert.equal(opprettetChallenge, null);
});

test("opprettUtfordring validerer input på serveren", async () => {
  const { opprettUtfordring } = await actions();
  await assert.rejects(() => opprettUtfordring({ name: " " }), /Kontroller navn/);
  assert.equal(opprettetChallenge, null);
});

test("opprettUtfordring avviser en venn utenfor gruppene", async () => {
  // venn-1 er venn, men ikke med i en av gruppene; Friendship leses ikke.
  const { opprettUtfordring } = await actions();
  await assert.rejects(
    () => opprettUtfordring({ name: "Puttekonkurranse", deltakerIds: ["venn-1"] }),
    /fra gruppene dine/,
  );
  assert.equal(opprettetChallenge, null);
  assert.equal(varslede.length, 0);
});

test("opprettUtfordring avviser en øvelse brukeren ikke har tilgang til", async () => {
  ovelseTilgjengelig = false;
  const { opprettUtfordring } = await actions();
  await assert.rejects(() => opprettUtfordring({ name: "Privat øvelse", drillId: "annens-ovelse" }), /Øvelsesbanken/);
  assert.equal(opprettetChallenge, null);
});

test("bliMed avviser en spiller som verken eier eller er valgt", async () => {
  erDeltaker = false;
  const { bliMed } = await actions();
  await assert.rejects(() => bliMed("utfordring-1"), /finnes ikke/);
});

test("opprettUtfordring godtar gruppemedlem og varsler", async () => {
  egneMedlemskap = [
    { groupId: "gruppe-1", userId: EIER.id, endedAt: null },
    { groupId: "gruppe-1", userId: "gruppemedlem-1", endedAt: null },
  ];

  const { opprettUtfordring } = await actions();
  await assert.rejects(
    () => opprettUtfordring({ name: "Puttekonkurranse", deltakerIds: ["gruppemedlem-1"] }),
    /REDIRECT:\/portal\/utfordringer\/utfordring-1/,
  );

  assert.ok(opprettetChallenge);
  const deltakere = (opprettetChallenge!.participants as { create: { userId: string }[] }).create;
  assert.deepEqual(
    deltakere.map((d) => d.userId).sort(),
    [EIER.id, "gruppemedlem-1"].sort(),
  );
  assert.deepEqual(varslede, ["gruppemedlem-1"]);
});

test("opprettUtfordring bruker øvelsens retning når den er satt, ignorerer klientvalg", async () => {
  ovelseHigherIsBetter = false; // lavest vinner (f.eks. antall putter)

  const { opprettUtfordring } = await actions();
  await assert.rejects(() =>
    opprettUtfordring({ name: "Færrest putter", drillId: "ovelse-1", higherIsBetter: true }),
  );

  assert.equal(opprettetChallenge?.higherIsBetter, false);
});

test("opprettUtfordring lar brukeren velge retning når øvelsen ikke definerer den", async () => {
  const { opprettUtfordring } = await actions();
  await assert.rejects(() => opprettUtfordring({ name: "Fri utfordring", higherIsBetter: false }));

  assert.equal(opprettetChallenge?.higherIsBetter, false);
});

test("registrerScore rangerer stigende når higherIsBetter er false", async () => {
  utfordringHigherIsBetter = false;
  deltakerRader = [
    { id: "p-hoy", score: 74 },
    { id: "p-lav", score: 52 },
    { id: "p-midt", score: 61 },
  ];

  const { registrerScore } = await actions();
  await registrerScore("utfordring-1", 52, null);

  assert.equal(sisteRankOrder, "asc");
  const rank = Object.fromEntries(oppdaterteRanker.map((r) => [r.id, r.rank]));
  assert.equal(rank["p-lav"], 1);
  assert.equal(rank["p-midt"], 2);
  assert.equal(rank["p-hoy"], 3);
});
