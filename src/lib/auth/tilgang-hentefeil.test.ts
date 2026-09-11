import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";
import { TilgangHentefeil, erTilgangHentefeil } from "./tilgang-hentefeil";

mock.module("next/navigation", {
  namedExports: {
    redirect: (to: string) => {
      throw new Error(`REDIRECT:${to}`);
    },
  },
});

mock.module("@/lib/supabase/server", {
  namedExports: {
    createClient: async () => ({
      auth: { getUser: async () => ({ data: { user: null } }) },
    }),
  },
});

mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      user: { findUnique: async () => null, update: async () => null },
      subscription: { findUnique: async () => null },
      groupMember: { count: async () => 0 },
    },
  },
});

describe("TilgangHentefeil", () => {
  it("kjenner igjen typed feil, ikke vanlige Error", () => {
    assert.equal(erTilgangHentefeil(new TilgangHentefeil()), true);
    assert.equal(erTilgangHentefeil(new Error("db nede")), false);
  });

  it("null-rad er «finnes ikke», avvist spørring er hentefeil", async () => {
    const { lastTilgangsRader } = await import("./getCurrentUser");
    const ok = await lastTilgangsRader(
      {
        subscription: { findUnique: async () => null },
        groupMember: { count: async () => 0 },
      },
      "u-1",
    );
    assert.equal(ok.coaching, null);
    assert.equal(ok.playerhq, null);
    assert.equal(ok.akGruppeCount, 0);

    await assert.rejects(
      () =>
        lastTilgangsRader(
          {
            subscription: {
              findUnique: async () => {
                throw new Error("connect ECONNREFUSED");
              },
            },
            groupMember: { count: async () => 0 },
          },
          "u-1",
        ),
      (e: unknown) => erTilgangHentefeil(e),
    );
  });
});
