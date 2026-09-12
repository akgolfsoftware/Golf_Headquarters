/**
 * R-J/R-I: manuell helselogg skrives ikke uten gyldig samtykke.
 * Forelder avvises før skriving.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

let bruker = { id: "spiller-a", role: "PLAYER" as "PLAYER" | "PARENT" | "COACH" | "ADMIN" };
let samtykkeOk = true;
let skrevet: unknown[] = [];

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
    requirePortalUser: async (options: { allow?: string | string[] } = {}) => {
      const allow = options.allow
        ? Array.isArray(options.allow)
          ? options.allow
          : [options.allow]
        : null;
      if (allow && !allow.includes(bruker.role)) {
        throw new Error(`REDIRECT:${bruker.role === "PARENT" ? "/forelder" : "/portal"}`);
      }
      return bruker;
    },
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
  bruker = { id: "spiller-a", role: "PLAYER" };
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

test("lagreHelseEntry avviser forelder før skriving", async () => {
  bruker = { id: "forelder-a", role: "PARENT" };
  const { lagreHelseEntry } = await actions();
  await assert.rejects(
    () => lagreHelseEntry({ date: "2026-09-13", restingHr: 48 }),
    /REDIRECT:\/forelder/,
  );
  assert.equal(skrevet.length, 0);
});
