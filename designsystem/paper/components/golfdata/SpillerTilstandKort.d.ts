/**
 * Coachens aggregat av spilleren NÅ: fire mono-felter (form, etterlevelse,
 * sist aktiv, neste) + flagg (~5 skjermer, stallkort og konsoll). IKKE
 * VelvaereKort (spillerens egenrapport) — dette er coachens blikk. Flagg
 * informerer coach, sperrer aldri, og går aldri til spilleren.
 * Chromeless — Panel eier flaten.
 */
export interface TilstandFelt {
  /** «Form», «Etterlevelse», «Sist aktiv», «Neste» */
  label: string;
  /** «72,4 snitt», «86 %», «i går» */
  value: string;
  tone?: "up" | "dn" | "mut";
}
export interface SpillerTilstandKortProps {
  /** Maks fire — flere kuttes */
  fields: TilstandFelt[];
  /** «Ingen økter logget på 8 dager» */
  flags?: string[];
  basis?: string;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
