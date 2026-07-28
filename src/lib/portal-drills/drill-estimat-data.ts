/**
 * Henter varighetshistorikk per drill for én spiller (2026-07-27).
 *
 * Brukes av Workbench til å vise «Sist: ~12 min» ved minutt-feltet når en drill
 * har vært kjørt før. Selve beregningen ligger i src/lib/domain/drill-estimat.ts
 * — denne filen gjør bare oppslaget.
 */
import { prisma } from "@/lib/prisma";
import { estimatTekst, ESTIMAT_VINDU } from "@/lib/domain/drill-estimat";

/**
 * Nøkkel en drill kjennes igjen på på tvers av økter: bibliotek-id når drillen
 * kommer derfra, ellers normalisert navn (spillerens egne, inline-lagde drills).
 */
export function drillNoekkel(drill: {
  exerciseId?: string | null;
  name?: string | null;
}): string {
  if (drill.exerciseId) return `id:${drill.exerciseId}`;
  return `navn:${(drill.name ?? "").trim().toLowerCase()}`;
}

/**
 * Map fra drill-nøkkel til ferdig badge-tekst («Sist: ~12 min»).
 * Drills uten troverdig historikk mangler i mappet — da vises ingen badge.
 *
 * Henter bevisst litt mer enn ESTIMAT_VINDU per drill (uteliggere filtreres
 * bort i beregningen, så vi trenger slingringsmonn for å lande på fem gyldige).
 */
export async function hentDrillEstimater(
  userId: string,
): Promise<Map<string, string>> {
  const rader = await prisma.trainingDrillV2.findMany({
    where: {
      actualDurationSec: { not: null },
      session: { studentId: userId, status: "COMPLETED" },
    },
    select: {
      name: true,
      exerciseId: true,
      actualDurationSec: true,
      session: { select: { startTime: true } },
    },
    orderBy: { session: { startTime: "desc" } },
    take: ESTIMAT_VINDU * 60,
  });

  // Nyeste først per nøkkel — rekkefølgen fra spørringen bevares.
  const perNoekkel = new Map<string, number[]>();
  for (const rad of rader) {
    if (rad.actualDurationSec === null) continue;
    const noekkel = drillNoekkel(rad);
    const liste = perNoekkel.get(noekkel);
    if (liste) liste.push(rad.actualDurationSec);
    else perNoekkel.set(noekkel, [rad.actualDurationSec]);
  }

  const estimater = new Map<string, string>();
  for (const [noekkel, varigheter] of perNoekkel) {
    const tekst = estimatTekst(varigheter);
    if (tekst) estimater.set(noekkel, tekst);
  }
  return estimater;
}
