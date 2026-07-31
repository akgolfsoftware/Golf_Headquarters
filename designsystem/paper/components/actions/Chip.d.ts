export interface ChipProps {
  /** Valgt tilstand: --fg-ramme + --soft-fyll */
  selected?: boolean;
  /** true = ikke-interaktiv tag (span, ingen hover) */
  static?: boolean;
  disabled?: boolean;
  /** Viser ×-knapp for fjerning */
  onRemove?: () => void;
  dataOdId?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}
