import * as React from "react";

export interface ToggleProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md";
}

/** Switch — lime when on, neutral grey when off. */
export declare function Toggle(props: ToggleProps): JSX.Element;
