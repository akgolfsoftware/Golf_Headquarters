import * as React from "react";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Leading Lucide icon name or node. */
  leadingIcon?: string | React.ReactNode;
  /** Trailing node (e.g. a clear button). */
  trailing?: React.ReactNode;
  /** "text" (default) or "search" (pill, search icon). */
  variant?: "text" | "search";
  size?: "sm" | "md";
  /** true to mark invalid, or a string to show an error message. */
  error?: boolean | string;
}

/** Text / search field with focus ring and error state. */
export declare function Input(props: InputProps): JSX.Element;
