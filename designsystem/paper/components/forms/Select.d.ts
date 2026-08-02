/**
 * Naken valgkontroll på en ekte <select>. Anatomien (etikett, hint, feil)
 * bor i FormField, som i alle skjemakontroller i biblioteket.
 *
 * Velg Select ved et fast, oversiktlig sett valg. Trenger valget søk,
 * mange rader eller fritekst, er komponenten Combobox.
 */
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Strenger er både verdi og etikett. */
  options: Array<string | SelectOption>;
  /** Tom førsteoppføring — bruk kun når «ikke valgt» er en gyldig tilstand. */
  placeholder?: string;
  density?: "md" | "sm";
  dataOdId?: string;
}
export declare function Select(props: SelectProps): JSX.Element;
