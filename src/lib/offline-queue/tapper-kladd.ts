/**
 * Ren logikk for tapper-offline-køen (flytpakke 2, punkt 2.9 — avgrenset til
 * tapper; slag-plotting er gameplan-avhengig og parkert). saveTapperCounts
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
  /**
   * R-C (2026-09-11): hvilken innlogget bruker som la raden i køen.
   * IndexedDB er origin-scopet, ikke bruker-scopet — uten dette feltet ville
   * en stale, usynket rad fra forrige bruker på en delt/familie-enhet blitt
   * flushet (forsøkt sendt) under NESTE brukers innloggede sesjon, første
   * gang de åpner /portal. Valgfri kun for bakoverkompatibilitet med rader
   * skrevet av en eldre appversjon uten feltet — de behandles som "ukjent
   * eier" og flushes ALDRI automatisk (se `tilhoererBruker` i queue-laget).
   */
  userId?: string;
};

const MAKS_STILLE_FORSOK = 5;

export function byggKoRad(
  sessionId: string,
  counts: Array<{ club: string; count: number }>,
  naa: Date,
  userId: string,
): TapperKoRad {
  return { sessionId, counts, sistOppdatert: naa.toISOString(), forsokAntall: 0, userId };
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

/**
 * R-C (2026-09-11): skal denne raden flushes automatisk for DENNE brukeren?
 * Ren regel, testbar uten IndexedDB — selve I/O-filtreringen (tapper-queue.ts
 * sin `listTapperKo`) delegerer hit i stedet for å inline `r.userId === userId`,
 * slik at mutasjonstesten kan bevise at regelen faktisk håndheves. En rad uten
 * `userId` (eldre appversjon) hører ALDRI til noen — den flushes aldri
 * automatisk, uansett hvem som spør.
 */
export function tilhoererBruker(rad: TapperKoRad, userId: string): boolean {
  return rad.userId != null && rad.userId === userId;
}
