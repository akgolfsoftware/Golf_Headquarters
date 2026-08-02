export interface PyramidProgressProps {
  /** Topp → bunn, typisk TURN/SPILL/SLAG/TEK/FYS; pct 0–100 per nivå */
  levels?: { label: string; pct: number }[];
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
