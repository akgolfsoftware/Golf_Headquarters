/**
 * Sesongbåndet: GRUNN/SPES/TURN-perioder som horisontale blokker, bredde =
 * antall uker. Dekker årshjulet i Workbench, WANG-årsplanen og PlayerHQ Plan
 * (~5 skjermer). IKKE Stepper (prosess-steg uten varighet) og IKKE Tidslinje
 * (hendelser bakover) — Periodeplan er sesongens KART fremover.
 */
export type PeriodeType = "GRUNN" | "SPES" | "TURN";
export interface Periode {
  id?: string;
  type: PeriodeType;
  /** «Grunnperiode» — vises som mono-versal */
  label: string;
  weeks: number;
}
export interface PeriodeplanProps {
  periods: Periode[];
  /** id/label til valgt periode */
  selected?: string;
  /** Gjør blokkene klikkbare; uten denne rendres rene div-er */
  onSelectPeriod?: (id: string) => void;
  /** Nå-markørens posisjon 0–100 (beregnes av konsumenten) */
  nowPct?: number;
  /** «uke 32» — går inn i aria-sammendraget */
  nowLabel?: string;
  startLabel?: string;
  endLabel?: string;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
