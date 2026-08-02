/**
 * Modal-variant for destruktive valg (~3 skjermer). Erstatter
 * window.confirm(), som brukes i playerhq-live i dag.
 *
 * Fokusoppførselen kommer fra ./overlay-focus.jsx med modal: true —
 * inert + aria-hidden på søsknene og scroll-lås, i tillegg til
 * fokusfelle, Escape på øverste lag, retur til utløser og fallback.
 * ConfirmDialog implementerer ingenting av dette selv.
 */
export interface ConfirmDialogProps {
  open?: boolean;
  /** Mono versal-kicker over tittelen: «Slett økt», «Fjern spiller» */
  kicker?: string;
  /** Påkrevd — dialogens tilgjengelige navn. Mangler den, varsles det i konsollen. */
  title: React.ReactNode;
  /** Hva som skjer. Kobles som aria-describedby. */
  body?: React.ReactNode;
  /** Konsekvensen i mono på --soft: «3 loggede serier slettes permanent» */
  consequence?: React.ReactNode;
  /** Verb, ikke «OK»: «Slett økten», «Fjern Emma» */
  confirmLabel?: string;
  cancelLabel?: string;
  /** true (standard) = --dn tekst og ramme på bekreft. false = vanlig primær. */
  destructive?: boolean;
  wide?: boolean;
  /** Under utføring: knappene disables, Escape og klikk utenfor sperres */
  busy?: boolean;
  /** Kun for spesimenkort: rendrer dialogen i flyten og hopper over ALL laglogikk
   * (inert, scroll-lås, fokusfelle, stack). En modal komponent kan ikke rendres
   * «alltid åpen» i et kort — flere samtidige lås ville låse sidens rulling. */
  preview?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  /** Ref til utløseren, så fokus kommer tilbake dit. Utelates den, brukes activeElement. */
  triggerRef?: React.RefObject<HTMLElement>;
  dataOdId?: string;
}
