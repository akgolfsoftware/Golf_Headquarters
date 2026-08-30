export interface InputProps {
  label?: string;
  value?: string | number;
  onChange?: (value: string) => void;
  placeholder?: string;
  /** Feilmelding — setter rød kant og erstatter hint. */
  error?: string;
  hint?: string;
  type?: 'text' | 'number' | 'date' | 'email';
  /** Enhet til høyre i feltet, f.eks. 'm/s' eller 'slag'. */
  suffix?: string;
  disabled?: boolean;
}
export declare function Input(props: InputProps): JSX.Element;