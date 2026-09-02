/**
 * Melding — kort svar på «hva skjedde nå». Meldingsstakk viser dem fast
 * nederst. Den som viser meldingen eier tiden; feil står til de lukkes.
 */
export interface MeldingProps extends React.HTMLAttributes<HTMLDivElement> {
  tekst: string;
  tilstand?: 'info' | 'ok' | 'varsel' | 'feil';
  /** Én tekstknapp, f.eks. «Angre». */
  handling?: React.ReactNode;
  onLukk?: () => void;
}
export function Melding(props: MeldingProps): JSX.Element;
export interface MeldingsstakkProps {
  meldinger: Array<{ id: string; tekst: string; tilstand?: MeldingProps['tilstand']; handling?: React.ReactNode }>;
  onLukk?: (id: string) => void;
  style?: React.CSSProperties;
}
export function Meldingsstakk(props: MeldingsstakkProps): JSX.Element | null;
