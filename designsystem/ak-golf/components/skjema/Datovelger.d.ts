/**
 * Datovelger — én måned inline, uken starter mandag, norske navn. Verdier
 * som ISO-dato (YYYY-MM-DD). Piltaster flytter, Enter velger, PageUp/Down
 * bytter måned.
 */
export interface DatovelgerProps {
  /** Valgt dato, «2026-09-14». */
  verdi?: string;
  onEndre?: (isoDato: string) => void;
  /** Tidligste og seneste lovlige dato, ISO. */
  min?: string;
  max?: string;
  merkelapp?: string;
  /** Datoer med prikk under — økter, ledige tider. */
  markerte?: string[];
  style?: React.CSSProperties;
}
export function Datovelger(props: DatovelgerProps): JSX.Element;
