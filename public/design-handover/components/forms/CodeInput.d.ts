import * as React from "react";

export interface CodeInputProps {
  /** Number of digit boxes. Default 6. */
  length?: number;
  /** Controlled value (string of digits). */
  value?: string;
  /** Fires with the joined code on every change. */
  onChange?: (code: string) => void;
  error?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/** Separate digit boxes for verification codes (BankID, e-post). */
export declare function CodeInput(props: CodeInputProps): JSX.Element;
