import * as React from "react";

export interface SpillerTilstandKortProps {
  navn: string;
  initialer?: string;
  /** Form-tilstand — farge + standardord. */
  tilstand?: "god" | "stabil" | "varsel" | "risiko";
  /** Overstyr form-teksten (ellers standardord per tilstand). */
  formTekst?: string;
  /** SG-trend som visningsstreng m/ fortegn → DeltaIndikator. */
  sgTrend?: string;
  sgTrendLabel?: string;
  /** Siste aktivitet, f.eks. "2t siden" / "i går". */
  sisteAktivitet?: string;
  /** Ett flagg (det viktigste), f.eks. "ACWR 1,46". */
  flagg?: string;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * SpillerTilstandKort — coach-cockpitens 5-sekunderssvar: navn, form, SG-trend,
 * siste aktivitet, ett flagg. Farge aldri eneste bærer (ord + prikk + pil).
 */
export declare function SpillerTilstandKort(props: SpillerTilstandKortProps): JSX.Element;
