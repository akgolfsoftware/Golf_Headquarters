/**
 * Naken flerlinjekontroll. Anatomien bor i `FormField`.
 * Brukes til øktnotater, kommentarer og fritekst i testregistrering.
 *
 * Har bevisst ingen `--floor`: høyden er alltid godt over 44px, og et gulv her
 * ville konkurrert med `--min` i stedet for å beskytte et treffmål.
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Synlige linjer. Brukeren kan dra den høyere — `resize: vertical`. */
  rows?: number;
  /** `sm` gir lavere minimumshøyde. */
  density?: "md" | "sm";
  /** data-od-id, rolleprefiks `felt-` */
  dataOdId?: string;
}
