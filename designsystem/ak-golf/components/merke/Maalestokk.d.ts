/**
 * Maalestokk — streken med merker langs en kant. Sier «dette er målt» uten å
 * skrive det. Merker hver 12 px, 42 % styrke, arver currentColor.
 */
export interface MaalestokkProps {
  retning?: 'vannrett' | 'staaende';
  /** Lengde i px langs retningen. */
  lengde?: number;
  style?: React.CSSProperties;
}
export function Maalestokk(props: MaalestokkProps): JSX.Element;
