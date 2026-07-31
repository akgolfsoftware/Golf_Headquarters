export interface PuttLabProps {
  /** Treffprosent per avstandsbøtte, med antall forsøk synlig */
  buckets?: { range: string; pct: number; attempts: number }[];
  window?: string;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
