/**
 * Avkrysning — én bekreftelse, ofte samtykke. Merkelappen er hele setningen,
 * så den kan leses uten teksten rundt.
 */
export interface AvkrysningProps {
  merkelapp: React.ReactNode;
  hjelp?: string;
  feil?: string;
  avkrysset?: boolean;
  onEndre?: (avkrysset: boolean) => void;
  deaktivert?: boolean;
  id?: string;
  style?: React.CSSProperties;
}
export function Avkrysning(props: AvkrysningProps): JSX.Element;
