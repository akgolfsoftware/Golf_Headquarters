/**
 * Pagination — sidevis navigasjon i et sett som er for stort for én side.
 * Vindu rundt gjeldende side: alltid første og siste, pluss gjeldende med en
 * nabo på hver side, og markerte utelatelser mellom.
 *
 * Hva den IKKE er:
 * - Uendelig liste / «hent flere». Se `.prompt.md`: paginering på en stall
 *   eller en øktliste er feil valg, ikke bare et annet valg.
 * - `Stepper` = posisjon i en flerstegsflyt, ikke i et datasett.
 */
export interface PaginationProps {
  /** 1-indeksert. */
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  /** Posisjon og totalsum i mono, f.eks. "248 økter · side 4 av 12". */
  totalLabel?: string;
  /** Skjuler sidetallene permanent — bare forrige/neste. */
  simple?: boolean;
  /** Tilgjengelig navn på `<nav>`. Flere pagineringer på samme side må skilles. */
  label?: string;
  /** data-od-id, rolleprefiks nav- */
  dataOdId?: string;
}
