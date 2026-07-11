/**
 * Ren logikk for tapper-offline-køen (flytpakke 2, punkt 2.9 — avgrenset til
 * tapper; slag-plotting er baneguide-avhengig og parkert). saveTapperCounts
 * er idempotent (absolutt telling, UNIQUE på planSessionId+kølle), så køen
 * trenger bare siste kjente snapshot per økt — ikke en voksende hendelseslogg.
 * IndexedDB-I/O ligger i tapper-queue.ts (browser-only); denne fila er
 * enhetstestbar uten IndexedDB.
 */

export type TapperKoRad = {
  sessionId: string;
  counts: Array<{ club: string; count: number }>;
  /** ISO-tidspunkt for siste lokale oppdatering — kun til feilsøk/visning. */
  sistOppdatert: string;
  /** Antall mislykkede synk-forsøk siden raden ble lagt i køen. */
  forsokAntall: number;
};

const MAKS_STILLE_FORSOK = 5;

export function byggKoRad(
  sessionId: string,
  counts: Array<{ club: string; count: number }>,
  naa: Date,
): TapperKoRad {
  return { sessionId, counts, sistOppdatert: naa.toISOString(), forsokAntall: 0 };
}

/** Etter et mislykket synk-forsøk — oppdaterer telling og tidspunkt. */
export function registrerMislykketForsok(rad: TapperKoRad, naa: Date): TapperKoRad {
  return { ...rad, forsokAntall: rad.forsokAntall + 1, sistOppdatert: naa.toISOString() };
}

/**
 * Etter MAKS_STILLE_FORSOK mislykkede forsøk skal appen slutte å prøve stille
 * i bakgrunnen og heller vise en tydelig feil til spilleren — automatisk
 * retry uten grense ville skjult et reelt, vedvarende problem (f.eks. utløpt
 * sesjon) bak en evig «lagres automatisk»-tekst.
 */
export function trengerManuellHandling(rad: TapperKoRad): boolean {
  return rad.forsokAntall >= MAKS_STILLE_FORSOK;
}
