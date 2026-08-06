/**
 * Treffkvaliteten: smash factor mot mål + treffbilde hæl/senter/tå
 * (~4 skjermer). Senter = oliven, hæl/tå = gråtoner (avvik, ikke moral).
 * IKKE LaunchWindowKort (ballens start) — dette er KONTAKTEN.
 * Chromeless — Panel eier flaten.
 */
export interface StrikeSmashKortProps {
  /** 1.46 → vises 1,46 */
  smash?: number;
  smashTarget?: number;
  club?: string;
  /** Prosentandeler — summen bør være 100 */
  heel?: number;
  center?: number;
  toe?: number;
  basis?: string;
  compact?: boolean;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
