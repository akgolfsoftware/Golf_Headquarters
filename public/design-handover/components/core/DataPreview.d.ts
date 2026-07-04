import * as React from "react";

export interface DataPreviewRow {
  /** Prikkfarge (f.eks. akse-token). Utelates for ingen prikk. */
  color?: string;
  /** Kort radetikett (mono). */
  label: React.ReactNode;
  /** Radverdi (mono, tabular-nums). */
  value: React.ReactNode;
  /** Valgfri farge på radverdien. */
  valueColor?: string;
}

export interface DataPreviewProps {
  /** Synlig? Hold montert og toggle denne for jevn inn/ut-fade. Default true. */
  visible?: boolean;
  /** Venstre-posisjon i forelderens `position:relative`-boks (px-tall eller CSS-streng, f.eks. "42%"). */
  x?: number | string;
  /** Topp-posisjon (px-tall eller CSS-streng). */
  y?: number | string;
  /** Hvilken side av punktet kortet legger seg. Default "top". */
  placement?: "top" | "bottom" | "left" | "right";
  /** Kort eyebrow-label over verdien (mono, muted). */
  label?: React.ReactNode;
  /** Hovedverdi (mono). Ignoreres når `rows` er satt. */
  value?: React.ReactNode;
  /** Liten enhet etter verdien. */
  unit?: React.ReactNode;
  /** Delta: tall (fortegn utleder retning + «+»-prefiks) eller ferdig formatert streng. */
  delta?: number | string;
  /** Overstyr delta-retning/-farge. Ellers utledet fra fortegnet på `delta`. */
  deltaDir?: "up" | "down" | "flat";
  /** Flerrad-modus (f.eks. SG-akser eller AK-formel). Overstyrer `value`. */
  rows?: DataPreviewRow[];
  /** Valgfri klarspråk-note under verdien (UI-font, wrapper). */
  note?: React.ReactNode;
  /** Aksentfarge på hovedverdien (f.eks. akse-farge). */
  accent?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Delt hover/scrubber-kort. Presentasjonelt: forelderen eier hover-geometrien og
 * posisjonerer via x/y; kortet eier utseende + inn/ut-bevegelse (respekterer
 * prefers-reduced-motion). Verdi i JetBrains Mono, valgfri delta i --up/--down.
 */
export function DataPreview(props: DataPreviewProps): React.ReactElement;

/**
 * Scrubber-hjelper: nærmeste punktindeks til pekerens clientX.
 * @param xFrac (i) => 0..1, punktets vannrette andel av bredden. Utelates ⇒ jevn fordeling.
 */
export function nearestIndex(
  clientX: number,
  rect: DOMRect,
  count: number,
  xFrac?: (i: number) => number
): number;
