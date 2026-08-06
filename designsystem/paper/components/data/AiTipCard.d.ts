/**
 * Caddie-tipset: kort AI-observasjon med evidens og valgfri lukking
 * (~8 skjermer). Kicker i analyse-blå — AI er analyse, aldri oransje.
 * Lavterskelen i AI-laget: forpliktende forslag går som PlanAction gjennom
 * køen (QueueCard + ProvenanceDisclosure + DiffKort), aldri som tips.
 */
export interface AiTipCardProps {
  /** «Caddie-tips» / «Plan-vakten» */
  source?: string;
  /** Prosa i du-form, én–to setninger */
  tip: string;
  /** Mini-proveniens: «fra 42 slag · økta 3. august» — bør alltid sendes */
  evidence?: string;
  muted?: boolean;
  /** Sesjonsbasert lukking — aldri localStorage */
  onDismiss?: () => void;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
