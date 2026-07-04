import * as React from "react";

export interface SgKategori {
  akse: "OTT" | "APP" | "ARG" | "PUTT";
  /** SG mot baseline i slag (fortegn: + gevinst, − tap). */
  sg: number;
  baseline?: string;
}
export interface SgKategoriBarProps {
  kategorier: SgKategori[];
  /** Navngitt baseline — vist fra nivå «øvet». */
  baseline?: string;
  nivaa?: "nybegynner" | "ovet" | "elite";
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * SgKategoriBar — divergerende SG-stolper (OTT/APP/ARG/PUTT) om nullbaseline,
 * tap venstre (--down) / gevinst høyre (--up), største tap fremhevet. Egen viz
 * (ikke BarChart — den er magnitude-fra-0, ikke divergerende m/ fortegn). Tomt = onboarding.
 */
export declare function SgKategoriBar(props: SgKategoriBarProps): JSX.Element;
