/**
 * R-I: admin/gdpr/actions.ts. GDPR-sletting og -avvisning er ADMIN-only
 * (`requireAdminActionUser`, ikke `requireCoachActionUser`) — dette er den
 * eneste av R-I-filene testet så langt der COACH også skal avvises, ikke bare
 * PLAYER/uinnlogget. Testen fanger regresjon der noen bytter guarden til
 * coach-nivå eller glemmer den helt.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "admin-a",
  role: "ADMIN",
  name: "Admin A",
};

const requests: Record<string, { id: string; type: "EXPORT" | "DELETE"; status: string; subjectUserId: string | null; userId: string }> = {};

let updates: Array<{ id: string; data: unknown }> = [];
let auditWrites: Array<{ actorId: string; action: string; target: string }> = [];
let anonymiserKall: string[] = [];

function nullstill() {
  bruker = { id: "admin-a", role: "ADMIN", name: "Admin A" };
  for (const k of Object.keys(requests)) delete requests[k];
  Object.assign(requests, {
    "req-delete": {
      id: "req-delete",
      type: "DELETE",
      status: "PENDING",
      subjectUserId: "spiller-a",
      userId: "forelder-a",
    },
    "req-export": {
      id: "req-export",
      type: "EXPORT",
      status: "PENDING",
      subjectUserId: "spiller-b",
      userId: "spiller-b",
    },
  });
  updates = [];
  auditWrites = [];
  anonymiserKall = [];
}

function formData(felter: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(felter)) fd.set(k, v);
  return fd;
}

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/action-guards", {
  namedExports: {
    requireAdminActionUser: async () => {
      if (!bruker) throw new Error("unauthenticated");
      if (bruker.role !== "ADMIN") throw new Error("forbidden");
      return bruker;
    },
  },
});
mock.module("@/lib/audit", {
  namedExports: {
    audit: async (input: { actorId: string; action: string; target: string }) => {
      auditWrites.push(input);
    },
  },
});
mock.module("@/lib/gdpr/anonymiser-bruker", {
  namedExports: {
    anonymiserBruker: async (subjektId: string) => {
      anonymiserKall.push(subjektId);
      return { brukerFantes: true, eksterntSlettet: { feil: [] } };
    },
  },
});
const prismaMock: Record<string, unknown> = {};
mock.module("@/lib/prisma", {
  namedExports: { prisma: prismaMock },
});
Object.assign(prismaMock, {
  dataExportRequest: {
    findUnique: async ({ where }: { where: { id: string } }) => requests[where.id] ?? null,
    update: async ({ where, data }: { where: { id: string }; data: unknown }) => {
      updates.push({ id: where.id, data });
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

test("utforSletteforesporsel avviser COACH uten å anonymisere", async () => {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  const { utforSletteforesporsel } = await actions();
  await assert.rejects(() => utforSletteforesporsel(formData({ id: "req-delete" })));
  assert.equal(anonymiserKall.length, 0);
  assert.equal(updates.length, 0);
});

test("utforSletteforesporsel avviser PLAYER uten å anonymisere", async () => {
  bruker = { id: "spiller-x", role: "PLAYER", name: "Spiller X" };
  const { utforSletteforesporsel } = await actions();
  await assert.rejects(() => utforSletteforesporsel(formData({ id: "req-delete" })));
  assert.equal(anonymiserKall.length, 0);
});

test("utforSletteforesporsel avviser uinnlogget uten å anonymisere", async () => {
  bruker = null;
  const { utforSletteforesporsel } = await actions();
  await assert.rejects(() => utforSletteforesporsel(formData({ id: "req-delete" })));
  assert.equal(anonymiserKall.length, 0);
});

test("utforSletteforesporsel anonymiserer subjektet for ADMIN", async () => {
  const { utforSletteforesporsel } = await actions();
  await utforSletteforesporsel(formData({ id: "req-delete" }));
  assert.deepEqual(anonymiserKall, ["spiller-a"]);
  assert.equal(updates[0]?.id, "req-delete");
  assert.equal((updates[0]?.data as { status: string }).status, "COMPLETED");
  assert.equal(auditWrites.at(-1)?.action, "gdpr.delete.executed");
});

test("utforSletteforesporsel avviser EXPORT-forespørsel uten å anonymisere", async () => {
  const { utforSletteforesporsel } = await actions();
  await assert.rejects(() => utforSletteforesporsel(formData({ id: "req-export" })));
  assert.equal(anonymiserKall.length, 0);
});

test("avvisForesporsel avviser COACH uten å endre status", async () => {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  const { avvisForesporsel } = await actions();
  await assert.rejects(() => avvisForesporsel(formData({ id: "req-delete" })));
  assert.equal(updates.length, 0);
});

test("avvisForesporsel avviser PLAYER uten å endre status", async () => {
  bruker = { id: "spiller-x", role: "PLAYER", name: "Spiller X" };
  const { avvisForesporsel } = await actions();
  await assert.rejects(() => avvisForesporsel(formData({ id: "req-delete" })));
  assert.equal(updates.length, 0);
});

test("avvisForesporsel avviser uinnlogget uten å endre status", async () => {
  bruker = null;
  const { avvisForesporsel } = await actions();
  await assert.rejects(() => avvisForesporsel(formData({ id: "req-delete" })));
  assert.equal(updates.length, 0);
});

test("avvisForesporsel markerer REJECTED for ADMIN", async () => {
  const { avvisForesporsel } = await actions();
  await avvisForesporsel(formData({ id: "req-delete" }));
  assert.equal(updates[0]?.id, "req-delete");
  assert.equal((updates[0]?.data as { status: string }).status, "REJECTED");
  assert.equal(auditWrites.at(-1)?.action, "gdpr.request.rejected");
});

test("avvisForesporsel avviser allerede behandlet forespørsel", async () => {
  requests["req-delete"].status = "COMPLETED";
  const { avvisForesporsel } = await actions();
  await assert.rejects(() => avvisForesporsel(formData({ id: "req-delete" })));
});
