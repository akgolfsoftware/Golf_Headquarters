/**
 * Spillerens egenrapport: søvn/energi/motivasjon/kropp som 1–5-prikker i
 * blekk (~4 skjermer — I dag, FØR-fasen, Meg). ALDRI farget skala — en 2-er
 * er informasjon, ikke dom. SENSITIVT: kun spiller + coach; mindreårige
 * aldri i sky-prompt uten anonymisering; foreldreportal krever eget
 * samtykke. IKKE SpillerTilstandKort (coachens aggregat).
 */
export interface VelvaereFelt {
  /** «Søvn», «Energi», «Motivasjon», «Kropp» */
  label: string;
  /** 1–5 */
  value: number;
}
export interface VelvaereKortProps {
  fields: VelvaereFelt[];
  /** Spillerens frie notat (Lora) — LIFE-koder hører hit */
  note?: string;
  basis?: string;
  dense?: boolean;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
