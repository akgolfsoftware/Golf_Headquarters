/**
 * Ren teksthjelp ved hover og fokus. Ingen handlinger, ingen fokus i laget.
 *
 * Tooltip er ikke en fokuskontrakt-konsument (det finnes ingenting å
 * fokusere), men oppfyller WCAG 1.4.13: Escape lukker, teksten forsvinner
 * ikke av seg selv, og den er koblet med aria-describedby.
 */
export interface TooltipProps {
  /** Kort tekst. Er den lengre enn en linje, hører den i innholdet. */
  text: React.ReactNode;
  /** Hurtigtast, dempet og høyrestilt: ⌘K. */
  kbd?: React.ReactNode;
  side?: "top" | "bottom";
  /** Ms før visning ved hover. Fokus viser umiddelbart etter samme forsinkelse. */
  delay?: number;
  /** Styrt modus — kun for spesimenkort. */
  open?: boolean;
  dataOdId?: string;
  /** Nøyaktig ett fokuserbart element. */
  children: React.ReactElement;
}
export declare function Tooltip(props: TooltipProps): JSX.Element;
