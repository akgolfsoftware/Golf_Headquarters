/**
 * Spredning — slagene sett ovenfra, med ellipse på ett standardavvik regnet fra
 * de faktiske slagene. Antall slag innenfor ellipsen telles og skrives.
 * Rendres IKKE uten kilde og dato.
 */
export interface SpredningPunkt {
  /** Sideavvik i meter. Venstre negativt, høyre positivt. */
  side: number;
  /** Lengde (Carry) i meter. */
  lengde: number;
}
export interface SpredningProps {
  punkter: SpredningPunkt[];
  /** Enhet på begge akser. Standard «m». */
  enhet?: string;
  /** Caps-etikett i mono: «Dispersion, 7-jern». */
  etikett?: string;
  /** Påkrevd. «Trackman». */
  kilde: string;
  /** Påkrevd. «18.08.2026». */
  dato: string;
  /** Overstyr antall i kildelinja (standard: punkter.length). */
  antall?: number;
  /** Målpunkt tegnet som kryss i fagfargen. */
  maal?: SpredningPunkt;
  ellipse?: boolean;
  forklaring?: string;
  /** Høyde i viewBox-enheter (bredden er alltid 640). */
  hoyde?: number;
  style?: React.CSSProperties;
}
export function Spredning(props: SpredningProps): JSX.Element;
