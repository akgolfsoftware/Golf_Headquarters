/**
 * R-I: admin/tournaments/ny/actions.ts. Turneringer er en delt admin-
 * ressurs uten per-coach eierskap (samme mønster som `tournaments/
 * actions.ts`) — vernet er rollegrensen alene. Testen dekker rollegrensen
 * pluss zod-krysssjekkene i `ny_turnering_schema` (sluttdato før startdato,
 * påmeldingsfrist etter startdato) og at wizard-feltene som ikke har egne
 * Tournament-kolonner pakkes riktig inn i `notes`-JSON-blobben.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "coach-a",
  role: "COACH",
  name: "Coach A",
};

let tournamentCreates: Array<{ name: string; format: string; notes: string }> = [];
let auditWrites: Array<{ action: string }> = [];

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  tournamentCreates = [];
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
    audit: async (input: { action: string }) => {
      auditWrites.push(input);
    },
  },
});
const prismaMock: Record<string, unknown> = {};
mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });
Object.assign(prismaMock, {
  tournament: {
    create: async ({ data }: { data: { name: string; format: string; notes: string } }) => {
      tournamentCreates.push(data);
      return { id: "turnering-ny", name: data.name };
    },
  },
});

async function actions() {
  return import("./actions");
}

const gyldigTurnering = {
  type: "INTERN",
  name: "Klubbmesterskap",
  startDate: "2026-10-01",
  format: "STROKE",
};

test.beforeEach(() => {
  nullstill();
});

test("createTournament avviser PLAYER uten å opprette turnering", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { createTournament } = await actions();
  await assert.rejects(() => createTournament(gyldigTurnering));
  assert.equal(tournamentCreates.length, 0);
});

test("createTournament avviser uinnlogget uten å opprette turnering", async () => {
  bruker = null;
  const { createTournament } = await actions();
  await assert.rejects(() => createTournament(gyldigTurnering));
  assert.equal(tournamentCreates.length, 0);
});

test("createTournament avviser manglende påkrevde felt med fieldErrors", async () => {
  const { createTournament } = await actions();
  const svar = await createTournament({ name: "A" });
  assert.equal(svar.ok, false);
  if (!svar.ok) assert.ok(svar.fieldErrors);
  assert.equal(tournamentCreates.length, 0);
});

test("createTournament avviser sluttdato før startdato", async () => {
  const { createTournament } = await actions();
  const svar = await createTournament({ ...gyldigTurnering, endDate: "2026-09-01" });
  assert.equal(svar.ok, false);
  if (!svar.ok) assert.ok(svar.fieldErrors?.endDate);
  assert.equal(tournamentCreates.length, 0);
});

test("createTournament avviser påmeldingsfrist etter startdato", async () => {
  const { createTournament } = await actions();
  const svar = await createTournament({ ...gyldigTurnering, registrationDeadline: "2026-10-05" });
  assert.equal(svar.ok, false);
  if (!svar.ok) assert.ok(svar.fieldErrors?.registrationDeadline);
  assert.equal(tournamentCreates.length, 0);
});

test("createTournament oppretter turnering for COACH med default-verdier i notes", async () => {
  const { createTournament } = await actions();
  const svar = await createTournament(gyldigTurnering);
  assert.equal(svar.ok, true);
  assert.equal(tournamentCreates.length, 1);
  const meta = JSON.parse(tournamentCreates[0]?.notes ?? "{}");
  assert.equal(meta.rounds, 2);
  assert.equal(meta.maxParticipants, 36);
  assert.equal(meta.feeOre, 0);
  assert.equal(meta.priority, "NORMAL");
  assert.equal(meta.hcpAdjust, "FULL");
  assert.equal(meta.sendInvitations, true);
  assert.equal(auditWrites.at(-1)?.action, "tournament.created");
});

test("createTournament pakker eksplisitte wizard-felt riktig inn i notes-JSON", async () => {
  const { createTournament } = await actions();
  await createTournament({
    ...gyldigTurnering,
    rounds: 4,
    maxParticipants: 60,
    feeOre: 25000,
    priority: "MAJOR",
    manualVenue: "Fredrikstad GK",
    teeOptions: ["Gul", "Rød"],
  });
  const meta = JSON.parse(tournamentCreates[0]?.notes ?? "{}");
  assert.equal(meta.rounds, 4);
  assert.equal(meta.maxParticipants, 60);
  assert.equal(meta.feeOre, 25000);
  assert.equal(meta.priority, "MAJOR");
  assert.equal(meta.manualVenue, "Fredrikstad GK");
  assert.deepEqual(meta.teeOptions, ["Gul", "Rød"]);
});
