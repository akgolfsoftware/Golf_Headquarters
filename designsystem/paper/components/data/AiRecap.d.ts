export interface AiRecapDelta {
  value: number;
  unit?: string;
  /** Grunnlag, f.eks. "vs forrige uke" — obligatorisk i praksis */
  basis?: string;
  decimals?: number;
}
export interface AiRecapProps {
  /** Agentnavn: Caddie, Plan-vakten, Runde-agent … */
  who?: string;
  /** true = info-blå ramme (KUN analyse) */
  analysis?: boolean;
  deltas?: AiRecapDelta[];
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  /** Oppsummeringen i prosa (Lora) */
  children?: React.ReactNode;
  dataOdId?: string;
}
