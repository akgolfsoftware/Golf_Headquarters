import * as React from 'react';

/**
 * «SG Tee App Predict»-arket som komponent: 18 hull, to tee-strategier,
 * predikert score og SG +/- mot PGA-baseline (ekte SG-tabeller).
 */
export interface TeeStrategyPlannerProps {
  /** Antall hull (default 18). */
  holes?: number;
  /** Navn på de to strategiene (default ['TEE alt 1','TEE alt 2']). */
  strategyLabels?: [string, string];
  /** Kontrollerte verdier: { [hullIndex]: { lengde, alt1, alt2 } }. Utelat for intern state. */
  values?: Record<number, { lengde?: string; alt1?: string; alt2?: string }>;
  onChange?: (next: Record<number, { lengde?: string; alt1?: string; alt2?: string }>) => void;
  title?: string;
  style?: React.CSSProperties;
}

export declare function TeeStrategyPlanner(props: TeeStrategyPlannerProps): React.ReactElement;
