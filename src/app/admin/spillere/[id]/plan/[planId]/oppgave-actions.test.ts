/**
 * AG-TP-01: oppgave-actions.ts. Coachen endrer en ANNEN brukers plan, så
 * vernet er rolle (COACH/ADMIN) + eierskap (coach → egen spiller) + at
 * oppgaven hører til planen. Testene låser alle tre lagene, og at lagring
 * faktisk skriver TrackMan-mål, treffprotokoll og målmatrise.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";
import type { TpSkjema } from "@/lib/teknisk-plan/tp-visning";

type Rolle = "PLAYER" | "COACH" | "ADMIN";
let bruker: { id: string; role: Rolle; name: string } | null = null;
let coachensSpillere = new Set<string>();
const skrevet: Array<[string, string, unknown]> = [];
const logg = (modell: string, op: string, arg: unknown) => { skrevet.push([modell, op, arg]); };

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  coachensSpillere = new Set(["spiller-a"]);
  skrevet.length = 0;
}

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/getCurrentUser", { namedExports: { getCurrentUser: async () => bruker } });
mock.module("@/lib/auth/coached", {
  namedExports: {
    assertCoachTilgangTilSpiller: async (_v: unknown, spiller: string) => {
      if (!coachensSpillere.has(spiller)) throw new Error("Du har ikke tilgang til denne spilleren.");
    },
  },
});
mock.module("@/lib/teknisk-plan/tp-utgangspunkt", {
  namedExports: { utgangspunktFraSisteOkt: async () => ({ verdi: -1.2, fra: "siste-okt", dato: new Date("2026-09-20"), n: 30 }) },
});
mock.module("@/lib/teknisk-plan/apply-reps", { namedExports: { rekalkulerMaalMatrise: async () => undefined } });

const opp = (modell: string, ops: Record<string, (a: unknown) => unknown>) =>
  new Proxy({}, { get: (_t, op: string) => async (a: unknown) => { logg(modell, op, a); return ops[op]?.(a) ?? null; } });

mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      technicalPlan: opp("plan", { findUnique: (a) => ((a as { where: { id: string } }).where.id === "plan-1" ? { id: "plan-1", userId: "spiller-a" } : null) }),
      technicalPlanPosition: opp("posisjon", { findFirst: () => ({ id: "pos-7", sortOrder: 0 }) }),
      positionTask: opp("oppgave", {
        findUnique: (a) => {
          const id = (a as { where: { id: string } }).where.id;
          if (id === "fremmed") return { id, positionId: "x", position: { planId: "plan-2", pNummer: "P1.0" }, tmGoals: [] };
          if (id === "t1") return { id, positionId: "pos-7", position: { planId: "plan-1", pNummer: "P7.0" }, tmGoals: [{ id: "g1", metric: "attack_angle_mean", targetType: "CAUSAL" }] };
          return null;
        },
        findFirst: () => ({ sortOrder: 2 }),
        create: () => ({ id: "ny" }),
        update: (a) => ({ id: (a as { where: { id: string } }).where.id }),
      }),
      positionTaskTmGoal: opp("tm", {}),
      positionTaskMaal: opp("maal", {}),
      technicalPlanAudit: opp("audit", {}),
      $transaction: async (ops: unknown[]) => Promise.all(ops),
    },
  },
});

const last = () => import("./oppgave-actions");

const skjema: TpSkjema = {
  id: null, pNummer: "P7.0", tittel: "Hendene foran ballen", slagNavn: "7-jern lav fade", omraadeKode: "INNSPILL_150",
  motorikk: "LAV_HAST", sandTrinn: null, dimensjon: "TREFFPUNKT", kolle: "7-jern", belastning: "BANE", press: "ALENE",
  maaleutstyr: "TRACKMAN", tm: [{ id: null, metric: "face_to_path_mean", fra: -2.5, til: -1 }],
  repSteg: { UTEN_BALL: 60, LAV_HAST: 120, AUTO: 0 }, rep: 0, repMiljo: { INNENDORS: 100 },
  protokoll: { type: "ROLLING_WINDOW", antall: 20, treff: 16 },
};

test("spiller og uinnlogget avvises før noe skrives", async () => {
  nullstill();
  bruker = { id: "spiller-a", role: "PLAYER", name: "S" };
  await assert.rejects(async () => (await last()).lagreOppgave("plan-1", { ...skjema }), /Ingen tilgang/);
  bruker = null;
  await assert.rejects(async () => (await last()).slettOppgave("plan-1", "t1"), /Ikke innlogget/);
  assert.equal(skrevet.filter(([, op]) => /create|update|delete/.test(op)).length, 0);
});

test("coach uten tilgang til spilleren avvises", async () => {
  nullstill();
  coachensSpillere = new Set(["en-annen"]);
  await assert.rejects(async () => (await last()).lagreOppgave("plan-1", { ...skjema }), /ikke tilgang til denne spilleren/);
  assert.equal(skrevet.filter(([, op]) => /create|update|delete/.test(op)).length, 0);
});

test("oppgave fra en annen plan kan verken endres eller slettes", async () => {
  nullstill();
  await assert.rejects(async () => (await last()).lagreOppgave("plan-1", { ...skjema, id: "fremmed" }), /hører ikke til planen/);
  await assert.rejects(async () => (await last()).slettOppgave("plan-1", "fremmed"), /hører ikke til planen/);
  assert.equal(skrevet.filter(([, op]) => /create|update|delete/.test(op)).length, 0);
});

test("ugyldig skjema gir feilmelding, ikke lagring", async () => {
  nullstill();
  const svar = await (await last()).lagreOppgave("plan-1", { ...skjema, tittel: "" });
  assert.equal(svar.ok, false);
  assert.equal(skrevet.filter(([, op]) => /create|update|delete/.test(op)).length, 0);
});

test("ny oppgave skriver TrackMan-mål med utgangspunkt, protokoll og målmatrise", async () => {
  nullstill();
  const svar = await (await last()).lagreOppgave("plan-1", { ...skjema });
  assert.deepEqual(svar, { ok: true, taskId: "ny" });
  const tm = skrevet.filter(([m, op]) => m === "tm" && op === "create").map(([, , a]) => (a as { data: Record<string, unknown> }).data);
  assert.equal(tm.length, 2);
  assert.deepEqual(
    { metric: tm[0].metric, targetValue: tm[0].targetValue, rangeMax: tm[0].rangeMax, baselineValue: tm[0].baselineValue, baselineFrom: tm[0].baselineFrom },
    { metric: "face_to_path_mean", targetValue: -2.5, rangeMax: -1, baselineValue: -1.2, baselineFrom: "siste-okt" },
  );
  assert.equal(tm[1].targetType, "HIT_RATE");
  assert.equal(tm[1].protocol, "ROLLING_WINDOW");
  const maal = skrevet.find(([m, op]) => m === "maal" && op === "createMany")?.[2] as { data: unknown[] };
  assert.deepEqual(maal.data, [{ motorikk: "LAV_HAST", belastning: "INNENDORS", maalReps: 100, taskId: "ny" }]);
  assert.ok(skrevet.some(([m, op, a]) => m === "audit" && op === "create" && (a as { data: { action: string } }).data.action === "TASK_ADD"));
});

test("endring fjerner TrackMan-mål som er tatt ut av skjemaet", async () => {
  nullstill();
  await (await last()).lagreOppgave("plan-1", { ...skjema, id: "t1", tm: [], protokoll: null });
  const slettet = skrevet.find(([m, op]) => m === "tm" && op === "deleteMany")?.[2] as { where: { id: { in: string[] } } };
  assert.deepEqual(slettet.where.id.in, ["g1"]);
});
