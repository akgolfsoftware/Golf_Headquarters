/**
 * Knapp — merkets handlingsflate. Én primærknapp per visning; tekstvarianten
 * er for det som ikke er hovedhandlingen.
 */
export interface KnappProps {
  /** primaer = signalfyll (én per flate) · sekundaer = kant på grunn · tekst = understreket lenkeknapp */
  variant?: 'primaer' | 'sekundaer' | 'tekst';
  storrelse?: 'sm' | 'md' | 'lg';
  /** Pill-radius. Kun knapper og filter-piller — aldri kort. */
  pill?: boolean;
  fullBredde?: boolean;
  deaktivert?: boolean;
  /** Viser snurre og blokkerer klikk. */
  laster?: boolean;
  /** Lucide-ikon som React-node, plassert før teksten. */
  ikon?: React.ReactNode;
  /** Settes den, rendres knappen som <a>. */
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export function Knapp(props: KnappProps): JSX.Element;
