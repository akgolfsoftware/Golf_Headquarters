/**
 * Radiogruppe — to til fem gjensidig utelukkende valg, alle synlige.
 */
export interface RadioValg { verdi: string; tekst: string; note?: string }
export interface RadiogruppeProps {
  merkelapp?: string;
  valg?: RadioValg[];
  verdi?: string;
  onEndre?: (verdi: string) => void;
  feil?: string;
  hjelp?: string;
  navn?: string;
  style?: React.CSSProperties;
}
export function Radiogruppe(props: RadiogruppeProps): JSX.Element;
