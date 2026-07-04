import * as React from "react";

export interface SegmentedOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface SegmentedTabsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Strings or {value,label} objects. */
  options: (string | SegmentedOption)[];
  value?: string;
  onChange?: (value: string) => void;
  size?: "sm" | "md";
  /** Stretch to fill the row. */
  block?: boolean;
  /** Deaktiver hele kontrollen. */
  disabled?: boolean;
}

/** Pill-active segmented control / period selector with mono labels. */
export declare function SegmentedTabs(props: SegmentedTabsProps): JSX.Element;
