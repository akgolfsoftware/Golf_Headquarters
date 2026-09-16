/**
 * R-I: admin/settings/tilgang/actions.ts. Per-trener capability-override
 * (G6) er ADMIN-only (`requireAdminActionUser`) — COACH skal ikke kunne
 * endre egen eller andres tilgang, ikke engang til seg selv. Guarden
 * returnerer `{ok:false}` (fanget try/catch) i stedet for å kaste, så testen
 * sjekker svaret, ikke `assert.rejects`.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "admin-a",
  role: "ADMIN",
  name: "Admin A",
};

const coaches: Record<string, { id: string; name: string; role: string; deletedAt: Date | null }> = {
  "coach-b": { id: "coach-b", name: "Coach B", role: "COACH", deletedAt: null },
};

let overrideDeletes: Array<{ userId: string; capability: string }> = [];
let overrideUpserts: Array<{ userId: string; capability: string; mode: string; grantedById: string }> = [];
let auditWrites: Array<{ action: string; target: string }> = [];

function nullstill() {
  bruker = { id: "admin-a", role: "ADMIN", name: "Admin A" };
  overrideDeletes = [];
  overrideUpserts = [];
  auditWrites = [];
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
    audit: async (input: { action: string; target: string }) => {
      auditWrites.push(input);
    },
  },
});
const prismaMock: Record<string, unknown> = {};
mock.module("@/lib/prisma", {
  namedExports: { prisma: prismaMock },
});
Object.assign(prismaMock, {
  user: {
    findFirst: async ({ where }: { where: { id: string } }) => coaches[where.id] ?? null,
  },
  userCapability: {
    deleteMany: async ({ where }: { where: { userId: string; capability: string } }) => {
      overrideDeletes.push(where);
      return { count: 1 };
    },
    upsert: async ({ create }: { create: { userId: string; capability: string; mode: string; grantedById: string } }) => {
      overrideUpserts.push(create);
      return create;
    },
  },
});

async function actions() {
  return import("./actions");
}

test.beforeEach(() => {
  nullstill();
});

test("settCapabilityOverride avviser COACH med ok:false, ingen skriving", async () => {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  const { settCapabilityOverride } = await actions();
  const svar = await settCapabilityOverride({
    coachId: "coach-b",
    capability: "view_finance",
    aktivert: true,
  });
  assert.equal(svar.ok, false);
  assert.equal(overrideUpserts.length, 0);
  assert.equal(overrideDeletes.length, 0);
  assert.equal(auditWrites.length, 0);
});

test("settCapabilityOverride avviser PLAYER med ok:false, ingen skriving", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { settCapabilityOverride } = await actions();
  const svar = await settCapabilityOverride({
    coachId: "coach-b",
    capability: "view_finance",
    aktivert: true,
  });
  assert.equal(svar.ok, false);
  assert.equal(overrideUpserts.length, 0);
});

test("settCapabilityOverride avviser uinnlogget med ok:false, ingen skriving", async () => {
  bruker = null;
  const { settCapabilityOverride } = await actions();
  const svar = await settCapabilityOverride({
    coachId: "coach-b",
    capability: "view_finance",
    aktivert: true,
  });
  assert.equal(svar.ok, false);
  assert.equal(overrideUpserts.length, 0);
});

test("settCapabilityOverride GRANTer for ADMIN utover coach-defaulten", async () => {
  const { settCapabilityOverride } = await actions();
  const svar = await settCapabilityOverride({
    coachId: "coach-b",
    capability: "view_finance", // ikke i COACH-defaulten
    aktivert: true,
  });
  assert.equal(svar.ok, true);
  if (svar.ok) assert.equal(svar.override, "GRANT");
  assert.equal(overrideUpserts[0]?.mode, "GRANT");
  assert.equal(overrideUpserts[0]?.userId, "coach-b");
  assert.equal(auditWrites.at(-1)?.action, "user.capability_override");
});

test("settCapabilityOverride REVOKEer for ADMIN en default-capability", async () => {
  const { settCapabilityOverride } = await actions();
  const svar = await settCapabilityOverride({
    coachId: "coach-b",
    capability: "manage_tests", // i COACH-defaulten
    aktivert: false,
  });
  assert.equal(svar.ok, true);
  if (svar.ok) assert.equal(svar.override, "REVOKE");
  assert.equal(overrideUpserts[0]?.mode, "REVOKE");
});

test("settCapabilityOverride fjerner override når ønsket tilstand matcher default", async () => {
  const { settCapabilityOverride } = await actions();
  const svar = await settCapabilityOverride({
    coachId: "coach-b",
    capability: "manage_tests", // i COACH-defaulten, aktivert=true = default
    aktivert: true,
  });
  assert.equal(svar.ok, true);
  if (svar.ok) assert.equal(svar.override, null);
  assert.equal(overrideDeletes.length, 1);
  assert.equal(overrideUpserts.length, 0);
});

test("settCapabilityOverride avviser ukjent coachId uten å skrive", async () => {
  const { settCapabilityOverride } = await actions();
  const svar = await settCapabilityOverride({
    coachId: "finnes-ikke",
    capability: "view_finance",
    aktivert: true,
  });
  assert.equal(svar.ok, false);
  assert.equal(overrideUpserts.length, 0);
});
