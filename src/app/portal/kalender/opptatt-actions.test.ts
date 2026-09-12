/**
 * R-I fortsettelse: opptatt tid er alltid scopet til innlogget bruker.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

let bruker = { id: "spiller-a", role: "PLAYER" as const };
let updateCount = 0;
let deleteCount = 0;
let createdUserId: string | null = null;

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("next/navigation", {
  namedExports: { redirect: (to: string) => { throw new Error(`REDIRECT:${to}`); } },
});
mock.module("@/lib/auth/requirePortalUser", {
  namedExports: { requirePortalUser: async () => bruker },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      playerBusyBlock: {
        create: async ({ data }: { data: { userId: string } }) => {
          createdUserId = data.userId;
          return { id: "blokk-ny" };
        },
        updateMany: async ({ where }: { where: { userId: string } }) => {
          updateCount += 1;
          return { count: where.userId === "spiller-a" ? 1 : 0 };
        },
        deleteMany: async ({ where }: { where: { userId: string } }) => {
          deleteCount += 1;
          return { count: where.userId === "spiller-a" ? 1 : 0 };
        },
      },
    },
  },
});

const input = {
  title: "Skole",
  startAt: new Date("2026-09-14T08:00:00Z"),
  endAt: new Date("2026-09-14T10:00:00Z"),
  kind: "SKOLE" as const,
};

async function actions() {
  return import("./opptatt-actions");
}

test.beforeEach(() => {
  bruker = { id: "spiller-a", role: "PLAYER" };
  updateCount = 0;
  deleteCount = 0;
  createdUserId = null;
});

test("leggTilOpptattTid lagrer mot innlogget bruker, ikke klient-id", async () => {
  const { leggTilOpptattTid } = await actions();
  const svar = await leggTilOpptattTid(input);
  assert.equal(svar.ok, true);
  assert.equal(createdUserId, "spiller-a");
});

test("endreOpptattTid avviser andres avtale uten skriving", async () => {
  bruker = { id: "spiller-b", role: "PLAYER" };
  const { endreOpptattTid } = await actions();
  const svar = await endreOpptattTid("blokk-a", input);
  assert.equal(svar.ok, false);
  assert.equal(updateCount, 1);
});

test("slettOpptattTid avviser andres avtale", async () => {
  bruker = { id: "spiller-b", role: "PLAYER" };
  const { slettOpptattTid } = await actions();
  const svar = await slettOpptattTid("blokk-a");
  assert.equal(svar.ok, false);
  assert.equal(deleteCount, 1);
});
