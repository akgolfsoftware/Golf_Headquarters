export interface ToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  /** Tekst til høyre for bryteren */
  label?: string;
  disabled?: boolean;
  dataOdId?: string;
}
