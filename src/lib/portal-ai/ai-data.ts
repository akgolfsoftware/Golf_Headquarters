/**
 * Delt data-lag for AI-verktøyene i PlayerHQ (/portal/ai/*).
 *
 * Prinsipp: ALDRI falske tall. AI-forslagene bygger på ekte signaler fra
 * spillerens data — pyramide-akse-svakhet utledes fra prosessmål + tester,
 * ikke oppdiktede SG-verdier. Mangler datagrunnlag, returnerer vi ærlige
 * tomstate-felter slik at skjermene kan vise "ingen signal ennå".
 */

import { prisma } from "@/lib/prisma";
import type { PyramidArea } from "@/generated/prisma/client";

export const AXIS_ORDER: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

export const AXIS_LABEL: Record<PyramidArea, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

export type AxisKind = "fys" | "tek" | "slag" | "spill" | "turn";

export function axisKind(area: PyramidArea): AxisKind {
  return area.toLowerCase() as AxisKind;
}

export type WeaknessSignal = {
  area: PyramidArea;
  /** Kort, ærlig begrunnelse for hvorfor området er prioritert. */
  reason: string;
};

/**
 * Utleder spillerens svakeste pyramide-akser fra ekte data:
 *  1) Aktive prosessmål (Goal.category=PROCESS) peker på fokusområder.
 *  2) Tester der spilleren mangler målinger (ingen baseline) er en svakhet.
 * Returnerer en prioritert liste (kan være tom).
 */
export async function loadWeaknessSignals(userId: string): Promise<WeaknessSignal[]> {
  const [tests, results] = await Promise.all([
    prisma.testDefinition.findMany({
      where: { OR: [{ isCustom: false }, { createdById: userId }] },
      select: { id: true, pyramidArea: true },
    }),
    prisma.testResult.findMany({
      where: { userId },
      select: { testId: true },
    }),
  ]);

  const testedIds = new Set(results.map((r) => r.testId));
  const missingByArea = new Map<PyramidArea, number>();
  const totalByArea = new Map<PyramidArea, number>();
  for (const t of tests) {
    totalByArea.set(t.pyramidArea, (totalByArea.get(t.pyramidArea) ?? 0) + 1);
    if (!testedIds.has(t.id)) {
      missingByArea.set(t.pyramidArea, (missingByArea.get(t.pyramidArea) ?? 0) + 1);
    }
  }

  const signals: WeaknessSignal[] = [];
  for (const area of AXIS_ORDER) {
    const missing = missingByArea.get(area) ?? 0;
    const total = totalByArea.get(area) ?? 0;
    if (missing > 0) {
      signals.push({
        area,
        reason:
          total === missing
            ? `${missing} ${AXIS_LABEL[area].toLowerCase()}-tester uten baseline ennå`
            : `${missing} av ${total} tester mangler en fersk måling`,
      });
    }
  }

  // Sorter på flest manglende målinger først.
  signals.sort(
    (a, b) => (missingByArea.get(b.area) ?? 0) - (missingByArea.get(a.area) ?? 0),
  );
  return signals;
}
