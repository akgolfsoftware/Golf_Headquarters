export interface KpiCardProps {
  /** Mono-etikett i versaler */
  label: string;
  value?: number | string;
  /** Synlig enhet, f.eks. "slag", "%", "m" */
  unit?: string;
  /** Synlig tidsvindu, f.eks. "siste 5 runder" */
  window?: string;
  /** Signert delta — rendres "▲ +2,0 vs i går" med --up/--dn */
  delta?: number;
  /** Sammenligningsgrunnlag, f.eks. "vs i går" */
  deltaBasis?: string;
  decimals?: number;
  /** Farger selve tallet (kun når verdien ER semantikken) */
  tone?: "up" | "dn";
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
