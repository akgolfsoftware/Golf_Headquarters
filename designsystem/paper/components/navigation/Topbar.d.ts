export interface TopbarProps {
  /** Venstre side — typisk <Breadcrumbs /> */
  left?: React.ReactNode;
  searchPlaceholder?: string;
  searchDisabled?: boolean;
  /** Styres av skjermen; persisteres i localStorage akhq-theme-<surface> */
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
  /** Knapper til høyre for tema-toggelen */
  actions?: React.ReactNode;
  dataOdId?: string;
}
