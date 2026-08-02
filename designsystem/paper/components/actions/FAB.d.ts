export interface FABProps {
  /** Alltid påkrevd. Med iconOnly blir den aria-label */
  label: string;
  icon?: React.ReactNode;
  iconOnly?: boolean;
  /** Løftes 56 px så den ikke dør under bunnfanene */
  overTab?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  dataOdId?: string;
}
