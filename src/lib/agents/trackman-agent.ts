// trackman-agent: kjøres etter TrackManSession.create. Parser rawJson for
// per-kølle-statistikk og skriver Signal med kind=CLUB_AVG.

import { prisma } from "@/lib/prisma";
import { runAgent, type AgentResult } from "./agent-runner";

export const AGENT_NAME = "trackman-agent";

type Slag = Record<string, string | undefined>;

export async function runTrackManAgent(userId: string): Promise<AgentResult> {
  return runAgent(AGENT_NAME, userId, async () => {
    const sisteSesjon = await prisma.trackManSession.findFirst({
      where: { userId },
      orderBy: { recordedAt: "desc" },
    });
    if (!sisteSesjon || !sisteSesjon.rawJson) {
      return { signalsWritten: 0 };
    }

    const rader = Array.isArray(sisteSesjon.rawJson)
      ? (sisteSesjon.rawJson as unknown[])
      : [];
    if (rader.length === 0) return { signalsWritten: 0 };

    // Forsøk å gruppere etter "club"-feltet (CSV-headere varierer)
    const perKolle = new Map<string, number[]>();
    for (const rad of rader) {
      if (typeof rad !== "object" || rad === null) continue;
      const r = rad as Slag;
      const klubb = r.Club ?? r.club ?? r.kolle ?? null;
      const distanseStr = r.Distance ?? r.distance ?? r.Carry ?? r.carry ?? null;
      if (!klubb || !distanseStr) continue;
      const distanse = Number(distanseStr);
      if (Number.isNaN(distanse)) continue;
      perKolle.set(klubb, [...(perKolle.get(klubb) ?? []), distanse]);
    }

    if (perKolle.size === 0) return { signalsWritten: 0 };

    const computedAt = new Date();
    const signaler = Array.from(perKolle.entries()).map(([klubb, distanser]) => ({
      userId,
      kind: "CLUB_AVG",
      value: distanser.reduce((s, d) => s + d, 0) / distanser.length,
      payload: {
        klubb,
        antallSlag: distanser.length,
        sessionId: sisteSesjon.id,
      },
      computedAt,
    }));

    await prisma.signal.createMany({ data: signaler });
    return { signalsWritten: signaler.length };
  });
}
