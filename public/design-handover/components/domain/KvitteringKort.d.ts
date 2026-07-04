import * as React from "react";

export interface Kvitteringslinje { tekst: string; belop: string | number; }
export interface KvitteringKortProps {
  tittel?: string;
  /** Betalingstilstand — ikon + ord (farge ikke eneste bærer). */
  status?: "betalt" | "venter" | "feilet" | "refundert";
  linjer: Kvitteringslinje[];
  /** Total (ellers summeres linjene). */
  sum?: string | number;
  valuta?: string;
  dato?: string;
  kvitteringsnr?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * KvitteringKort — betalingskvittering m/ linjer, sum, betalt-stempel og
 * kvitteringsnr/dato. Dekker betalingstilstandene betalt/venter/feilet/refundert.
 */
export declare function KvitteringKort(props: KvitteringKortProps): JSX.Element;
