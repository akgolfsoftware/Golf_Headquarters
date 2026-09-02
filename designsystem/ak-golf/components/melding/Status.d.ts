/**
 * Status — i orden, følg med, feil. Punktet er kvadratisk (2 px radius) og
 * fargen er aldri eneste bærer: ordet står ved siden av.
 */
export interface StatusProps {
  tilstand?: 'ok' | 'varsel' | 'feil' | 'noytral';
  /** Overstyrer standardordet. */
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export function Status(props: StatusProps): JSX.Element;
