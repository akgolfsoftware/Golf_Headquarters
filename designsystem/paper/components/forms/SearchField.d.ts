/**
 * Søkefelt: `FormField` med skjult etikett og en `TextInput` av type search.
 *
 * Har ingen egen CSS og ingen egen anatomi — det er hele poenget. Et søkefelt
 * ser ut som et felt uten etikett, men er det ikke: etiketten er visuelt skjult
 * og fortsatt annonsert, ellers kan skjermleseren bare kalle det «tekstfelt».
 *
 * Er den IKKE: en kommandopalett (`CommandPalette`, køført) eller et filter
 * (`FilterBar`). Denne søker i innhold, den filtrerer ikke en liste på fasetter.
 */
export interface SearchFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Annonsert navn. Vises ikke, men må gi mening lest alene. */
  label?: string;
  placeholder?: string;
  /** Vises under feltet når satt. Sjelden nødvendig. */
  hint?: string;
  /** data-od-id, rolleprefiks `felt-` */
  dataOdId?: string;
}
