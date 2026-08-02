/**
 * Primær handling i Claude Paper. CTA er alltid blekk/papir (--cta/--on-cta) —
 * aldri farge. Én primær per skjerm, resten ghost. Fylt aksentflate finnes
 * ikke i knapper; «Én ting nå» er OneThingNow-seksjonen med blekk-knapper inni.
 * @startingPoint section="Kjernekomponenter" subtitle="Primær og ghost — blekk/papir, aldri farge" viewport="700x400"
 */
export interface ButtonProps {
  /** primary = blekk/papir CTA · ghost = sekundær */
  /** ghost = ramme, ingen fyll · primary = fylt blekk · danger = --dn tekst og ramme, aldri fylt */
  variant?: "primary" | "ghost" | "danger";
  /** md 36px · sm 32px (44/40px ved pointer: coarse) */
  size?: "md" | "sm";
  disabled?: boolean;
  /** data-od-id, rolleprefiks cta- */
  dataOdId?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}
