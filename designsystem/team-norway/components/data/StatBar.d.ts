export interface StatBarProps {
  label: string;
  value: number;
  max?: number;
  unit?: string;
  tone?: 'navy' | 'accent' | 'green' | 'amber' | 'red';
  /** Målverdi — tegnes som loddrett merke i baren. */
  target?: number;
  compact?: boolean;
}
export declare function StatBar(props: StatBarProps): JSX.Element;