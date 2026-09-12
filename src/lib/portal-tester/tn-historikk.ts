import { tnComparableResult } from "./tn-integration";

export type TnHistorikkKilde = {
  id: string;
  testId: string;
  score: number;
  details: unknown;
  takenAt: Date;
};

export type TnHistorikkRad = {
  id: string;
  testId: string;
  protocolId: string;
  count: number;
  score: number;
  unit: string;
  comparisonKey: string;
  takenAt: Date;
};

/** Fullførte resultater som kan sammenlignes. Avvikende variant, score eller utgave droppes. */
export function tnHistorikkRader(rader: readonly TnHistorikkKilde[]): TnHistorikkRad[] {
  const out: TnHistorikkRad[] = [];
  for (const rad of rader) {
    const sammenlignbar = tnComparableResult(rad.testId, rad.score, rad.details);
    if (!sammenlignbar) continue;
    out.push({
      id: rad.id,
      testId: rad.testId,
      protocolId: sammenlignbar.protocolId,
      count: sammenlignbar.count,
      score: rad.score,
      unit: sammenlignbar.unit,
      comparisonKey: sammenlignbar.comparisonKey,
      takenAt: rad.takenAt,
    });
  }
  return out;
}

export function tnHistorikkForVariant(
  rader: readonly TnHistorikkRad[],
  protocolId: string,
  count: number,
): TnHistorikkRad[] {
  return rader.filter((rad) => rad.protocolId === protocolId && rad.count === count);
}

/** Fullført økt er historikk. Korrigering skjer som nytt forsøk, aldri ved å overskrive. */
export function tnKorrigeringKreverNyOkt(status: string): boolean {
  return status === "COMPLETED";
}

/** Angre gjelder bare åpent utkast. Fullført økt avbrytes ikke. */
export function tnKanAngreUtkast(status: string): boolean {
  return status === "IN_PROGRESS";
}
