/**
 * MORAD-kjernen: P1.0–P10.0 som horisontal skinne med markør, fokusvindu og
 * valgfri klikk per posisjon. Dekker økt-editor, videoanalyse, live-økt og
 * teknisk plan (~8 skjermer). Ingen generisk erstatning finnes — P-systemet
 * er coaching-DNA-et. IKKE Slider (kontinuerlig verdi i skjema) og IKKE
 * Stepper (prosess-steg).
 */
export interface PPositionRailProps {
  /** Gjeldende posisjon 1.0–10.0 — halvposisjoner (6.5) plasseres proporsjonalt */
  value?: number;
  /** Fokusvindu, f.eks. { from: 5, to: 7 } for P5–P7 */
  window?: { from: number; to: number };
  /** Gjør stoppene klikkbare (heltallsposisjoner) */
  onSelect?: (p: number) => void;
  hideLabels?: boolean;
  /** Mono-fotnote: «L-ARM · fokus på venstre arm i P6» */
  note?: string;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
