/**
 * Ikon — merkets ikonsett, 24 stykker fra Lucide satt med square/miter.
 * Uten tekst ved siden av MÅ `merkelapp` settes; ellers er ikonet dekor for
 * skjermlesere (aria-hidden).
 */
export type IkonNavn =
  | 'meny' | 'lukk' | 'pil-ned' | 'pil-hoyre' | 'pil-venstre' | 'videre' | 'ut'
  | 'pluss' | 'minus' | 'hake' | 'sok' | 'kalender' | 'klokke' | 'sted' | 'epost'
  | 'telefon' | 'last-ned' | 'ekstern' | 'info' | 'advarsel' | 'kryss' | 'maal'
  | 'person' | 'dokument';
export const IKONNAVN: IkonNavn[];
export interface IkonProps extends React.SVGAttributes<SVGSVGElement> {
  navn: IkonNavn;
  /** 16, 18, 20 eller 22 — følger typeskalaen. Standard 20. */
  storrelse?: 16 | 18 | 20 | 22 | number;
  /** Tilgjengelig navn når ikonet står alene. */
  merkelapp?: string;
}
export function Ikon(props: IkonProps): JSX.Element | null;
