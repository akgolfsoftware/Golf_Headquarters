/**
 * Delt navnematching for scraper-scripts som må koble et fritekst-navn fra en
 * ekstern kilde (Clippd, Golfstat) mot en kjent PublicPlayer.
 *
 * Trukket ut fra scripts/import-clippd-college.ts (opprinnelig implementasjon)
 * slik at scripts/scrape-golfstat-ncaa.ts kan bruke samme, verifiserte logikk
 * i stedet for en egen kopi.
 */

/** Normaliser navn: småbokstaver, ascii, kollaps mellomrom. */
export function normaliserNavn(navn: string): string {
  return navn
    .toLowerCase()
    .replace(/[åä]/g, "a")
    // Clippd/Golfstat bruker gammel norsk translitterasjon: å → aa, ø → oe, æ → ae
    // Normaliser dette til enkelt bokstav slik at "Baard" → "bard" matcher "Bård" → "bard"
    .replace(/aa/g, "a")
    .replace(/oe/g, "o")
    .replace(/[øö]/g, "o")
    .replace(/[æ]/g, "ae")
    .replace(/[éèê]/g, "e")
    .replace(/[íì]/g, "i")
    .replace(/[úù]/g, "u")
    .replace(/\s+/g, " ")
    .trim();
}

/** Dice-koeffisient (karakter-bigram-overlapp) mellom to strenger. */
export function diceKoeffisient(a: string, b: string): number {
  if (a.length < 2 || b.length < 2) return a === b ? 1.0 : 0.0;
  const bigramA = new Set<string>();
  for (let i = 0; i < a.length - 1; i++) bigramA.add(a.slice(i, i + 2));
  const bigramB: string[] = [];
  for (let i = 0; i < b.length - 1; i++) bigramB.push(b.slice(i, i + 2));
  const felles = bigramB.filter((g) => bigramA.has(g)).length;
  return (2 * felles) / (bigramA.size + bigramB.length);
}

/**
 * Navnelikhet 0–1: fornavn må ha minst 60% karakter-likhet (hindrer
 * "Frithjof" → "Alex" via felles etternavn "Rasmussen"), deretter 70%
 * ord-overlapp + 30% fornavn-likhet for resten.
 */
export function navnLikhet(a: string, b: string): number {
  const na = normaliserNavn(a);
  const nb = normaliserNavn(b);
  if (na === nb) return 1.0;

  const partsA = na.split(" ");
  const partsB = nb.split(" ");

  const fornavnA = partsA[0];
  const fornavnB = partsB[0];
  const fornavnLikhet = diceKoeffisient(fornavnA, fornavnB);

  if (fornavnLikhet < 0.6) return 0.0;

  const felles = partsA.filter((p) => partsB.includes(p)).length;
  const maxLen = Math.max(partsA.length, partsB.length);
  const ordScore = felles / maxLen;
  return 0.7 * ordScore + 0.3 * fornavnLikhet;
}
