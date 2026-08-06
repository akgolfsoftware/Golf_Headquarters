/**
 * Scorekortet: 18 hull som ut/inn-niere, BRUTTO slag (aldri netto —
 * golfdataregelen), golfens merker: sirkel under par, firkant over
 * (~6 skjermer). Ren visning — redigering bor i FangstSheet. IKKE HoleStrip
 * (golfviz — SG per hull som stripe). Chromeless — Panel eier flaten.
 */
export interface ScorekortHull {
  par: number;
  /** Brutto slag */
  score: number;
}
export interface ScorekortProps {
  /** 9 eller 18 hull i rekkefølge */
  holes: ScorekortHull[];
  /** Skjuler par-radene */
  compact?: boolean;
  /** «GFGK · 3. august» */
  courseLabel?: string;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
