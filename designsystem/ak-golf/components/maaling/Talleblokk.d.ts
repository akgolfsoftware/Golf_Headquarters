/**
 * Talleblokk — merkets signatur. Et målt tall som står alene, med dato og kilde
 * båret av målestokken under tallet. Står tallet ikke i mono, er det ikke målt;
 * mangler kilden, skal blokken ikke brukes.
 */
export interface TalleblokkProps {
  /** Tallet, ferdig formatert med norsk desimalkomma: «+12,4». */
  tall: string;
  /** Enhet i mono ved siden av tallet: «m», «°», «m/s», «kr». */
  enhet?: string;
  /** Caps-etikett i mono over tallet, tre ord eller mindre. TrackMan-parametere med stor forbokstav. */
  etikett?: string;
  /** Én setning som forklarer hva tallet betyr på norsk. */
  forklaring?: string;
  /** Måleinstrument eller base: «Trackman». Påkrevd i praksis. */
  kilde?: string;
  /** Dato eller datospenn: «12.05–18.08.2026». */
  dato?: string;
  /** Antall målinger bak tallet. */
  antall?: number;
  /** Merker blokken ESTIMAT. Bruk alltid når tallet ikke er målt. */
  estimat?: boolean;
  storrelse?: 'sm' | 'md' | 'lg' | 'xl';
  /** Setter tallet i signalrødt. Kun ett fremhevet tall per flate. */
  fremhevet?: boolean;
  maalestokk?: boolean;
  style?: React.CSSProperties;
}
export function Talleblokk(props: TalleblokkProps): JSX.Element;
