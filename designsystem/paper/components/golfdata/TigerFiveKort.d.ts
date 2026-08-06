/**
 * Tiger Five Metrics — de fem dyre feilene, telt mot målet 0 (~5 skjermer).
 * Metrikk-navnene er låst i komponenten (strategibibliotekets rammeverk);
 * konsumenten sender KUN tallene i fast rekkefølge. IKKE TigerFive som
 * generisk sjekkliste — rekkefølgen og ordlyden endres aldri per skjerm.
 * Chromeless — flaten eies av Panel.
 */
export interface TigerFiveKortProps {
  /** Fem tall i rekkefølgen: par5-bogey, dobbel+, 3-putt, bogey innenfor 9-jern, uforsert straffe */
  counts: number[];
  /** «siste 5 runder» */
  basis?: string;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
