/**
 * Dekningsgrad for delingssamtykke (plan N5, Team Norway/WANG-ekstern-leser).
 *
 * En trener med ekstern-leser-tilgang til en gruppe skal ALDRI presenteres
 * som om spillere uten samtykke ikke finnes. UI-et skal si «4 av 11 har gitt
 * samtykke» — aldri late som gruppen har 4 medlemmer. Denne fila er den ene
 * regnestykke-kilden for det tallet.
 *
 * Ren funksjon (ingen IO) — testes isolert. Kall den med resultatet av
 * `aktivtSpillerMedlemskapWhere`-spørringen (gruppemedlemmene) og
 * `velgSamtykkedeSpillerePerGruppe`/`eksternLeserSpillerIderPerGruppe`
 * (de samtykkede) for én gruppe om gangen.
 */

export interface DekningsgradInput {
  /** userId for hvert aktivt PLAYER-medlem i gruppen. Duplikater tolereres. */
  gruppemedlemmer: readonly string[];
  /**
   * userId for medlemmer med gyldig samtykke for scopet mot AKKURAT denne
   * gruppen. En id utenfor `gruppemedlemmer` telles ikke — dekningsgrad er
   * alltid et forhold til de faktiske medlemmene, aldri til samtykke-tallet
   * alene (en utmeldt spiller med gammelt samtykke skal ikke blåse opp `totalt`).
   */
  samtykketUserIds: readonly string[];
}

export interface Dekningsgrad {
  /** Antall unike aktive spillermedlemmer i gruppen. */
  totalt: number;
  /** Antall av dem som har gyldig samtykke for scopet mot gruppen. */
  samtykket: number;
  /** Avrundet heltall 0–100. 0 medlemmer → 0, aldri NaN eller Infinity. */
  prosentSamtykket: number;
}

export function beregnDekningsgrad(input: DekningsgradInput): Dekningsgrad {
  const medlemmer = new Set(input.gruppemedlemmer);
  const samtykketSet = new Set(input.samtykketUserIds);

  let samtykket = 0;
  for (const userId of medlemmer) {
    if (samtykketSet.has(userId)) samtykket++;
  }

  const totalt = medlemmer.size;
  const prosentSamtykket = totalt === 0 ? 0 : Math.round((samtykket / totalt) * 100);

  return { totalt, samtykket, prosentSamtykket };
}
