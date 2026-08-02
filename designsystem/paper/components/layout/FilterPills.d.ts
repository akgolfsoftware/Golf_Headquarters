/**
 * FilterPills — innsnevring av et sett som allerede vises. Piller med antall,
 * flervalg som standard, og en nullstiller som bare finnes når noe er valgt.
 *
 * Erstatter de håndrullede chip-radene over lister og tabeller.
 *
 * Hva den IKKE er:
 * - `Tabs` = navigasjon. Bytter HVA du ser. Filtre bestemmer hvor mye av det
 *   samme du ser.
 * - `SegmentControl` = eksklusivt valg av én verdi, med `--soft`-spor.
 *   FilterPills er flervalg og har ingen spor.
 * - `Chip` = etikett eller fjernbar tagg på et objekt. Ikke en kontroll over
 *   et sett.
 */
export interface FilterPillOption {
  value: string;
  label: string;
  /** Antall treff bak valget. Mono, tabulære sifre. */
  count?: number;
}

export interface FilterPillsProps {
  /** Mono versaletikett. Rendres som ekte `<legend>` i et `<fieldset>`. */
  label?: string;
  options: (FilterPillOption | string)[];
  /** Alltid en array, også når multiple er false. */
  value: string[];
  onChange: (next: string[]) => void;
  /** false gir eksklusivt valg. Vurder `SegmentControl` først. */
  multiple?: boolean;
  resetLabel?: string;
  /** Vannrett rulling i stedet for linjebryting. For lange sett i smal spalte. */
  scroll?: boolean;
  /** data-od-id, rolleprefiks cta- */
  dataOdId?: string;
}
