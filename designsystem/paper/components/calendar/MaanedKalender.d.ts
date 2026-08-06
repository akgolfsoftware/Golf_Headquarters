/**
 * Månedsrutenettet: ukedagshode, ukenummer-kolonne, en dagcelle per dag med
 * økt-prikker i pyramideområdets farge. Dekker Kalender-flatens månedsvisning,
 * årshjul-drilldown og PlayerHQ Plan-måned (~5 skjermer). IKKE DatePicker
 * (skjemakontroll som velger én dato i et felt) og IKKE UkeKalender (rammen) —
 * rutenettet navigerer ikke seg selv.
 */
export type PyramideOmraade = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
export interface MkalDag {
  /** Stabil nøkkel, f.eks. "08-03" — brukes i data-od-id og onSelectDay */
  key: string;
  date: number;
  /** false demper cellen (dager utenfor måneden) */
  inMonth?: boolean;
  today?: boolean;
  events?: { area: PyramideOmraade }[];
}
export interface MkalUke { week: number; days: MkalDag[] }
export interface MaanedKalenderProps {
  weeks: MkalUke[];
  /** key til valgt dag */
  value?: string;
  onSelectDay?: (key: string) => void;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  /** 44 px celler uten +N-teller — eksplisitt forfattervalg */
  dense?: boolean;
  dataOdId?: string;
}
