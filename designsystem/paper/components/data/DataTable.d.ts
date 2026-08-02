/**
 * DataTable — radsett med flere sammenlignbare kolonner, der lesningen går
 * NEDOVER i en kolonne. Bærer økonomi- og rapportfamilien (S11, S13),
 * turneringsfelt og stallister med tall.
 *
 * Erstatter håndrullede `<table>`-blokker på hver enkelt skjerm, og de
 * ListRow-listene som fikk tall stappet inn i halen for å simulere kolonner.
 *
 * Hva den IKKE er:
 * - `ListRow` + `ListGroup` = én rad, én sak (leading + tittel + hale). Ingen
 *   kolonner å sammenligne, ingen sortering. Er det bare én verdi per rad,
 *   er det en liste — ikke en tabell med én kolonne.
 * - `KeyValueGrid` = ETT objekts spesifikasjoner. Par, ikke rader.
 * - `KanbanKolonne` = samme sett gruppert etter status, lest bortover.
 *
 * Komponenten sorterer ikke selv: `sort` og `onSort` er kontrollerte, slik at
 * skjermen kan sortere på serveren når settet er større enn siden.
 */
export interface DataTableColumn<R = any> {
  /** Feltnavn i raden. Også React-key for cellen. */
  key: string;
  label: string;
  /** "end" høyrestiller OG setter mono med tabulære sifre — bruk for alle tall. */
  align?: "start" | "end";
  sortable?: boolean;
  strong?: boolean;
  /** Datasemantikk. Funksjon når tonen avhenger av raden. Aldri rød — "dn" er leire. */
  tone?: "up" | "dn" | null | ((row: R) => "up" | "dn" | null);
  /** CSS-bredde, f.eks. "180px". Uten den forhandler tabellen selv. */
  width?: string;
  render?: (row: R) => React.ReactNode;
}

export interface DataTableProps<R = any> {
  columns: DataTableColumn<R>[];
  rows: R[];
  /** Mono versaletikett over tabellen. Rendres som ekte `<caption>`. */
  caption?: string;
  sort?: { key: string; dir: "asc" | "desc" } | null;
  onSort?: (next: { key: string; dir: "asc" | "desc" }) => void;
  /** Feltet som gir React-key per rad. Standard "id". */
  rowKey?: string;
  state?: "content" | "empty" | "loading" | "error";
  /** Ekte norsk tomtekst — aldri «Ingen data». */
  emptyText?: string;
  errorText?: string;
  /** Antall skjelettrader i lastetilstand. */
  loadingRows?: number;
  density?: "tett" | "md" | "romslig";
  /** Låser høyden og gjør hodet klebrig. Tall tolkes som px. */
  maxHeight?: number | string;
  /** Grunnlagslinje under tabellen — kilde og tidsvindu. Ruller ikke med. */
  footNote?: string;
  /** data-od-id, rolleprefiks panel- */
  dataOdId?: string;
}
