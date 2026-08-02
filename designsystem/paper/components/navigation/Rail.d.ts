export interface RailItem {
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
  dataOdId?: string;
}
