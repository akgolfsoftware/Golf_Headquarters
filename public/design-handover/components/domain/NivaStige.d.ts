import * as React from "react";

export interface NivaStigeProps {
  /** Nåværende nivå (tall eller kort kode). */
  nivaa: string | number;
  etikett?: string;
  /** Antall nivåer/steg i stigen. Default 5. */
  steg?: number;
  /** Antall hele nådde steg. */
  fylte?: number;
  /** Fremdrift 0–1 innen neste steg (fyller neste prikk halvt). */
  fremdrift?: number;
  nesteEtikett?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * NivaStige — AK-stige / nivåprogresjon: nivå-badge + dotted fremdrift mot neste.
 * Data-bundet/didaktisk (aldri dekor). Signal-fylte prikker for nådde steg.
 */
export declare function NivaStige(props: NivaStigeProps): JSX.Element;
