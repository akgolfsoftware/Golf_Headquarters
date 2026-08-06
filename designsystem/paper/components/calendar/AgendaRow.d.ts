/**
 * Agendalistens rad: fast tidskolonne · tittel/meta · hale. Dekker
 * agendavisningen i Kalenderen, PlayerHQ I dag og dagsartefakter (~8 skjermer).
 * IKKE ListRow (generell rad uten tidsanker) og IKKE SessionCard (kortet på
 * ukelerretet) — AgendaRow er én linje i en kronologisk liste.
 */
export type PyramideOmraade = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
export interface AgendaRowProps {
  /** «09:00» — mono, fast kolonne */
  time: string;
  /** «10:30» — skjules under 360 px container */
  endTime?: string;
  title: string;
  /** «Mulligan 3 · Øyvind Rohjan» */
  meta?: string;
  /** Farger venstrekanten — samme mapping som SessionCard */
  area?: PyramideOmraade;
  /** naa: dempet flate + NÅ-merke · ferdig: ✓ + dempet · avlyst: gjennomstreket */
  status?: "naa" | "ferdig" | "avlyst";
  /** Hale-tekst: «90 min», «Gjennomført» */
  trailing?: string;
  onClick?: () => void;
  dataOdId?: string;
}
