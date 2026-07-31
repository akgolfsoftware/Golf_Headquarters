/**
 * Mono versal-etikett over en gruppe (~15 skjermer). Én kilde for
 * eyebrow/kicker/gruppeetikett: mono 10/600, .1em sporing, --muted.
 * PageHeaders kicker ER denne komponenten — ikke en kopi av den.
 */
export interface SectionLabelProps {
  /** span (standard) · div når etiketten står alene i en kolonne · p i prosaflyt */
  as?: "span" | "div" | "p";
  /** For aria-labelledby fra gruppen etiketten navngir */
  id?: string;
  dataOdId?: string;
  children?: React.ReactNode;
}
