import * as React from "react";

export type DiffAkse = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";

export interface DiffKortProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface DiffKolonneProps {
  children?: React.ReactNode;
}

export interface DiffRadProps {
  /** Pyramide-akse — gir semantisk kant-farge. */
  akse?: DiffAkse;
  /** Metalinje, f.eks. "Lør 09:00 · 1,5t · CS50". */
  meta?: string;
  children?: React.ReactNode;
}

export interface DiffMetrikkProps {
  label: string;
  /** Verdi før endringen. */
  fra: string;
  /** Verdi etter endringen. */
  til: string;
  /** Retning for fargen på ny verdi: "positiv" (signal) · "negativ" (amber). */
  tone?: "positiv" | "negativ";
}

/**
 * Diff-kort — før/etter-visning av en plan-endring (AI-forslag, godkjenninger, audit-logg).
 * Compound: <DiffKort.Fjernes> / <DiffKort.LeggesTil> med <DiffKort.Rad>,
 * pluss <DiffKort.Effekt> med <DiffKort.Metrikk> (fra → til).
 */
export declare function DiffKort(props: DiffKortProps): JSX.Element;
export declare namespace DiffKort {
  function Fjernes(props: DiffKolonneProps): JSX.Element;
  function LeggesTil(props: DiffKolonneProps): JSX.Element;
  function Rad(props: DiffRadProps): JSX.Element;
  function Effekt(props: DiffKolonneProps): JSX.Element;
  function Metrikk(props: DiffMetrikkProps): JSX.Element;
}
