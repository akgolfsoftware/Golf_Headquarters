import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
import { Prisma } from "@/generated/prisma/client";
import { parseWeekPlanData, tommeUkeplandetaljer, UKEPLAN_TYPER } from "./ukeplan-schema";

const playerId = "syntetisk-spiller";
let viewer = { id: playerId, role: "PLAYER" };
let access = false;
let writes = 0;
let dbCalls = 0;
let row: Record<string, unknown> | null = null;
let failWrite = false;
let revision = 0;
let raceOnUpdate = false;
let raceOnCreate = false;
const invalidations: string[] = [];
const seasons = [
  { id: "egen-sesong", userId: playerId, year: 2026, startDate: new Date("2026-08-01"), endDate: new Date("2027-07-31") },
  { id: "fremmed-sesong", userId: "syntetisk-fremmed", year: 2026, startDate: new Date("2026-08-01"), endDate: new Date("2027-07-31") },
  { id: "eldre-sesong", userId: playerId, year: 2025, startDate: new Date("2025-08-01"), endDate: new Date("2026-07-31") },
];
const key = { playerId, isoYear: 2026, weekNumber: 40 };

function matches(wanted: typeof key) {
  return row !== null && row.playerId === wanted.playerId && row.isoYear === wanted.isoYear && row.weekNumber === wanted.weekNumber;
}
function write(fields: Record<string, unknown>) {
  if (failWrite) throw new Error("Syntetisk lagringsfeil");
  writes++;
  row ??= { id: "syntetisk-uke", repetitionTargets: null };
  for (const [name, value] of Object.entries(fields)) {
    if (value !== undefined) row[name] = value === Prisma.DbNull ? null : value;
  }
  row.updatedAt = new Date(Date.UTC(2026, 9, 2) + ++revision);
  return structuredClone(row);
}

mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async () => viewer } });
mock.module("@/lib/auth/coached", { namedExports: {
  harCoachTilgangTilSpiller: async () => access,
  harCoachLesetilgangTilSpiller: async () => access,
  coachScopedPlayerWhere: () => ({ id: playerId }),
} });
mock.module("@/lib/admin/stallen-data", { namedExports: { loadStallen: async () => [] } });
mock.module("next/cache", { namedExports: { revalidatePath: (path: string) => invalidations.push(path) } });
mock.module("@/lib/prisma", { namedExports: { prisma: {
  weekPlan: {
    findUnique: async ({ where }: { where: { playerId_isoYear_weekNumber: typeof key } }) => {
      dbCalls++;
      const wanted = where.playerId_isoYear_weekNumber;
      return matches(wanted) ? structuredClone(row) : null;
    },
    create: async ({ data }: { data: typeof key & Record<string, unknown> }) => {
      dbCalls++;
      if (raceOnCreate) {
        row = { ...data, id: "samtidig-uke", customNotes: "Nyere samtidig plan", planningDetails: tommeUkeplandetaljer(), updatedAt: new Date(Date.UTC(2026, 9, 2) + ++revision) };
      }
      if (matches(data)) throw new Error("Syntetisk unik nøkkel-konflikt");
      row = null;
      return write(data);
    },
    updateMany: async ({ where, data }: { where: typeof key & { updatedAt: Date }; data: Record<string, unknown> }) => {
      dbCalls++;
      if (raceOnUpdate && row) {
        row.customNotes = "Nyere samtidig plan";
        row.updatedAt = new Date(Date.UTC(2026, 9, 2) + ++revision);
      }
      if (!matches(where) || !(row?.updatedAt instanceof Date) || row.updatedAt.getTime() !== where.updatedAt.getTime()) return { count: 0 };
      write(data);
      return { count: 1 };
    },
    upsert: async ({ create, update }: { create: Record<string, unknown>; update: Record<string, unknown> }) => {
      const finnes = row && row.playerId === create.playerId && row.isoYear === create.isoYear && row.weekNumber === create.weekNumber;
      const fields = finnes ? update : create;
      if (!finnes) row = null;
      return write(fields);
    },
  },
  seasonPlan: { findFirst: async ({ where }: { where: {
    userId: string; id?: string; startDate: { lte: Date }; endDate: { gte: Date };
  } }) => {
    dbCalls++;
    return seasons.find((s) => s.userId === where.userId && (!where.id || s.id === where.id)
      && s.startDate <= where.startDate.lte && s.endDate >= where.endDate.gte) ?? null;
  } },
  workbenchSession: { findMany: async () => { dbCalls++; return []; } },
  groupSchedule: { findMany: async () => { dbCalls++; return []; } },
  workbenchTournamentPlan: { findMany: async () => { dbCalls++; return []; } },
  user: { findUnique: async () => { dbCalls++; return { schoolYear: null }; } },
  playerBusyBlock: { findMany: async () => { dbCalls++; return []; } },
} } });

let actions: typeof import("./wb-actions");
before(async () => { actions = await import("./wb-actions"); });
beforeEach(() => {
  viewer = { id: playerId, role: "PLAYER" };
  access = false; writes = 0; dbCalls = 0; row = null; failWrite = false;
  revision = 0; raceOnUpdate = false; raceOnCreate = false;
  invalidations.length = 0;
});

function load(weekStart = "2026-09-28") {
  return actions.loadWeek({ playerId, weekStart, mode: { kind: "AGENCY", subjectId: playerId, sources: ["OEKTER"] } });
}

test("spiller lagrer alle fem områder og fire uketyper; tillatt coach gjenleser samme kontrakt", async () => {
  for (const type of UKEPLAN_TYPER) {
    const planningDetails = tommeUkeplandetaljer();
    planningDetails.weekType = type.id;
    planningDetails.location = "Syntetisk treningssted";
    planningDetails.areas.FYS = { priority: "VEDLIKEHOLDE", focus: "Styrke", sessionBudget: 2 };
    planningDetails.areas.TEK = { priority: "UTVIKLE", focus: "Treffpunkt", sessionBudget: 3 };
    planningDetails.areas.SLAG = { priority: "UTVIKLE", focus: "Ballstart", sessionBudget: 4 };
    planningDetails.areas.SPILL = { priority: "REDUSERE", focus: null, sessionBudget: 0 };
    planningDetails.areas.TURN = { priority: null, focus: "Banestrategi", sessionBudget: null };
    const saved = await actions.saveWeekPlan({ ...key, planningDetails, plannedHoursFys: 1.5, plannedHoursTek: 0, plannedHoursTurn: null });
    assert.ok(saved.ok);
    assert.equal(saved.data.weekType, "UTVIKLING");
    assert.equal(saved.data.seasonPlanId, "egen-sesong");
    viewer = { id: "syntetisk-coach", role: "COACH" }; access = true;
    const read = await load();
    assert.ok(read.ok);
    assert.deepEqual(read.data.weekPlan, saved.data);
    assert.deepEqual(parseWeekPlanData(read.data.weekPlan)?.planningDetails, planningDetails);
    assert.equal(read.data.weekPlan?.plannedHoursTek, 0);
    assert.equal(read.data.weekPlan?.plannedHoursTurn, null);
  }
  assert.ok(invalidations.includes(`/admin/workbench/${playerId}`));
  assert.ok(invalidations.includes("/portal/planlegge/workbench"));
});

test("fremmed spiller, coach uten tilgang og ekstern leser kan verken lese eller skrive", async () => {
  for (const role of ["PLAYER", "COACH", "WANG_COACH"]) {
    viewer = { id: "syntetisk-fremmed", role }; access = false;
    assert.equal((await actions.saveWeekPlan({ ...key, planningDetails: tommeUkeplandetaljer() })).ok, false);
    assert.equal((await load()).ok, false);
    assert.equal(writes, 0); assert.equal(dbCalls, 0);
  }
});

test("tillatt coach kan lagre; fremmed eller feil tidsavgrenset sesong avvises", async () => {
  viewer = { id: "syntetisk-coach", role: "COACH" }; access = true;
  assert.equal((await actions.saveWeekPlan({ ...key, seasonPlanId: "fremmed-sesong" })).ok, false);
  assert.equal((await actions.saveWeekPlan({ ...key, seasonPlanId: "eldre-sesong" })).ok, false);
  assert.equal(writes, 0);
  assert.ok((await actions.saveWeekPlan({ ...key, seasonPlanId: "egen-sesong" })).ok);
  assert.equal(writes, 1);
});

test("gammel klient og delvis oppdatering beholder nye felt, repetisjoner og tidsbudsjett", async () => {
  const planningDetails = tommeUkeplandetaljer(); planningDetails.weekType = "tuten";
  assert.ok((await actions.saveWeekPlan({ ...key, planningDetails, plannedHoursFys: 2.5, repTargetDry: 10 })).ok);
  assert.ok((await actions.saveWeekPlan({ ...key, weekType: "VEDLIKEHOLD", notes: ["TEST"], customNotes: "Syntetisk notat" })).ok);
  const read = await load(); assert.ok(read.ok);
  assert.deepEqual(read.data.weekPlan?.planningDetails, planningDetails);
  assert.equal(read.data.weekPlan?.plannedHoursFys, 2.5);
  assert.equal(read.data.weekPlan?.repTargetDry, 10);
  assert.equal(read.data.weekPlan?.weekType, "VEDLIKEHOLD");
  const patch = await actions.saveWeekPlan({ ...key, plannedHoursTek: 0 }); assert.ok(patch.ok);
  assert.deepEqual(patch.data.planningDetails, planningDetails);
  assert.deepEqual(patch.data.notes, ["TEST"]);
});

test("null tømmer JSON og felt eksplisitt; null sesongkobling beholdes i lagringssvar", async () => {
  assert.ok((await actions.saveWeekPlan({ ...key, planningDetails: tommeUkeplandetaljer(), plannedHoursFys: 2 })).ok);
  const cleared = await actions.saveWeekPlan({ ...key, planningDetails: null, plannedHoursFys: null, seasonPlanId: null });
  assert.ok(cleared.ok);
  assert.equal(cleared.data.planningDetails, null);
  assert.equal(cleared.data.plannedHoursFys, null);
  assert.equal(cleared.data.seasonPlanId, null);
  const oldPatch = await actions.saveWeekPlan({ ...key, customNotes: "Syntetisk oppdatering" });
  assert.ok(oldPatch.ok);
  assert.equal(oldPatch.data.seasonPlanId, null);
  assert.equal(oldPatch.data.planningDetails, null);
});

test("nyttår lastes med ISO-ukeåret; sesong krysser kalenderår uten årskoblingsfeil", async () => {
  const saved = await actions.saveWeekPlan({ ...key, isoYear: 2027, weekNumber: 1, planningDetails: tommeUkeplandetaljer() });
  assert.ok(saved.ok); assert.equal(saved.data.seasonPlanId, "egen-sesong");
  const read = await load("2027-01-04"); assert.ok(read.ok);
  assert.equal(read.data.weekPlan?.isoYear, 2027);
  const boundary = await actions.saveWeekPlan({ ...key, isoYear: 2025, weekNumber: 1 }); assert.ok(boundary.ok);
  const december = await load("2024-12-30"); assert.ok(december.ok);
  assert.equal(december.data.weekPlan?.isoYear, 2025);
  assert.equal(december.data.weekPlan?.weekNumber, 1);
});

test("ikke-mandag normaliseres til samme uke", async () => {
  assert.ok((await actions.saveWeekPlan(key)).ok);
  const read = await load("2026-09-30"); assert.ok(read.ok);
  assert.equal(read.data.weekStart, "2026-09-28");
  assert.equal(read.data.weekPlan?.weekNumber, 40);
});

test("ugyldig input avvises før database; ugyldig lagret JSON returneres ikke til klient", async () => {
  assert.equal((await actions.saveWeekPlan({ ...key, plannedHoursTurn: Infinity })).ok, false);
  assert.equal((await actions.saveWeekPlan({ ...key, repTargetPutting: 1.5 })).ok, false);
  assert.equal((await actions.saveWeekPlan({ ...key, isoYear: 2025, weekNumber: 53 })).ok, false);
  assert.equal(dbCalls, 0); assert.equal(writes, 0);
  assert.ok((await actions.saveWeekPlan(key)).ok);
  assert.ok(row); row.planningDetails = { version: 4, areas: {} };
  const read = await load(); assert.equal(read.ok, false);
  if (!read.ok) assert.match(read.error, /ugyldige/);
  const original = structuredClone(row); const originalWrites = writes;
  assert.equal((await actions.saveWeekPlan({ ...key, planningDetails: null })).ok, false);
  assert.deepEqual(row, original, "Ukjent versjon avvises og beholdes også ved et tømmingsforsøk");
  assert.equal(writes, originalWrites);
});

test("metadata-CAS avviser nyere rad uten å overskrive samtidig plan eller bekrefte lagring", async () => {
  assert.ok((await actions.saveWeekPlan({ ...key, planningDetails: tommeUkeplandetaljer(), plannedHoursFys: 2 })).ok);
  const beforeWrites = writes; invalidations.length = 0; raceOnUpdate = true;
  const next = tommeUkeplandetaljer(); next.location = "Skal ikke skrives";
  const saved = await actions.saveWeekPlan({ ...key, planningDetails: next, plannedHoursFys: 99 });
  assert.equal(saved.ok, false); assert.ok(row);
  assert.equal(row.customNotes, "Nyere samtidig plan");
  assert.equal(row.plannedHoursFys, 2);
  assert.deepEqual(row.planningDetails, tommeUkeplandetaljer());
  assert.equal(writes, beforeWrites); assert.equal(invalidations.length, 0);
});

test("forventet tom uke opprettes med unik kontrakt; samtidig ny uke bevares", async () => {
  raceOnCreate = true;
  const details = tommeUkeplandetaljer(); details.location = "Skal ikke overskrive";
  const saved = await actions.saveWeekPlan({ ...key, planningDetails: details });
  assert.equal(saved.ok, false); assert.ok(row);
  assert.equal(row.id, "samtidig-uke"); assert.equal(row.customNotes, "Nyere samtidig plan");
  assert.deepEqual(row.planningDetails, tommeUkeplandetaljer());
  assert.equal(writes, 0); assert.equal(invalidations.length, 0);
});

test("databasefeil gir feilstatus og ingen falsk lagringsbekreftelse", async () => {
  failWrite = true;
  const saved = await actions.saveWeekPlan(key);
  assert.equal(saved.ok, false);
  assert.equal(writes, 0); assert.equal(invalidations.length, 0);
});
