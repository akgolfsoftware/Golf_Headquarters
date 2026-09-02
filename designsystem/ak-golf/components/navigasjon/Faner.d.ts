/**
 * Faner — bytter innhold på samme flate. Understreken på aktiv fane er stedet
 * en identitetsfarge får stå (09-varianter.md).
 */
export interface Fane { noekkel: string; tekst: string; antall?: number }
export interface FanerProps {
  faner?: Fane[];
  aktiv?: string;
  onBytt?: (noekkel: string) => void;
  /** Understrekfarge. Sett variantfargen når flaten hører til en variant. */
  aksent?: string;
  style?: React.CSSProperties;
}
export function Faner(props: FanerProps): JSX.Element;
