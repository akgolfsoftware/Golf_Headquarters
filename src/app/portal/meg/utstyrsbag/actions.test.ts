/**
 * R-I: utstyrsbag skrives bare for innlogget bruker. Forelder avvises.
 * Ingen userId-parameter — klienten kan ikke treffe en annen spiller.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

let bruker = { id: "spiller-a", role: "PLAYER" as string };
let skrevet: Array<{ where: { userId: string }; create: { userId: string; driver: string | null } }> =
  [];

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/audit", { namedExports: { audit: async () => undefined } });
mock.module("@/lib/auth/requirePortalUser", {
  namedExports: {
    requirePortalUser: async ({ allow }: { allow?: string | string[] } = {}) => {
      const tillatt = allow ? (Array.isArray(allow) ? allow : [allow]) : null;
      if (tillatt && !tillatt.includes(bruker.role)) {
        throw new Error(`REDIRECT:${bruker.role === "PARENT" ? "/forelder" : "/portal"}`);
      }
      return bruker;
    },
  },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      equipmentBag: {
        upsert: async (args: {
          where: { userId: string };
          create: { userId: string; driver: string | null };
        }) => {
          skrevet.push(args);
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
  bruker = { id: "spiller-a", role: "PLAYER" };
  skrevet = [];
});

test("lagreUtstyrsbag avviser forelder uten skriving", async () => {
  bruker = { id: "forelder-a", role: "PARENT" };
  const { lagreUtstyrsbag } = await actions();
  await assert.rejects(() => lagreUtstyrsbag({ driver: "X" }), /REDIRECT:\/forelder/);
  assert.equal(skrevet.length, 0);
});

test("lagreUtstyrsbag lagrer mot innlogget bruker, ikke et klient-id-felt", async () => {
  const { lagreUtstyrsbag } = await actions();
  await lagreUtstyrsbag({ driver: "  TaylorMade  " });
  assert.equal(skrevet.length, 1);
  assert.equal(skrevet[0]?.where.userId, "spiller-a");
  assert.equal(skrevet[0]?.create.userId, "spiller-a");
  assert.equal(skrevet[0]?.create.driver, "TaylorMade");
});

test("lagreUtstyrsbag avviser felt over 200 tegn uten skriving", async () => {
  const { lagreUtstyrsbag } = await actions();
  await assert.rejects(() => lagreUtstyrsbag({ notes: "x".repeat(201) }));
  assert.equal(skrevet.length, 0);
});
