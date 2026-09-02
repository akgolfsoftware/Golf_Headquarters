/**
 * Velger — nedtrekksliste. Har den under fem valg, bruk Radiogruppe i stedet.
 */
export interface VelgerValg { verdi: string; tekst: string }
export interface VelgerProps {
  merkelapp?: string;
  hjelp?: string;
  feil?: string;
  verdi?: string;
  onEndre?: (verdi: string) => void;
  valg?: VelgerValg[];
  plassholder?: string;
  deaktivert?: boolean;
  id?: string;
  style?: React.CSSProperties;
}
export function Velger(props: VelgerProps): JSX.Element;
