export interface CoverageSegment {
  /** Norsk etikett, f.eks. 'Komplett profil'. */
  label: string;
  count: number;
  /** Token-verdi. Utelates den, brukes rampen navy-900 → navy-400 → ravgul → ink-200. */
  color?: string;
}
export interface CoverageCardProps {
  /** Første segment er det som telles som dekket. */
  segments: CoverageSegment[];
  /** Totalt antall utøvere. Utelates den, summeres segmentene. */
  total?: number;
  /** Halen etter tallet: 'av 11 <unitLabel>'. Standard 'med profil'. */
  unitLabel?: string;
  /** Kildelinje: 'Talt 25.08.2026 · komplett PlayerHQ kreves for TN-utøvere'. */
  source?: string;
  /** Vises i stedet for kildelinjen når state = 'error'. */
  staleNote?: string;
  state?: 'ready' | 'loading' | 'error';
  /** 'wide' = tall til venstre, stolpe til høyre (Mac). 'compact' = stablet (mobil). */
  layout?: 'wide' | 'compact';
}
export declare function CoverageCard(props: CoverageCardProps): JSX.Element;
