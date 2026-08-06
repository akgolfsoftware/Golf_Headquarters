/**
 * Ukevisningens ramme: uketall + datospenn + «I dag»/‹/› + toolbar-slot.
 * Lerretet (TimeGrid, AgendaRow-liste) sendes som children — rammen eier
 * navigasjonen, lerretet eier tiden. Dekker Kalender-flaten, Workbench-uka
 * og PlayerHQ Plan-uka (~8 skjermer). Den er IKKE TimeGrid (lerretet) og
 * IKKE MaanedKalender (rutenettet) — de komponeres inni denne.
 */
export interface UkeKalenderProps {
  /** «Uke 32» — rendres som h2 */
  weekLabel: string;
  /** «3.–9. august 2026» — skjules under 560 px container */
  rangeLabel?: string;
  onPrev?: () => void;
  onNext?: () => void;
  onToday?: () => void;
  /** Slot i hodet, før knappene — VisningsVelger hører hjemme her */
  toolbar?: React.ReactNode;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  /** Tettere hode uten datospenn — eksplisitt forfattervalg */
  compact?: boolean;
  /** data-od-id: rammen får panel-, knappene cta- */
  dataOdId?: string;
  children?: React.ReactNode;
}
