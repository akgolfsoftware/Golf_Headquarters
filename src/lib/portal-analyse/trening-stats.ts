/**
 * PH-17 Trening (pakke 6, godkjent av Anders 14.10.2026): gjennomført mot planen per akse og hvor spilleren trener.
 * Fasit: docs/design-system/utkast-playerhq/stats-dybde.html, malen «trening».
 * Ren funksjon. Samme regel som etterlevelse ellers i appen (beslutninger.md §KARTLEGGINGSØKT FJERNES):
 * gjennomførte mot planlagte minutter, siste fire uker, bare økter med passert sluttid.
 *
 * Økter logget i etterkant (Logg økt, TrainingLog) teller i total treningstid per akse og sted, men aldri mot
 * planen: de endrer verken planlagte minutter, prosenten eller underskuddet (vedtak 16.10 §STATS-RESTEN punkt 2).
 */
import { etterlevelse, type OktStatus } from "@/lib/domain/etterlevelse";

export type TreningAkse = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
export const TRENING_AKSER: TreningAkse[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

export type TreningOkt = { start: string; min: number; status: OktStatus; akse: TreningAkse; sted: string | null };
export type TreningFilter = { akse: TreningAkse[]; sted: string[] };
/** Økt ført i etterkant. Dato som «YYYY-MM-DD» (Oslo). */
export type LoggetOkt = { dato: string; min: number; akse: TreningAkse; sted: string | null };

export type TreningStats = {
  /** Total treningstid: gjennomført fra planen pluss logget i etterkant. */
  gjortMin: number;
  /** Gjennomført fra planen alene. Grunnlaget for prosenten og underskuddet. */
  planGjortMin: number;
  /** Logget i etterkant. Teller aldri mot planen. */
  loggetMin: number;
  planMin: number;
  /** null når ingen planlagte minutter har passert. */
  pct: number | null;
  akser: { akse: TreningAkse; gjortMin: number; planGjortMin: number; loggetMin: number; planMin: number }[];
  /** Gjennomført tid per sted, mest først. Økter uten sted telles som «Sted ikke satt». */
  sted: { navn: string; min: number }[];
};

export const UTEN_STED = "Sted ikke satt";
const OSLO_DATO = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo", year: "numeric", month: "2-digit", day: "2-digit" });

export function byggTrening(
  okter: readonly TreningOkt[],
  naa: Date,
  filter: TreningFilter = { akse: [], sted: [] },
  logget: readonly LoggetOkt[] = [],
): TreningStats {
  const passer = (o: { akse: TreningAkse; sted: string | null }) =>
    (!filter.akse.length || filter.akse.includes(o.akse)) &&
    (!filter.sted.length || filter.sted.includes(o.sted ?? UTEN_STED));
  const valgt = okter.filter(passer);
  const iDag = OSLO_DATO.format(naa);
  const loggetValgt = logget.filter((l) => passer(l) && l.min > 0 && l.dato <= iDag);
  const loggetSum = (xs: readonly LoggetOkt[]) => xs.reduce((a, l) => a + l.min, 0);
  const som = (xs: readonly TreningOkt[]) => xs.map((o) => ({ scheduledAt: new Date(o.start), durationMin: o.min, status: o.status }));
  const total = etterlevelse(som(valgt), naa);
  const akser = TRENING_AKSER
    .filter((a) => !filter.akse.length || filter.akse.includes(a))
    .map((a) => {
      const e = etterlevelse(som(valgt.filter((o) => o.akse === a)), naa);
      const l = loggetSum(loggetValgt.filter((x) => x.akse === a));
      return { akse: a, gjortMin: e.gjennomfortMinutter + l, planGjortMin: e.gjennomfortMinutter, loggetMin: l, planMin: e.planlagtMinutter };
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
  for (const l of loggetValgt) {
    const navn = l.sted ?? UTEN_STED;
    perSted.set(navn, (perSted.get(navn) ?? 0) + l.min);
  }
  const loggetMin = loggetSum(loggetValgt);
  return {
    gjortMin: total.gjennomfortMinutter + loggetMin,
    planGjortMin: total.gjennomfortMinutter,
    loggetMin,
    planMin: total.planlagtMinutter,
    pct: total.pct,
    akser,
    sted: [...perSted].map(([navn, min]) => ({ navn, min })).sort((a, b) => b.min - a.min),
  };
}

/** Stedene spilleren har økter på, for filteret. */
export function treningSteder(okter: readonly TreningOkt[], logget: readonly LoggetOkt[] = []): string[] {
  return [...new Set([...okter, ...logget].map((o) => o.sted ?? UTEN_STED))].sort((a, b) => a.localeCompare(b, "nb-NO"));
}
