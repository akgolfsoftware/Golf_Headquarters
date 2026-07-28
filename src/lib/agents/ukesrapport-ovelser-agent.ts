// ukesrapport-ovelser: ukentlig oppsummering av hele øvelses-motoren
// (radar → fabrikk → media-lofte → godkjenningsinnboks). Sendes ALLTID til
// Telegram OG som in-app-varsel i AgencyOS (varsleAgentFunn dekker begge
// kanaler i ett kall — samme mønster som resten av agent-varslingen i appen).
// Ren rapportering, ingen handling: coachen åpner selv
// /admin/drills/forslag for å godkjenne/avvise.

import { prisma } from "@/lib/prisma";
import { runAgent, type AgentResult } from "./agent-runner";
import { varsleAgentFunn } from "./agent-notify";
import { DRILL_DRAFT_TOOL } from "./drill-forslag-agent";
import { MEDIA_DRAFT_TOOL } from "./media-lofte-agent";

export const AGENT_NAME = "ukesrapport-ovelser";

const FORSLAG_TOOLS = [DRILL_DRAFT_TOOL, MEDIA_DRAFT_TOOL];
const DAGER = 7;

function pl(n: number, en: string, flere: string): string {
  return `${n} ${n === 1 ? en : flere}`;
}

export async function runUkesrapportOvelser(): Promise<AgentResult> {
  return runAgent(AGENT_NAME, null, async () => {
    const ukeStart = new Date(Date.now() - DAGER * 86_400_000);

    const [radarUke, radarPerKilde, forslagUke, godkjentUke, avvistUke, ventendeNa, admins] =
      await Promise.all([
        prisma.radarFunn.count({ where: { funnetAt: { gte: ukeStart } } }),
        prisma.radarFunn.groupBy({
          by: ["kilde"],
          where: { funnetAt: { gte: ukeStart } },
          _count: { _all: true },
        }),
        prisma.caddieDraft.count({
          where: { toolName: { in: FORSLAG_TOOLS }, createdAt: { gte: ukeStart } },
        }),
        prisma.caddieDraft.count({
          where: { toolName: { in: FORSLAG_TOOLS }, status: "APPROVED", resolvedAt: { gte: ukeStart } },
        }),
        prisma.caddieDraft.count({
          where: { toolName: { in: FORSLAG_TOOLS }, status: "REJECTED", resolvedAt: { gte: ukeStart } },
        }),
        prisma.caddieDraft.count({
          where: { toolName: { in: FORSLAG_TOOLS }, status: "PENDING" },
        }),
        prisma.user.findMany({ where: { role: "ADMIN", deletedAt: null }, select: { id: true } }),
      ]);

    const videoFunn = radarPerKilde.find((r) => r.kilde === "youtube")?._count._all ?? 0;
    const artikkelFunn = radarPerKilde.find((r) => r.kilde === "rss")?._count._all ?? 0;

    if (radarUke === 0 && forslagUke === 0 && ventendeNa === 0) {
      return {
        output: {
          status: "stille-uke",
          melding: "Ingen radar-funn, forslag eller ventende godkjenninger denne uka.",
        },
      };
    }

    const linjer = [
      `Radar: ${pl(radarUke, "nytt funn", "nye funn")} (${videoFunn} video, ${artikkelFunn} artikkel)`,
      `Fabrikk: ${pl(forslagUke, "forslag generert", "forslag generert")} denne uka`,
      `Godkjent: ${godkjentUke}   Avvist: ${avvistUke}`,
      `Venter på deg nå: ${pl(ventendeNa, "forslag", "forslag")}`,
    ];
    const tekst = linjer.join("\n");

    for (let i = 0; i < admins.length; i++) {
      await varsleAgentFunn({
        coachId: admins[i].id,
        tittel: "Øvelses-motoren — ukesrapport",
        tekst,
        lenke: "/admin/drills/forslag",
        telegram: i === 0, // kun ett Telegram-varsel selv om det er flere admin-brukere
      });
    }

    return {
      output: {
        status: "ok",
        radarUke,
        videoFunn,
        artikkelFunn,
        forslagUke,
        godkjentUke,
        avvistUke,
        ventendeNa,
        varsletCoacher: admins.length,
      },
    };
  });
}
