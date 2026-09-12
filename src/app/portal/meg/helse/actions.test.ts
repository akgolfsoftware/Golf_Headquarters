/**
 * R-J: manuell helselogg skrives ikke uten gyldig samtykke.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

let brukerId = "spiller-a";
let samtykkeOk = true;
let skrevet: unknown[] = [];

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/requirePortalUser", {
  namedExports: {
    requirePortalUser: async () => ({ id: brukerId, role: "PLAYER" }),
  },
});
mock.module("@/lib/health/samtykke", {
  namedExports: {
    krevManuellHelseSamtykke: async (userId: string) => {
      if (!samtykkeOk) {
        throw new Error(`helse-samtykke-mangler:${userId}`);
      }
    },
  },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      healthEntry: {
        upsert: async ({ create }: { create: unknown }) => {
          skrevet.push(create);
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
  brukerId = "spiller-a";
  samtykkeOk = true;
  skrevet = [];
});

test("lagreHelseEntry avviser uten manuell-samtykke og skriver ingenting", async () => {
  samtykkeOk = false;
  const { lagreHelseEntry } = await actions();
  await assert.rejects(
    () =>
      lagreHelseEntry({
        date: "2026-09-13",
        restingHr: 48,
      }),
    /helse-samtykke-mangler:spiller-a/,
  );
  assert.equal(skrevet.length, 0);
});

test("lagreHelseEntry lagrer på innlogget bruker når samtykke finnes", async () => {
  const { lagreHelseEntry } = await actions();
  await lagreHelseEntry({ date: "2026-09-13", sleepHours: 8 });
  assert.equal(skrevet.length, 1);
  assert.equal((skrevet[0] as { userId: string }).userId, "spiller-a");
});
