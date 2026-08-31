export interface ButtonProps {
  /** primary = navy fill (hovedhandling), accent = merkevarerød (sjeldent, én per skjerm), secondary = hvit m/kant, ghost = kun tekst, onDark = til hero. */
  variant?: 'primary' | 'accent' | 'secondary' | 'ghost' | 'onDark';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
  children?: React.ReactNode;
}
export declare function Button(props: ButtonProps): JSX.Element;