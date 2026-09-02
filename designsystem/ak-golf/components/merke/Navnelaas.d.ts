/**
 * Navnelaas — logo + virksomhetsnavn, låst sammen i ferdig SVG. Fem varianter,
 * hver i lys og mørk utgave. Bygg aldri en lås for hånd.
 */
export interface NavnelaasProps {
  variant?: 'academy' | 'junior-academy' | 'hq' | 'organisasjon' | 'products';
  /** Bruker -pa-morkt-filen. */
  paaMorkt?: boolean;
  hoyde?: number;
  rot?: string;
  style?: React.CSSProperties;
}
export function Navnelaas(props: NavnelaasProps): JSX.Element;
