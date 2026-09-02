/**
 * Toppnav — topplinja på markedssider. Aktiv lenke får 2 px signalstrek under;
 * det er den ene bruken av rødt i navigasjonen.
 *
 * @startingPoint section="Navigasjon" subtitle="Toppnav, mobilmeny, brødsmuler og faner" viewport="700x300"
 */
export interface Navlenke { href: string; tekst: string }
export interface ToppnavProps {
  lenker?: Navlenke[];
  /** href-en til gjeldende side. */
  aktiv?: string;
  /** Knappen til høyre — én handling, ikke to. */
  handling?: React.ReactNode;
  /** Sett navnelås i stedet for logo alene. */
  variant?: 'academy' | 'junior-academy' | 'hq' | 'organisasjon' | 'products';
  mork?: boolean;
  logoRot?: string;
  /** Mobilutgave: 64 px høy, menyknapp i stedet for lenker. */
  mobil?: boolean;
  onMeny?: () => void;
  style?: React.CSSProperties;
}
export function Toppnav(props: ToppnavProps): JSX.Element;
