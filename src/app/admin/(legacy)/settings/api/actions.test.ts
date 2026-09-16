/**
 * R-I: admin/(legacy)/settings/api/actions.ts. Sikkerhetskritisk fil (API-
 * nøkler): `createApiKey` er hardkodet ADMIN-only (ikke via
 * requireAdminActionUser, men en manuell `user.role !== "ADMIN"`-sjekk —
 * verdt å teste direkte siden mønsteret avviker fra resten av kodebasen).
 * `revokeApiKey` har en annen regel: eier ELLER ADMIN kan tilbakekalle, en
 * annen ikke-ADMIN-bruker skal avvises selv om hen er innlogget. Testen
 * verifiserer også at hemmeligheten ALDRI lagres i klartekst — kun
 * SHA-256-hashen skrives til databasen.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "admin-a",
  role: "ADMIN",
  name: "Admin A",
};

const apiKeys: Record<string, { id: string; userId: string; revokedAt: Date | null }> = {
  "key-admin-a": { id: "key-admin-a", userId: "admin-a", revokedAt: null },
  "key-coach-a": { id: "key-coach-a", userId: "coach-a", revokedAt: null },
};

let apiKeyCreates: Array<{ userId: string; name: string; hashedKey: string; prefix: string; scopes: string[] }> = [];
let apiKeyUpdates: Array<{ id: string; data: unknown }> = [];
let auditWrites: Array<{ action: string; target: string }> = [];

function nullstill() {
  bruker = { id: "admin-a", role: "ADMIN", name: "Admin A" };
  apiKeyCreates = [];
  apiKeyUpdates = [];
  auditWrites = [];
}

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/getCurrentUser", {
  namedExports: {
    getCurrentUser: async () => bruker,
  },
});
mock.module("@/lib/audit", {
  namedExports: {
    audit: async (input: { action: string; target: string }) => {
      auditWrites.push(input);
    },
  },
});
const prismaMock: Record<string, unknown> = {};
mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });
Object.assign(prismaMock, {
  apiKey: {
    create: async ({ data }: { data: { userId: string; name: string; hashedKey: string; prefix: string; scopes: string[] } }) => {
      apiKeyCreates.push(data);
      return { id: "key-ny" };
    },
    findUnique: async ({ where }: { where: { id: string } }) => apiKeys[where.id] ?? null,
    update: async ({ where, data }: { where: { id: string }; data: unknown }) => {
      apiKeyUpdates.push({ id: where.id, data });
      return { id: where.id };
    },
  },
});

async function actions() {
  return import("./actions");
}

test.beforeEach(() => {
  nullstill();
});

test("createApiKey avviser COACH med ok:false, ingen nøkkel opprettet", async () => {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  const { createApiKey } = await actions();
  await assert.rejects(() => createApiKey({ name: "Ny nøkkel", scopes: [] }), /forbidden/);
  assert.equal(apiKeyCreates.length, 0);
});

test("createApiKey avviser PLAYER uten å opprette nøkkel", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { createApiKey } = await actions();
  await assert.rejects(() => createApiKey({ name: "Ny nøkkel", scopes: [] }), /forbidden/);
  assert.equal(apiKeyCreates.length, 0);
});

test("createApiKey avviser uinnlogget uten å opprette nøkkel", async () => {
  bruker = null;
  const { createApiKey } = await actions();
  await assert.rejects(() => createApiKey({ name: "Ny nøkkel", scopes: [] }), /unauthenticated/);
  assert.equal(apiKeyCreates.length, 0);
});

test("createApiKey avviser tomt navn", async () => {
  const { createApiKey } = await actions();
  await assert.rejects(() => createApiKey({ name: "   ", scopes: [] }), /missing-name/);
  assert.equal(apiKeyCreates.length, 0);
});

test("createApiKey oppretter nøkkel for ADMIN og lagrer aldri hemmeligheten i klartekst", async () => {
  const { createApiKey } = await actions();
  const svar = await createApiKey({ name: "CI-nøkkel", scopes: ["read"] });
  assert.equal(apiKeyCreates.length, 1);
  const lagret = apiKeyCreates[0];
  assert.notEqual(lagret?.hashedKey, svar.secret);
  assert.equal(lagret?.hashedKey.length, 64); // sha256 hex
  assert.ok(svar.secret.startsWith("akg_"));
  assert.equal(svar.prefix, svar.secret.slice(0, 12));
  assert.equal(auditWrites.at(-1)?.action, "api_key.created");
});

test("revokeApiKey avviser uinnlogget uten å tilbakekalle", async () => {
  bruker = null;
  const { revokeApiKey } = await actions();
  await assert.rejects(() => revokeApiKey("key-admin-a"));
  assert.equal(apiKeyUpdates.length, 0);
});

test("revokeApiKey avviser ukjent nøkkel-id", async () => {
  const { revokeApiKey } = await actions();
  await assert.rejects(() => revokeApiKey("finnes-ikke"), /not-found/);
  assert.equal(apiKeyUpdates.length, 0);
});

test("revokeApiKey avviser en bruker som verken eier nøkkelen eller er ADMIN", async () => {
  bruker = { id: "coach-b", role: "COACH", name: "Coach B" };
  const { revokeApiKey } = await actions();
  await assert.rejects(() => revokeApiKey("key-coach-a"), /forbidden/);
  assert.equal(apiKeyUpdates.length, 0);
});

test("revokeApiKey lar eieren tilbakekalle sin egen nøkkel", async () => {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  const { revokeApiKey } = await actions();
  await revokeApiKey("key-coach-a");
  assert.equal(apiKeyUpdates.length, 1);
  assert.ok((apiKeyUpdates[0]?.data as { revokedAt: Date }).revokedAt instanceof Date);
  assert.equal(auditWrites.at(-1)?.action, "api_key.revoked");
});

test("revokeApiKey lar ADMIN tilbakekalle en annen brukers nøkkel", async () => {
  const { revokeApiKey } = await actions();
  await revokeApiKey("key-coach-a");
  assert.equal(apiKeyUpdates.length, 1);
});
