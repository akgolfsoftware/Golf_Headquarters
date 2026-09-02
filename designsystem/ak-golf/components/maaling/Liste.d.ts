/**
 * Liste — rader med tittel, note og eventuelt en målt verdi. Brukes til
 * turneringsoversikt, trinn på AK-stigen og gruppeoversikt.
 */
export interface Listepost { tittel: string; note?: string; verdi?: string; merke?: string }
export interface ListeProps {
  poster?: Listepost[];
  /** Settes den, blir radene klikkbare med pil til høyre. */
  onVelg?: (post: Listepost, indeks: number) => void;
  tom?: string;
  style?: React.CSSProperties;
}
export function Liste(props: ListeProps): JSX.Element;
