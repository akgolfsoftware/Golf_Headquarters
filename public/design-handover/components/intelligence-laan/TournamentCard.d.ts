import * as React from 'react';

export interface TournamentCardProps {
  /** Series pill label, e.g. "Norgescup 2026 · RD 1 av 4". */
  series: string;
  name: string;
  course: string;
  date: string;
  fieldSize?: number;
  par?: number;
  top25Cut?: string;
  variant?: 'compact' | 'full';
  /** Show the pulsing live dot for an in-progress tournament. */
  active?: boolean;
  onOpen?: () => void;
  style?: React.CSSProperties;
}

/** Tournament list/discovery card — series, name, course/date, field stats, open action. */
export function TournamentCard(props: TournamentCardProps): JSX.Element;
