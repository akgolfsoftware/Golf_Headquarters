export interface ScaleRatingProps {
  value: number;
  max?: number;
  onChange?: (value: number) => void;
  /** Endepunktstekster, f.eks. ['Ikke etablert','Automatisert']. */
  labels?: [string, string];
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
}
export declare function ScaleRating(props: ScaleRatingProps): JSX.Element;