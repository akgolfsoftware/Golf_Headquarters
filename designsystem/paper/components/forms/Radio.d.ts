/**
 * Radioknapp og radiogruppe. Etiketten står ved siden av merket, som i
 * Checkbox — en radio kan ikke arve FormFields kolonneanatomi.
 *
 * Bruk Radio for 2–4 korte valg som skal sees samtidig. Filtre og visninger
 * er SegmentControl; lange lister er Select eller Combobox.
 */
export interface RadioOption {
  value: string;
  label: string;
  /** Mono-presisering under etiketten: pris, varighet, konsekvens. */
  note?: string;
  disabled?: boolean;
}
export interface RadioProps {
  name: string;
  value: string;
  checked?: boolean;
  onChange?: (value: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  label: React.ReactNode;
  note?: React.ReactNode;
  disabled?: boolean;
  dataOdId?: string;
}
export interface RadioGroupProps {
  /** aria-label på gruppen. Synlig etikett settes av FormField rundt. */
  label?: string;
  /** Utelates for autogenerert navn. */
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: Array<string | RadioOption>;
  /** Vannrett rad. Kun for korte etiketter uten note. */
  row?: boolean;
  dataOdId?: string;
}
export declare function Radio(props: RadioProps): JSX.Element;
export declare function RadioGroup(props: RadioGroupProps): JSX.Element;
