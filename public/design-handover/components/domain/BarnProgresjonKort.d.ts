import * as React from "react";

export interface BarnOmrade {
  /** Klarspråk-område, f.eks. "Nærspill" / "Putting" (aldri fagkode). */
  omrade: string;
  /** Verdi i klarspråk, f.eks. "God" / "74 %". */
  verdi?: string;
  /** Trend som visningsstreng m/ fortegn → DeltaIndikator. */
  trend?: string;
}
export interface BarnProgresjonKortProps {
  navn: string;
  initialer?: string;
  /** Ett klarspråk-budskap om utviklingen. */
  oppsummering?: string;
  omrader?: BarnOmrade[];
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * BarnProgresjonKort — foreldreportal, lesevisning i klarspråk. Ingen fagkoder,
 * ID-er eller overstyr. Trend via DeltaIndikator. Foreldreflate-regel: kun klarspråk.
 */
export declare function BarnProgresjonKort(props: BarnProgresjonKortProps): JSX.Element;
