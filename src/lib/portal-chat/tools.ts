// Spiller-vendte AI-tools for portal-chat (PlayerHQ "I dag").
//
// Caddies read-tools (src/lib/caddie/tools/read.ts) er bygget for at COACHEN
// skal spørre om EN GITT spiller (playerId-parameter). Disse toolene er det
// motsatte: spilleren spør om SEG SELV — ingen playerId-parameter, alt scopes
// på viewer.id. Samme feilmønster (try/catch → toolError) og samme
// { ok, data } / { ok:false, error, userMessage }-kontrakt som Caddie.
//
// Hvert tool måler egen kjøretid (tookMs) slik at chat-UI-et kan vise en ekte
// steg-liste ("Leste ukeplan · 0,3 s") i stedet for oppdiktede tall.

import "server-only";
import { tool } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { toolError, type ToolResult } from "@/lib/caddie/types";
import { getWeekOverview } from "@/app/portal/actions";
import { getGjennomforeData } from "@/lib/portal-gjennomfore/gjennomfore-data";
import { translatePyramide } from "@/lib/portal/translate-taxonomy";
import type { PracticeType, PyramidArea } from "@/generated/prisma/client";

export { PORTAL_CHAT_TOOL_LABEL } from "./labels";
export type { PortalChatToolName } from "./labels";

// Samme mapping som src/app/portal/actions.ts og gjennomfore-data.ts —
// TrainingSessionV2 har ikke et eget pyramidArea-felt, bare practiceType.
const PRACTICE_TO_PYRAMID: Record<PracticeType, PyramidArea> = {
  BLOKK: "TEK",
  RANDOM: "SLAG",
  KONKURRANSE: "TURN",
  SPILL_TEST: "SPILL",
};

type Timed<T> = ToolResult<T> & { tookMs: number };

async function timed<T>(fn: () => Promise<ToolResult<T>>): Promise<Timed<T>> {
  const start = Date.now();
  const result = await fn();
  return { ...result, tookMs: Date.now() - start };
}

export type UkeplanOkt = {
  dato: string;
  dag: string;
  tittel: string;
  startTid: string;
  sluttTid: string;
  status: string;
  pyramidOmrade: string;
};

export type SisteOktResultat = {
  kilde: "plan" | "v2";
  dato: string;
  tittel: string;
  pyramidOmrade: string;
  /** Snitt treffprosent på tvers av loggede drills (v2), eller CS-oppnåelse (plan). Null hvis ikke logget. */
  resultatPct: number | null;
  totalReps: number | null;
  spillerensNotat: string | null;
  coachTilbakemelding: string | null;
};

/** Bygg tool-settet for én innlogget spiller. Kalles med viewer=spilleren selv. */
export function buildPortalChatTools(viewer: { id: string }) {
  return {
    hentUkeplan: tool({
      description:
        "Hent spillerens treningsplan for inneværende uke (mandag–søndag): tittel, tidspunkt, " +
        "status og pyramideområde per økt. Bruk denne når spilleren spør hva som er planlagt denne uken.",
      inputSchema: z.object({}),
      execute: async () =>
        timed<{ antallOkter: number; okter: UkeplanOkt[] }>(async () => {
          try {
            const dager = await getWeekOverview(viewer.id);
            const okter: UkeplanOkt[] = dager.flatMap((d) =>
              d.sessions.map((s) => ({
                dato: d.date.toISOString().slice(0, 10),
                dag: d.dayLabel,
                tittel: s.title,
                startTid: s.startTime.toISOString(),
                sluttTid: s.endTime.toISOString(),
                status: s.status,
                pyramidOmrade: translatePyramide(s.pyramidArea),
              })),
            );
            return { ok: true as const, data: { antallOkter: okter.length, okter } };
          } catch (err) {
            return toolError(
              `hentUkeplan feilet: ${err instanceof Error ? err.message : String(err)}`,
              "Kunne ikke hente ukeplanen din.",
            );
          }
        }),
    }),

    hentDagensOkt: tool({
      description:
        "Hent spillerens økt(er) for i dag: neste/pågående økt, resten av dagens økter, og " +
        "det som allerede er fullført — med tid, sted, varighet og drill-navn. Bruk denne når " +
        "spilleren spør hva hen skal trene i dag.",
      inputSchema: z.object({}),
      execute: async () =>
        timed(async () => {
          try {
            const data = await getGjennomforeData(viewer.id);
            return { ok: true as const, data };
          } catch (err) {
            return toolError(
              `hentDagensOkt feilet: ${err instanceof Error ? err.message : String(err)}`,
              "Kunne ikke hente dagens økt.",
            );
          }
        }),
    }),

    hentSisteOkt: tool({
      description:
        "Hent spillerens siste FULLFØRTE treningsøkt, uansett om den kom fra treningsplanen eller " +
        "ble opprettet direkte — med dato, tema og resultat der noe er logget. Bruk denne når " +
        "spilleren spør om forrige økt eller ber om sammenligning mot forrige gang.",
      inputSchema: z.object({}),
      execute: async () =>
        timed<SisteOktResultat | null>(async () => {
          try {
            const [planOkt, v2Okt] = await Promise.all([
              prisma.trainingPlanSession.findFirst({
                where: { plan: { userId: viewer.id }, status: "COMPLETED" },
                orderBy: { scheduledAt: "desc" },
                select: {
                  title: true,
                  scheduledAt: true,
                  pyramidArea: true,
                  log: {
                    select: {
                      completedAt: true,
                      csAchieved: true,
                      totalReps: true,
                      notes: true,
                      coachFeedback: true,
                    },
                  },
                },
              }),
              prisma.trainingSessionV2.findFirst({
                where: { studentId: viewer.id, status: "COMPLETED" },
                orderBy: { startTime: "desc" },
                select: {
                  title: true,
                  startTime: true,
                  practiceType: true,
                  drills: { select: { id: true } },
                },
              }),
            ]);

            let v2Resultat: SisteOktResultat | null = null;
            if (v2Okt) {
              const drillIds = v2Okt.drills.map((d) => d.id);
              const agg = drillIds.length
                ? await prisma.drillLogV2.aggregate({
                    where: { drillId: { in: drillIds } },
                    _avg: { successRate: true },
                    _sum: { repsTotal: true },
                    _max: { loggedAt: true },
                  })
                : null;
              v2Resultat = {
                kilde: "v2",
                dato: (agg?._max.loggedAt ?? v2Okt.startTime).toISOString(),
                tittel: v2Okt.title,
                pyramidOmrade: translatePyramide(PRACTICE_TO_PYRAMID[v2Okt.practiceType] ?? "TEK"),
                resultatPct: agg?._avg.successRate != null ? Math.round(agg._avg.successRate) : null,
                totalReps: agg?._sum.repsTotal ?? null,
                spillerensNotat: null,
                coachTilbakemelding: null,
              };
            }

            const planResultat: SisteOktResultat | null = planOkt
              ? {
                  kilde: "plan",
                  dato: (planOkt.log?.completedAt ?? planOkt.scheduledAt).toISOString(),
                  tittel: planOkt.title,
                  pyramidOmrade: translatePyramide(planOkt.pyramidArea),
                  resultatPct: planOkt.log?.csAchieved ?? null,
                  totalReps: planOkt.log?.totalReps ?? null,
                  spillerensNotat: planOkt.log?.notes ?? null,
                  coachTilbakemelding: planOkt.log?.coachFeedback ?? null,
                }
              : null;

            const nyest = [planResultat, v2Resultat]
              .filter((x): x is SisteOktResultat => x !== null)
              .sort((a, b) => new Date(b.dato).getTime() - new Date(a.dato).getTime())[0];

            return { ok: true as const, data: nyest ?? null };
          } catch (err) {
            return toolError(
              `hentSisteOkt feilet: ${err instanceof Error ? err.message : String(err)}`,
              "Kunne ikke hente siste økt.",
            );
          }
        }),
    }),
  } as const;
}

