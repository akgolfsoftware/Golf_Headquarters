/**
 * Varsel — en melding som gjelder hele flaten. Farget skinne til venstre (3 px)
 * bærer tilstanden; kortet ellers er hvitt ark. Ikke en toast — merket har ingen.
 */
export interface VarselProps {
  tilstand?: 'info' | 'ok' | 'varsel' | 'feil';
  tittel?: string;
  /** Én knapp eller lenke, aldri to. */
  handling?: React.ReactNode;
  onLukk?: () => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export function Varsel(props: VarselProps): JSX.Element;
