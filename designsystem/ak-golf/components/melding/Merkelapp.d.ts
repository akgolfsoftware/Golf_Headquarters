/**
 * Merkelapp — liten etikett i mono-caps som sier hvilken variant, kategori eller
 * gruppe noe hører til. Aldri en statusmarkering; det er Status.
 */
export interface MerkelappProps {
  variant?: 'junior' | 'academy' | 'hq' | 'organisasjon' | 'produkt' | 'fag' | 'noytral';
  fylt?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export function Merkelapp(props: MerkelappProps): JSX.Element;
