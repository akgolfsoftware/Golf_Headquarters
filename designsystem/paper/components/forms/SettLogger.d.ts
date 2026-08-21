/**
 * FYS-serielogging i live-økta: reps + vekt (2,5 kg-steg) → «Logg sett» →
 * settet legges i lista under. Reps/vekt-justering leveres av konsumenten
 * (typisk to `TallStepper`) — denne komponenten viser verdiene og eier
 * listen av loggede sett.
 */
export interface LoggetSett {
  reps: number;
  vekt: number;
}
export interface SettLoggerProps {
  reps: number;
  vekt: number;
  onRepsChange?: (v: number) => void;
  onVektChange?: (v: number) => void;
  /** Kg-steget vist i etiketten (justeringen selv gjøres av ekstern TallStepper). */
  vektSteg?: number;
  sett?: LoggetSett[];
  onLoggSett?: (nyttSett: LoggetSett) => void;
  onFjernSett?: (index: number) => void;
  dataOdId?: string;
}
export declare function SettLogger(props: SettLoggerProps): JSX.Element;
