/**
 * Lokal, deterministisk navne-anonymisering for Saker (Jarvis steg 3).
 *
 * Selve navne-GJENKJENNINGEN gjøres av en lokal Ollama-modell
 * (scripts/saker-innsamling/triage.ts) — den kjører kun på Mac Mini-en og
 * ser derfor rå tekst uten problem. Denne fila gjør KUN den mekaniske
 * erstatningen (navn → [PERSON1], [PERSON2] …) og re-substitusjonen etterpå.
 * Skillet finnes fordi en språkmodell ikke kan garanteres å gjengi RESTEN av
 * teksten uendret — den mekaniske delen må være en ren, testbar funksjon for
 * at et eksakt round-trip (og fravær av plassholder-kollisjoner) skal kunne
 * verifiseres uten nettverk.
 *
 * Ligger i src/lib/ (ikke scripts/) fordi kun src/**\/*.test.ts dekkes av
 * `npm test` (se package.json) — anonymisering av personopplysninger er
 * nøyaktig den typen logikk som MÅ ha regresjonstester.
 */

export type AnonymiseringsResultat = {
  /** Teksten med navn erstattet av [PERSON1], [PERSON2] osv. */
  anonymisert: string;
  /** plassholder → opprinnelig navn. Brukes av reSubstituer() til å sette navnene tilbake. */
  mapping: Map<string, string>;
};

function escapeRegExp(tekst: string): string {
  return tekst.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Unicode-bevisst «ordgrense». JS sin innebygde `\b` bygger på `\w`
 * (`[A-Za-z0-9_]`) og bommer på æøå — uten dette ville et navn som «Åse»
 * kunne matche midt inne i et lengre, ubeslektet ord. `\p{L}` dekker alle
 * bokstaver (norske inkludert), så en grense er «ingen bokstav rett før
 * eller etter treffet».
 */
function medOrdgrense(navn: string): RegExp {
  return new RegExp(`(?<![\\p{L}])${escapeRegExp(navn)}(?![\\p{L}])`, "gu");
}

/**
 * Erstatter en liste personnavn i teksten med [PERSON1], [PERSON2] osv.
 *
 * Nummereringen følger rekkefølgen navnene står i `navn`-lista (første gang
 * et navn er nevnt, deduplisert case-insensitivt) — IKKE tekstens
 * leserekkefølge. `navn` kommer fra Ollama-klassifiseringen i den
 * rekkefølgen modellen fant dem, og den rekkefølgen er stabil nok til å
 * bruke direkte.
 *
 * Selve tekst-erstatningen skjer i LENGDE-rekkefølge (lengste navn først),
 * slik at et navn som er en delstreng av et lengre navn («Ole» i
 * «Ole Hansen») ikke ved et uhell fanger opp deler av det lengre navnet før
 * det er erstattet som helhet. To ulike navn i lista får alltid to ulike
 * plassholdere — det finnes ingen fuzzy sammenslåing av «samme person, ulikt
 * skrevet» her (det er Ollama sin jobb å levere kanoniske navn).
 *
 * Navn som ikke faktisk finnes i teksten (case-sensitivt — se reSubstituer)
 * hoppes stille over: de får ingen plassholder og ingen mapping-oppføring.
 */
export function anonymiserNavn(tekst: string, navn: readonly string[]): AnonymiseringsResultat {
  const uniknavn: string[] = [];
  const settNokkel = new Set<string>();
  for (const raa of navn) {
    const n = raa.trim();
    if (!n) continue;
    const nokkel = n.toLowerCase();
    if (settNokkel.has(nokkel)) continue;
    settNokkel.add(nokkel);
    uniknavn.push(n);
  }

  const plassholderForNavn = new Map<string, string>(); // navn (lowercase) -> plassholder
  uniknavn.forEach((n, i) => plassholderForNavn.set(n.toLowerCase(), `[PERSON${i + 1}]`));

  const iLengdeRekkefolge = [...uniknavn].sort((a, b) => b.length - a.length);

  let anonymisert = tekst;
  const mapping = new Map<string, string>(); // plassholder -> navn
  for (const n of iLengdeRekkefolge) {
    const plassholder = plassholderForNavn.get(n.toLowerCase());
    if (!plassholder) continue;
    if (!medOrdgrense(n).test(anonymisert)) continue;
    anonymisert = anonymisert.replace(medOrdgrense(n), plassholder);
    mapping.set(plassholder, n);
  }

  return { anonymisert, mapping };
}

/**
 * Setter navnene tilbake i en (evt. AI-omskrevet) tekst som fortsatt
 * inneholder plassholderne. Ren streng-erstatning — plassholderne
 * ([PERSON1] osv.) er unike nok til at rekkefølgen på erstatningen ikke
 * spiller noen rolle, og de kolliderer aldri med hverandre (PERSON1 er ikke
 * en delstreng av PERSON2 osv.).
 */
export function reSubstituer(tekst: string, mapping: ReadonlyMap<string, string>): string {
  let resultat = tekst;
  for (const [plassholder, navn] of mapping) {
    resultat = resultat.split(plassholder).join(navn);
  }
  return resultat;
}
