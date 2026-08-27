/**
 * Rom-/sim-kollisjon — KA-05 (Loop 7/C3, natt-plan bølge 2).
 *
 * Fasit: `designsystem/train-lock/KA-05 Agency Kollisjon rom.dc.html» —
 * «Ett rom, to bookinger. Flytt en av dem — treningsinnholdet påvirkes ikke.»
 * Eies av Kalender, ALDRI Workbench (OVERNIGHT-CODING-LOOP-BOLGE2.md Loop 7).
 *
 * Samme mønster som `kalender-belegg.ts` sin `kollisjoner()` — coachen der,
 * fasiliteten her, er ressursen som ikke kan være to steder samtidig.
 *
 * Skop: KUN fasiliteter med kapasitet 1. En fasilitet med kapasitet > 1 (delt
 * simulator-flate, range-bukt med flere plasser) er per definisjon
 * overbookbar opp til kapasiteten — det er ikke en kollisjon, det er
 * fasilitetens formål. Å telle overlapp der ville meldt falske kollisjoner på
 * normal drift. Rene funksjoner, ingen Prisma/Date — kalleren (data.ts) gir
 * minutter siden midnatt og fasilitetens kapasitet.
 */

export interface RomBooking {
  id: string;
  facilityId: string;
  facilityName: string;
  /** Minutter siden midnatt. */
  startMin: number;
  /** Minutter siden midnatt. Klemt til døgnet av kalleren for fleredagers-bookinger. */
  sluttMin: number;
  tittel: string;
}

export interface RomKollisjonPar {
  a: string;
  b: string;
  facilityId: string;
  facilityName: string;
  /** Overlappets start og slutt i minutter siden midnatt. */
  fraMin: number;
  tilMin: number;
}

/**
 * Kollisjoner: to bookinger som opptar SAMME fasilitet samtidig, når
 * fasiliteten kun har plass til én. Berøring teller ikke — en booking som
 * slutter 14.00 og en som starter 14.00 kolliderer ikke (samme regel som
 * `kalender-belegg.kollisjoner`: `a1 < b2 && b1 < a2`).
 *
 * `kapasitetPerFasilitet` mangler nøkkel ⇒ anta kapasitet 1 (fasiliteter uten
 * eksplisitt kapasitet i data er som regel enkeltrom/simulatorer).
 */
export function romKollisjoner(
  bookinger: readonly RomBooking[],
  kapasitetPerFasilitet: Readonly<Record<string, number>>,
): RomKollisjonPar[] {
  const ut: RomKollisjonPar[] = [];
  for (let i = 0; i < bookinger.length; i++) {
    for (let j = i + 1; j < bookinger.length; j++) {
      const a = bookinger[i];
      const b = bookinger[j];
      if (a.facilityId !== b.facilityId) continue;
      if ((kapasitetPerFasilitet[a.facilityId] ?? 1) > 1) continue;
      if (a.startMin < b.sluttMin && b.startMin < a.sluttMin) {
        ut.push({
          a: a.id,
          b: b.id,
          facilityId: a.facilityId,
          facilityName: a.facilityName,
          fraMin: Math.max(a.startMin, b.startMin),
          tilMin: Math.min(a.sluttMin, b.sluttMin),
        });
      }
    }
  }
  return ut;
}

/** Id-ene til alle bookinger som inngår i minst én kollisjon. */
export function romKollidererIder(kollisjoner: readonly RomKollisjonPar[]): Set<string> {
  const ut = new Set<string>();
  for (const k of kollisjoner) {
    ut.add(k.a);
    ut.add(k.b);
  }
  return ut;
}
