import "server-only";

/**
 * Laster «Perioden er ferdig» for spillerens egen periode (pakke 17b). Perioden slås alltid opp med
 * spillerens id i årsplanen, så en annen spillers periode-id gir null (404), ikke data.
 */
import { prisma } from "@/lib/prisma";
import { LPHASE_LABEL } from "@/lib/labels/taxonomy";
import { OSLO_YMD_FMT } from "@/lib/jarvis/dagen";
import { SPILLER_SYNLIGE_STATUSER, tilDatoKolonne } from "@/lib/workbench/wb-map";
import { workbenchUrl } from "@/lib/workbench/visning-url";
import { periodeTall } from "@/lib/portal-plan/periode-ferdig";
import type { PHPeriodeFerdigData } from "@/components/portal/precision/PHPeriodeFerdig";

const DAG_MS = 86_400_000;
const DATO = new Intl.DateTimeFormat("nb-NO", { timeZone: "UTC", day: "numeric", month: "short" });
const DATO_AAR = new Intl.DateTimeFormat("nb-NO", { timeZone: "UTC", day: "numeric", month: "short", year: "numeric" });

/** Dagens dato som datokolonne (UTC-midnatt for Oslo-dagen). */
export const idagKolonne = (naa = new Date()) => tilDatoKolonne(OSLO_YMD_FMT.format(naa));

/** Den sist avsluttede perioden i spillerens årsplaner, eller null. */
export async function sisteFerdigePeriodeId(userId: string, naa = new Date()): Promise<string | null> {
  const p = await prisma.periodBlock.findFirst({
    where: { seasonPlan: { userId }, endDate: { lt: idagKolonne(naa) } },
    orderBy: { endDate: "desc" },
    select: { id: true },
  });
  return p?.id ?? null;
}

export type PeriodeFerdigResultat = { status: "ikke-funnet" } | { status: "pagar"; href: string } | { status: "ferdig"; data: PHPeriodeFerdigData };

export async function lastPeriodeFerdig(userId: string, periodeId: string, naa = new Date()): Promise<PeriodeFerdigResultat> {
  const p = await prisma.periodBlock.findFirst({
    where: { id: periodeId, seasonPlan: { userId } },
    select: { id: true, lPhase: true, startDate: true, endDate: true, notes: true },
  });
  if (!p) return { status: "ikke-funnet" };
  const periodeHref = workbenchUrl(userId, "periode", { periode: p.id }, "player");
  if (p.endDate >= idagKolonne(naa)) return { status: "pagar", href: periodeHref };

  // Periodedatoene er rene datoer; tidspunktene for runder og målsetninger regnes til og med sluttdagen.
  const slutt = new Date(p.endDate.getTime() + DAG_MS);
  const [okter, runder, nyeMal, neste] = await Promise.all([
    prisma.workbenchSession.findMany({
      where: {
        playerId: userId, date: { gte: p.startDate, lte: p.endDate },
        status: { in: [...SPILLER_SYNLIGE_STATUSER] }, hiddenByPlayer: false, needsPlayerApproval: false, isTemplate: false,
        OR: [{ approvalStatus: null }, { approvalStatus: { not: "REJECTED" } }],
      },
      select: { pyramid: true, durationMinutes: true, status: true },
    }),
    prisma.round.count({ where: { userId, playedAt: { gte: p.startDate, lt: slutt } } }),
    prisma.goal.count({ where: { userId, createdAt: { gte: p.startDate, lt: slutt } } }),
    prisma.periodBlock.findFirst({
      where: { seasonPlan: { userId }, startDate: { gt: p.endDate } },
      orderBy: { startDate: "asc" },
      select: { id: true, lPhase: true, startDate: true },
    }),
  ]);

  return {
    status: "ferdig",
    data: {
      navn: LPHASE_LABEL[p.lPhase],
      tidsrom: `${DATO.format(p.startDate)}–${DATO.format(p.endDate)}`,
      ferdig: DATO_AAR.format(p.endDate),
      tall: periodeTall(okter),
      runder, nyeMal,
      notat: p.notes?.trim() || null,
      neste: neste ? {
        navn: LPHASE_LABEL[neste.lPhase], start: DATO_AAR.format(neste.startDate),
        href: workbenchUrl(userId, "periode", { periode: neste.id }, "player"),
      } : null,
      periodeHref,
    },
  };
}
