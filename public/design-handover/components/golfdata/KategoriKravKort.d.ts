import * as React from "react";

export interface Kravrad {
  navn: string;
  bestatt: boolean;
  /** Nåværende verdi (visningsstreng). */
  verdi?: string;
  /** Målverdi/krav (visningsstreng). */
  mal?: string;
}
export interface KategoriKravKortProps {
  /** Spillerens nivå A–K (A = beste, jf. kanon). */
  nivaa: string;
  nesteNivaa?: string;
  krav: Kravrad[];
  /** Neste krav i klarspråk. */
  nesteKrav?: string;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * KategoriKravKort — spillerens A–K-nivå (A = beste): bestått/gjenstår per
 * testprotokoll-krav + neste krav. Sjekkliste; check aldri eneste bærer (ikon + tekst).
 */
export declare function KategoriKravKort(props: KategoriKravKortProps): JSX.Element;
