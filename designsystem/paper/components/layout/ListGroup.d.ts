/**
 * Beholderen som samler ListRow (~15 skjermer). Rendres som <ul> og eier
 * skillelinjene via :not(:last-child) — en rad tegner aldri sin egen.
 */
export interface ListGroupProps {
  /** Mono versal-etikett over gruppen, koblet via aria-labelledby */
  label?: string;
  /** 1px --border mellom rader. false i korte lister der luft er nok. */
  dividers?: boolean;
  /**
   * "ul" (standard) eller "div" med role="list". Bruk "div" når en runtime
   * legger en mount-wrapper mellom gruppen og radene — da ville et <div>
   * blitt barn av <ul>, som er ugyldig HTML. Radene MÅ få samme verdi.
   */
  as?: "ul" | "div";
  dataOdId?: string;
  /** Kun ListRow. */
  children?: React.ReactNode;
}
