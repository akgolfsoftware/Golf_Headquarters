/**
 * Server-siden av tilpasningsmotoren: samler PlayerSignals fra eksisterende
 * hjelpere (samme kilder og prioriteringer som Workbench-loaderen bruker).
 * Selve tilpasningslogikken bor i adapt-template.ts (ren/testbar).
 */

import { prisma } from "@/lib/prisma";
import { kategoriFraFritekst, SG_FOKUS_LABEL, type WorkbenchFokus } from "@/lib/workbench/fokus";
import { beregnSgGap } from "@/lib/workbench/sg-gap";
import { adherencePct } from "@/lib/workbench/compliance";
import { findActivePeriod } from "@/lib/workbench/period-lookup";
import type { PlayerSignals } from "./adapt-template";

const ADHERENCE_VINDU_DAGER = 28;

export async function hentPlayerSignals(userId: string, now = new Date()): Promise<PlayerSignals> {
  const vinduStart = new Date(now.getTime() - ADHERENCE_VINDU_DAGER * 86_400_000);

  const [seasonPlan, fasiliteter, okter, nesteTurnering] = await Promise.all([
    prisma.seasonPlan.findFirst({
      where: { userId },
      include: { periodBlocks: { orderBy: { startDate: "asc" } } },
    }),
    prisma.facilityPrefs.findUnique({ where: { userId } }),
    prisma.trainingPlanSession.findMany({
      where: {
        plan: { userId },
        scheduledAt: { gte: vinduStart, lte: now },
      },
      select: { scheduledAt: true, durationMin: true, status: true },
    }),
    prisma.tournamentEntry.findFirst({
      where: {
        userId,
        OR: [{ tournament: { startDate: { gte: now } } }, { manualDate: { gte: now } }],
      },
      orderBy: [{ tournament: { startDate: "asc" } }, { manualDate: "asc" }],
      select: {
        manualDate: true,
        tournament: { select: { startDate: true } },
      },
    }),
  ]);

  // Fokus: coachens eksplisitte periode-fokus vinner; ellers beregnet SG-gap
  // (samme prioritering som load-workbench.ts).
  const aktivPeriode = seasonPlan ? findActivePeriod(seasonPlan.periodBlocks, now) : null;
  let fokus: WorkbenchFokus | null = null;
  if (aktivPeriode?.focus) {
    fokus = {
      kilde: "coach",
      label: aktivPeriode.focus,
      kategori: kategoriFraFritekst(aktivPeriode.focus),
    };
  } else {
    const gap = await beregnSgGap(userId);
    if (gap) fokus = { kilde: "sg-gap", label: SG_FOKUS_LABEL[gap.kategori], kategori: gap.kategori };
  }

  const turneringsDato = nesteTurnering?.tournament?.startDate ?? nesteTurnering?.manualDate ?? null;
  const dagerTilTurnering = turneringsDato
    ? Math.max(0, Math.ceil((turneringsDato.getTime() - now.getTime()) / 86_400_000))
    : null;

  return {
    fokus,
    aktivFase: aktivPeriode?.lPhase ?? null,
    adherencePct: adherencePct(okter, now),
    fasiliteter: fasiliteter
      ? {
          range: fasiliteter.range,
          putting: fasiliteter.putting,
          shortgame: fasiliteter.shortgame,
          trackman: fasiliteter.trackman,
          course9: fasiliteter.course9,
          course18: fasiliteter.course18,
          gym: fasiliteter.gym,
          video: fasiliteter.video,
        }
      : null,
    dagerTilTurnering,
  };
}
