/**
 * TomTilstand — flaten som ikke har innhold ennå. Sier hva som mangler og hva
 * som skaffer det. Vis alltid tom tilstand der en flate kan være tom.
 */
export interface TomTilstandProps {
  tittel: string;
  forklaring?: string;
  handling?: React.ReactNode;
  style?: React.CSSProperties;
}
export function TomTilstand(props: TomTilstandProps): JSX.Element;
