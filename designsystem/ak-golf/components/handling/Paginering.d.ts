/**
 * Paginering — sidetall i mono med tabellsiffer. Brukes på turneringsoversikt,
 * artikkelliste og andre lange lister utenfor produktet.
 */
export interface PagineringProps {
  side?: number;
  antallSider?: number;
  onBytt?: (side: number) => void;
  style?: React.CSSProperties;
}
export function Paginering(props: PagineringProps): JSX.Element;
