/**
 * PH-17 Trening (pakke 6, godkjent av Anders 14.10.2026): gjennomført mot planen per akse og hvor spilleren trener.
 * Fasit: docs/design-system/utkast-playerhq/stats-dybde.html, malen «trening».
 * Ren funksjon. Samme regel som etterlevelse ellers i appen (beslutninger.md §KARTLEGGINGSØKT FJERNES):
 * gjennomførte mot planlagte minutter, siste fire uker, bare økter med passert sluttid.
 */
import { etterlevelse, type OktStatus } from "@/lib/domain/etterlevelse";

export type TreningAkse = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
export const TRENING_AKSER: TreningAkse[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

export type TreningOkt = { start: string; min: number; status: OktStatus; akse: TreningAkse; sted: string | null };
export type TreningFilter = { akse: TreningAkse[]; sted: string[] };

export type TreningStats = {
  gjortMin: number;
  planMin: number;
  /** null når ingen planlagte minutter har passert. */
  pct: number | null;
  akser: { akse: TreningAkse; gjortMin: number; planMin: number }[];
  /** Gjennomført tid per sted, mest først. Økter uten sted telles som «Sted ikke satt». */
  sted: { navn: string; min: number }[];
};

export const UTEN_STED = "Sted ikke satt";

export function byggTrening(okter: readonly TreningOkt[], naa: Date, filter: TreningFilter = { akse: [], sted: [] }): TreningStats {
  const valgt = okter.filter((o) =>
    (!filter.akse.length || filter.akse.includes(o.akse)) &&
    (!filter.sted.length || filter.sted.includes(o.sted ?? UTEN_STED)));
  const som = (xs: readonly TreningOkt[]) => xs.map((o) => ({ scheduledAt: new Date(o.start), durationMin: o.min, status: o.status }));
  const total = etterlevelse(som(valgt), naa);
  const akser = TRENING_AKSER
    .filter((a) => !filter.akse.length || filter.akse.includes(a))
    .map((a) => {
      const e = etterlevelse(som(valgt.filter((o) => o.akse === a)), naa);
      return { akse: a, gjortMin: e.gjennomfortMinutter, planMin: e.planlagtMinutter };
    });
  // Sted: bare gjennomførte økter med passert sluttid, samme vindu som over.
  const perSted = new Map<string, number>();
  for (const o of valgt) {
    if (o.status !== "COMPLETED") continue;
    const e = etterlevelse(som([o]), naa);
    if (!e.gjennomfortMinutter) continue;
    const navn = o.sted ?? UTEN_STED;
    perSted.set(navn, (perSted.get(navn) ?? 0) + e.gjennomfortMinutter);
  }
  return {
    gjortMin: total.gjennomfortMinutter,
    planMin: total.planlagtMinutter,
    pct: total.pct,
    akser,
    sted: [...perSted].map(([navn, min]) => ({ navn, min })).sort((a, b) => b.min - a.min),
  };
}

/** Stedene spilleren har økter på, for filteret. */
export function treningSteder(okter: readonly TreningOkt[]): string[] {
  return [...new Set(okter.map((o) => o.sted ?? UTEN_STED))].sort((a, b) => a.localeCompare(b, "nb-NO"));
}
