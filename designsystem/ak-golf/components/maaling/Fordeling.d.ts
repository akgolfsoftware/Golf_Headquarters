/**
 * Fordeling — hvordan målingene fordeler seg. Snitt som signalrød strek,
 * ett standardavvik som bånd. Rendres IKKE uten kilde og dato.
 */
export interface FordelingProps {
  verdier: number[];
  enhet?: string;
  etikett?: string;
  /** Påkrevd. */
  kilde: string;
  /** Påkrevd. */
  dato: string;
  /** Intervallbredde i enheten. Velges automatisk hvis utelatt. */
  bredde?: number;
  desimaler?: number;
  forklaring?: string;
  hoyde?: number;
  style?: React.CSSProperties;
}
export function Fordeling(props: FordelingProps): JSX.Element;
