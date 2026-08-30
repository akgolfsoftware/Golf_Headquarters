export interface HeroMeta { label: string; value: string }
export interface HeroProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  /** Nøkkeltall i bunnen av heroen. */
  meta?: HeroMeta[];
  height?: number;
  align?: 'left' | 'center';
}
export declare function Hero(props: HeroProps): JSX.Element;