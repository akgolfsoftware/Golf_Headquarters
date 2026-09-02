/**
 * Tabell — målte kolonner i mono, høyrestilt. Med `sorterbar` blir
 * kolonnehodene knapper; målte kolonner sorteres som tall, andre som tekst.
 */
export interface TabellKolonne {
  noekkel: string;
  tittel: string;
  /** Mono, høyrestilt, tallsortering. */
  maalt?: boolean;
  dempet?: boolean;
}
export interface TabellProps {
  kolonner: TabellKolonne[];
  rader: Array<Record<string, React.ReactNode> & { id?: string | number }>;
  /** Kildelinje over tabellen: «Trackman · 18.08.2026 · 38 målinger». */
  tekst?: string;
  tom?: string;
  sorterbar?: boolean;
  standardSortering?: { noekkel: string; retning: 'opp' | 'ned' };
  style?: React.CSSProperties;
}
export function Tabell(props: TabellProps): JSX.Element;
