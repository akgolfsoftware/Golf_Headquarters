/**
 * Akkordeon — spørsmål og svar, ofte på priser og junior. Ett åpent av gangen
 * som standard. Pluss-tegnet blir signalrødt når posten er åpen.
 */
export interface Akkordeonpost { tittel: string; innhold: React.ReactNode }
export interface AkkordeonProps {
  poster?: Akkordeonpost[];
  /** Indeks som er åpen ved første render. -1 = alt lukket. */
  apenIndeks?: number;
  flerAvGangen?: boolean;
  style?: React.CSSProperties;
}
export function Akkordeon(props: AkkordeonProps): JSX.Element;
