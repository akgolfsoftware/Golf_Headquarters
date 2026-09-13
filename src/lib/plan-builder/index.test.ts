import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
import type { PlanForslag } from "@/lib/ai-plan/schema";

let opprettetPlan: Record<string, unknown> | null = null;
let planEier = "syntetisk-spiller";
let planStatus = "DRAFT";
const speilinger: Array<Record<string, unknown>> = [];

mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      exerciseDefinition: {
        findMany: async () => [{ id: "drill-1", name: "Startlinje" }],
      },
      trainingPlan: {
        create: async ({ data }: { data: Record<string, unknown> }) => {
          opprettetPlan = data;
          return {
            id: "plan-1",
            sessions: [
              {
                id: "okt-1",
                title: "Kontrollert start",
                scheduledAt: new Date("2026-09-14T00:00:00.000Z"),
                durationMin: 60,
                pyramidArea: "TEK",
              },
            ],
          };
        },
        findUnique: async () => ({ userId: planEier, status: planStatus }),
        update: async ({ data }: { data: { status: string } }) => {
          planStatus = data.status;
        },
      },
    },
  },
});

mock.module("@/lib/workbench/v2-sync", {
  namedExports: {
    upsertV2ForPlanSession: async (input: Record<string, unknown>) => {
      speilinger.push(input);
    },
  },
});

mock.module("@/lib/domain/spiller-kategori", {
  namedExports: {
    hentSpillerAkKategori: async () => "H",
    akTilNgfKategori: () => "H",
  },
});

mock.module("@/lib/ai-plan/generate", {
  namedExports: {
    genererPlan: async () => {
      throw new Error("ikke brukt i disse testene");
    },
  },
});

let lagrePlanForslagCore: typeof import("./index").lagrePlanForslagCore;
let sendTilGodkjenningCore: typeof import("./index").sendTilGodkjenningCore;

before(async () => {
  ({ lagrePlanForslagCore, sendTilGodkjenningCore } = await import("./index"));
});

beforeEach(() => {
  opprettetPlan = null;
  planEier = "syntetisk-spiller";
  planStatus = "DRAFT";
  speilinger.length = 0;
});

const forslag: PlanForslag = {
  navn: "Syntetisk ukeplan",
  beskrivelse: "Testplan uten persondata.",
  periodeUker: 1,
  fokusOmrader: ["Startlinje"],
  okter: [
    {
      uke: 1,
      dag: "MAN",
      type: "RANGE",
      varighetMin: 60,
      fokus: "Kontrollert start",
      skillArea: "TILNAERMING",
      environment: "RANGE",
      lPhase: "GRUNN",
      drills: [{ navn: "Startlinje", sets: 3, reps: 8 }],
    },
  ],
};

const fullBruker = {
  id: "syntetisk-spiller",
  name: "Øyvind Rohjan",
  hcp: 8,
  tier: "PRO",
};

test("TALENT-bruker kan ikke lagre en plan", async () => {
  await assert.rejects(
    lagrePlanForslagCore(
      { ...fullBruker, tier: "GRATIS" },
      {
        generationId: "generering-1",
        forslag,
        status: "DRAFT",
        startDato: "2026-09-14",
      },
    ),
    /Oppgrader til FULL/,
  );
  assert.equal(opprettetPlan, null);
});

test("ugyldig planforslag avvises før lagring", async () => {
  await assert.rejects(
    lagrePlanForslagCore(fullBruker, {
      generationId: "generering-1",
      forslag: { ...forslag, okter: [] },
      status: "DRAFT",
      startDato: "2026-09-14",
    }),
    /Ugyldig plan-forslag/,
  );
  assert.equal(opprettetPlan, null);
});

test("lagret plan speiler hver opprettet økt til V2", async () => {
  const resultat = await lagrePlanForslagCore(fullBruker, {
    generationId: "generering-1",
    forslag,
    status: "DRAFT",
    startDato: "2026-09-14",
  });

  assert.equal(resultat.planId, "plan-1");
  assert.equal(speilinger.length, 1);
  assert.equal(speilinger[0]?.planSessionId, "okt-1");
  assert.equal(speilinger[0]?.playerId, "syntetisk-spiller");
});

test("spiller kan ikke sende en annen spillers plan til godkjenning", async () => {
  planEier = "annen-syntetisk-spiller";
  await assert.rejects(
    sendTilGodkjenningCore("syntetisk-spiller", "plan-1"),
    /ikke tilgang/,
  );
  assert.equal(planStatus, "DRAFT");
});
