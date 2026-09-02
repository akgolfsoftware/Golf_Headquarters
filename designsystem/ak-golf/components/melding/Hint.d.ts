/**
 * Hint — kort forklaring ved hover og fokus. Til et ord, aldri til en
 * setning; innhold som må leses hører hjemme i teksten.
 */
export interface HintProps {
  tekst: string;
  plassering?: 'over' | 'under';
  /** Nøyaktig ett fokuserbart barn. */
  children: React.ReactElement;
  style?: React.CSSProperties;
}
export function Hint(props: HintProps): JSX.Element;
