export interface CardProps {
  title?: string;
  /** Liten mono-etikett over tittelen. */
  eyebrow?: string;
  /** Element i øvre høyre hjørne (knapp, badge). */
  action?: React.ReactNode;
  elevation?: 'flat' | 'sm' | 'md' | 'lg';
  /** Farget kantstripe til venstre. */
  accent?: 'navy' | 'red';
  padding?: string;
  /** Mørk variant — kun i hero-/presentasjonssammenheng. */
  dark?: boolean;
  children?: React.ReactNode;
}
export declare function Card(props: CardProps): JSX.Element;