/**
 * Responsivt rutenett av paneler og kort (~10 skjermer). Rutenettet eier
 * bare mellomrom og kolonner — kortene eier sitt eget utseende.
 */
export interface CardGridProps {
  /** auto = auto-fill fra 280px · wide = auto-fill fra 360px (viz-tunge kort) */
  min?: "auto" | "wide";
  /** Fast kolonneantall når layouten er en beslutning, ikke en tilpasning */
  columns?: 2 | 3;
  dataOdId?: string;
  children?: React.ReactNode;
}
