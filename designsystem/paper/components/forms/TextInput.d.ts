/**
 * Naken tekstkontroll — ett linjeinnput uten etikett, hjelpetekst eller feilmelding.
 * Anatomien bor i `FormField`; denne tegner bare kontrollen.
 *
 * Erstatter `Input`, som er PENSJONERT: den bar sin egen anatomi og kunne derfor
 * ikke kobles til en ekstern feiloppsummering. Se Input.prompt.md.
 *
 * Feiltilstanden leses av `aria-invalid`, som FormField setter — så «ser feil ut»
 * og «er annonsert som feil» kan ikke gå fra hverandre.
 */
export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** `sm` gir 30px basishøyde. Tilgjengelighetsgulvet på 44px gjelder uansett. */
  density?: "md" | "sm";
  /** data-od-id, rolleprefiks `felt-` */
  dataOdId?: string;
}
