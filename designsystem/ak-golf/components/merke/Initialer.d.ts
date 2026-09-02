/**
 * Initialer — en person uten bilde, eller med. Kvadrat med radius sm.
 * Aldri en farge per person: farge er ikke identitet.
 */
export interface InitialerProps {
  /** Fullt navn. Blir aria-label og initialer (første og siste ord). */
  navn: string;
  foto?: string;
  /** Sidelengde i px. Standard 40. */
  storrelse?: number;
  style?: React.CSSProperties;
}
export function Initialer(props: InitialerProps): JSX.Element;
