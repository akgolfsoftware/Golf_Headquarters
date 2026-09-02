/**
 * Felt — tekstfelt, tallfelt og flerlinjefelt med validering. Feilteksten sier
 * hva som må gjøres, ikke at noe er galt.
 */
export interface FeltProps {
  merkelapp?: string;
  /** Hjelpetekst under feltet. Vises når feil er tom. */
  hjelp?: string;
  /** Feiltekst. Setter aria-invalid og feilrød kant. */
  feil?: string;
  /** Enhet vist inne i feltet til høyre, i mono: «m», «°», «kr». */
  enhet?: string;
  verdi?: string;
  onEndre?: (verdi: string) => void;
  type?: 'text' | 'email' | 'tel' | 'number' | 'date' | 'password';
  plassholder?: string;
  flerlinje?: boolean;
  paakrevd?: boolean;
  deaktivert?: boolean;
  /** Setter innholdet i mono — kun når verdien er en måling. */
  maalt?: boolean;
  id?: string;
  style?: React.CSSProperties;
}
export function Felt(props: FeltProps): JSX.Element;
