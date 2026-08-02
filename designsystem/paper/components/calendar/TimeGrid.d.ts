/**
 * Ukens tidsgrid for AgencyOS-kalenderen og Workbench: 04:00–23:00 med
 * 1px = 1 minutt, 20-min raster, sticky dagshode og sticky timemarg.
 * Erstatter håndrullede kalendertabeller — biblioteket hadde ingenting for tid.
 * IKKE en agenda-liste (bruk ListGroup) og ikke en editor: drag, resize og
 * tastaturflytting er oppførsel som hører til konsumenten, ikke til anatomien.
 */
export interface TimeGridDay {
  /** Kort ukedag, f.eks. "man" */
  label: string;
  /** Datotall som vises i pillen, f.eks. "29" */
  date: string;
  today?: boolean;
}
export interface TimeGridEvent {
  id?: string | number;
  /** Indeks i days[] */
  day: number;
  /** "14:00" eller minutter fra midnatt */
  start: string | number;
  end: string | number;
  title: string;
  /** default = blekk-kant · free = ledig/bookbar (--up, stiplet) · bg = bakgrunnslag (skole/booking, bak alt, ikke klikkbart) */
  kind?: "default" | "free" | "bg";
}
export interface TimeGridProps {
  days: TimeGridDay[];
  events: TimeGridEvent[];
  /** Døgnvinduet. Standard 4–23 = 1140px lerret. */
  startHour?: number;
  endHour?: number;
  /** Nålinje: "13:20" eller minutter. null skjuler den. */
  now?: string | number | null;
  /** Høyde på scrollrammen. Standard 460px. */
  maxHeight?: number | string;
  onEventClick?: (event: TimeGridEvent) => void;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  /** data-od-id, rolleprefiks panel- */
  dataOdId?: string;
  className?: string;
}
export declare function TimeGrid(props: TimeGridProps): JSX.Element;
