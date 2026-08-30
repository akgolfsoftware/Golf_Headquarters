/**
 * Hvem kan vises på ÅPNE (uinnloggede) stats-flater.
 *
 * Grunnlag: Anders' beslutning 30.08.2026 («LIVE-SIDEN: TO-LAGS-MODELL» punkt 2 +
 * datakartleggingens svar 3, se `.claude/rules/beslutninger.md`):
 *
 *  1. Spillere født 2008 eller senere vises ALDRI åpent (barnevern).
 *  2. Mangler fødselsår → vises ikke (fail-closed).
 *  3. Fail-closed gjelder KUN ikke-DataGolf-spillere. DataGolf-proffer er voksne
 *     spillere på offentlige tourer, og 3 556 av 3 569 mangler fødselsår i basen —
 *     fail-closed på dem ville fjernet nettopp det laget som er trygt.
 *
 * Regel 1 og 2 er implementert som ett aldersgulv: fødselsåret må være minst 19 år
 * tilbake i tid. 19 og ikke 18 fordi vi kun har ÅR, ikke dato — den som er født i
 * år `n - 19` har fylt 18 uansett fødselsdag, mens `n - 18` ville sluppet gjennom
 * mindreårige med bursdag senere på året. For 2026 gir dette grensen «født 2007
 * eller tidligere», som er nøyaktig beslutningens ordlyd.
 *
 * Samtykke-unntaket i beslutningen («uten aktivt samtykke») er IKKE implementert:
 * `PublicPlayer` har ikke noe samtykkefelt i dag. Til det finnes er regelen ren
 * skjuling. Kommer samtykke, utvides dette predikatet — ikke kallstedene.
 *
 * Gjelder kun ÅPNE flater. Innlogget visning til berørte (spiller, forelder,
 * trener) er en tjeneste, ikke republisering, og styres av tilgangsmodellen.
 */

import type { Prisma } from "@/generated/prisma/client";

/**
 * Antall år tilbake fødselsåret minst må ligge for at spilleren garantert er myndig.
 * Se filhodet for hvorfor 19 og ikke 18.
 */
export const MYNDIG_AARSMARGIN = 19;

/**
 * Nedre grense mot søppeldata. Basen har minst én rad med `birthYear = 0`, som uten
 * denne grensen ville passert som «trygt gammel» og blitt vist åpent.
 */
export const TIDLIGSTE_GYLDIGE_FODSELSAAR = 1900;

/** Siste fødselsår som kan vises åpent. For 2026: 2007. */
export function sisteTryggeFodselsaar(naa: Date = new Date()): number {
  return naa.getFullYear() - MYNDIG_AARSMARGIN;
}

/**
 * Prisma-filter for åpne spillerlister og -oppslag.
 *
 * Legges ved siden av flatens egne filtre:
 *   where: { country: "NO", isActive: true, ...offentligSpillerFilter() }
 */
export function offentligSpillerFilter(naa: Date = new Date()): Prisma.PublicPlayerWhereInput {
  return {
    OR: [
      // DataGolf-proffer: voksne på offentlige tourer, unntatt fail-closed.
      { dataGolfId: { not: null } },
      // Alle andre: må ha et troverdig fødselsår som gjør dem garantert myndige.
      {
        birthYear: {
          gte: TIDLIGSTE_GYLDIGE_FODSELSAAR,
          lte: sisteTryggeFodselsaar(naa),
        },
      },
    ],
  };
}

/**
 * Samme regel for én allerede hentet spiller — til detaljsider som slår opp på slug
 * og må svare 404 i stedet for å filtrere en liste.
 */
export function kanVisesOffentlig(
  spiller: { birthYear: number | null; dataGolfId: number | null },
  naa: Date = new Date(),
): boolean {
  if (spiller.dataGolfId !== null) return true;
  if (spiller.birthYear === null) return false;
  return (
    spiller.birthYear >= TIDLIGSTE_GYLDIGE_FODSELSAAR &&
    spiller.birthYear <= sisteTryggeFodselsaar(naa)
  );
}
