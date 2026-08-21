/**
 * Tallfelt med enhetsetikett og forklaringslinje: rangelengde i meter, maks
 * puttelengde i fot. Fri inntasting — riktig når verdien er et presist mål
 * spilleren leser av et anlegg, ikke noe som telles (motsatt av
 * `TallStepper`). Onboarding-tillegget, manifest 20.08.2026.
 *
 * Putteavstander i fot, alt annet i meter (VOKABULAR §2) — enheten styres
 * av konsumenten via `enhet`, komponenten håndhever den ikke selv.
 */
export interface MaaleFeltProps {
  label?: string;
  /** Tallverdi, eller `undefined` for tomt felt. */
  verdi?: number;
  onChange?: (verdi: number | undefined) => void;
  /** Enhetsetikett inne i feltet: "m", "fot". */
  enhet?: string;
  /** Forklaringslinje under feltet — hva tallet brukes til, ikke en gjentakelse av etiketten. */
  hjelpetekst?: React.ReactNode;
  /** Feilmelding erstatter hjelpeteksten og setter aria-invalid. */
  feilmelding?: React.ReactNode;
  placeholder?: string;
  id?: string;
  dataOdId?: string;
}
export declare function MaaleFelt(props: MaaleFeltProps): JSX.Element;
