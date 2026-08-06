/**
 * Årshjulet: tolv måneder med hendelser (turnering/samling/test) og
 * nå-måned (~4 skjermer — S15 Årshjul, WANG-årsplan, turneringsplanlegger).
 * IKKE Periodeplan (GRUNN/SPES/TURN-båndet) — de stables: bånd øverst,
 * hendelser under. Kolonner 12→6→4 etter container.
 */
export type YtlType = "turn" | "samling" | "test";
export interface YtlEvent { type: YtlType; label: string }
export interface YtlMonth { label: string; events?: YtlEvent[] }
export interface YearTimelineProps {
  /** Tolv måneder i sesongens rekkefølge (aug–jul for WANG) */
  months: YtlMonth[];
  nowIndex?: number;
  showLegend?: boolean;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
