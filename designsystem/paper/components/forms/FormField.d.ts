/**
 * Feltanatomien alle skjemakomponenter står på: etikett, kontroll, og hjelpetekst
 * ELLER feilmelding. Dekker hvert skjema i AgencyOS og PlayerHQ — onboarding,
 * spillerprofil, booking, testregistrering, innstillinger.
 *
 * Erstatter den håndrullede anatomien som ellers gjentas per skjema: en <label>,
 * en kontroll, og en <span> under, koblet sammen for hånd hver gang. FormField
 * setter htmlFor, aria-describedby, aria-invalid og aria-required selv, fordi
 * koblingen er den delen som stille blir glemt — og et felt uten den er usynlig
 * for skjermleser mens det ser helt riktig ut.
 *
 * Den er IKKE en kontroll. Den tegner ingen ramme, ingen bakgrunn og ingen høyde;
 * kontrollen inni eier sitt eget utseende og sitt eget 44px-treffmål. Nærmeste
 * nabo er `Input`, som i dag bærer sin egen anatomi (.akhq-field/.akhq-label) —
 * de to skal slås sammen, se K5 i kart/nattrapport.md.
 */
export interface FormFieldProps {
  /** Etikett over kontrollen. Utelates den, rendres ingen label-node. */
  label?: string;
  /** Hjelpetekst under. Vises kun når `error` ikke er satt. */
  hint?: string;
  /** Feilmelding. Vinner over `hint` — de vises aldri samtidig. */
  error?: string;
  /** Markerer feltet som påkrevd: visuell `*` + aria-required på kontrollen. */
  required?: boolean;
  /** `sm` strammer avstanden etikett/kontroll/hjelpetekst. */
  density?: "md" | "sm";
  /** Overstyr generert id. Settes normalt ikke — komponenten lager sin egen. */
  htmlFor?: string;
  /** data-od-id, rolleprefiks `felt-` */
  dataOdId?: string;
  /** Kontrollen. Ett element — den klones med id og aria-kobling. */
  children?: React.ReactNode;
}
