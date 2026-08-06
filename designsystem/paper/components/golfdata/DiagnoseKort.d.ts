/**
 * Diagnosen — coachens/AI-ens lesning av et mønster: tittel, Lora-prosa i
 * du-form, mono-evidens, neste steg (~7 skjermer). IKKE NesteFokusKort
 * (anbefalingen fremover) — diagnosen forklarer HVA som skjer; fokus-kortet
 * sier hva som skal TRENES. Fra agent? Konsumenten må legge
 * ProvenanceDisclosure ved siden av. Chromeless — flaten eies av Panel.
 */
export interface DiagnoseKortProps {
  title: string;
  /** Prosa i du-form: «Driveren har vært stabil i tre uker …» */
  body?: string;
  /** Mono-linjer: «SG tee −1,84 · siste 5 runder» */
  evidence?: string[];
  nextStep?: string;
  compact?: boolean;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
