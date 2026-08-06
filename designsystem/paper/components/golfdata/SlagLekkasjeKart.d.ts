/**
 * Slaglekkasjen — SG-tap rangert, størst først (~5 skjermer). Konsumenten
 * sorterer; øverste rad tones full leire. IKKE SgBreakdown (alle kategorier
 * begge veier) — kartet viser bare TAPENE. Chromeless — Panel eier flaten.
 */
export interface LekkasjeRad {
  /** «Nærspill 20–50 m», «Utslag under press» */
  label: string;
  /** Negativ SG-verdi */
  sg: number;
  /** «−1,84» — signert, komma-desimal */
  display: string;
}
export interface SlagLekkasjeKartProps {
  /** Ferdig sortert, størst lekkasje først */
  rows: LekkasjeRad[];
  basis?: string;
  note?: string;
  dense?: boolean;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
