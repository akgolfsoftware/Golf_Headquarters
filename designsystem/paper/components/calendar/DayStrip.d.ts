/**
 * Horisontal dagvelger — sju dager i en stripe, valgt dag blekkfylt, i dag
 * med prikk. Dekker PlayerHQ I dag/Plan og FangstSheet-dagbytte (~5 skjermer).
 * IKKE SegmentControl (generisk verdibryter) og IKKE DatePicker
 * (skjemakontroll for vilkårlig dato) — DayStrip velger blant SYNLIGE dager.
 */
export interface DayStripDag {
  /** Stabil nøkkel, f.eks. "2026-08-03" */
  key: string;
  /** «man» — vises som mono-versal */
  weekday: string;
  /** Dagtallet: 3 */
  date: number | string;
  today?: boolean;
  /** Full tekst for skjermleser: «mandag 3. august» */
  full?: string;
}
export interface DayStripProps {
  days: DayStripDag[];
  value?: string;
  onChange?: (key: string) => void;
  /** Border på alle dager (står alene utenfor panel) */
  framed?: boolean;
  dataOdId?: string;
}
