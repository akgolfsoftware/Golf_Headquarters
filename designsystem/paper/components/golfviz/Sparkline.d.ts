export interface SparklineProps {
  data?: number[];
  /** Raw-farge: info (analyse) eller up (positiv utvikling) — kun fyll/strek, aldri tekst */
  color?: "info" | "up";
  width?: number;
  height?: number;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
