export interface SelectProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  /** Strenger, eller {label, value}-objekter. */
  options?: Array<string | { label: string; value: string }>;
  hint?: string;
  disabled?: boolean;
}
export declare function Select(props: SelectProps): JSX.Element;