/**
 * R-I: admin/grupper/actions.ts. Gruppe-CRUD (opprett/slett/bootstrap) er
 * gated på `Capability.MANAGE_GROUPS` (G6) — i COACH-defaulten, men testen
 * dekker likevel at (1) rollegrensen (PLAYER/uinnlogget) kastes og avviser
 * skriving, og (2) en COACH der capabiliteten er eksplisitt REVOKEt
 * (override) avvises selv om rollen i seg selv er tillatt — capability-
 * gaten er reell, ikke bare et rolle-alias.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "coach-a",
  role: "COACH",
  name: "Coach A",
};

/** Simulerer effektiv MANAGE_GROUPS-tilgang (default true for COACH). */
let coachHarManageGroups = true;

const coacher: Record<string, { id: string; role: string; deletedAt: Date | null }> = {
  "coach-b": { id: "coach-b", role: "COACH", deletedAt: null },
  "slettet-coach": { id: "slettet-coach", role: "COACH", deletedAt: new Date() },
};
const grupper: Record<string, { id: string; name: string }> = {
  "gruppe-a": { id: "gruppe-a", name: "Gruppe A" },
};

let groupCreates: unknown[] = [];
let groupDeletes: string[] = [];
let auditWrites: Array<{ action: string }> = [];
let bootstrapKall = 0;
let simulerDbFeil = false;

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  coachHarManageGroups = true;
  groupCreates = [];
  groupDeletes = [];
  auditWrites = [];
  bootstrapKall = 0;
  simulerDbFeil = false;
}

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/requirePortalUser", {
  namedExports: {
    requirePortalUser: async (options: { allow?: Rolle | Rolle[] }) => {
      if (!bruker) throw new Error("NEXT_REDIRECT");
      const tillatt = Array.isArray(options.allow) ? options.allow : options.allow ? [options.allow] : undefined;
      if (tillatt && !tillatt.includes(bruker.role)) throw new Error("NEXT_REDIRECT");
      return bruker;
    },
  },
});
mock.module("@/lib/auth/effective-capabilities", {
  namedExports: {
    assertCapability: async (user: { role: Rolle }) => {
      if (user.role === "ADMIN") return;
      if (!coachHarManageGroups) throw new Error("forbidden");
    },
  },
});
mock.module("@/lib/gfgk-junior/bootstrap", {
  namedExports: {
    kjorGfgkJuniorBootstrap: async () => {
      bootstrapKall += 1;
      if (simulerDbFeil) throw new Error("db feil");
      return { grupperOpprettet: 4, okterOpprettet: 8, perioderOpprettet: 3 };
    },
  },
});
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => undefined } });
mock.module("@/lib/audit", {
  namedExports: {
    audit: async (input: { action: string }) => {
      auditWrites.push(input);
    },
  },
});
const prismaMock: Record<string, unknown> = {};
mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });
Object.assign(prismaMock, {
  user: {
    findUnique: async ({ where }: { where: { id: string } }) => coacher[where.id] ?? null,
  },
  group: {
    create: async ({ data }: { data: { name: string } }) => {
      if (simulerDbFeil) throw new Error("db feil");
      groupCreates.push(data);
      return { id: "gruppe-ny", name: data.name };
    },
    findUnique: async ({ where }: { where: { id: string } }) => grupper[where.id] ?? null,
    delete: async ({ where }: { where: { id: string } }) => {
      if (simulerDbFeil) throw new Error("db feil");
      groupDeletes.push(where.id);
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

test("createGroup avviser PLAYER uten å opprette gruppe", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { createGroup } = await actions();
  await assert.rejects(() => createGroup({ name: "Ny gruppe" }));
  assert.equal(groupCreates.length, 0);
});

test("createGroup avviser uinnlogget uten å opprette gruppe", async () => {
  bruker = null;
  const { createGroup } = await actions();
  await assert.rejects(() => createGroup({ name: "Ny gruppe" }));
  assert.equal(groupCreates.length, 0);
});

test("createGroup avviser COACH med revoket MANAGE_GROUPS", async () => {
  coachHarManageGroups = false;
  const { createGroup } = await actions();
  await assert.rejects(() => createGroup({ name: "Ny gruppe" }), /forbidden/);
  assert.equal(groupCreates.length, 0);
});

test("createGroup oppretter gruppe for COACH med MANAGE_GROUPS", async () => {
  const { createGroup } = await actions();
  const svar = await createGroup({ name: "Ny gruppe" });
  assert.ok("success" in svar && svar.success);
  assert.equal(groupCreates.length, 1);
  assert.equal(auditWrites.at(-1)?.action, "group.created");
});

test("createGroup avviser ukjent coachId med feilmelding, ingen gruppe opprettet", async () => {
  const { createGroup } = await actions();
  const svar = await createGroup({ name: "Ny gruppe", coachId: "finnes-ikke" });
  assert.ok("error" in svar);
  assert.equal(groupCreates.length, 0);
});

test("createGroup avviser myk-slettet coachId", async () => {
  const { createGroup } = await actions();
  const svar = await createGroup({ name: "Ny gruppe", coachId: "slettet-coach" });
  assert.ok("error" in svar);
  assert.equal(groupCreates.length, 0);
});

test("createGroup avviser tomt navn (zod)", async () => {
  const { createGroup } = await actions();
  const svar = await createGroup({ name: "" });
  assert.ok("error" in svar);
  assert.equal(groupCreates.length, 0);
});

test("createGroup fanger databasefeil som norsk feilmelding", async () => {
  simulerDbFeil = true;
  const { createGroup } = await actions();
  const svar = await createGroup({ name: "Ny gruppe" });
  assert.ok("error" in svar);
});

test("deleteGroup avviser PLAYER uten å slette", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { deleteGroup } = await actions();
  await assert.rejects(() => deleteGroup("gruppe-a"));
  assert.equal(groupDeletes.length, 0);
});

test("deleteGroup avviser uinnlogget uten å slette", async () => {
  bruker = null;
  const { deleteGroup } = await actions();
  await assert.rejects(() => deleteGroup("gruppe-a"));
  assert.equal(groupDeletes.length, 0);
});

test("deleteGroup avviser COACH med revoket MANAGE_GROUPS", async () => {
  coachHarManageGroups = false;
  const { deleteGroup } = await actions();
  await assert.rejects(() => deleteGroup("gruppe-a"), /forbidden/);
  assert.equal(groupDeletes.length, 0);
});

test("deleteGroup sletter gruppe for COACH med MANAGE_GROUPS", async () => {
  const { deleteGroup } = await actions();
  const svar = await deleteGroup("gruppe-a");
  assert.ok("success" in svar && svar.success);
  assert.deepEqual(groupDeletes, ["gruppe-a"]);
  assert.equal(auditWrites.at(-1)?.action, "group.deleted");
});

test("deleteGroup avviser ukjent gruppe-id", async () => {
  const { deleteGroup } = await actions();
  const svar = await deleteGroup("finnes-ikke");
  assert.ok("error" in svar);
  assert.equal(groupDeletes.length, 0);
});

test("bootstrapGfgkJuniorGrupper avviser PLAYER uten å kjøre bootstrap", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { bootstrapGfgkJuniorGrupper } = await actions();
  await assert.rejects(() => bootstrapGfgkJuniorGrupper());
  assert.equal(bootstrapKall, 0);
});

test("bootstrapGfgkJuniorGrupper avviser uinnlogget uten å kjøre bootstrap", async () => {
  bruker = null;
  const { bootstrapGfgkJuniorGrupper } = await actions();
  await assert.rejects(() => bootstrapGfgkJuniorGrupper());
  assert.equal(bootstrapKall, 0);
});

test("bootstrapGfgkJuniorGrupper avviser COACH med revoket MANAGE_GROUPS", async () => {
  coachHarManageGroups = false;
  const { bootstrapGfgkJuniorGrupper } = await actions();
  await assert.rejects(() => bootstrapGfgkJuniorGrupper(), /forbidden/);
  assert.equal(bootstrapKall, 0);
});

test("bootstrapGfgkJuniorGrupper kjører og audit-loggfører for COACH med MANAGE_GROUPS", async () => {
  const { bootstrapGfgkJuniorGrupper } = await actions();
  const svar = await bootstrapGfgkJuniorGrupper();
  assert.ok("success" in svar && svar.success);
  assert.equal(bootstrapKall, 1);
  assert.equal(auditWrites.at(-1)?.action, "group.gfgk_bootstrap");
});

test("bootstrapGfgkJuniorGrupper fanger feil fra bootstrap-kjøringen", async () => {
  simulerDbFeil = true;
  const { bootstrapGfgkJuniorGrupper } = await actions();
  const svar = await bootstrapGfgkJuniorGrupper();
  assert.ok("error" in svar);
});
