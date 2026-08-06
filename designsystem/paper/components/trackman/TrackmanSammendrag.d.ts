/**
 * TrackMan-øktas sammendrag: fire mono-nøkkeltall + høydepunkter
 * (~4 skjermer — TrackMan-fanen, økt-artefakt, live-økt ETTER).
 * Døra inn til økta — detaljene bor i KolleStatKort/LaunchWindowKort/
 * DispersionMap. Chromeless — Panel eier flaten.
 */
export interface TmsFelt {
  /** «Slag», «Køller», «Snitt smash», «Beste carry» */
  label: string;
  /** «84», «1,44», «236 m» */
  value: string;
}
export interface TrackmanSammendragProps {
  /** «3. august · Mulligan 3 · 62 min» */
  sessionLabel?: string;
  /** Maks fire */
  fields: TmsFelt[];
  highlights?: string[];
  dense?: boolean;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
