export interface RailItem {
  /** Valgfri seksjonsetikett; vises som mono-versaler over første rad i gruppen */
  section?: string;
  /** Blir data-od-id "nav-<id>" */
  id: string;
  label: string;
  /** Lucide-SVG 18px, stroke-width 1,5 */
  icon: React.ReactNode;
}
export interface RailProps {
  items?: RailItem[];
  /** id på aktiv side */
  current?: string;
  onNavigate?: (id: string) => void;
  /** Initialer i bunn-avataren */
  initials?: string;
  /** Produktnavn ved siden av logoen */
  title?: string;
  /** Navn i bunnraden */
  name?: string;
  /** Underlinje i bunnraden */
  role?: string;
  dataOdId?: string;
}
