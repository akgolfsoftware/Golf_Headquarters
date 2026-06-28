// daily-brief: selvgående cron-agent som genererer morgenbrief per coach og
// varsler om hastefunn. Wrapper den Claude-drevne golf-agenten
// `genererDailyBrief` (src/lib/ai/agents/daily-brief.ts) inn i det felles
// agent-rammeverket: runAgent() logger til AgentRun (synlig i /admin/agents),
// og varsleAgentFunn() ruter hastefunn til coachen + Anders på Telegram.

import { prisma } from "@/lib/prisma";
import { runAgent, type AgentResult } from "./agent-runner";
import { genererDailyBrief } from "@/lib/ai/agents/daily-brief";
import { varsleAgentFunn } from "./agent-notify";

export const AGENT_NAME = "daily-brief";

// Flagg med severity >= dette regnes som hastefunn → coachen varsles.
const HASTE_TERSKEL = 4;

export async function runDailyBrief(): Promise<AgentResult> {
  return runAgent(AGENT_NAME, null, async () => {
    const coacher = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "COACH"] }, deletedAt: null },
      select: { id: true, name: true },
    });

    const idag = new Date();
    const briefs: Array<{
      coachId: string;
      coachNavn: string;
      brief: string;
      flagg: number;
      hasteFlagg: number;
    }> = [];
    let varsler = 0;

    for (const coach of coacher) {
      const { brief, metrics } = await genererDailyBrief({
        coachId: coach.id,
        dato: idag,
      });
      const hasteFlagg = metrics.flagg.filter(
        (f) => f.severity >= HASTE_TERSKEL,
      );

      briefs.push({
        coachId: coach.id,
        coachNavn: coach.name ?? "Ukjent",
        brief,
        flagg: metrics.flagg.length,
        hasteFlagg: hasteFlagg.length,
      });

      if (hasteFlagg.length > 0) {
        const linjer = hasteFlagg
          .map((f) => `- ${f.spillerNavn}: ${f.melding}`)
          .join("\n");
        await varsleAgentFunn({
          coachId: coach.id,
          tittel: `Daily Brief — ${hasteFlagg.length} ${
            hasteFlagg.length === 1 ? "spiller krever" : "spillere krever"
          } handling`,
          tekst: `${linjer}\n\nÅpne dagsbriefen i AgencyOS for full oversikt.`,
          lenke: "/admin/agencyos",
        });
        varsler++;
      }
    }

    return {
      output: {
        coacher: coacher.length,
        varsler,
        briefs,
      },
    };
  });
}
