/**
 * Avkrysningsboks med sidestilt etikett.
 *
 * Bærer sin egen etikettplassering, og det er tilsiktet: en avkrysningsboks har
 * teksten ved siden av boksen, ikke over den, så den kan ikke arve FormFields
 * kolonneanatomi. Flere av dem grupperes inne i én `FormField` som gir gruppen
 * et navn — det er den riktige måten å stille tre valg under én overskrift.
 *
 * Avkrysset tilstand bruker `--fg`, ikke `--accent`: oransje er reservert for
 * «Én ting nå» og fokus.
 */
export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Teksten ved siden av boksen. Hele raden er klikkbar. */
  label?: string;
  /** data-od-id, rolleprefiks `felt-` */
  dataOdId?: string;
}
