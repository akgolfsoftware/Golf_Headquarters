import "server-only";

/**
 * Utgangspunkt for et nytt TrackMan-mål (AG-TP-01): snittet (eller spredningen)
 * fra spillerens siste TrackMan-økt med samme kølle. Finnes ingen slag, lagres
 * målet med baselineFrom «ingen» og vises som «—» — aldri et oppdiktet tall.
 */

import { prisma } from "@/lib/prisma";
import { aggregateMetric } from "@/lib/teknisk-plan/update-tm-goals";

export type Utgangspunkt = { verdi: number; fra: string; dato: Date; n: number | null };

export async function utgangspunktFraSisteOkt(userId: string, metric: string, klubb: string | null): Promise<Utgangspunkt> {
  const okt = await prisma.trackManSession.findFirst({
    where: { userId, ...(klubb ? { shots: { some: { club: klubb, outlier: false } } } : {}) },
    orderBy: { recordedAt: "desc" },
    select: {
      recordedAt: true,
      shots: {
        where: { outlier: false, ...(klubb ? { club: klubb } : {}) },
        select: {
          clubSpeed: true, ballSpeed: true, smashFactor: true, carryDistance: true, side: true, clubPath: true,
          faceAngle: true, faceToPath: true, attackAngle: true, launchAngle: true, spinRate: true,
        },
      },
    },
  });
  const verdi = okt ? aggregateMetric(metric, okt.shots) : null;
  if (!okt || verdi == null) return { verdi: 0, fra: "ingen", dato: new Date(), n: null };
  return { verdi, fra: "siste-okt", dato: okt.recordedAt, n: okt.shots.length };
}
