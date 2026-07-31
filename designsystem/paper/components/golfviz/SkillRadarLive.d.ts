export interface SkillRadarLiveProps {
  /** Aksenavn, f.eks. ["OTT","APP","ARG","PUTT","FYS"] */
  axes?: string[];
  /** 0–1 per akse — heltrukken --fg med 8 % fyll */
  now?: number[];
  /** 0–1 — stiplet --info-raw */
  target?: number[];
  /** 0–1 — prikket --mid (grafikk-unntaket) */
  previous?: number[];
  size?: number;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
