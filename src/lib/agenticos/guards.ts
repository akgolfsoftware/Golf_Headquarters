// Guards som kjører ETTER generering, før brukeren ser svaret.
//
// Prompten ber modellen om å følge invariantene; guardene sjekker at den
// faktisk gjorde det. En prompt er en anmodning, en guard er en kontroll.
//
// Guardene BLOKKERER ikke — de returnerer treff som logges på interaksjonen og
// kan vises til coachen. Å sperre et svar ville brutt invariant 1 («anbefalinger
// sperrer aldri»). Kalleren bestemmer hva et treff skal føre til.
//
// Trygg for klient — ingen server-only imports.

import { harDrillBank, masterbrain } from "@/lib/masterbrain";

export type GuardTreff = {
  guard: string;
  detalj: string;
};

// Formuleringer som gjør en anbefaling om til en sperre.
const SPERRE_MONSTRE: readonly { regex: RegExp; detalj: string }[] = [
  { regex: /\bkan ikke brytes\b/iu, detalj: "«kan ikke brytes»" },
  { regex: /\b(du|de)\s+(kan|får)\s+ikke\s+(trene|spille|gjennomføre)\b/iu, detalj: "nekter trening" },
  { regex: /\ber\s+(sperret|blokkert)\b/iu, detalj: "omtaler noe som sperret" },
  { regex: /\bikke\s+lov\s+(å|a)\s+(trene|spille)\b/iu, detalj: "omtaler trening som ulovlig" },
];

/** Invariant 1: ingenting i appen skal blokkere trening. */
export function sjekkInvarianter(svar: string): GuardTreff[] {
  return SPERRE_MONSTRE.filter((m) => m.regex.test(svar)).map((m) => ({
    guard: "invariant-sperrer-aldri",
    detalj: m.detalj,
  }));
}

/**
 * Presenterer svaret en SG-basert svingfeil som et funn i stedet for en hypotese?
 * Beslutning 2026-07-31: SG peker mot kandidater, det diagnostiserer ikke.
 */
export function sjekkHypoteseSpraak(svar: string): GuardTreff[] {
  const naevnerSg = /\bsg\b|strokes gained/iu.test(svar);
  if (!naevnerSg) return [];

  const diagnostisk = /\b(feilen er|du har|diagnosen er|dette skyldes)\b/iu.test(svar);
  const forbeholden = /\b(peker mot|kan tyde på|hypotese|må bekreftes|sannsynlig)\b/iu.test(svar);

  if (diagnostisk && !forbeholden) {
    return [
      {
        guard: "sg-er-hypotese",
        detalj: "SG-basert påstand formulert som diagnose uten forbehold",
      },
    ];
  }
  return [];
}

/**
 * Nevner svaret en drill, svingfeil eller posisjon som ikke finnes i fasiten?
 * Treff betyr ikke at svaret er feil — det betyr at påstanden er ubekreftet og
 * bør merkes som det.
 */
export function sjekkMotFasit(svar: string): GuardTreff[] {
  const treff: GuardTreff[] = [];

  // Drill-banken er tom (tømt 2026-07-31). Foreskriver svaret likevel en øvelse?
  if (!harDrillBank()) {
    // Merk: \b er ASCII-basert i JS og gir ingen grense foran «ø» — derfor
    // eksplisitt unicode-ordgrense her.
    const foreskriver =
      /(^|[^\p{L}\p{N}])(øvelsen|ovelsen|drillen)\s+«?[\p{L}\p{N}_-]+»?/iu.test(svar);
    if (foreskriver) {
      treff.push({
        guard: "tom-drill-bank",
        detalj: "foreskriver navngitt øvelse mens drill-banken er under oppbygging",
      });
    }
  }

  // Nevnte fault-id-er skal finnes i fasiten.
  const kjenteFeil = new Set(
    Object.keys((masterbrain.faults as { entities?: Record<string, unknown> }).entities ?? {}),
  );
  const naevnteIder = svar.match(/\b[a-z]+(?:_[a-z]+){1,4}\b/gu) ?? [];
  for (const id of new Set(naevnteIder)) {
    // Kun ord som ser ut som fault-id-er og ikke finnes i fasiten er interessante.
    // Vi flagger bare når det ligner sterkt: minst to understreker eller kjent prefiks.
    const lignerFaultId = id.split("_").length >= 3 || /^(over|early|poor|angle|left|improper|insufficient|flat|incorrect)_/u.test(id);
    if (lignerFaultId && !kjenteFeil.has(id)) {
      treff.push({ guard: "ukjent-fault-id", detalj: id });
    }
  }

  return treff;
}

/** Kjør alle guards. Returnerer alle treff — kalleren avgjør hva de betyr. */
export function kjorGuards(svar: string): GuardTreff[] {
  return [...sjekkInvarianter(svar), ...sjekkHypoteseSpraak(svar), ...sjekkMotFasit(svar)];
}
