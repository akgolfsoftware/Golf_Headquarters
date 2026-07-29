// Oversetter TrainingPeriod.name (fritekst) til PeriodeType (enum).
//
// `TrainingPeriod` lagrer perioden som fritekst i `name` — verdiene i prod
// 2026-07-29 er: TURN-rest, GRUNN, Testuke, SPES, TURN. Valideringen i
// periode-constraints.ts trenger `PeriodeType`, så noen må eie oversettelsen.
//
// Den er bevisst eksplisitt og ikke «gjett fra prefiks»: en ukjent verdi skal
// gi null og en synlig melding, aldri en tilfeldig periode. Faller en periode
// stille ut, blir økten aldri validert — og alt ser grønt ut fordi ingenting
// ble målt. Det er den verste feilmodusen her.

import type { PeriodeType } from "@/generated/prisma/client";

/**
 * Kjente periodenavn. Nøkler sammenlignes uten hensyn til store/små bokstaver.
 *
 * `TURN-rest` er restsesongen av turneringsperioden når skoleåret starter i
 * august (Anders, 2026-07-29) — samme krav som TURN, ikke oppbygging.
 */
const NAVN_TIL_TYPE: Record<string, PeriodeType> = {
  grunn: "GRUNN",
  spes: "SPESIALISERING",
  spesialisering: "SPESIALISERING",
  turn: "TURNERING",
  "turn-rest": "TURNERING",
  turnering: "TURNERING",
  testuke: "EVALUERING",
  evaluering: "EVALUERING",
  ferie: "FERIE",
};

/** Normalisert nøkkel for et periodenavn — samme normalisering brukes ved lagring i DB. */
export function normaliserNavn(navn: string): string {
  return navn.trim().toLowerCase();
}

/** PeriodeType for et periodenavn, eller null hvis navnet er ukjent. */
export function periodeTypeFraNavn(navn: string): PeriodeType | null {
  return NAVN_TIL_TYPE[normaliserNavn(navn)] ?? null;
}

/**
 * Som periodeTypeFraNavn, men slår i tillegg opp i coach-lagte mappinger
 * (PeriodeNavnMapping, hentet via periode-navn-mapping.ts sin
 * hentEkstraPeriodeNavn()). `ekstra` er nøkkelnormalisert på samme måte.
 */
export function periodeTypeFraNavnMedEkstra(
  navn: string,
  ekstra: Record<string, PeriodeType>,
): PeriodeType | null {
  return periodeTypeFraNavn(navn) ?? ekstra[normaliserNavn(navn)] ?? null;
}

/** Navn som ikke lar seg oversette — for synlig varsling i UI, ikke stille frafall. */
export function ukjenteNavn(navn: string[], ekstra: Record<string, PeriodeType> = {}): string[] {
  return [...new Set(navn.filter((n) => periodeTypeFraNavnMedEkstra(n, ekstra) === null))];
}
