import "server-only";

import { prisma } from "@/lib/prisma";
import { tilLoggetOkt } from "./logg-okt";
import type { LoggetOkt } from "./trening-stats";

/** Økter spilleren har logget i etterkant i vinduet [fra, til]. Teller i tiden, aldri mot planen. */
export async function hentLoggetTrening(userId: string, fra: Date, til: Date): Promise<LoggetOkt[]> {
  const rader = await prisma.trainingLog.findMany({
    where: { userId, date: { gte: new Date(fra.toISOString().slice(0, 10)), lte: til } },
    select: { date: true, minutes: true, pyramid: true, sgArea: true, location: true },
    orderBy: { date: "asc" },
  });
  return rader.map(tilLoggetOkt).filter((x): x is LoggetOkt => x != null);
}
