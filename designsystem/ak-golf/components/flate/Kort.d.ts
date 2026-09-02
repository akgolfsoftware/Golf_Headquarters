/**
 * Kort — arket som ligger på grunnen. Tre tyngder: 1 i ro med hårlinje, 2 for
 * det som kan trykkes, 3 for panel og dialog. Radius 10 px, aldri pill.
 */
export interface KortProps {
  tyngde?: 1 | 2 | 3;
  /** Løfter kortet til tyngde 2 ved hover. */
  trykkbar?: boolean;
  /** Identitetsfarge som 3 px skinne i topp. Én variantfarge per visning. */
  aksent?: string;
  /** Tett rutenett (24 px) inne i kortet. */
  rutenett?: boolean;
  som?: keyof JSX.IntrinsicElements;
  onClick?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export function Kort(props: KortProps): JSX.Element;
