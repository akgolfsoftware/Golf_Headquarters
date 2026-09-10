import { test } from "node:test";
import assert from "node:assert/strict";
import type { PrismaClient } from "@/generated/prisma/client";
import { resolvePlayer, tomResolveCache } from "./player-resolve";

test("navnelikhet overstyrer ikke forskjellig fødselsår eller land", async () => {
  for (const candidate of [{ birthYear: 2004, country: "NO" }, { birthYear: 2005, country: "SE" }]) {
    tomResolveCache();
    const db = { publicPlayer: {
      findMany: async () => [{ id: "annen", name: "Test Spiller", slug: "test-spiller", ...candidate }],
      findUnique: async () => null,
      create: async ({ data }: { data: object }) => ({ id: "ny", ...data }),
    } } as unknown as PrismaClient;
    const result = await resolvePlayer(db, { name: "Test Spiller", birthYear: 2005, country: "NO", tier: "junior" });
    assert.equal(result.created, true); assert.equal(result.player.id, "ny");
  }
});

test("ISO-varianter gjenbruker profilen; prosesscachen skiller ulike land", async () => {
  tomResolveCache();
  let lookups = 0;
  const db = { publicPlayer: {
    findMany: async () => { lookups++; return [{ id: "norsk", name: "Test Spiller", slug: "test-spiller", birthYear: 2005, country: "no" }]; },
    findUnique: async () => null,
    create: async ({ data }: { data: object }) => ({ id: "svensk", ...data }),
  } } as unknown as PrismaClient;
  assert.equal((await resolvePlayer(db, { name: "Test Spiller", birthYear: 2005, country: "NOR", tier: "junior" })).player.id, "norsk");
  assert.equal((await resolvePlayer(db, { name: "Test Spiller", birthYear: 2005, country: "NO", tier: "junior" })).player.id, "norsk");
  assert.equal((await resolvePlayer(db, { name: "Test Spiller", birthYear: 2005, country: "SE", tier: "junior" })).player.id, "svensk");
  assert.equal(lookups, 2);
});
