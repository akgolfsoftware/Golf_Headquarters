/**
 * Fritekstfelt som filtrerer et sett. For sett som er for store for Select
 * og som kjennes ved navn: spillere, drills, fasiliteter, kunder.
 *
 * Fokus blir i feltet (aria-activedescendant), som ARIA-mønsteret krever —
 * derfor er dette det ene laget som ikke konsumerer useOverlayLayer.
 * Escape og klikk utenfor oppfører seg likevel som i de andre lagene.
 */
export interface ComboboxOption {
  value: string;
  label: string;
  /** Mono-notat høyrestilt i raden: kategori, antall, sist brukt. */
  note?: string;
}
export interface ComboboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "onSelect" | "value"> {
  options: Array<string | ComboboxOption>;
  /** Feltets tekst. Styrt — komponenten holder ingen skyggeverdi. */
  value: string;
  onChange?: (text: string) => void;
  /** Kalles når en rad velges, med hele objektet. */
  onSelect?: (option: ComboboxOption) => void;
  placeholder?: string;
  /** Tekst når filteret ikke gir treff. Aldri en tom liste uten forklaring. */
  emptyText?: string;
  disabled?: boolean;
  dataOdId?: string;
}
export declare function Combobox(props: ComboboxProps): JSX.Element;
