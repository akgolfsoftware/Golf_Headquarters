/**
 * Datovelger med norsk kalender: mandag først, ukenummer synlig,
 * tastaturnavigasjon i rutenettet.
 *
 * Avhengighet under hele kalenderfamilien (bølge P4) og under
 * snooze-tidsvalget i køen. Fokusoppførselen kommer fra
 * ../overlays/overlay-focus.jsx.
 */
export interface DatePickerProps {
  /** ISO-dato, "2026-07-31". Tom streng = ikke valgt. */
  value?: string;
  onChange?: (iso: string) => void;
  /** ISO-grenser. Datoer utenfor er disabled, ikke skjult. */
  min?: string;
  max?: string;
  placeholder?: string;
  /** «I dag» og «Neste mandag» i foten. Ukebasert planlegging trenger begge. */
  shortcuts?: boolean;
  disabled?: boolean;
  /** Åpen ved montering. Kun spesimenkort og dokumentasjon. */
  defaultOpen?: boolean;
  /** Settes av FormField ved feil. */
  invalid?: boolean;
  dataOdId?: string;
}
export declare function DatePicker(props: DatePickerProps): JSX.Element;
/** ISO-8601 ukenummer. Eksportert fordi kalenderfamilien trenger samme regnestykke. */
export declare function ukenummer(d: Date): number;
