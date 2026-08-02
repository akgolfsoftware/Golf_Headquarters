export interface StatusBarItem {
  id?: string;
  /** Mono-etikett, små bokstaver: «agentfeil», «MRR», «CANON» */
  label?: string;
  /** Verdien. Tall er nøytrale til tallet selv er semantikken */
  value?: string | number;
  /** Retning bæres av tonen, aldri av dekor. Utelat for nøytrale tall */
  tone?: "up" | "dn" | "info";
  /** Satt = cellen blir en knapp med 44 px ::after-sone. Maks tre per linje */
  onClick?: () => void;
}
export interface StatusBarProps {
  items?: StatusBarItem[];
  dataOdId?: string;
}
