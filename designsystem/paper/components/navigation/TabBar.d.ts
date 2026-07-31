export interface TabBarItem {
  id: string;
  label: string;
  /** Lucide-SVG 20px, stroke-width 1,5 */
  icon: React.ReactNode;
  disabled?: boolean;
}
export interface TabBarProps {
  items?: TabBarItem[];
  current?: string;
  onNavigate?: (id: string) => void;
  dataOdId?: string;
}
