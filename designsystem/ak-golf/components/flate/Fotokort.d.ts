/**
 * Fotokort — bilde med bildetekst, og eventuelt tekst lagt over med mørkt sjikt
 * fra bunnen. Sjiktet er en gradering, ikke et lag over hele bildet.
 * Kontrastkravet 4,5:1 gjelder mot bildepartiet teksten ligger på.
 */
export interface FotokortProps {
  bilde: string;
  /** Alt-tekst. Beskriv hva som skjer i bildet, ikke «bilde av golf». */
  alt: string;
  bildetekst?: string;
  /** Kilde eller dato i mono, høyre side av bildeteksten. */
  kilde?: string;
  /** Innhold lagt over bildet. Utløser det mørke sjiktet. Bruk hvit tekst og hvit logo. */
  tekstOver?: React.ReactNode;
  forhold?: string;
  hoyde?: number | string;
  style?: React.CSSProperties;
}
export function Fotokort(props: FotokortProps): JSX.Element;
