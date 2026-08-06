/**
 * «?»-forklaringen: 18 px hjelpknapp + lite ikke-modalt panel (~15 skjermer
 * — alle steder v2 brukte hjelp.tsx). Konsumerer useOverlayLayer
 * (fokuskontrakten). IKKE Tooltip (ren tekst ved hover, skjult ved grov
 * peker) — hjelpepanelet er klikkbart og virker på touch. Kun KORT tekst.
 */
export interface HjelpPopoverProps {
  title?: string;
  /** Forklaringen — én–tre setninger prosa */
  children: React.ReactNode;
  /** Panelets forankring når knappen står ved høyre kant */
  align?: "venstre" | "hoyre";
  dataOdId?: string;
}
