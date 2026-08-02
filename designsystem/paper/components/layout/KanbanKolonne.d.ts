/**
 * KanbanKolonne — ETT trinn i en flyt, med kortene som står der nå. Tittel,
 * antall (mot valgfritt tak), valgfri handling, og tom tilstand.
 *
 * Komponenten er kolonnen alene. Brettet er skjermens eget grid, og kortene
 * er `QueueCard`, `SessionCard` eller `Panel` — kolonnen eier verken
 * drag-drop, rekkefølge eller kortenes innhold.
 *
 * Hva den IKKE er:
 * - `DataTable` = samme sett, annet spørsmål. Tabellen svarer «hvordan ligger
 *   disse an mot hverandre» (leses nedover). Kanban svarer «hvor i flyten
 *   står hver enkelt» (leses bortover).
 * - `ListGroup` = en liste uten trinn. Ingen kolonne, ingen tak.
 * - `Panel` = generell kortflate. KanbanKolonne har `--soft`-bunn med hensikt,
 *   slik at kortene inni leser som oppå og ikke som en del av flaten.
 */
export interface KanbanKolonneProps {
  title: string;
  /** Overstyrer antall barn — for virtuelle lister der ikke alt er rendret. */
  count?: number;
  /** Anbefalt tak. Overskridelse gir merknad, ALDRI sperre. */
  limit?: number;
  /** Liten handling i kolonnehodet, f.eks. en DropdownMenu-utløser. */
  action?: React.ReactNode;
  /** Ekte norsk tomtekst — aldri «Ingen data». */
  emptyText?: string;
  /** Låser listehøyden og lar kolonnen rulle i seg selv. Tall tolkes som px. */
  maxHeight?: number | string;
  /** Fjerner bunnflaten — for brett som allerede står på --soft. */
  flat?: boolean;
  children?: React.ReactNode;
  /** data-od-id, rolleprefiks panel- */
  dataOdId?: string;
}
