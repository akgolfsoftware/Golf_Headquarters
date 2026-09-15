/**
 * R-I: admin/(legacy)/anlegg/location-actions.ts. Anlegg (lokasjoner og
 * fasiliteter) er klubbfelles innstillinger uten per-coach eierskap, så
 * vernet er rollegrensen alene — hver av de 6 mutasjonene skal avvise
 * PLAYER (og uinnlogget) uten å skrive noe, og fortsatt slippe COACH gjennom.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "coach-a",
  role: "COACH",
  name: "Coach A",
};

let locationCreates: unknown[] = [];
let locationUpdates: unknown[] = [];
let facilityCreates: unknown[] = [];
let facilityUpdates: unknown[] = [];
let auditWrites: Array<{ action: string; target: string }> = [];

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  locationCreates = [];
  locationUpdates = [];
  facilityCreates = [];
  facilityUpdates = [];
  auditWrites = [];
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
mock.module("@/lib/audit", {
  namedExports: {
    audit: async (input: { action: string; target: string }) => {
      auditWrites.push({ action: input.action, target: input.target });
    },
  },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      location: {
        create: async ({ data }: { data: unknown }) => {
          locationCreates.push(data);
          return { id: "ny-lokasjon" };
        },
        update: async ({ where, data }: { where: { id: string }; data: unknown }) => {
          locationUpdates.push({ id: where.id, data });
          return { id: where.id };
        },
      },
      facility: {
        create: async ({ data }: { data: unknown }) => {
          facilityCreates.push(data);
          return { id: "ny-fasilitet" };
        },
        update: async ({ where, data }: { where: { id: string }; data: unknown }) => {
          facilityUpdates.push({ id: where.id, data });
          return { id: where.id };
        },
      },
    },
  },
});

const lokasjonInput = { name: "Range", address: "Golfveien 1", active: true, latitude: null, longitude: null };
const fasilitetInput = { name: "Simulator 1", capacity: 4, active: true, type: "STUDIO" as const, description: null };

async function actions() {
  return import("./location-actions");
}

test.beforeEach(() => {
  nullstill();
});

test("createLocation avviser PLAYER uten å opprette lokasjon", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { createLocation } = await actions();
  await assert.rejects(() => createLocation(lokasjonInput));
  assert.equal(locationCreates.length, 0);
});

test("createLocation avviser uinnlogget uten å opprette lokasjon", async () => {
  bruker = null;
  const { createLocation } = await actions();
  await assert.rejects(() => createLocation(lokasjonInput));
  assert.equal(locationCreates.length, 0);
});

test("createLocation oppretter lokasjon for COACH", async () => {
  const { createLocation } = await actions();
  await createLocation(lokasjonInput);
  assert.equal(locationCreates.length, 1);
  assert.equal(auditWrites.at(-1)?.action, "location.created");
});

test("updateLocation avviser PLAYER uten å oppdatere lokasjon", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { updateLocation } = await actions();
  await assert.rejects(() => updateLocation("lok-a", lokasjonInput));
  assert.equal(locationUpdates.length, 0);
});

test("setLocationActive avviser PLAYER uten å endre status", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { setLocationActive } = await actions();
  await assert.rejects(() => setLocationActive("lok-a", false));
  assert.equal(locationUpdates.length, 0);
});

test("createFacility avviser PLAYER uten å opprette fasilitet", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { createFacility } = await actions();
  await assert.rejects(() => createFacility("lok-a", fasilitetInput));
  assert.equal(facilityCreates.length, 0);
});

test("updateFacility avviser PLAYER uten å oppdatere fasilitet", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { updateFacility } = await actions();
  await assert.rejects(() => updateFacility("fas-a", fasilitetInput));
  assert.equal(facilityUpdates.length, 0);
});

test("setFacilityActive avviser PLAYER uten å endre status", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { setFacilityActive } = await actions();
  await assert.rejects(() => setFacilityActive("fas-a", false));
  assert.equal(facilityUpdates.length, 0);
});

test("setFacilityActive endrer status for COACH", async () => {
  const { setFacilityActive } = await actions();
  await setFacilityActive("fas-a", false);
  assert.equal(facilityUpdates.length, 1);
  assert.equal(auditWrites.at(-1)?.action, "facility.deactivated");
});
