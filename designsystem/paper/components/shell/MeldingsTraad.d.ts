/**
 * Meldingstråden coach–spiller: motpart venstre/surface, egne høyre/soft,
 * dagskiller (~6 skjermer — chat-flatene, coach-meldinger, foreldrekontakt).
 * Ren visning — Composer eier skrivingen. IKKE Tidslinje (hendelser) —
 * dette er SAMTALE.
 */
export interface Melding {
  id?: string;
  /** true = egen melding (høyre, soft) */
  self?: boolean;
  /** Avsender når self er false: «Anders Kristiansen» */
  author?: string;
  time?: string;
  text?: string;
  /** Alternativ: dagskille-rad («i dag», «man 3. august») */
  divider?: string;
}
export interface MeldingsTraadProps {
  messages: Melding[];
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
