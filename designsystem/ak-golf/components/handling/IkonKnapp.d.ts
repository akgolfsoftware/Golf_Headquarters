/**
 * IkonKnapp — kvadratisk trykkflate for ett Lucide-ikon. Krever alltid merkelapp;
 * et ikon uten ord er ikke tilgjengelig.
 */
export interface IkonKnappProps {
  /** aria-label. Påkrevd — ikonet alene er ikke en etikett. */
  merkelapp: string;
  /** stille = kant på grunn · fylt = signalfyll */
  variant?: 'stille' | 'fylt';
  /** Sidekant i px. Aldri under 44 på mobil. */
  storrelse?: number;
  aktiv?: boolean;
  deaktivert?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export function IkonKnapp(props: IkonKnappProps): JSX.Element;
