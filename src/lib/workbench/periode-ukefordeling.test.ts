import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

type Uke = { playerId: string; isoYear: number; weekNumber: number; weekType: string; plannedHoursFys: number | null; plannedHoursTek: number | null; seasonPlanId?: string };
let uker: Uke[];
let periode: Record<string, unknown> | null;

const nokkel = (u: { isoYear: number; weekNumber: number }) => `${u.isoYear}-${u.weekNumber}`;
const prisma = {
  periodBlock: { findUnique: async () => periode },
  weekPlan: {
    findMany: async () => uker.map((u) => ({ isoYear: u.isoYear, weekNumber: u.weekNumber, weekType: u.weekType })),
    upsert: async ({ where, create, update }: { where: { playerId_isoYear_weekNumber: { playerId: string; isoYear: number; weekNumber: number } }; create: Uke; update: Partial<Uke> }) => {
      const k = where.playerId_isoYear_weekNumber;
      const finnes = uker.find((u) => u.playerId === k.playerId && nokkel(u) === nokkel(k));
      if (finnes) Object.assign(finnes, update); else uker.push({ ...create });
    },
  },
  $transaction: async (ops: Promise<unknown>[]) => Promise.all(ops),
};
mock.module("@/lib/prisma", { namedExports: { prisma } });
let modul: typeof import("./periode-ukefordeling");
before(async () => { modul = await import("./periode-ukefordeling"); });

const iDag = new Date("2026-10-14T10:00:00Z"); // uke 42
const uke = (weekNumber: number, weekType = "UTVIKLING", fys: number | null = 9): Uke =>
  ({ playerId: "spiller", isoYear: 2026, weekNumber, weekType, plannedHoursFys: fys, plannedHoursTek: null });

beforeEach(() => {
  uker = [uke(40), uke(41), uke(43, "VEDLIKEHOLD")];
  periode = {
    startDate: new Date("2026-09-28T00:00:00Z"), endDate: new Date("2026-11-01T00:00:00Z"),
    axisMinutes: { FYS: 120, TEK: 180 }, axisMinutesLight: { FYS: 60 },
    seasonPlan: { id: "plan", userId: "spiller" },
  };
});

test("endret periode gir nye timer i kommende uker og uendrede tall i gåtte uker", async () => {
  const k = await modul.fordelPeriodeTilUker("p1", iDag);
  const finn = (n: number) => uker.find((u) => u.weekNumber === n)!;
  assert.equal(finn(40).plannedHoursFys, 9);
  assert.equal(finn(41).plannedHoursFys, 9);
  assert.equal(finn(42).plannedHoursFys, 2);
  assert.equal(finn(42).plannedHoursTek, 3);
  assert.equal(finn(44).plannedHoursFys, 2);
  assert.deepEqual(k, { antallUker: 3, fraUke: "2026-U42", tilUke: "2026-U44" });
});

test("lett uke får de lette tallene", async () => {
  await modul.fordelPeriodeTilUker("p1", iDag);
  const lett = uker.find((u) => u.weekNumber === 43)!;
  assert.equal(lett.plannedHoursFys, 1);
  assert.equal(lett.plannedHoursTek, null);
});

test("periode uten minutter per akse lar ukene stå", async () => {
  periode = { ...periode!, axisMinutes: null, axisMinutesLight: null };
  const k = await modul.fordelPeriodeTilUker("p1", iDag);
  assert.equal(k.antallUker, 0);
  assert.deepEqual(uker.map((u) => u.plannedHoursFys), [9, 9, 9]);
});
