/**
 * Fordeling over én akse som ETT stablet bånd med legend — slagfordeling,
 * tid per selskap, score per hulltype (~8 skjermer). Maks fem segmenter fra
 * en lukket femtonersliste. IKKE BarChart (absolutte verdier per kategori)
 * og IKKE PyramideFasett (pyramidens fem områder med filter).
 */
export type AfbTone = "ink" | "info" | "up" | "mid" | "soft";
export interface AfbSegment {
  label: string;
  /** Andel — brukes som flex-vekt */
  pct: number;
  /** «42 %» eller «12,5 t» */
  display?: string;
  /** Overstyr tildelt tone — sjelden riktig */
  tone?: AfbTone;
}
export interface AkseFordelingsBarProps {
  segments: AfbSegment[];
  thin?: boolean;
  hideLegend?: boolean;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  ariaLabel?: string;
  dataOdId?: string;
}
