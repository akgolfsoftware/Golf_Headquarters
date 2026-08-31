export interface BadgeProps {
  /** neutral/navy/accent er identitet; green/amber/red/info er status. Bland dem ikke. */
  tone?: 'neutral' | 'navy' | 'accent' | 'green' | 'amber' | 'red' | 'info';
  /** Fylt i stedet for tonet bakgrunn. */
  solid?: boolean;
  /** Vis statusprikk foran teksten. */
  dot?: boolean;
  children?: React.ReactNode;
}
export declare function Badge(props: BadgeProps): JSX.Element;