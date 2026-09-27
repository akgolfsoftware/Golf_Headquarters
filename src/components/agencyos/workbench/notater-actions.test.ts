/**
 * R-I: kaller de eksporterte coach-notat-handlingene. Rolle alene er ikke nok.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

let bruker = { id: "coach-a", role: "COACH" as const };
let tillatteSpillere = new Set<string>(["spiller-a"]);
let created: Array<Record<string, unknown>> = [];
let listed = 0;
const notater: Record<string, { id: string; coachId: string; playerId: string }> = {
  "notat-1": { id: "notat-1", coachId: "coach-a", playerId: "spiller-a" },
  "notat-fremmed": { id: "notat-fremmed", coachId: "coach-a", playerId: "spiller-b" },
};

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("next/navigation", {
  namedExports: {
    redirect: (to: string) => {
      throw new Error(`REDIRECT:${to}`);
    },
  },
});
mock.module("@/lib/auth/requirePortalUser", {
  namedExports: {
    requirePortalUser: async () => {
      if (bruker.role !== "COACH" && bruker.role !== "ADMIN") {
        throw new Error(`REDIRECT:/portal`);
      }
      return bruker;
    },
  },
});
mock.module("@/lib/auth/coached", {
  namedExports: {
    harCoachTilgangTilSpiller: async (_viewer: unknown, playerId: string) =>
      tillatteSpillere.has(playerId),
  },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      coachNote: {
        create: async ({ data }: { data: Record<string, unknown> }) => {
          created.push(data);
          return { id: "ny" };
        },
        findUnique: async ({ where }: { where: { id: string } }) => notater[where.id] ?? null,
        findMany: async () => {
          listed += 1;
          return [];
        },
        update: async () => ({}),
        delete: async () => ({}),
      },
    },
  },
});

async function actions() {
  return import("./notater-actions");
}

test.beforeEach(() => {
  bruker = { id: "coach-a", role: "COACH" };
  tillatteSpillere = new Set(["spiller-a"]);
  created = [];
  listed = 0;
});

test("opprettCoachNotat avviser spiller utenfor stallen og skriver ingenting", async () => {
  const { opprettCoachNotat } = await actions();
  await assert.rejects(
    () =>
      opprettCoachNotat({
        playerId: "spiller-b",
        content: "Hemmelig notat om fremmed spiller",
        tags: [],
        isPrivate: true,
      }),
    /Ikke tillatt/,
  );
  assert.equal(created.length, 0);
});

test("opprettCoachNotat skriver når coachen har tilgang til spilleren", async () => {
  const { opprettCoachNotat } = await actions();
  const svar = await opprettCoachNotat({
    playerId: "spiller-a",
    content: "Tillatt notat",
    tags: [],
    isPrivate: true,
  });
  assert.equal(svar.ok, true);
  assert.equal(created.length, 1);
  assert.equal(created[0]?.playerId, "spiller-a");
  assert.equal(created[0]?.coachId, "coach-a");
});

test("hentCoachNotater leser ingenting for spiller utenfor stallen", async () => {
  const { hentCoachNotater } = await actions();
  const rader = await hentCoachNotater("spiller-b");
  assert.deepEqual(rader, []);
  assert.equal(listed, 0);
});

test("slettCoachNotat avviser notat knyttet til spiller utenfor stallen", async () => {
  const { slettCoachNotat } = await actions();
  await assert.rejects(() => slettCoachNotat("notat-fremmed"), /Ikke tillatt/);
});
