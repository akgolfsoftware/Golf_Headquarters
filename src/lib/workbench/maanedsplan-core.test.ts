import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

type Uke = { playerId: string; isoYear: number; weekNumber: number; plannedHoursFys: number | null };
type Maaned = { userId: string; year: number; month: number; weekAxisMinutes: unknown; focus: string | null };
let uker: Uke[];
let maaneder: Maaned[];
let periodeKall: Array<{ id: string; kun: string[] }>;

const prisma = {
  monthPlan: {
    findUnique: async ({ where }: { where: { userId_year_month: { userId: string; year: number; month: number } } }) => {
      const k = where.userId_year_month;
      return maaneder.find((m) => m.userId === k.userId && m.year === k.year && m.month === k.month) ?? null;
    },
    upsert: async ({ where, create, update }: { where: { userId_year_month: { userId: string; year: number; month: number } }; create: Maaned; update: Partial<Maaned> }) => {
      const k = where.userId_year_month;
      const finnes = maaneder.find((m) => m.userId === k.userId && m.year === k.year && m.month === k.month);
      if (finnes) Object.assign(finnes, update); else maaneder.push({ ...create });
    },
  },
  seasonPlan: { findFirst: async () => ({ id: "plan" }) },
  weekPlan: {
    upsert: async ({ where, create, update }: { where: { playerId_isoYear_weekNumber: Uke }; create: Uke; update: Partial<Uke> }) => {
      const k = where.playerId_isoYear_weekNumber;
      const finnes = uker.find((u) => u.playerId === k.playerId && u.isoYear === k.isoYear && u.weekNumber === k.weekNumber);
      if (finnes) Object.assign(finnes, update); else uker.push({ ...create });
    },
  },
  periodBlock: { findMany: async () => [{ id: "p1" }] },
  $transaction: async (ops: Promise<unknown>[]) => Promise.all(ops),
};
mock.module("@/lib/prisma", { namedExports: { prisma } });
mock.module("@/lib/workbench/periode-ukefordeling", {
  namedExports: {
    fordelPeriodeTilUker: async (id: string, _now: Date, kun?: ReadonlySet<string>) => {
      periodeKall.push({ id, kun: [...(kun ?? [])].sort() });
      return { antallUker: kun?.size ?? 0, fraUke: null, tilUke: null };
    },
  },
});
let modul: typeof import("./maanedsplan-core");
before(async () => { modul = await import("./maanedsplan-core"); });

const iDag = new Date("2026-10-14T10:00:00Z"); // uke 42

beforeEach(() => {
  uker = [{ playerId: "s", isoYear: 2026, weekNumber: 41, plannedHoursFys: 9 }];
  maaneder = [];
  periodeKall = [];
});

test("lagring skriver tilpassede uker fra og med inneværende uke og lar gåtte uker stå", async () => {
  const r = await modul.lagreMaanedCore("s", "s", {
    year: 2026, month: 10, fokus: "Putting",
    uker: { "2026-U41": { FYS: 600 }, "2026-U43": { FYS: 120, TEK: 60 } },
  }, iDag);
  assert.equal(r.ok, true);
  assert.equal(uker.find((u) => u.weekNumber === 41)!.plannedHoursFys, 9);
  assert.equal(uker.find((u) => u.weekNumber === 43)!.plannedHoursFys, 2);
  assert.equal(maaneder.length, 1);
  assert.deepEqual(Object.keys(maaneder[0].weekAxisMinutes as object).sort(), ["2026-U41", "2026-U43"]);
  if (r.ok) assert.equal(r.kvittering.antallUker, 1);
});

test("uke som ikke lenger er tilpasset går tilbake til periodens tall", async () => {
  maaneder.push({ userId: "s", year: 2026, month: 10, focus: null, weekAxisMinutes: { "2026-U43": { FYS: 120 } } });
  const r = await modul.lagreMaanedCore("s", "s", { year: 2026, month: 10, uker: {} }, iDag);
  assert.equal(r.ok, true);
  assert.deepEqual(periodeKall, [{ id: "p1", kun: ["2026-U43"] }]);
});

test("ugyldig input avvises", async () => {
  const r = await modul.lagreMaanedCore("s", "s", { year: 2026, month: 13 }, iDag);
  assert.equal(r.ok, false);
});
