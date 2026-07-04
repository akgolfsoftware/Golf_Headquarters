import * as React from "react";

export interface DeltaIndikatorProps {
  /** Delta som visningsstreng m/ fortegn, f.eks. "+0,4" / "−1,2" / "0". */
  verdi: string;
  /** Retning — utledes av fortegn om utelatt. "flat" = nøytral grå. */
  retning?: "opp" | "ned" | "flat";
  /** Snu fargelogikken (f.eks. ACWR der ned er bra). */
  invertert?: boolean;
  /** Størrelse: "sm" (11px, default) · "md" (13px). */
  size?: "sm" | "md";
  /** Tilgjengelig kontekst, f.eks. "siste 4 runder". */
  srLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Delta-indikator — retningspil + verdi i mono. Opp = lime (--up),
 * ned = coral (--down), flat = muted. Farge er aldri eneste bærer:
 * pilen + fortegnet gir samme informasjon.
 */
export declare function DeltaIndikator(props: DeltaIndikatorProps): JSX.Element;
