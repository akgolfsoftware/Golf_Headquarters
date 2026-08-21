/**
 * Numerisk stepper (− / verdi / +). Telling, aldri tekstinntasting — reps,
 * sett og minutter telles raskere med to knapper enn med et tastatur.
 *
 * Delt av tre flater (manifestene 20.08.2026): okt-detaljs rediger-tilstand
 * (reps per drill), live-øktas FYS-serielogging, og onboarding-tillegget
 * (treningstimer per uke).
 */
export interface TallStepperProps {
  value: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Enhet under tallet: "reps", "kg", "t". */
  unit?: string;
  /** aria-label for gruppen når ingen synlig etikett står ved siden av. */
  label?: string;
  /** Smalere midtkolonne — brukes i tette rader (drill-liste). */
  kompakt?: boolean;
  disabled?: boolean;
  dataOdId?: string;
}
export declare function TallStepper(props: TallStepperProps): JSX.Element;
