/**
 * Meldingen under et felt: hjelpetekst eller feil. Én eier, slik at en ekstern
 * feiloppsummering øverst i skjemaet ser identisk ut med feilen under selve feltet.
 *
 * FormField rendrer den selv fra sine `hint`/`error`-props — du oppretter den
 * direkte kun når meldingen skal stå utenfor et felt, typisk en samlet
 * feiloppsummering som fokus flyttes til ved innsending.
 *
 * Den er IKKE `Callout` eller `Banner`: de bærer en hendelse eller et varsel med
 * egen flate og tone. FieldMessage er ren tekst som hører til en kontroll.
 */
export interface FieldMessageProps {
  /** `feil` gir --dn og role="alert". `hint` er nøytral hjelpetekst. */
  tone?: "hint" | "feil";
  /** Settes av FormField for aria-describedby. Oppgis manuelt ved frittstående bruk. */
  id?: string;
  /** data-od-id, rolleprefiks `felt-` */
  dataOdId?: string;
  children?: React.ReactNode;
}
