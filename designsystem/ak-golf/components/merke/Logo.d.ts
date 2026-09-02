/**
 * Logo — AK Golf-merket rendret fra SVG-fil. Logoen er ukrenkelig: aldri
 * gjenskapt i markup, aldri farget om, strukket, rotert eller satt i annen skrift.
 */
export interface LogoProps {
  /** Filvariant. primaer-lys er standardvalget på grunn og ark. */
  variant?: 'primaer-lys' | 'primaer-mork' | 'hvit-mork' | 'hvit-mono' | 'sort-mono' | 'signal-mono' | 'kvadrat' | 'favicon';
  /** Høyde i px. Klemmes til minst 24 — under det forsvinner ballen. */
  hoyde?: number;
  /** Legger inn klaringssonen som padding: halve logoens høyde på alle fire sider. */
  klaring?: boolean;
  /** Sti til assets/logo/. Endre når systemet ligger et annet sted. */
  rot?: string;
  style?: React.CSSProperties;
}
export function Logo(props: LogoProps): JSX.Element;
