/**
 * Regresjonstest for 14.5A: mal-utrullingen i apply-template-actions.ts skal
 * kjøre plan-opprettelse + per-økt create/upsert + usageCount-increment i ÉN
 * transaksjon. Før fiksen kjørte disse skrivingene som separate databasekall
 * — feilet én rad midt i uka (f.eks. V2-speiling), sto de foregående radene
 * igjen som en halvferdig uke. Nå skal HELE utrullingen rulles tilbake.
 *
 * Mock-mønster som resten av suiten (t.mock.module før dynamisk import).
 * Modulen mockes og importeres ÉN gang for hele filen — Node cacher
 * dynamiske import()-kall på samme specifier, så et nytt t.mock.module()
 * per subtest ville ikke truffet en allerede-lastet modul. Subtestene
 * resetter i stedet det mutable «butikk»-lukket mockene leser fra.
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

function tomButikk(): Butikk {
  return { plans: new Map(), sessions: [], usageCount: 0 };
}

/** Mal med to økter i uke 1 (mandag + tirsdag) — nok til å teste midt-i-uka-feil. */
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

test("mal-utrulling — atomisk transaksjon (14.5A)", async (t) => {
  let butikk: Butikk = tomButikk();
  let kall = 0;
  let feilPaKall = 0; // 0 = aldri feil
  let sessionTeller = 0;

  t.mock.module("next/cache", {
    namedExports: { revalidatePath: () => {} },
  });

  t.mock.module("@/lib/auth/requirePortalUser", {
    namedExports: { requirePortalUser: async () => ({ id: "spiller-1", name: "Test Spiller" }) },
  });

  t.mock.module("@/lib/error-tracking", {
    namedExports: { logError: async () => {} },
  });

  t.mock.module("@/lib/plan-engine/load-signals", {
    namedExports: { hentPlayerSignals: async () => ({}) },
  });

  t.mock.module("@/lib/plan-engine/adapt-template", {
    namedExports: {
      // Passthrough — selve tilpasningslogikken er testet separat og er ren.
      adaptTemplateWeek: (sessions: unknown) => ({ okter: sessions, justeringer: [] }),
    },
  });

  t.mock.module("@/lib/workbench/v2-sync", {
    namedExports: {
      upsertV2ForPlanSession: async () => {
        kall++;
        if (feilPaKall && kall === feilPaKall) throw new Error("V2-speiling feilet (simulert)");
      },
    },
  });

  t.mock.module("@/lib/prisma", {
    namedExports: {
      prisma: {
        planTemplate: {
          findUnique: async () => ({ id: "mal-1", lPhase: "GRUNN", sessions: MAL_SESSIONS }),
        },
        $transaction: async (cb: (tx: unknown) => Promise<unknown>) => {
          // Ekte transaksjonssemantikk: skriv til en kopi, commit KUN ved
          // suksess — kaster cb, forblir den delte `butikk` urørt.
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
              findMany: async () => [],
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

  const { applyWorkbenchTemplate } = await import("@/lib/workbench/apply-template-actions");

  await t.test("feil på andre V2-speiling → hele uka rulles tilbake, ingen halvferdig uke", async () => {
    butikk = tomButikk();
    kall = 0;
    feilPaKall = 2;

    await assert.rejects(() => applyWorkbenchTemplate("mal-1", 1));

    assert.equal(butikk.sessions.length, 0, "ingen økt skal ha nådd butikken etter rollback");
    assert.equal(butikk.usageCount, 0, "usageCount skal ikke ha inkrementert etter rollback");
    assert.equal(kall, 2);
  });

  await t.test("suksess → begge økter + usageCount committer sammen", async () => {
    butikk = tomButikk();
    kall = 0;
    feilPaKall = 0;

    const res = await applyWorkbenchTemplate("mal-1", 1);

    assert.equal(res.ok, true);
    assert.equal(res.sessions?.length, 2);
    assert.equal(butikk.sessions.length, 2);
    assert.equal(butikk.usageCount, 1);
    assert.equal(kall, 2);
  });
});
