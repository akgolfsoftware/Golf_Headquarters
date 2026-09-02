/**
 * Akse — én måling på en skala, med valgfritt mål. Svarer på «hvor står
 * tallet i forhold til der det skal». Rendres IKKE uten kilde og dato.
 */
export interface AkseProps {
  verdi: number;
  min: number;
  max: number;
  /** Skrives rett etter tallet: «°», « m». */
  enhet?: string;
  etikett?: string;
  /** Påkrevd. */
  kilde: string;
  /** Påkrevd. */
  dato: string;
  maal?: number;
  maalTekst?: string;
  /** Avstand mellom merkene. Standard: (max − min) / 8. */
  steg?: number;
  desimaler?: number;
  forklaring?: string;
  style?: React.CSSProperties;
}
export function Akse(props: AkseProps): JSX.Element;
