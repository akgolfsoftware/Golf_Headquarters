/**
 * Tidsserie — én måling over tid, økt for økt. Ingen glatting, ingen trend.
 * Siste verdi i signalrødt. Rendres IKKE uten kilde og daterte punkter.
 */
export interface TidsseriePunkt {
  /** «12.05» eller «12.05.2026». Vises som skrevet. */
  dato: string;
  verdi: number;
}
export interface TidsserieProps {
  punkter: TidsseriePunkt[];
  /** «m», «°», «m/s». */
  enhet?: string;
  etikett?: string;
  /** Påkrevd. */
  kilde: string;
  /** Målverdi, stiplet linje i fagfargen. */
  maal?: number;
  maalTekst?: string;
  desimaler?: number;
  forklaring?: string;
  hoyde?: number;
  style?: React.CSSProperties;
}
export function Tidsserie(props: TidsserieProps): JSX.Element;
