/**
 * O02-rest · gruppeplan uten dublett og uten bortfall av spillerens egne økter.
 *
 * `gruppeplan-dedup.test.ts` dekker den rene regelen. Denne filen dekker
 * HANDLINGEN `coachApplyTemplateToGroup` → `applyTemplateCore`: at regelen
 * faktisk brukes på spillerens lagrede plan-økter, og — like viktig — at en
 * kollisjon aldri sletter eller overskriver økta som allerede lå der.
 *
 * Mock-mønster som resten av suiten: `t.mock.module` før dynamisk import,
 * modulen lastes ÉN gang, subtestene resetter det mutable «butikk»-lukket.
 * Kjør med: npm test
 */

import { test } from "node:test";
import assert from "node:assert/strict";

type PlanRad = { id: string };
type SessionRad = {
  id: string;
  planId: string;
  title: string;
  scheduledAt: Date;
  durationMin: number;
  pyramidArea: string;
  sourceGroupId: string | null;
};
type Butikk = { plans: Map<string, PlanRad>; sessions: SessionRad[]; usageCount: number };

const GRUPPE_ID = "gruppe-1";
const ANNEN_GRUPPE_ID = "gruppe-2";
const SPILLER_ID = "spiller-1";

function tomButikk(): Butikk {
  return { plans: new Map(), sessions: [], usageCount: 0 };
}

/** Mal med to økter i uke 1 (mandag + tirsdag). */
const MAL_SESSIONS = [
  {
    title: "Chip-økt",
    varighetMin: 60,
    pyramidArea: "TEK" as const,
    skillArea: null,
    environment: "RANGE" as const,
    ukeNr: 1,
    dagNr: 1,
  },
  {
    title: "Putt-økt",
    varighetMin: 45,
    pyramidArea: "TEK" as const,
    skillArea: null,
    environment: "PUTTING_GREEN" as const,
    ukeNr: 1,
    dagNr: 2,
  },
];

test("gruppeutrulling — dedup uten bortfall av spillerens egne økter (O02)", async (t) => {
  let butikk: Butikk = tomButikk();
  let sessionTeller = 0;

  t.mock.module("next/cache", { namedExports: { revalidatePath: () => {} } });

  t.mock.module("@/lib/auth/requirePortalUser", {
    namedExports: {
      requirePortalUser: async () => ({ id: "coach-1", name: "Test Coach", role: "COACH" }),
    },
  });

  t.mock.module("@/lib/auth/effective-capabilities", {
    namedExports: { assertCapability: async () => {} },
  });

  t.mock.module("@/lib/auth/coached", {
    namedExports: { harCoachTilgangTilSpiller: async () => true },
  });

  t.mock.module("@/lib/error-tracking", { namedExports: { logError: async () => {} } });

  t.mock.module("@/lib/plan-engine/load-signals", {
    namedExports: { hentPlayerSignals: async () => ({}) },
  });

  t.mock.module("@/lib/plan-engine/adapt-template", {
    namedExports: {
      adaptTemplateWeek: (sessions: unknown) => ({ okter: sessions, justeringer: [] }),
    },
  });

  t.mock.module("@/lib/workbench/v2-sync", {
    namedExports: { upsertV2ForPlanSession: async () => {} },
  });

  t.mock.module("@/lib/prisma", {
    namedExports: {
      prisma: {
        group: {
          findUnique: async () => ({
            id: GRUPPE_ID,
            name: "P0 Gruppe",
            members: [{ user: { id: SPILLER_ID, name: "Test Spiller" } }],
          }),
        },
        planTemplate: {
          // Samme mock dekker begge oppslagene i handlingen: gruppe-oppslaget
          // (varighetUker + distinkte ukeNr) og uke-oppslaget (selve øktene).
          findUnique: async () => ({
            id: "mal-1",
            lPhase: "GRUNN",
            varighetUker: 1,
            sessions: MAL_SESSIONS,
          }),
        },
        $transaction: async (cb: (tx: unknown) => Promise<unknown>) => {
          const draft: Butikk = {
            plans: new Map(butikk.plans),
            sessions: [...butikk.sessions],
            usageCount: butikk.usageCount,
          };
          const tx = {
            trainingPlan: {
              findFirst: async ({ where }: { where: { userId: string } }) =>
                draft.plans.get(where.userId) ?? null,
              create: async ({ data }: { data: { userId: string } }) => {
                const rad: PlanRad = { id: `plan-${data.userId}` };
                draft.plans.set(data.userId, rad);
                return rad;
              },
            },
            trainingPlanSession: {
              // Speiler spørringen i handlingen: spillerens egne økter i vinduet.
              findMany: async ({
                where,
              }: {
                where: { scheduledAt: { gte: Date; lt: Date } };
              }) =>
                draft.sessions
                  .filter(
                    (s) =>
                      s.scheduledAt >= where.scheduledAt.gte &&
                      s.scheduledAt < where.scheduledAt.lt,
                  )
                  .map((s) => ({
                    scheduledAt: s.scheduledAt,
                    durationMin: s.durationMin,
                    sourceGroupId: s.sourceGroupId,
                  })),
              create: async ({ data }: { data: Omit<SessionRad, "id"> }) => {
                sessionTeller++;
                const rad: SessionRad = { id: `okt-${sessionTeller}`, ...data };
                draft.sessions.push(rad);
                return rad;
              },
            },
            planTemplate: {
              update: async () => {
                draft.usageCount += 1;
              },
            },
          };
          const resultat = await cb(tx);
          butikk = draft;
          return resultat;
        },
      },
    },
  });

  const { coachApplyTemplateToGroup } = await import("@/lib/workbench/apply-template-actions");

  await t.test("første utrulling oppretter gruppeøktene, stemplet med gruppa", async () => {
    butikk = tomButikk();

    const res = await coachApplyTemplateToGroup(GRUPPE_ID, "mal-1", { uker: 1 });

    assert.equal(res.ok, true);
    assert.equal(res.spillere, 1);
    assert.equal(res.okterOpprettet, 2);
    assert.deepEqual(res.hoppet, []);
    assert.equal(butikk.sessions.length, 2);
    assert.ok(butikk.sessions.every((s) => s.sourceGroupId === GRUPPE_ID));
  });

  await t.test("re-kjøring av SAMME gruppe er stille idempotent — ingen dublett", async () => {
    butikk = tomButikk();
    await coachApplyTemplateToGroup(GRUPPE_ID, "mal-1", { uker: 1 });
    const forsteIder = butikk.sessions.map((s) => s.id);

    const res = await coachApplyTemplateToGroup(GRUPPE_ID, "mal-1", { uker: 1 });

    assert.equal(res.ok, true);
    assert.equal(res.okterOpprettet, 0, "re-kjøring skal ikke opprette nye økter");
    assert.deepEqual(res.hoppet, [], "samme gruppe rapporteres ikke — stille idempotens");
    assert.equal(butikk.sessions.length, 2, "ingen dublett i spillerens plan");
    assert.deepEqual(butikk.sessions.map((s) => s.id), forsteIder, "eksisterende rader er urørt");
  });

  await t.test(
    "krysskilde: spillerens egen økt kolliderer → hoppes og rapporteres, men slettes ALDRI",
    async () => {
      butikk = tomButikk();
      // Legg ut gruppeøktene først for å få eksakte tidspunkt, gjør dem så om
      // til spillerens EGNE økter (sourceGroupId null) og nullstill utrullingen.
      await coachApplyTemplateToGroup(GRUPPE_ID, "mal-1", { uker: 1 });
      const egne = butikk.sessions.map((s) => ({ ...s, sourceGroupId: null }));
      butikk = { plans: butikk.plans, sessions: egne, usageCount: 0 };

      const res = await coachApplyTemplateToGroup(GRUPPE_ID, "mal-1", { uker: 1 });

      assert.equal(res.ok, true);
      assert.equal(res.okterOpprettet, 0, "kolliderende gruppeøkter skal ikke opprettes");
      assert.equal(res.hoppet?.length, 2, "krysskilde skal rapporteres per økt");
      assert.ok(res.hoppet?.every((h) => h.grunn === "KRYSSKILDE"));
      assert.equal(butikk.sessions.length, 2, "spillerens egne økter skal fortsatt ligge der");
      assert.ok(
        butikk.sessions.every((s) => s.sourceGroupId === null),
        "spillerens egne økter skal ikke stemples om til gruppa",
      );
      assert.deepEqual(
        butikk.sessions.map((s) => s.id),
        egne.map((s) => s.id),
        "ingen egen økt er byttet ut",
      );
    },
  );

  await t.test("annen gruppes økt i samme tidsrom hoppes som krysskilde", async () => {
    butikk = tomButikk();
    await coachApplyTemplateToGroup(GRUPPE_ID, "mal-1", { uker: 1 });
    const andres = butikk.sessions.map((s) => ({ ...s, sourceGroupId: ANNEN_GRUPPE_ID }));
    butikk = { plans: butikk.plans, sessions: andres, usageCount: 0 };

    const res = await coachApplyTemplateToGroup(GRUPPE_ID, "mal-1", { uker: 1 });

    assert.equal(res.okterOpprettet, 0);
    assert.equal(res.hoppet?.length, 2);
    assert.ok(res.hoppet?.every((h) => h.grunn === "KRYSSKILDE"));
    assert.equal(butikk.sessions.length, 2);
    assert.ok(butikk.sessions.every((s) => s.sourceGroupId === ANNEN_GRUPPE_ID));
  });

  await t.test(
    "spillerens egen økt samme dag UTEN tidsoverlapp stopper ikke gruppeøkta",
    async () => {
      butikk = tomButikk();
      await coachApplyTemplateToGroup(GRUPPE_ID, "mal-1", { uker: 1 });
      // Flytt spillerens egne økter to døgn bak i tid: samme uke, ingen overlapp.
      const egne = butikk.sessions.map((s) => ({
        ...s,
        sourceGroupId: null,
        scheduledAt: new Date(s.scheduledAt.getTime() - 2 * 24 * 60 * 60_000),
      }));
      butikk = { plans: butikk.plans, sessions: egne, usageCount: 0 };

      const res = await coachApplyTemplateToGroup(GRUPPE_ID, "mal-1", { uker: 1 });

      assert.equal(res.okterOpprettet, 2, "ingen falsk dedup uten ekte tidsoverlapp");
      assert.deepEqual(res.hoppet, []);
      assert.equal(butikk.sessions.length, 4, "spillerens egne økter er beholdt ved siden av");
      assert.equal(butikk.sessions.filter((s) => s.sourceGroupId === null).length, 2);
    },
  );
});
