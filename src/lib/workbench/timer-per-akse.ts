/**
 * Plannivåene henger sammen (Anders 14.10.2026, punkt 1–2): timer per akse per uke
 * i en måned, lest fra perioden og månedsplanen. Ren funksjon, ingen database.
 * Samme regel for spiller (PeriodBlock + MonthPlan) og gruppe (GroupPeriodBlock).
 *
 * - Uka hører til måneden og perioden der torsdagen ligger (som ukerForPeriode).
 * - Månedens overstyring vinner over perioden («Endret i måneden»).
 * - Lett uke bruker periodens lette tall; mangler de, er uka ikke fordelt.
 */

import { alleUkerIMaaned, ukeNokkel, type UkeOverstyringer } from "@/lib/workbench/maanedsplan-regler";
import { minutterForUke } from "@/lib/workbench/periode-ukefordeling-regler";
import type { AxisMinutes } from "@/lib/workbench/perioder";

export type AksePeriode = {
  /** «YYYY-MM-DD» */
  startDate: string;
  /** «YYYY-MM-DD» */
  endDate: string;
  axisMinutes: AxisMinutes | null;
  axisMinutesLight: AxisMinutes | null;
};

export type AkseUke = {
  /** «ÅÅÅÅ-Uxx» */
  nokkel: string;
  weekNumber: number;
  mandag: string;
  lett: boolean;
  /** Null = ikke fordelt (ingen periode med timer, og ingen overstyring). */
  minutter: AxisMinutes | null;
  kilde: "maaned" | "periode" | null;
};

function leggTil(iso: string, dager: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dager);
  return d.toISOString().slice(0, 10);
}

export function timerPerAksePerUke(input: {
  year: number;
  month: number;
  perioder: readonly AksePeriode[];
  overstyringer?: UkeOverstyringer;
  /** Ukenøkler som er lette uker. */
  letteUker?: ReadonlySet<string>;
}): AkseUke[] {
  return alleUkerIMaaned(input.year, input.month).map((u) => {
    const nokkel = ukeNokkel(u.isoYear, u.weekNumber);
    const lett = input.letteUker?.has(nokkel) ?? false;
    const base = { nokkel, weekNumber: u.weekNumber, mandag: u.mandag, lett };
    const overstyrt = input.overstyringer?.[nokkel];
    if (overstyrt) return { ...base, minutter: overstyrt, kilde: "maaned" as const };
    const torsdag = leggTil(u.mandag, 3);
    const periode = input.perioder.find((p) => p.startDate <= torsdag && torsdag <= p.endDate);
    const minutter = periode ? minutterForUke(periode, lett) : null;
    return { ...base, minutter, kilde: minutter ? ("periode" as const) : null };
  });
}

/** Sum minutter per akse over ukene. Akser uten tall i noen uke er udefinert («—»). */
export function sumPerAkse(uker: readonly AkseUke[]): AxisMinutes {
  const ut: AxisMinutes = {};
  for (const u of uker) {
    if (!u.minutter) continue;
    for (const [akse, min] of Object.entries(u.minutter) as [keyof AxisMinutes, number | undefined][]) {
      if (min != null) ut[akse] = (ut[akse] ?? 0) + min;
    }
  }
  return ut;
}
