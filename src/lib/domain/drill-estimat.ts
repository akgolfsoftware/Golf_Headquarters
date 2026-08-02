/**
 * Varighetsestimat per drill (2026-07-27).
 *
 * Når en drill har vært kjørt før, viser Workbench «Sist: ~12 min» ved
 * minutt-feltet så spilleren slipper å gjette hvor lang tid den tar.
 *
 * MEDIAN, ikke gjennomsnitt: glemmer spilleren å stoppe timeren blir én økt
 * liggende på to timer, og et gjennomsnitt ville dratt estimatet håpløst opp.
 * Medianen ignorerer slike uteliggere så lenge de er i mindretall.
 *
 * Estimatet beregnes ved lesing — det lagres aldri. Da kan det ikke bli
 * foreldet, og ingen backfill trengs når historikken vokser.
 */

/** Hvor mange av de siste gjennomføringene som teller med. */
export const ESTIMAT_VINDU = 5;

/** Under dette regnes en registrering som feilklikk og forkastes. */
const MIN_GYLDIG_SEK = 30;

/** Over dette er timeren nesten sikkert glemt på — forkastes. */
const MAKS_GYLDIG_SEK = 4 * 60 * 60;

/**
 * Median av de siste gjennomføringene, i sekunder. Null når det ikke finnes
 * nok troverdig historikk — da skal ingen estimat-badge vises.
 *
 * @param varigheterSek Faktiske varigheter, NYESTE FØRST.
 */
export function beregnVarighetsEstimat(varigheterSek: number[]): number | null {
  const gyldige = varigheterSek
    .filter((v) => Number.isFinite(v) && v >= MIN_GYLDIG_SEK && v <= MAKS_GYLDIG_SEK)
    .slice(0, ESTIMAT_VINDU);

  if (gyldige.length === 0) return null;

  const sortert = [...gyldige].sort((a, b) => a - b);
  const midt = Math.floor(sortert.length / 2);

  return sortert.length % 2 === 1
    ? sortert[midt]
    : Math.round((sortert[midt - 1] + sortert[midt]) / 2);
}

/**
 * Estimat avrundet til hele minutter for visning. Minst 1 — «~0 min» hjelper ingen.
 * Null inn gir null ut (ingen badge).
 */
export function estimatIMinutter(sekunder: number | null): number | null {
  if (sekunder === null) return null;
  return Math.max(1, Math.round(sekunder / 60));
}

/** Ferdig visningstekst for badgen, eller null når historikk mangler. */
export function estimatTekst(varigheterSek: number[]): string | null {
  const minutter = estimatIMinutter(beregnVarighetsEstimat(varigheterSek));
  return minutter === null ? null : `Sist: ~${minutter} min`;
}
