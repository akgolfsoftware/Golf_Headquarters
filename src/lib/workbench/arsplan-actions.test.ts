import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

type Blokk = {
  lPhase: string; startDate: Date; endDate: Date; focus: string | null;
  weeklyVolMin: number | null; weeklyVolMax: number | null; weeklySessionBudget: unknown; notes: string | null;
};

let me = { id: "coach", role: "COACH" as string };
let coachet = true;
let stall = true;
let planer: { userId: string; year: number; periodBlocks: Blokk[] }[] = [];
let opprettet: { userId: string; year: number; name: string }[] = [];
let blokker: Record<string, unknown>[] = [];
let sjekkUtenforTx = 0;
let lasKall = 0;
let iTx = false;

const seasonPlan = {
  findFirst: async ({ where }: { where: { userId: string; year: number } }) => {
    if (!iTx) sjekkUtenforTx += 1;
    const treff = planer.find((p) => p.userId === where.userId && p.year === where.year);
    return treff ? { id: `plan-${treff.year}`, periodBlocks: treff.periodBlocks } : null;
  },
  create: async ({ data }: { data: { userId: string; year: number; name: string } }) => {
    opprettet.push(data);
    planer.push({ userId: data.userId, year: data.year, periodBlocks: [] });
    return { id: "ny-plan" };
  },
};
const periodBlock = { create: async ({ data }: { data: Record<string, unknown> }) => { blokker.push(data); return { id: "b" }; } };

mock.module("@/lib/auth/requirePortalUser", {
  namedExports: {
    requirePortalUser: async ({ allow }: { allow: string[] }) => {
      if (!allow.includes(me.role)) throw new Error("Ingen tilgang");
      return me;
    },
  },
});
mock.module("@/lib/auth/coached", {
  namedExports: { erCoachetSpiller: async () => coachet, harCoachTilgangTilSpiller: async () => stall },
});
mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      $transaction: async (fn: (tx: unknown) => Promise<unknown>) => {
        iTx = true;
        try {
          return await fn({ seasonPlan, periodBlock, $queryRaw: async () => { lasKall += 1; return []; } });
        } finally {
          iTx = false;
        }
      },
    },
  },
});

let actions: typeof import("./arsplan-actions");
before(async () => { actions = await import("./arsplan-actions"); });
beforeEach(() => {
  me = { id: "coach", role: "COACH" };
  coachet = true;
  stall = true;
  planer = [];
  opprettet = [];
  blokker = [];
  sjekkUtenforTx = 0;
  lasKall = 0;
});

const input = { aar: 2027, navn: "Sesong 2027", utgangspunkt: "tom" as const };
const fjorBlokk: Blokk = {
  lPhase: "GRUNN", startDate: new Date("2026-01-05T00:00:00.000Z"), endDate: new Date("2026-03-29T00:00:00.000Z"), focus: "Styrke",
  weeklyVolMin: 360, weeklyVolMax: 420, weeklySessionBudget: { FYS: 3 }, notes: null,
};

test("assistent nektes og ingenting skrives", async () => {
  me = { id: "a", role: "ASSISTANT" };
  await assert.rejects(() => actions.coachOpprettArsplan("spiller", input));
  assert.equal(opprettet.length, 0);
});

test("spiller som ikke er coachet nektes", async () => {
  coachet = false;
  const res = await actions.coachOpprettArsplan("spiller", input);
  assert.equal(res.ok, false);
  assert.equal(opprettet.length, 0);
});

test("en annen coachs spiller nektes", async () => {
  stall = false;
  const res = await actions.coachOpprettArsplan("spiller", input);
  assert.equal(res.ok, false);
  assert.match(res.error ?? "", /tilgang/i);
  assert.equal(opprettet.length, 0);
});

test("ugyldig input avvises", async () => {
  const res = await actions.coachOpprettArsplan("spiller", { ...input, aar: 1800 });
  assert.equal(res.ok, false);
  assert.equal(opprettet.length, 0);
});

test("år som allerede har plan gir feil og ingen ny plan", async () => {
  planer = [{ userId: "spiller", year: 2027, periodBlocks: [] }];
  const res = await actions.coachOpprettArsplan("spiller", input);
  assert.equal(res.ok, false);
  assert.match(res.error ?? "", /allerede/);
  assert.equal(opprettet.length, 0);
});

test("sjekken for eksisterende plan skjer inne i transaksjonen, bak lås", async () => {
  await actions.coachOpprettArsplan("spiller", input);
  assert.equal(sjekkUtenforTx, 0);
  assert.equal(lasKall, 1);
});

test("dobbel innsending gir bare én plan", async () => {
  const [a, b] = [await actions.coachOpprettArsplan("spiller", input), await actions.coachOpprettArsplan("spiller", input)];
  assert.equal(a.ok, true);
  assert.equal(b.ok, false);
  assert.equal(opprettet.length, 1);
});

test("kopi av fjoråret uten perioder gir feil og ingen plan", async () => {
  planer = [{ userId: "spiller", year: 2026, periodBlocks: [] }];
  const res = await actions.coachOpprettArsplan("spiller", { ...input, utgangspunkt: "fjor" });
  assert.equal(res.ok, false);
  assert.match(res.error ?? "", /2026/);
  assert.equal(opprettet.length, 0);
});

test("kopi av fjoråret flytter datoene ett år og tar med volum og økter", async () => {
  planer = [{ userId: "spiller", year: 2026, periodBlocks: [fjorBlokk] }];
  const res = await actions.coachOpprettArsplan("spiller", { ...input, utgangspunkt: "fjor" });
  assert.deepEqual({ ok: res.ok, perioder: res.perioder }, { ok: true, perioder: 1 });
  assert.equal(opprettet.length, 1);
  const b = blokker[0];
  assert.equal((b.startDate as Date).toISOString().slice(0, 10), "2027-01-05");
  assert.equal((b.endDate as Date).toISOString().slice(0, 10), "2027-03-29");
  assert.equal(b.weeklyVolMin, 360);
  assert.deepEqual(b.weeklySessionBudget, { FYS: 3 });
});

test("tom plan lager kalenderåret uten perioder", async () => {
  const res = await actions.coachOpprettArsplan("spiller", input);
  assert.deepEqual({ ok: res.ok, perioder: res.perioder }, { ok: true, perioder: 0 });
  assert.equal(opprettet[0].year, 2027);
  assert.equal(blokker.length, 0);
});
