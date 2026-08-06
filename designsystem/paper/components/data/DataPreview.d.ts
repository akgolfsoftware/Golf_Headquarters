/**
 * Forhåndsvisning av et datasett før import: maks fem rader + «+ N til»
 * (~5 skjermer — GolfBox-import, TrackMan-synk, CSV). Gjenkjenning, ikke
 * lesing — hele settet hører i DataTable ETTER import. Ren visning.
 */
export interface DataPreviewProps {
  columns: string[];
  /** Celleverdier per rad — ferdig formatert */
  rows: string[][];
  /** Overstyrer beregnet resttall */
  moreCount?: number;
  dense?: boolean;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
