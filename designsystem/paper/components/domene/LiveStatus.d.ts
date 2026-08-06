/**
 * Live-indikatoren: Direkte/Pause/Avsluttet med rolig pulserende prikk
 * (~4 skjermer — live-økt, konsoll, FangstSheet). Pulsen er Skeleton-rytmen
 * i --up-raw — aldri oransje. `inverse` for blekkfylte flater (LiveBar).
 */
export interface LiveStatusProps {
  mode?: "live" | "pause" | "slutt";
  /** «12:41» eller «48 min» */
  timeLabel?: string;
  /** På blekkfylt flate (LiveBar) */
  inverse?: boolean;
  dataOdId?: string;
}
