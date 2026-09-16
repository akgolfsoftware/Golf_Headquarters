/**
 * R-I: admin/(legacy)/availability/actions.ts. `updateSlot`/`deleteSlot`
 * har ekte per-coach eierskap (`slot.coachId !== user.id && role !== ADMIN`)
 * — en COACH kan ikke endre/slette en ANNEN coachs tilgjengelighetsvindu.
 * `addSlot` oppretter alltid på den innloggede coachens egen id, så der er
 * rollegrensen alene vernet. Testen dekker også forretningsreglene:
 * manglende ukedag/dato, sluttid før starttid, og no-dobbeltsted-vernet
 * (kan ikke være tilgjengelig på to steder samtidig, samme tidsvindu).
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "coach-a",
  role: "COACH",
  name: "Coach A",
};

const slots: Record<string, { id: string; coachId: string; locationId: string | null; weekday: number | null; date: Date | null; startTime: string; endTime: string; active: boolean }> = {
  "slot-a": { id: "slot-a", coachId: "coach-a", locationId: null, weekday: 1, date: null, startTime: "10:00", endTime: "18:00", active: true },
  "slot-b": { id: "slot-b", coachId: "coach-b", locationId: null, weekday: 1, date: null, startTime: "09:00", endTime: "17:00", active: true },
};
/** Konkurrerende vinduer på ANDRE anlegg for coach-a (no-dobbeltsted). */
let konkurrerendeAndreSteder: Array<{ startTime: string; endTime: string; locationName: string }> = [];

let slotCreates: unknown[] = [];
let slotUpdates: Array<{ id: string; data: unknown }> = [];
let slotDeletes: string[] = [];

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  konkurrerendeAndreSteder = [];
  slotCreates = [];
  slotUpdates = [];
  slotDeletes = [];
}

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/action-guards", {
  namedExports: {
    requireCoachActionUser: async () => {
      if (!bruker) throw new Error("unauthenticated");
      if (bruker.role !== "COACH" && bruker.role !== "ADMIN") throw new Error("forbidden");
      return bruker;
    },
  },
});
const prismaMock: Record<string, unknown> = {};
mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });
Object.assign(prismaMock, {
  coachAvailability: {
    findMany: async () =>
      konkurrerendeAndreSteder.map((k) => ({
        startTime: k.startTime,
        endTime: k.endTime,
        location: { name: k.locationName },
      })),
    findUnique: async ({ where }: { where: { id: string } }) => slots[where.id] ?? null,
    create: async ({ data }: { data: unknown }) => {
      slotCreates.push(data);
      return { id: "slot-ny" };
    },
    update: async ({ where, data }: { where: { id: string }; data: unknown }) => {
      slotUpdates.push({ id: where.id, data });
      return { id: where.id };
    },
    delete: async ({ where }: { where: { id: string } }) => {
      slotDeletes.push(where.id);
      return { id: where.id };
    },
  },
});

async function actions() {
  return import("./actions");
}

const gyldigSlot = { weekday: 2, startTime: "10:00", endTime: "18:00", active: true };

test.beforeEach(() => {
  nullstill();
});

test("addSlot avviser PLAYER uten å opprette vindu", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { addSlot } = await actions();
  await assert.rejects(() => addSlot(gyldigSlot));
  assert.equal(slotCreates.length, 0);
});

test("addSlot avviser uinnlogget uten å opprette vindu", async () => {
  bruker = null;
  const { addSlot } = await actions();
  await assert.rejects(() => addSlot(gyldigSlot));
  assert.equal(slotCreates.length, 0);
});

test("addSlot avviser når verken ukedag eller dato er valgt", async () => {
  const { addSlot } = await actions();
  await assert.rejects(
    () => addSlot({ startTime: "10:00", endTime: "18:00", active: true }),
    /Velg enten ukedag/,
  );
  assert.equal(slotCreates.length, 0);
});

test("addSlot avviser sluttid før eller lik starttid", async () => {
  const { addSlot } = await actions();
  await assert.rejects(
    () => addSlot({ weekday: 1, startTime: "18:00", endTime: "10:00", active: true }),
    /Sluttid må være etter starttid/,
  );
  assert.equal(slotCreates.length, 0);
});

test("addSlot avviser overlappende vindu på et annet anlegg (no-dobbeltsted)", async () => {
  konkurrerendeAndreSteder = [{ startTime: "09:00", endTime: "12:00", locationName: "Fredrikstad" }];
  const { addSlot } = await actions();
  await assert.rejects(
    () => addSlot({ ...gyldigSlot, locationId: "sted-oslo", startTime: "10:00", endTime: "14:00" }),
    /kan ikke være to steder samtidig/,
  );
  assert.equal(slotCreates.length, 0);
});

test("addSlot oppretter vindu for COACH på egen coachId", async () => {
  const { addSlot } = await actions();
  await addSlot(gyldigSlot);
  assert.equal(slotCreates.length, 1);
  assert.equal((slotCreates[0] as { coachId: string }).coachId, "coach-a");
});

test("updateSlot avviser PLAYER uten å oppdatere", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { updateSlot } = await actions();
  await assert.rejects(() => updateSlot("slot-a", gyldigSlot));
  assert.equal(slotUpdates.length, 0);
});

test("updateSlot avviser uinnlogget uten å oppdatere", async () => {
  bruker = null;
  const { updateSlot } = await actions();
  await assert.rejects(() => updateSlot("slot-a", gyldigSlot));
  assert.equal(slotUpdates.length, 0);
});

test("updateSlot avviser ukjent vindu", async () => {
  const { updateSlot } = await actions();
  await assert.rejects(() => updateSlot("finnes-ikke", gyldigSlot), /not-found/);
  assert.equal(slotUpdates.length, 0);
});

test("updateSlot avviser COACH som prøver å endre en annen coachs vindu", async () => {
  const { updateSlot } = await actions();
  await assert.rejects(() => updateSlot("slot-b", gyldigSlot), /forbidden/);
  assert.equal(slotUpdates.length, 0);
});

test("updateSlot oppdaterer eget vindu for COACH", async () => {
  const { updateSlot } = await actions();
  await updateSlot("slot-a", gyldigSlot);
  assert.equal(slotUpdates.length, 1);
  assert.equal(slotUpdates[0]?.id, "slot-a");
});

test("updateSlot lar ADMIN endre en annen coachs vindu", async () => {
  bruker = { id: "admin-a", role: "ADMIN", name: "Admin A" };
  const { updateSlot } = await actions();
  await updateSlot("slot-b", gyldigSlot);
  assert.equal(slotUpdates.length, 1);
});

test("deleteSlot avviser PLAYER uten å slette", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { deleteSlot } = await actions();
  await assert.rejects(() => deleteSlot("slot-a"));
  assert.equal(slotDeletes.length, 0);
});

test("deleteSlot avviser uinnlogget uten å slette", async () => {
  bruker = null;
  const { deleteSlot } = await actions();
  await assert.rejects(() => deleteSlot("slot-a"));
  assert.equal(slotDeletes.length, 0);
});

test("deleteSlot avviser ukjent vindu", async () => {
  const { deleteSlot } = await actions();
  await assert.rejects(() => deleteSlot("finnes-ikke"), /not-found/);
  assert.equal(slotDeletes.length, 0);
});

test("deleteSlot avviser COACH som prøver å slette en annen coachs vindu", async () => {
  const { deleteSlot } = await actions();
  await assert.rejects(() => deleteSlot("slot-b"), /forbidden/);
  assert.equal(slotDeletes.length, 0);
});

test("deleteSlot sletter eget vindu for COACH", async () => {
  const { deleteSlot } = await actions();
  await deleteSlot("slot-a");
  assert.deepEqual(slotDeletes, ["slot-a"]);
});

test("deleteSlot lar ADMIN slette en annen coachs vindu", async () => {
  bruker = { id: "admin-a", role: "ADMIN", name: "Admin A" };
  const { deleteSlot } = await actions();
  await deleteSlot("slot-b");
  assert.deepEqual(slotDeletes, ["slot-b"]);
});
