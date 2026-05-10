// round-agent: kjøres etter Round.create. Beregner SG-snitt siste 30 dager
// og skriver til Signal-tabellen.

import { prisma } from "@/lib/prisma";
import { aggregateSg } from "@/lib/sg";
import { runAgent, type AgentResult } from "./agent-runner";

export const AGENT_NAME = "round-agent";

export async function runRoundAgent(userId: string): Promise<AgentResult> {
  return runAgent(AGENT_NAME, userId, async () => {
    const tretti = new Date();
    tretti.setDate(tretti.getDate() - 30);

    const runder = await prisma.round.findMany({
      where: { userId, playedAt: { gte: tretti } },
    });

    const sg = aggregateSg(runder);
    const computedAt = new Date();

    type Skrivbar = { kind: string; value: number };
    const signals: Skrivbar[] = [];
    if (sg.total != null) signals.push({ kind: "SG_TOTAL", value: sg.total });
    if (sg.ott != null) signals.push({ kind: "SG_OTT", value: sg.ott });
    if (sg.app != null) signals.push({ kind: "SG_APP", value: sg.app });
    if (sg.arg != null) signals.push({ kind: "SG_ARG", value: sg.arg });
    if (sg.putt != null) signals.push({ kind: "SG_PUTT", value: sg.putt });

    if (signals.length === 0) {
      return { signalsWritten: 0 };
    }

    await prisma.signal.createMany({
      data: signals.map((s) => ({
        userId,
        kind: s.kind,
        value: s.value,
        computedAt,
        payload: { rundeAntall: sg.rundeAntall },
      })),
    });

    return { signalsWritten: signals.length };
  });
}
