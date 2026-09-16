/**
 * R-I: admin/(legacy)/klubb/innstillinger/actions.ts. Alle fire handlinger
 * er ADMIN-only — tre via `requireAdminActionUser`, én (`lagreClubSettings`)
 * via `requirePortalUser({allow:["ADMIN"]})`. Ingen av dem tillater COACH.
 * Testen dekker at COACH/PLAYER/uinnlogget avvises for alle fire uten
 * skriving, pluss `lagreClubSettings` sin upsert-logikk (oppdater
 * eksisterende singleton-rad, eller opprett hvis ingen finnes) og at tomme
 * tekstfelt lagres som `null`, ikke tomme strenger.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "admin-a",
  role: "ADMIN",
  name: "Admin A",
};

let locationCreates: unknown[] = [];
let locationUpdates: Array<{ id: string; data: unknown }> = [];
let clubSettingsCreates: unknown[] = [];
let clubSettingsUpdates: Array<{ id: string; data: unknown }> = [];
let eksisterendeClubSettings: { id: string } | null = null;
let auditWrites: Array<{ action: string; target: string }> = [];

function nullstill() {
  bruker = { id: "admin-a", role: "ADMIN", name: "Admin A" };
  locationCreates = [];
  locationUpdates = [];
  clubSettingsCreates = [];
  clubSettingsUpdates = [];
  eksisterendeClubSettings = null;
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
mock.module("@/lib/audit", {
  namedExports: {
    audit: async (input: { action: string; target: string }) => {
      auditWrites.push(input);
    },
  },
});
const JSON_NULL_SENTINEL = { __jsonNull: true };
mock.module("@/generated/prisma/client", {
  namedExports: {
    Prisma: { JsonNull: JSON_NULL_SENTINEL },
  },
});
const prismaMock: Record<string, unknown> = {};
mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });
Object.assign(prismaMock, {
  location: {
    create: async ({ data }: { data: unknown }) => {
      locationCreates.push(data);
      return { id: "sted-ny" };
    },
    update: async ({ where, data }: { where: { id: string }; data: unknown }) => {
      locationUpdates.push({ id: where.id, data });
      return { id: where.id };
    },
  },
  clubSettings: {
    findFirst: async () => eksisterendeClubSettings,
    create: async ({ data }: { data: unknown }) => {
      clubSettingsCreates.push(data);
      return { id: "settings-ny" };
    },
    update: async ({ where, data }: { where: { id: string }; data: unknown }) => {
      clubSettingsUpdates.push({ id: where.id, data });
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

test("addClub avviser COACH uten å opprette lokasjon", async () => {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  const { addClub } = await actions();
  await assert.rejects(() => addClub({ name: "Ny klubb", address: "Adresse 1", active: true }));
  assert.equal(locationCreates.length, 0);
});

test("addClub avviser PLAYER uten å opprette lokasjon", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { addClub } = await actions();
  await assert.rejects(() => addClub({ name: "Ny klubb", address: "Adresse 1", active: true }));
  assert.equal(locationCreates.length, 0);
});

test("addClub avviser uinnlogget uten å opprette lokasjon", async () => {
  bruker = null;
  const { addClub } = await actions();
  await assert.rejects(() => addClub({ name: "Ny klubb", address: "Adresse 1", active: true }));
  assert.equal(locationCreates.length, 0);
});

test("addClub oppretter lokasjon for ADMIN", async () => {
  const { addClub } = await actions();
  await addClub({ name: "Ny klubb", address: "Adresse 1", active: true });
  assert.equal(locationCreates.length, 1);
  assert.equal(auditWrites.at(-1)?.action, "club.created");
});

test("addClub avviser for kort navn (zod)", async () => {
  const { addClub } = await actions();
  await assert.rejects(() => addClub({ name: "A", address: "Adresse 1", active: true }));
  assert.equal(locationCreates.length, 0);
});

test("updateClubSettings avviser COACH uten å skrive", async () => {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  const { updateClubSettings } = await actions();
  await assert.rejects(() =>
    updateClubSettings("sted-a", { name: "Endret", address: "Adresse 1", active: true }),
  );
  assert.equal(locationUpdates.length, 0);
});

test("updateClubSettings avviser uinnlogget uten å skrive", async () => {
  bruker = null;
  const { updateClubSettings } = await actions();
  await assert.rejects(() =>
    updateClubSettings("sted-a", { name: "Endret", address: "Adresse 1", active: true }),
  );
  assert.equal(locationUpdates.length, 0);
});

test("updateClubSettings oppdaterer for ADMIN med audit-metadata", async () => {
  const { updateClubSettings } = await actions();
  await updateClubSettings("sted-a", {
    name: "Endret", address: "Adresse 1", active: true,
    daglig_leder_email: "leder@example.com",
  });
  assert.equal(locationUpdates.length, 1);
  assert.equal(auditWrites.at(-1)?.action, "club.settings.updated");
});

test("lagreClubSettings avviser COACH uten å skrive", async () => {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  const { lagreClubSettings } = await actions();
  await assert.rejects(() => lagreClubSettings({ clubName: "Klubb" }));
  assert.equal(clubSettingsCreates.length, 0);
  assert.equal(clubSettingsUpdates.length, 0);
});

test("lagreClubSettings avviser uinnlogget uten å skrive", async () => {
  bruker = null;
  const { lagreClubSettings } = await actions();
  await assert.rejects(() => lagreClubSettings({ clubName: "Klubb" }));
  assert.equal(clubSettingsCreates.length, 0);
});

test("lagreClubSettings oppretter singleton-rad når ingen finnes fra før", async () => {
  eksisterendeClubSettings = null;
  const { lagreClubSettings } = await actions();
  await lagreClubSettings({ clubName: "Klubb", epost: "post@example.com" });
  assert.equal(clubSettingsCreates.length, 1);
  assert.equal(clubSettingsUpdates.length, 0);
});

test("lagreClubSettings oppdaterer eksisterende singleton-rad i stedet for å opprette ny", async () => {
  eksisterendeClubSettings = { id: "settings-eksisterende" };
  const { lagreClubSettings } = await actions();
  await lagreClubSettings({ clubName: "Klubb" });
  assert.equal(clubSettingsUpdates.length, 1);
  assert.equal(clubSettingsUpdates[0]?.id, "settings-eksisterende");
  assert.equal(clubSettingsCreates.length, 0);
});

test("lagreClubSettings lagrer tomme tekstfelt som null, ikke tom streng", async () => {
  eksisterendeClubSettings = { id: "settings-eksisterende" };
  const { lagreClubSettings } = await actions();
  await lagreClubSettings({ clubName: "", dagligLeder: "  " });
  const data = clubSettingsUpdates[0]?.data as { clubName: string | null; dagligLeder: string | null };
  assert.equal(data.clubName, null);
  assert.equal(data.dagligLeder, null);
});

test("removeClub avviser COACH uten å deaktivere", async () => {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  const { removeClub } = await actions();
  await assert.rejects(() => removeClub("sted-a"));
  assert.equal(locationUpdates.length, 0);
});

test("removeClub avviser uinnlogget uten å deaktivere", async () => {
  bruker = null;
  const { removeClub } = await actions();
  await assert.rejects(() => removeClub("sted-a"));
  assert.equal(locationUpdates.length, 0);
});

test("removeClub deaktiverer (soft-delete) lokasjon for ADMIN", async () => {
  const { removeClub } = await actions();
  await removeClub("sted-a");
  assert.equal(locationUpdates.length, 1);
  assert.equal((locationUpdates[0]?.data as { active: boolean }).active, false);
  assert.equal(auditWrites.at(-1)?.action, "club.deactivated");
});
