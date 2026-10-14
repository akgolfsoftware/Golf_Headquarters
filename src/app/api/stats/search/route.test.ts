/**
 * TA-06: det åpne søket skal aldri levere Data Golf-tall (PgaPlayerSeason:
 * SG, Data Golf-ID) til uinnloggede, spillere eller foreldre. Bare coach og
 * admin får dem (Anders 09.10.2026). Ingen ekte database brukes.
 */
import { mock, test } from "node:test";
import assert from "node:assert/strict";

type Rolle = "COACH" | "ADMIN" | "PLAYER" | "PARENT";
let bruker: { id: string; role: Rolle } | null = null;
let pgaKall = 0;

const PGA_RAD = { playerName: "Viktor Hovland", sgTotal: 1.42, dgPlayerId: 18417 };

mock.module("next/navigation", {
  namedExports: {
    redirect: (til: string) => {
      throw new Error(`uventet redirect:${til}`);
    },
  },
});
mock.module("@/lib/auth/getCurrentUser", {
  namedExports: { getCurrentUserRaw: async () => bruker },
});
mock.module("@/lib/rate-limit", {
  namedExports: { rateLimit: async () => ({ ok: true, resetAt: 0 }) },
});
mock.module("@/lib/security/same-origin", {
  namedExports: { getClientIp: () => "127.0.0.1" },
});
mock.module("@/lib/stats/offentlig-spiller", {
  namedExports: { offentligSpillerFilter: () => ({}) },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      publicPlayer: { findMany: async () => [] },
      tournament: { findMany: async () => [] },
      pgaPlayerSeason: {
        findMany: async () => {
          pgaKall++;
          return [PGA_RAD];
        },
      },
    },
  },
});

async function sok(): Promise<{ pgaSpillere: unknown[] }> {
  const { GET } = await import("./route");
  const { NextRequest } = await import("next/server");
  const res = await GET(new NextRequest("http://localhost/api/stats/search?q=hovland"));
  return (await res.json()) as { pgaSpillere: unknown[] };
}

test("uinnlogget får ingen Data Golf-felt, og basen spørres ikke", async () => {
  bruker = null;
  pgaKall = 0;
  const svar = await sok();
  assert.deepEqual(svar.pgaSpillere, []);
  assert.equal(pgaKall, 0);
  assert.ok(!JSON.stringify(svar).includes("sgTotal"));
  assert.ok(!JSON.stringify(svar).includes("dgPlayerId"));
});

test("spiller og forelder får ingen Data Golf-felt", async () => {
  for (const role of ["PLAYER", "PARENT"] as const) {
    bruker = { id: "u1", role };
    pgaKall = 0;
    const svar = await sok();
    assert.deepEqual(svar.pgaSpillere, []);
    assert.equal(pgaKall, 0);
  }
});

test("coach og admin får PGA-spillerne med SG", async () => {
  for (const role of ["COACH", "ADMIN"] as const) {
    bruker = { id: "c1", role };
    const svar = await sok();
    assert.deepEqual(svar.pgaSpillere, [PGA_RAD]);
  }
});
