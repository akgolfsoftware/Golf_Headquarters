/**
 * Engangskode i separate ruter. Avhengighet for Auth-familien (12 ruter,
 * én mal). Liming i første rute fordeler seg over alle rutene.
 */
export interface CodeInputProps {
  /** Antall siffer. 6 er standard; 4 gir bredere ruter. */
  length?: number;
  /** Hele koden som streng. Styrt. */
  value: string;
  onChange?: (value: string) => void;
  /** Kalles når siste siffer er fylt — bruk til autosending. */
  onComplete?: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  /** Gruppens navn for skjermleser. Synlig etikett settes av FormField. */
  label?: string;
  dataOdId?: string;
}
export declare function CodeInput(props: CodeInputProps): JSX.Element;
