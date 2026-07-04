import * as React from "react";

export interface DatePickerProps {
  /** Valgt dato som ISO-streng "YYYY-MM-DD" (kontrollert). */
  value?: string;
  /** Standardverdi for ukontrollert bruk. */
  defaultValue?: string;
  onChange?: (isoDate: string) => void;
  /** Tidligste / seneste valgbare dato (ISO). */
  min?: string;
  max?: string;
  placeholder?: string;
  size?: "sm" | "md";
  disabled?: boolean;
  /** true for å markere ugyldig (rammes av FormField for melding). */
  error?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Datovelger — Input-lik trigger + månedsgrid i popover.
 * Norsk locale (uke starter mandag). Full tastaturnav: piltaster flytter dag,
 * PgUp/PgDn måned, Enter velger, Escape lukker. WAI-ARIA grid-pattern.
 */
export declare function DatePicker(props: DatePickerProps): JSX.Element;
