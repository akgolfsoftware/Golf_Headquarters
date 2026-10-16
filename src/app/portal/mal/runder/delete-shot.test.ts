import { before, beforeEach, describe, mock, test } from "node:test";
import assert from "node:assert/strict";

let runde: { userId: string } | null;
let slettetAntall: number;
let deleteManyArg: { where: Record<string, unknown> } | null;

const fil = (rel: string) => new URL(rel, import.meta.url).pathname;

mock.module(fil("../../../../lib/auth/requireConsentingUser.ts"), {
  namedExports: { requireConsentingUser: async () => ({ id: "u1", role: "PLAYER" }) },
});
mock.module(fil("../../../../lib/prisma.ts"), {
  namedExports: {
    prisma: {
      round: { findUnique: async () => runde, findFirst: async () => null },
      shot: {
        deleteMany: async (arg: { where: Record<string, unknown> }) => {
          deleteManyArg = arg;
          return { count: slettetAntall };
        },
        findMany: async () => [],
      },
      holeScore: { findMany: async () => [] },
    },
  },
});
mock.module(fil("../../../../lib/error-tracking.ts"), {
  namedExports: { logError: async () => undefined },
});
mock.module(fil("../../../../lib/domain/sg-reference.ts"), {
  namedExports: {
    hentSgReferanseForRunde: async () => null,
    SG_ENGINE_VERSION: "test",
  },
});
mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });

let actions: typeof import("./[id]/actions");
before(async () => {
  actions = await import("./[id]/actions");
});

describe("deleteShot — slaget må tilhøre runden (TP-05)", () => {
  beforeEach(() => {
    runde = { userId: "u1" };
    slettetAntall = 1;
    deleteManyArg = null;
  });

  test("sletter med både shotId og roundId i where", async () => {
    await actions.deleteShot("r1", "s1");
    assert.deepEqual(deleteManyArg?.where, { id: "s1", roundId: "r1" });
  });

  test("slag fra en annen runde (0 slettet) gir feil", async () => {
    slettetAntall = 0;
    await assert.rejects(() => actions.deleteShot("r1", "s-annen"), /forbidden/);
  });

  test("andres runde avvises før noe slettes", async () => {
    runde = { userId: "annen" };
    await assert.rejects(() => actions.deleteShot("r1", "s1"), /forbidden/);
    assert.equal(deleteManyArg, null);
  });
});
