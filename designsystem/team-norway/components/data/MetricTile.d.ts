export interface MetricTileProps {
  label: string;
  value: string | number;
  unit?: string;
  /** Endringstekst, f.eks. '+2.4'. */
  delta?: string;
  deltaTone?: 'up' | 'down' | 'flat';
  caption?: string;
  dark?: boolean;
}
export declare function MetricTile(props: MetricTileProps): JSX.Element;