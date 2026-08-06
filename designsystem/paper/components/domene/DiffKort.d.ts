/**
 * Endringsdiffen felt for felt: fra (gjennomstreket) → til (halvfet), NY
 * for nye felter (~5 skjermer — godkjenninger, PlanAction, køen). Ingen
 * godkjenner uten å se diffen. Ren visning — godkjenn/avvis eier
 * konsumenten. Chromeless — Panel eier flaten.
 */
export interface DiffRad {
  /** «Tirsdag 09:00», «Ukevolum» */
  field: string;
  /** Utelatt = nytt felt (merkes NY) */
  from?: string;
  to: string;
}
export interface DiffKortProps {
  title?: string;
  rows: DiffRad[];
  dense?: boolean;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
