/**
 * Én SG-sannhet — kanonisk kilde for «spillerens SG nå».
 *
 * Frem til 2026-08-16 fantes to konkurrerende sannheter: sg-gap og
 * hull-analysen prioriterte selvrapporterte BrukerSgInput-rader FORAN
 * beregnede Round.sg*, mens Analysere/Hjem brukte Round-snitt. Denne
 * selectoren lukker spriket (AP0.1 i docs/plan-baneguide-sg-app-2026-08-16.md,
 * NORDSTJERNE-kravet «én SG-beregning — avledet data regenereres fra kilde»).
 *
 * Kilderegel:
 *   1. BEREGNET — snitt per kategori over siste SPILLER_SG_RUNDER runder med
 *      SG-tall (Round.sg*; sgSource "manual" er også fasit — manuelt satte
 *      rundetall overskrives aldri av beregning, jf. recomputeRoundSg).
 *   2. SELVRAPPORTERT — BrukerSgInput brukes KUN når ingen runder med SG
 *      finnes (typisk onboarding/import før første førte runde).
 *   3. null når ingen av delene finnes.
 *
 * Kilden følger alltid med i resultatet slik at UI kan merke tillitsnivået
 * (NORDSTJERNE: TrackMan-verifisert / GPS-beregnet / selvrapportert er ulike
 * tillitsnivåer og skal merkes slik).
 */

import { prisma } from "@/lib/prisma";

/**
 * Vindu: de N nyeste rundene — UANSETT om de har SG-tall. Snittet regnes over
 * de av dem som faktisk har tall. Dette er nøyaktig samme semantikk som
 * getKpiStats (Hjem-heroen), hentSgSnittPerOmrade og loadMinGolf bruker, og
 * det er hele poenget: filtrerte vi bort SG-løse runder i spørringen ville
 * vinduet rekke lenger bakover enn de flatene, og samme spiller ville se to
 * ulike SG-snitt («hurtig score»-runder uten SG er en helt vanlig tilstand).
 */
export const SPILLER_SG_RUNDER = 10;

/** Antall selvrapporterte registreringer i fallback-vinduet. */
export const SPILLER_SG_REGISTRERINGER = 8;

export type SpillerSgKilde = "BEREGNET" | "SELVRAPPORTERT";

export type SgKategoriVerdi = {
  /** Snitt (BEREGNET) eller nyeste registrering (SELVRAPPORTERT). */
  sg: number | null;
  /** Serie eldste → nyeste for sparklines. Tom når felt mangler. */
  trend: number[];
};

export type SpillerSg = {
  kilde: SpillerSgKilde;
  /** Klarspråk for UI: «10 runder» / «3 registreringer». */
  grunnlag: string;
  /** Antall rader tallene bygger på. */
  antall: number;
  total: SgKategoriVerdi;
  ott: SgKategoriVerdi;
  app: SgKategoriVerdi;
  arg: SgKategoriVerdi;
  putt: SgKategoriVerdi;
};

export type SgRad = {
  sgTotal: number | null;
  sgOtt: number | null;
  sgApp: number | null;
  sgArg: number | null;
  sgPutt: number | null;
};

const FELTER = ["sgTotal", "sgOtt", "sgApp", "sgArg", "sgPutt"] as const;

const harSgTall = (rad: SgRad): boolean => FELTER.some((f) => rad[f] != null);

/** Serie eldste → nyeste for ett felt (rader kommer nyeste først). */
const serie = (rader: SgRad[], felt: (typeof FELTER)[number]): number[] =>
  [...rader]
    .reverse()
    .map((r) => r[felt])
    .filter((v): v is number => v != null);

const snitt = (verdier: number[]): number | null =>
  verdier.length === 0
    ? null
    : Math.round((verdier.reduce((s, v) => s + v, 0) / verdier.length) * 100) / 100;

const entallFlertall = (n: number, entall: string, flertall: string): string =>
  `${n} ${n === 1 ? entall : flertall}`;

/**
 * BEREGNET-grenen: snitt + trendserie per felt over runder (nyeste først).
 * null når ingen rad har SG-tall.
 */
export function byggSpillerSgFraRunder(runder: SgRad[]): SpillerSg | null {
  const medTall = runder.filter(harSgTall);
  if (medTall.length === 0) return null;

  const felt = (f: (typeof FELTER)[number]): SgKategoriVerdi => {
    const s = serie(medTall, f);
    return { sg: snitt(s), trend: s };
  };

  return {
    kilde: "BEREGNET",
    grunnlag: entallFlertall(medTall.length, "runde", "runder"),
    antall: medTall.length,
    total: felt("sgTotal"),
    ott: felt("sgOtt"),
    app: felt("sgApp"),
    arg: felt("sgArg"),
    putt: felt("sgPutt"),
  };
}

/**
 * SELVRAPPORTERT-grenen: nyeste registrerte verdi per felt + trendserie over
 * registreringene (nyeste først inn). null når ingen rad har SG-tall.
 */
export function byggSpillerSgFraInput(registreringer: SgRad[]): SpillerSg | null {
  const medTall = registreringer.filter(harSgTall);
  if (medTall.length === 0) return null;

  const felt = (f: (typeof FELTER)[number]): SgKategoriVerdi => {
    const s = serie(medTall, f);
    return { sg: s.length > 0 ? s[s.length - 1] : null, trend: s };
  };

  return {
    kilde: "SELVRAPPORTERT",
    grunnlag: entallFlertall(medTall.length, "registrering", "registreringer"),
    antall: medTall.length,
    total: felt("sgTotal"),
    ott: felt("sgOtt"),
    app: felt("sgApp"),
    arg: felt("sgArg"),
    putt: felt("sgPutt"),
  };
}

/** Kanonisk oppslag — bruk denne, ikke egne prioriteringer per skjerm. */
export async function hentSpillerSg(userId: string): Promise<SpillerSg | null> {
  // Ingen OR-filter på sg-feltene her — se SPILLER_SG_RUNDER: vinduet skal
  // være de N nyeste rundene, samme som Hjem/Analysere. byggSpillerSgFraRunder
  // filtrerer bort de uten tall når snittet regnes.
  const runder = await prisma.round.findMany({
    where: { userId },
    orderBy: { playedAt: "desc" },
    take: SPILLER_SG_RUNDER,
    select: { sgTotal: true, sgOtt: true, sgApp: true, sgArg: true, sgPutt: true },
  });

  const fraRunder = byggSpillerSgFraRunder(runder);
  if (fraRunder) return fraRunder;

  return hentSelvrapportertSg(userId);
}

/**
 * Fallback-grenen alene — for kallere som allerede har rundene sine i minnet
 * (f.eks. load-min-golf.ts, som spør Round i en Promise.all) og derfor kan
 * kjøre `byggSpillerSgFraRunder` selv uten et ekstra prisma-kall. Kalles kun
 * når den grenen ga null, akkurat som i `hentSpillerSg`.
 */
export async function hentSelvrapportertSg(userId: string): Promise<SpillerSg | null> {
  const registreringer = await prisma.brukerSgInput.findMany({
    where: {
      userId,
      OR: FELTER.map((f) => ({ [f]: { not: null } })),
    },
    orderBy: { dato: "desc" },
    take: SPILLER_SG_REGISTRERINGER,
    select: { sgTotal: true, sgOtt: true, sgApp: true, sgArg: true, sgPutt: true },
  });

  return byggSpillerSgFraInput(registreringer);
}
