/**
 * Kategorifjellet: spillerprofil over A–K-kategoriene som silhuett, med
 * stiplet kravlinje (~4 skjermer). IKKE SkillRadarLive (ferdighetsradar i
 * live-økt) og IKKE ProgramLadder (stigen) — fjellet viser HELE profilen
 * mot kravene i én figur. Kategorirekkefølgen eies av CANON via konsumenten.
 */
export interface KategoriFjellKategori {
  /** «A»…«K» — rekkefølgen kommer ferdig fra konsumenten */
  label: string;
  value: number;
  /** Kategorikravet — tegner kravlinjen når minst én finnes */
  krav?: number;
  display?: string;
}
export interface KategoriFjellProps {
  categories: KategoriFjellKategori[];
  maxValue?: number;
  /** Fremhever én kategorietikett (spillerens nivå) */
  focus?: string;
  low?: boolean;
  showLegend?: boolean;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  ariaLabel?: string;
  dataOdId?: string;
}
