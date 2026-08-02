export interface ScoreGaugeSub {
  label: string;
  value: string;
  unit?: string;
  window?: string;
}
export interface ScoreGaugeProps {
  /** Hero-tallet i sentrum */
  value?: number;
  max?: number;
  decimals?: number;
  unit?: string;
  /**
   * "below" (standard): enheten stables under hero-tallet, så tallet står på
   * buens midtakse. "inline": gammel oppførsel — tallet+enheten sentreres som
   * én blokk, og tallet havner ~14 % av buebredden til venstre for aksen.
   * Bruk "inline" bare når enheten er ett tegn (%, °) og avviket er umerkelig.
   */
  unitPlacement?: "below" | "inline";
  label?: string;
  /** Nøyaktig tre undertall med enhet og vindu (Sleep-score-mønsteret) */
  subs?: ScoreGaugeSub[];
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
