import * as React from "react";

export interface HeroTallProps {
  /** Eyebrow-etikett, f.eks. "Plan-kvalitet" eller "Gjennomføring". */
  label: string;
  /** Verdien som visningsstreng (norsk komma) eller tall, f.eks. "87" / "94 %". */
  verdi: string | number;
  /** Enhets-suffiks i dempet liten tekst, f.eks. "%", "av 100", "SG". */
  enhet?: string;
  /** Størrelse: "md" (36px) · "lg" (48px, default) · "xl" (60px). */
  size?: "md" | "lg" | "xl";
  /** Valgfri delta-node — bruk <DeltaIndikator>. */
  delta?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Hero-tall — naken tall-lockup (eyebrow + stor tabulær mono + enhet).
 * Primitiven bak topplinjas TO TALL (plan-kvalitet 0–100 og gjennomføring %):
 * to HeroTall side om side, hver med egen eyebrow — ALDRI i samme tallgruppe.
 * For tall i kort-ramme, bruk KpiTile.
 */
export declare function HeroTall(props: HeroTallProps): JSX.Element;
