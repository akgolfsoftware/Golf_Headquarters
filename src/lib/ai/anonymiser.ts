/**
 * Pseudonymisering av navn før tekst sendes til en ekstern LLM (GDPR art. 9).
 *
 * Ren modul — ingen I/O, ingen tunge imports — så den kan enhetstestes og deles
 * på tvers av agenter. Mønsteret: bytt hvert ekte navn med et stabilt pseudonym
 * ("Spiller 1", "Spiller 2", …) i prompten, og map pseudonymene tilbake til
 * ekte navn i modell-svaret. Da forlater navnet aldri systemet, mens sluttteksten
 * som vises internt fortsatt inneholder de ekte navnene.
 *
 * To mønstre, samme modul (slått sammen 2026-08-02 fra `anonymiser.ts` i PR #223
 * og `pseudonym.ts` på rednings-grenen — det skal finnes ÉN kilde her):
 *
 * 1. Navn-basert (`byggPseudonymMap` + `anonymiser`/`deanonymiser`) — når du har
 *    en tekst med flere navn i, f.eks. daily brief.
 * 2. Id-basert (`pseudonymForId` + `substituerPseudonym`) — når du bygger prompten
 *    selv og har spillerens id. Pseudonymet er deterministisk og ikke-reverserbart
 *    uten databasen.
 */

import { createHash } from "crypto";

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Bygg pseudonym-map fra en liste ekte navn. Tomme/duplikate navn hoppes over.
 * Sorteres lengste navn først slik at et fornavn som er delstreng av et fullt
 * navn ikke erstattes før det fulle navnet.
 */
export function byggPseudonymMap(navn: Iterable<string>): Map<string, string> {
  const unike = new Set<string>();
  for (const n of navn) {
    const t = n?.trim();
    if (t) unike.add(t);
  }
  const map = new Map<string, string>();
  let i = 1;
  for (const n of [...unike].sort((a, b) => b.length - a.length)) {
    map.set(n, `Spiller ${i++}`);
  }
  return map;
}

/** Bytt ekte navn → pseudonym i teksten som skal sendes ut. */
export function anonymiser(tekst: string, map: Map<string, string>): string {
  let ut = tekst;
  for (const [ekte, pseudo] of map) {
    ut = ut.replace(new RegExp(escapeRegExp(ekte), "g"), pseudo);
  }
  return ut;
}

/** Bytt pseudonym → ekte navn i modell-svaret (lengste pseudonym først). */
export function deanonymiser(tekst: string, map: Map<string, string>): string {
  let ut = tekst;
  const par = [...map.entries()].sort((a, b) => b[1].length - a[1].length);
  for (const [ekte, pseudo] of par) {
    ut = ut.replace(new RegExp(escapeRegExp(pseudo), "g"), ekte);
  }
  return ut;
}

// ---------- Id-basert pseudonym (fra tidligere pseudonym.ts) ----------

/**
 * Deterministisk, ikke-reverserbart pseudonym for én bruker-id. Samme spiller gir
 * alltid samme pseudonym, slik at AI-svaret kan mappes tilbake til ekte navn før
 * coach eller spiller ser det — det ekte navnet forlater aldri denne serveren.
 */
export function pseudonymForId(userId: string): string {
  const hash = createHash("sha256").update(userId).digest("hex").slice(0, 6);
  return `Spiller-${hash}`;
}

/**
 * Bytter ut ett pseudonym med det ekte navnet i en AI-generert tekst.
 * Kjøres på responsen FØR den lagres eller vises til coach/spiller.
 */
export function substituerPseudonym(
  tekst: string,
  pseudonym: string,
  ektNavn: string,
): string {
  return tekst.split(pseudonym).join(ektNavn);
}

/** Som substituerPseudonym, men for flere spillere i én tekst. */
export function substituerPseudonymer(
  tekst: string,
  kart: Map<string, string> | Record<string, string>,
): string {
  const entries = kart instanceof Map ? Array.from(kart.entries()) : Object.entries(kart);
  return entries.reduce(
    (acc, [pseudonym, ektNavn]) => acc.split(pseudonym).join(ektNavn),
    tekst,
  );
}
