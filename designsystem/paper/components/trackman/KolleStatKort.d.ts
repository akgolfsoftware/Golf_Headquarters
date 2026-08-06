/**
 * Én kølles dybde: carry-hero med spredning + parameterrader (~4 skjermer).
 * Spredning ALLTID sammen med snitt. IKKE GappingChart (alle køller mot
 * hverandre) og IKKE KeyValueGrid (generiske par) — dette kortet eier
 * kølleformatet. Chromeless — Panel eier flaten.
 */
export interface KolleStatRad {
  /** «Ballhastighet», «Spinn», «Apex» */
  label: string;
  /** «68,2 m/s» — alltid med enhet */
  value: string;
}
export interface KolleStatKortProps {
  club: string;
  count?: number;
  /** «168 m» */
  carry?: string;
  /** «±4,2 m» — skal alltid følge carry */
  carrySpread?: string;
  rows?: KolleStatRad[];
  dense?: boolean;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
