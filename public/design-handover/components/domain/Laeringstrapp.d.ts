import * as React from "react";

export interface LaeringstrappProps {
  /** Aktivt trinn 1–5 (Kropp/Armer/Kølle/Ball/Auto). */
  aktivtTrinn: 1 | 2 | 3 | 4 | 5;
  /** Tettere geometri uten beskrivelser. */
  kompakt?: boolean;
  /** Vis trinn-etiketter under trappen. Default true. */
  visEtiketter?: boolean;
  /** Spillervisning: «Trinn X av 5» + trinnavn over trappen. */
  visStatus?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Læringstrapp — signaturmotivet: fem like steg med 1:1-stigning.
 * Aktivt trinn fylt (signal), passerte dempet-fylte, kommende kun kontur.
 * Alltid nøyaktig 5 steg (kanon). Spillervisning: «Trinn 3 av 5 · Kølle».
 */
export declare function Laeringstrapp(props: LaeringstrappProps): JSX.Element;
