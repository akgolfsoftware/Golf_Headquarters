/**
 * Fast bunnrad med 1–2 knapper og gradient-fade over (~10 skjermer).
 * Brukes der en side har én uunngåelig handling: publiser plan, lagre
 * økt, bekreft booking.
 */
export interface StickyActionBarProps {
  /** Mono-notat til venstre: «6 av 5 økter · over maks», «Utkast lagret 08:42» */
  note?: React.ReactNode;
  /** 1–2 Button. Mer enn 2 gir konsollvarsel. */
  children?: React.ReactNode;
  /** Stables når notatet er langt og knappene trenger full bredde */
  stack?: boolean;
  dataOdId?: string;
}
