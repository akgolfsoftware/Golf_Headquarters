/**
 * Faktarad — to til fire målte tall side om side, delt av hårlinjer. Til
 * seksjonsbunn, presentasjonsside og rapport. Alle tall i mono.
 */
export interface Faktapost { etikett: string; verdi: string; enhet?: string; note?: string; fremhevet?: boolean }
export interface FaktaradProps {
  poster?: Faktapost[];
  kolonner?: number;
  kompakt?: boolean;
  style?: React.CSSProperties;
}
export function Faktarad(props: FaktaradProps): JSX.Element;
