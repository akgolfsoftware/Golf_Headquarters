import * as React from "react";

export interface PyramideFordeling {
  FYS: number;
  TEK: number;
  SLAG: number;
  SPILL: number;
  TURN: number;
}

export interface PyramideFasettProps {
  /** Fordeling i % per akse (normaliseres til 100). Default en balansert grunn-plan. */
  fordeling?: PyramideFordeling;
  /** Bredde på pyramiden i px (høyde ≈ 0,9×). Default 168. */
  bredde?: number;
  /** Vis akse-legende ved siden av formen. Default true. */
  visEtiketter?: boolean;
  /** Vis %-tall i legenden. Default true. */
  visProsent?: boolean;
  /** Tegn terskel-hakk (15 %/40 %) på høyre egg. Default false. */
  visTerskler?: boolean;
  /** Kun formen, ingen legende. */
  kompakt?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * PyramideFasett — signaturmotivet: 5-lags treningspyramide som fasettert form.
 * Apex→base = TURN→FYS, lag-høyde ∝ fordelings-%. Farge = akse (LAG 4).
 * Bruk data-bundet eller didaktisk — aldri som bakgrunnsmønster.
 */
export declare function PyramideFasett(props: PyramideFasettProps): JSX.Element;
