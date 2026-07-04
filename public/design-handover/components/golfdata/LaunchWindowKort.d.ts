import * as React from "react";

export interface LaunchSkudd {
  /** Launch-vinkel i grader. */
  launch: number;
  /** Spinn i rpm. */
  spinn: number;
}

export interface LaunchVindu {
  launchMin: number;
  launchMax: number;
  spinnMin: number;
  spinnMax: number;
}

export interface LaunchWindowKortProps {
  /** Kølla scatteret gjelder, f.eks. "Driver". */
  kolle?: string;
  /** Spillerens CS-nivå (CS50–CS100) — navngir vinduet. */
  csNivaa?: string;
  /** TrackMan-slag (launch °, spinn rpm). */
  skudd?: LaunchSkudd[];
  /** Optimalt vindu for CS-nivået — skravert sone (--success-bg/-border). */
  vindu?: LaunchVindu;
  /** Dommen: meter som ligger igjen i vinduet — ALLTID i meter. Tall («9») eller ferdig streng. */
  meterIgjen?: number | string;
  /** Datagrunnlag — alltid synlig, f.eks. "26 slag · TrackMan". */
  grunnlag?: string;
  /** Klarspråk-dom under grafen, f.eks. «Spinnen ligger ~400 rpm for høyt …». */
  dom?: string;
  /** Progressiv dybde — én kodevei: nybegynner (graf+hero) · ovet (+dom) · elite (+vindu-fagtall). Default "ovet". */
  nivaa?: "nybegynner" | "ovet" | "elite";
  loading?: boolean;
  /** Tomtilstand = onboarding, aldri blank. */
  tomt?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * LaunchWindowKort — launch/spinn-scatter mot skravert optimalt vindu for
 * spillerens CS-nivå. Hero-tallet er meter som ligger igjen (i meter). Treff i
 * vinduet = fylt --up-punkt, utenfor = åpen ring (form + farge).
 */
export declare function LaunchWindowKort(props: LaunchWindowKortProps): JSX.Element;
