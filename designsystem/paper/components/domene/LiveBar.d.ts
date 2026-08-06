/**
 * Live-linjen under pågående økt: LiveStatus + gjeldende blokk + neste +
 * handlingsslot (~3 skjermer — live-økt, FangstSheet). Blekkfylt — eneste
 * inverterte linje i appen. IKKE StatusBar (skallets systemstatus).
 */
export interface LiveBarProps {
  mode?: "live" | "pause" | "slutt";
  timeLabel?: string;
  /** «Blokk 2 av 4 · Wedge 40–90 m» */
  currentLabel?: string;
  nextLabel?: string;
  /** Bibliotekets knapper (ghost på blekk) */
  actions?: React.ReactNode;
  flat?: boolean;
  dataOdId?: string;
}
