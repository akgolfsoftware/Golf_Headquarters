/**
 * Verdi mot referanse som badge, med basis i badgen («+0,4 vs kat B»)
 * (~10 skjermer). Datasemantikk-toner er lov (data, ikke vokabular).
 * IKKE StatusBadge (status/tags) — benchmark-badgen eier formatet
 * verdi + retning + basis, og basis er obligatorisk.
 */
export interface BenchmarkBadgeProps {
  /** «+0,4» — signert, komma-desimal */
  value: string;
  /** «vs kat B · siste 5» — obligatorisk i praksis */
  basis: string;
  tone?: "up" | "dn" | "info";
  dataOdId?: string;
}
