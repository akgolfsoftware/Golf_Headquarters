/**
 * Coachens målspor i Workbench: aktive mål for én spiller, med planleggings-
 * nivå, fremdrift og planlagt/gjennomført/uteblitt.
 *
 * FORUTSETNING: kalleren har allerede kontrollert coachens tilgang til
 * spilleren (`coachScopedPlayerWhere` / `assertCoachTilgangTilSpiller`).
 * Denne funksjonen sjekker ikke tilgang selv.
 *
 * Kun aktive mål og feltene visningen trenger hentes. `payload` leses kun for
 * nivåvalget og sendes aldri videre.
 */

import "server-only";
import { prisma } from "@/lib/prisma";
import { beregnGoalProgress } from "@/lib/portal/goals/progress";
import type { PlanningGoalSummary } from "@/lib/domain/workbench/types";
import {
  beregnMaalSpor,
  foreslaNesteTiltak,
  GOAL_TYPE_LABEL,
  losPlanNivaa,
  planVindu,
} from "@/lib/domain/maal-plannivaa";

const MAKS_MAAL = 8;

function osloIdag(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
}

function utcDato(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

export async function hentMaalSpor(playerId: string): Promise<PlanningGoalSummary[]> {
  const idag = osloIdag();

  const [goals, spiller] = await Promise.all([
    prisma.goal.findMany({
      where: { userId: playerId, status: "ACTIVE" },
      select: {
        id: true,
        userId: true,
        type: true,
        category: true,
        title: true,
        targetValue: true,
        targetDate: true,
        payload: true,
        linkedPyramidArea: true,
        linkedTestId: true,
      },
      orderBy: [{ category: "asc" }, { targetDate: "asc" }, { createdAt: "desc" }],
      take: MAKS_MAAL,
    }),
    prisma.user.findUnique({ where: { id: playerId }, select: { hcp: true } }),
  ]);
  if (goals.length === 0) return [];

  const oppslag = goals.map((goal) => {
    const fristIso = goal.targetDate ? goal.targetDate.toISOString().slice(0, 10) : null;
    return { goal, fristIso, ...losPlanNivaa(goal.payload, fristIso, idag) };
  });

  // Én spørring for alle øktkoblede mål: union av vinduene, filtrert per mål under.
  const koblede = oppslag.filter((o) => o.goal.linkedPyramidArea);
  const okter =
    koblede.length === 0
      ? []
      : await (async () => {
          const vinduer = koblede.map((o) => planVindu(o.nivaa, idag));
          const fra = vinduer.reduce((min, v) => (v.fra < min ? v.fra : min), vinduer[0].fra);
          const til = vinduer.reduce((maks, v) => (v.til > maks ? v.til : maks), vinduer[0].til);
          const rader = await prisma.workbenchSession.findMany({
            where: {
              playerId,
              date: { gte: utcDato(fra), lte: utcDato(til) },
              pyramid: { in: [...new Set(koblede.map((o) => o.goal.linkedPyramidArea as string))] },
            },
            select: { date: true, status: true, pyramid: true },
          });
          return rader.map((r) => ({
            date: r.date.toISOString().slice(0, 10),
            status: r.status,
            pyramid: r.pyramid,
          }));
        })();

  return Promise.all(
    oppslag.map(async ({ goal, fristIso, nivaa, kilde }): Promise<PlanningGoalSummary> => {
      const fremdrift = await beregnGoalProgress(goal, { hcp: spiller?.hcp ?? null });
      const vindu = planVindu(nivaa, idag);
      const spor = goal.linkedPyramidArea
        ? beregnMaalSpor(
            okter.filter(
              (o) => o.pyramid === goal.linkedPyramidArea && o.date >= vindu.fra && o.date <= vindu.til,
            ),
            idag,
          )
        : null;
      return {
        id: goal.id,
        title: goal.title,
        category: goal.category,
        targetDate: fristIso,
        typeLabel: GOAL_TYPE_LABEL[goal.type] ?? "Mål",
        planNivaa: nivaa,
        planNivaaKilde: kilde,
        fremdrift: {
          pct: fremdrift.pct,
          hasData: fremdrift.hasData,
          status: fremdrift.status,
          detail: fremdrift.detail,
        },
        spor,
        nesteTiltak: foreslaNesteTiltak({ fremdriftStatus: fremdrift.status, spor }),
      };
    }),
  );
}
