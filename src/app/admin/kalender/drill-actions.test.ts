/**
 * R-I: admin/kalender/drill-actions.ts. Ren lesevisning (ingen per-coach
 * eierskap per filens egen kommentar — redigering skjer i Workbench, ikke
 * her) — vernet er rollegrensen alene. Dekker også fallback-logikken for
 * planlagte reps (`repetitions ?? repAntall ?? 0`) og at faktiske reps
 * hentes fra siste logg, ikke bare første i listen.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "coach-a",
  role: "COACH",
  name: "Coach A",
};

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
}

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
const prismaMock: Record<string, unknown> = {};
mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });
Object.assign(prismaMock, {
  trainingSessionV2: {
    findUnique: async ({ where }: { where: { id: string } }) => {
      if (where.id === "okt-a") {
        return {
          id: "okt-a",
          title: "Teknikk-økt",
          drills: [
            {
              id: "drill-1", name: "Chip 10m", pyramide: "TEK", durationMinutes: 15,
              repType: "REPS", repetitions: 20, repAntall: null,
              logs: [{ repsTotal: 17 }],
            },
            {
              id: "drill-2", name: "Putt lag", pyramide: "TEK", durationMinutes: 10,
              repType: "TID", repetitions: null, repAntall: 12,
              logs: [],
            },
          ],
        };
      }
      return null;
    },
  },
});

async function actions() {
  return import("./drill-actions");
}

test.beforeEach(() => {
  nullstill();
});

test("hentKalenderDrills avviser PLAYER", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { hentKalenderDrills } = await actions();
  await assert.rejects(() => hentKalenderDrills("okt-a"));
});

test("hentKalenderDrills avviser uinnlogget", async () => {
  bruker = null;
  const { hentKalenderDrills } = await actions();
  await assert.rejects(() => hentKalenderDrills("okt-a"));
});

test("hentKalenderDrills avviser tom sessionId med ok:false", async () => {
  const { hentKalenderDrills } = await actions();
  const svar = await hentKalenderDrills("");
  assert.equal(svar.ok, false);
});

test("hentKalenderDrills avviser ukjent økt med ok:false", async () => {
  const { hentKalenderDrills } = await actions();
  const svar = await hentKalenderDrills("finnes-ikke");
  assert.equal(svar.ok, false);
});

test("hentKalenderDrills returnerer drills med riktig fallback for planlagte reps", async () => {
  const { hentKalenderDrills } = await actions();
  const svar = await hentKalenderDrills("okt-a");
  assert.equal(svar.ok, true);
  if (!svar.ok) return;
  assert.equal(svar.title, "Teknikk-økt");
  assert.equal(svar.drills.length, 2);
  assert.equal(svar.drills[0]?.plannedReps, 20); // repetitions brukt
  assert.equal(svar.drills[0]?.faktiskeReps, 17);
  assert.equal(svar.drills[1]?.plannedReps, 12); // repAntall-fallback
  assert.equal(svar.drills[1]?.faktiskeReps, null); // ingen logg ennå
});
