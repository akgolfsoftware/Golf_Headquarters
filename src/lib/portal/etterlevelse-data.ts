import "server-only";
import { loadVisibleSessionRange } from "./visible-session-range";
import { etterlevelse, etterlevelseFra } from "@/lib/domain/etterlevelse";
import type { PyramidArea } from "@/generated/prisma/client";
import type { TodaySession } from "@/app/portal/actions";

/** Intern leser etter kallerens spiller-/coach-/foresattvakt. Samme
 * synlighet og speildeduplisering som I dag/Plan. Ingen skriver eller cache
 * på tvers av forespørsler. */
export function somEtterlevelseOkt(session: TodaySession) {
  return { scheduledAt: session.startTime, durationMin: session.durationMin, status: session.status };
}

async function hentEtterlevelseMedAkser(userId: string, now: Date) {
  const sessions = await loadVisibleSessionRange(userId, etterlevelseFra(now).toISOString(), now.toISOString());
  const perAkse = new Map((["FYS", "TEK", "SLAG", "SPILL", "TURN"] as PyramidArea[]).map(axis =>
    [axis, etterlevelse(sessions.filter(s => s.pyramidArea === axis).map(somEtterlevelseOkt), now)]));
  return { ...etterlevelse(sessions.map(somEtterlevelseOkt), now), perAkse };
}

export async function hentEtterlevelse(userId: string, now = new Date()) {
  const sessions = await loadVisibleSessionRange(userId, etterlevelseFra(now).toISOString(), now.toISOString());
  return etterlevelse(sessions.map(somEtterlevelseOkt), now);
}

/** Avgrens samtidige databaseoppslag for en tilgangsfiltrert stall. */
export async function hentStallEtterlevelse(playerIds: readonly string[], now: Date) {
  const result = new Map<string, Awaited<ReturnType<typeof hentEtterlevelseMedAkser>>>();
  for (let i = 0; i < playerIds.length; i += 8) {
    await Promise.all(playerIds.slice(i, i + 8).map(async id => {
      result.set(id, await hentEtterlevelseMedAkser(id, now));
    }));
  }
  return result;
}
