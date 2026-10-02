/**
 * Ren logikk for tapper-offline-køen (flytpakke 2, punkt 2.9 — avgrenset til
 * tapper; slag-plotting er gameplan-avhengig og parkert). saveTapperCounts
 * er idempotent (absolutt telling, UNIQUE på planSessionId+kølle), så køen
 * trenger bare siste kjente snapshot per økt — ikke en voksende hendelseslogg.
 * IndexedDB-I/O ligger i tapper-queue.ts (browser-only); denne fila er
 * enhetstestbar uten IndexedDB.
 */

export type TapperCount = { club: string; count: number; area?: string | null; category?: string | null; repetitionType?: string | null };

export type TapperKoRad = {
  /** Sammensatt lokal nøkkel: eier + økt. */
  key: string;
  /** Innlogget aktør som opprettet kladden på denne enheten. */
  eierId: string;
  sessionId: string;
  counts: TapperCount[];
  /** ISO-tidspunkt for siste lokale oppdatering — kun til feilsøk/visning. */
  sistOppdatert: string;
  /** Antall mislykkede synk-forsøk siden raden ble lagt i køen. */
  forsokAntall: number;
  revision?: number;
  synketRevision?: number;
  serverUpdatedAt?: string;
};

const MAKS_STILLE_FORSOK = 5;

export function byggKoRad(
  eierId: string,
  sessionId: string,
  counts: TapperCount[],
  naa: Date,
): TapperKoRad {
  return {
    key: `${encodeURIComponent(eierId)}:${sessionId}`,
    eierId,
    sessionId,
    counts,
    sistOppdatert: naa.toISOString(),
    forsokAntall: 0,
  };
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

/** Ventende lokal telling vinner. Kvittert telling brukes bare når serverbildet
 * ikke er nyere; sammenligningen bruker serverens egne tidsstempler. */
export function gjenopptaTapper(rad: TapperKoRad | null, serverUpdatedAt?: string): TapperCount[] | null {
  if (!rad) return null;
  if (rad.synketRevision == null || rad.synketRevision !== rad.revision) return rad.counts;
  if (rad.serverUpdatedAt && (!serverUpdatedAt || rad.serverUpdatedAt >= serverUpdatedAt)) return rad.counts;
  return null;
}
