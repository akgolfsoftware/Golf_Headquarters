import * as React from 'react';

export interface StatBoxProps {
  value: React.ReactNode;
  /** Uppercase mono label, e.g. "SNITT". */
  label: string;
  tone?: 'neutral' | 'pos' | 'neg' | 'warn' | 'info' | 'brand';
  /** outline (default) = white card; tint = soft tone wash; filled = solid brand, white value. */
  variant?: 'outline' | 'tint' | 'filled';
  /** Small mono change-chip under the value, e.g. "+0,4" or "▲ 3". */
  delta?: React.ReactNode;
  /** Colour of the delta line; inferred from a leading − when omitted. */
  deltaTone?: 'pos' | 'neg' | 'warn' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

/** Small labelled stat tile — value in JetBrains Mono, label as uppercase eyebrow. */
export function StatBox(props: StatBoxProps): JSX.Element;
