/**
 * Horisontal andelsmåler med etikett og prosent (~8 skjermer).
 * Trukket ut av GoalProgress, som nå konsumerer den.
 *
 * Ikke en lastindikator — laster noe, bruker du Region state="loading".
 */
export interface ProgressBarProps {
  value?: number;
  max?: number;
  /** Etikett til venstre over sporet */
  label?: React.ReactNode;
  /** Overstyrer «NN %» — «4 av 5 økter», «12/40 serier» */
  valueText?: string;
  /** ink (standard) · up = innenfor krav · warn = over/under terskel */
  tone?: "ink" | "up" | "warn";
  size?: "md" | "lg";
  dataOdId?: string;
}
