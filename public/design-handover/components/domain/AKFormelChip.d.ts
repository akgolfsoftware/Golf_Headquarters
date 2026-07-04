import * as React from "react";

export interface AKFormelChipProps {
  /** Formelkode — kun synlig i coach-flaten, f.eks. "M2", "CS60", "L3". */
  kode: string;
  /** Klarspråk-navn, f.eks. "Kravtrening", "60 % av maksfart". */
  navn: string;
  /** Verditilstand: "arvet" (dempet — fra plan/mal) · "overstyrt" (solid — satt manuelt). */
  tilstand?: "arvet" | "overstyrt";
  /** Vis kode (coach) eller kun klarspråk (spiller). Default true. */
  visKode?: boolean;
  /** Klikk åpner redigering (chippen blir knapp). */
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * AK-formel-chip — én formelverdi på økt/drill (arena, CS, læringstrinn).
 * Tolags-språk: coach ser kode + navn, spiller ser kun klarspråk.
 * Arvet verdi = dempet; overstyrt = solid m/ tydelig kant.
 */
export declare function AKFormelChip(props: AKFormelChipProps): JSX.Element;
