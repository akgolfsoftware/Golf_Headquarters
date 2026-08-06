/**
 * Ballbanen fra siden: hvert slag dempet, snittet i blekk (~4 skjermer).
 * Kurven er en symmetrisk TILNÆRMING fra carry + apex (beregnet, ikke
 * aerodynamisk) — den viser høydevinduet, ikke ballfysikk. IKKE
 * DispersionMap (ovenfra/retning) — dette er høyden.
 * Chromeless — Panel eier flaten.
 */
export interface TrajShot {
  /** Carry i meter */
  carry: number;
  /** Apex i meter */
  apex: number;
}
export interface TrajectoryPlotProps {
  shots?: TrajShot[];
  /** Snittbanen — tegnes i blekk over */
  mean?: TrajShot;
  maxCarry?: number;
  maxHeight?: number;
  /** «168 m» — overstyrer autogenerert nøkkeltekst */
  carryLabel?: string;
  apexLabel?: string;
  low?: boolean;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
