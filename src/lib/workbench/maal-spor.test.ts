import assert from "node:assert/strict";
import { mock, test } from "node:test";

let goalArgs: { where: Record<string, unknown> } | null = null;
let oktArgs: { where: Record<string, unknown> } | null = null;
let goals: Array<Record<string, unknown>> = [];
let okter: Array<{ date: Date; status: string; pyramid: string }> = [];

mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      goal: {
        findMany: async (args: { where: Record<string, unknown> }) => {
          goalArgs = args;
          return goals;
        },
      },
      user: { findUnique: async () => ({ hcp: 12.4 }) },
      workbenchSession: {
        findMany: async (args: { where: Record<string, unknown> }) => {
          oktArgs = args;
          return okter;
        },
      },
    },
  },
});
mock.module("@/lib/portal/goals/progress", {
  namedExports: {
    beregnGoalProgress: async () => ({ pct: 40, status: "behind", hasData: true, value: 2, detail: "2 av 5 økter" }),
  },
});

function iDag(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
}

const BASIS = {
  userId: "spiller-a",
  type: "SESSION_FREQUENCY",
  category: "PROCESS",
  title: "Tre teknikkøkter i uken",
  targetValue: 3,
  targetDate: null,
  payload: { planNivaa: "UKE", abandonReason: "skal ikke ut" },
  linkedPyramidArea: "TEK",
  linkedTestId: null,
};

test.beforeEach(() => {
  goalArgs = null;
  oktArgs = null;
  goals = [];
  okter = [];
});

test("henter kun aktive mål for angitt spiller", async () => {
  const { hentMaalSpor } = await import("./maal-spor");
  const res = await hentMaalSpor("spiller-a");
  assert.deepEqual(res, []);
  assert.deepEqual(goalArgs?.where, { userId: "spiller-a", status: "ACTIVE" });
  assert.equal(oktArgs, null);
});

test("valgt nivå, fremdrift og spor følger målet uten å lekke payload", async () => {
  const dag = iDag();
  goals = [{ ...BASIS, id: "m1" }];
  okter = [
    { date: new Date(`${dag}T00:00:00Z`), status: "COMPLETED", pyramid: "TEK" },
    { date: new Date(`${dag}T00:00:00Z`), status: "DRAFT", pyramid: "TEK" },
    { date: new Date(`${dag}T00:00:00Z`), status: "PUBLISHED", pyramid: "SLAG" }, // annet område, filtreres bort
  ];
  const { hentMaalSpor } = await import("./maal-spor");
  const [maal] = await hentMaalSpor("spiller-a");

  assert.equal(maal.planNivaa, "UKE");
  assert.equal(maal.planNivaaKilde, "valgt");
  assert.equal(maal.typeLabel, "Øktfrekvens");
  assert.deepEqual(maal.fremdrift, { pct: 40, hasData: true, status: "behind", detail: "2 av 5 økter" });
  assert.deepEqual(maal.spor, { planlagt: 1, gjennomfort: 1, uteblitt: 0, gjenstar: 0 });
  assert.equal(JSON.stringify(maal).includes("skal ikke ut"), false);
  assert.deepEqual((oktArgs?.where as { playerId: string }).playerId, "spiller-a");
});

test("mål uten øktområde får foreslått nivå og ingen spor", async () => {
  goals = [{ ...BASIS, id: "m2", type: "FREE_TEXT", payload: null, linkedPyramidArea: null }];
  const { hentMaalSpor } = await import("./maal-spor");
  const [maal] = await hentMaalSpor("spiller-a");
  assert.equal(maal.planNivaa, "AAR");
  assert.equal(maal.planNivaaKilde, "foreslatt");
  assert.equal(maal.spor, null);
  assert.equal(oktArgs, null);
});
