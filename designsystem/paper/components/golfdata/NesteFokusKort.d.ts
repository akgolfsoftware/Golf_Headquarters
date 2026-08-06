/**
 * Analysens anbefaling for de neste ukene: fokusområde, hvorfor, evidens,
 * plankobling (~6 skjermer). IKKE OneThingNow (én ting NÅ, oransje-monopolet)
 * — fokus-kortet er blekk på papir og peker uker frem. IKKE DiagnoseKort
 * (forklaringen) — dette er anbefalingen. Chromeless — Panel eier flaten.
 */
export interface NesteFokusKortProps {
  title: string;
  /** Prosa i du-form (Lora) */
  why?: string;
  /** Mono: «SG nærspill −1,2 · størst gap mot kategori B» */
  evidence?: string;
  /** «Lagt inn som 2 økter/uke i SPES-perioden» */
  planNote?: string;
  /** Bibliotekets Button-noder — aldri egne knapper */
  actions?: React.ReactNode;
  compact?: boolean;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
