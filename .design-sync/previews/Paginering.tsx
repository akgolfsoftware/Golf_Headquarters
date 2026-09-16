import { Paginering } from "akgolf-hq-komponenter";

/** Side 2 av 8 i stallen: mono-tall, aktiv side som fylt pille, tellertekst til høyre. */
export function Standard() {
  return <Paginering side={2} antall={8} tekst="74 spillere" />;
}

/** Første side i turneringslista. */
export function ForsteSide() {
  return <Paginering side={1} antall={12} tekst="212 turneringer" />;
}

/** Siste side: den siste pillen er aktiv. Kilden viser alltid 1 · 2 · 3 · … · siste, uansett aktiv side. */
export function SisteSide() {
  return <Paginering side={8} antall={8} tekst="74 spillere" />;
}
