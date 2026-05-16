// refresh-calendar-watches: cron daglig (typisk 02:00 UTC). Fornyer Google
// Calendar Push Notifications som utløper innen 24 timer. Google tillater maks
// 7 dager per watch, så vi må re-registrere før det.
//
// Strategi: stop eksisterende watch, opprett ny. Idempotent — feiler én
// subscription stopper ikke loopen for de andre.

import { prisma } from "@/lib/prisma";
import {
  setupWatchForSubscription,
  stopWatchForSubscription,
} from "@/lib/google-calendar";
import type { AgentResult } from "./agent-runner";
import { runAgent } from "./agent-runner";

export const AGENT_NAME = "refresh-calendar-watches";

export async function runRefreshCalendarWatches(): Promise<AgentResult> {
  return runAgent(AGENT_NAME, null, async () => {
    const grense = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Aktive pull-subscriptions hvor watch enten mangler eller utløper snart
    const subs = await prisma.googleCalendarSubscription.findMany({
      where: {
        syncPull: true,
        active: true,
        OR: [
          { watchChannelId: null },
          { watchExpiresAt: { lt: grense } },
        ],
      },
      select: { id: true, watchChannelId: true },
    });

    let fornyet = 0;
    let opprettet = 0;
    let feilet = 0;
    const feilDetaljer: { id: string; feil: string }[] = [];

    for (const sub of subs) {
      try {
        if (sub.watchChannelId) {
          await stopWatchForSubscription(sub.id);
        }
        const result = await setupWatchForSubscription(sub.id);
        if (result) {
          if (sub.watchChannelId) fornyet++;
          else opprettet++;
        } else {
          feilet++;
          feilDetaljer.push({ id: sub.id, feil: "setup returnerte null" });
        }
      } catch (err) {
        const melding = err instanceof Error ? err.message : String(err);
        feilDetaljer.push({ id: sub.id, feil: melding });
        feilet++;
      }
    }

    return {
      output: {
        totalt: subs.length,
        fornyet,
        opprettet,
        feilet,
        feilDetaljer: feilDetaljer.slice(0, 10),
      },
    };
  });
}
