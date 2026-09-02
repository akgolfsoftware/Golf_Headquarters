/**
 * Mobilmeny — fullflatemeny på 390 px. Lenkene settes i Archivo Narrow 600 på
 * 26 px, én per rad, 56 px høy. Mobil er merkets viktigste visning.
 */
export interface MobilmenyProps {
  apen?: boolean;
  lenker?: { href: string; tekst: string }[];
  aktiv?: string;
  handling?: React.ReactNode;
  onLukk?: () => void;
  logoRot?: string;
  style?: React.CSSProperties;
}
export function Mobilmeny(props: MobilmenyProps): JSX.Element | null;
