import "server-only";

import { prisma } from "@/lib/prisma";
import type { LPhase } from "@/generated/prisma/client";
import type { WorkbenchData } from "./load-workbench";
import type { WorkbenchInsights } from "./types";

const PHASE_LABEL: Record<LPhase, string> = {
  GRUNN: "Grunnperiode",
  SPESIAL: "Spesialiseringsperiode",
  TURNERING: "Turneringsperiode",
};

function fmtMin(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} t` : `${h} t ${m} min`;
}

/**
 * Bygger «hvorfor denne uken»-stripe fra ekte data.
 * Ingen oppdiktede SG-tall — weaknessLine settes kun ved faktisk runde-data.
 */
export async function buildWorkbenchInsights(
  userId: string,
  data: WorkbenchData,
): Promise<WorkbenchInsights> {
  const now = new Date();
  const tretti = new Date(now);
  tretti.setDate(tretti.getDate() - 30);

  const [activeBlock, weakestPutt] = await Promise.all([
    prisma.periodBlock.findFirst({
      where: { seasonPlan: { userId }, startDate: { lte: now }, endDate: { gte: now } },
      select: { lPhase: true },
    }),
    prisma.round.findMany({
      where: { userId, playedAt: { gte: tretti } },
      select: { sgPutt: true },
      take: 20,
      orderBy: { playedAt: "desc" },
    }),
  ]);

  const periodLabel = activeBlock ? PHASE_LABEL[activeBlock.lPhase] ?? null : null;

  const puttValues = weakestPutt
    .map((r) => r.sgPutt)
    .filter((v): v is number => v !== null);
  const weaknessLine =
    puttValues.length >= 3
      ? (() => {
          const snitt = puttValues.reduce((a, b) => a + b, 0) / puttValues.length;
          if (snitt >= -0.15) return null;
          const abs = Math.abs(snitt).toFixed(1).replace(".", ",");
          return `Putting (−${abs} SG snitt siste ${puttValues.length} runder)`;
        })()
      : null;

  const weekNumber = data.summary?.weekNumber ?? isoWeek(now);
  const sessionCount =
    data.summary?.sessionCount ??
    (data.weekDays?.reduce((n, d) => n + d.events.length, 0) ?? 0);
  const plannedMinutes = Math.round((data.summary?.plannedHours ?? 0) * 60);

  const parts: string[] = [`Uke ${weekNumber}`];
  if (periodLabel) parts.push(periodLabel);
  if (weaknessLine) parts.push(weaknessLine);
  parts.push(`${sessionCount} økter`);
  if (plannedMinutes > 0) parts.push(fmtMin(plannedMinutes));

  return {
    line: parts.join(" · "),
    periodLabel,
    weaknessLine,
    sessionCount,
    plannedMinutes,
  };
}

function isoWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  return 1 + Math.round((date.getTime() - firstThursday.getTime()) / (7 * 86_400_000));
}