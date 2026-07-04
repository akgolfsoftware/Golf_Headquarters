import * as React from "react";

export interface TigerFiveMetrikk {
  navn: string;
  verdi: string | number;
  enhet?: string;
  /** Status — farge + prikk (aldri eneste bærer). */
  status?: "god" | "varsel" | "risiko" | "noytral";
  /** Trend som visningsstreng m/ fortegn → DeltaIndikator. */
  trend?: string;
  /** Snu trend-fargelogikk (der lavere er bedre). */
  invertert?: boolean;
}
export interface TigerFiveKortProps {
  metrikker: TigerFiveMetrikk[];
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * TigerFiveKort — de fem kjernemetrikkene med status (prikk + farge) og trend
 * (DeltaIndikator). Kompakt tilstandsavlesning. Tomt = onboarding.
 */
export declare function TigerFiveKort(props: TigerFiveKortProps): JSX.Element;
