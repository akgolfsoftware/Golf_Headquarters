/**
 * Komplett spillerprofil for trenere i AgencyOS, WANG og Team Norway: identitet, offisielle resultater,
 * tester spilleren har registrert og IUP. Samme data og samme tilgangsregler i alle tre miljøer.
 *
 * Alt leses gjennom `medSpillerTilgang`: egen coach/admin, eller organisasjonstrener med gjeldende
 * navngitt deling (da skjer lesingen under delingslåsen). Ingen kopi av noe; resultatene kommer fra
 * den bekreftede profilkoblingen (dashboard.profile_links), testene og IUP fra spillerens egen konto.
 *
 * Personvern:
 *  - Golf-ID (MemberID) kommer bare med for trenere (synlighet() i tilgang-regler.ts).
 *  - Runder merket «Bare deg» (sharedWithCoach = false) teller ikke, heller ikke i IUP-måltallene.
 *  - Bare leverte IUP-svar leses; utkast hentes aldri (lesLeverteIupForProfil).
 *  - Ingen Data Golf: databasefunksjonen leverer ingen.
 */

import "server-only";

import { iupSynligForSpillerWhere } from "@/lib/iup/tilknytning";
import { hentIupMaaltallForSpiller, type IupMaaltallData } from "@/lib/iup/maaltall-data";
import { lesLeverteIupForProfil, type LevertIupProfilrad } from "@/lib/iup/trener-profil-lesing";
import { hentSpillerprofil } from "./data";
import { medSpillerTilgang, type Betrakter, type SpillerDb } from "./tilgang";
import type { Spillerprofil } from "./typer";
import type { Relasjon } from "./tilgang-regler";

export type TestSammendrag = {
  testId: string;
  navn: string;
  omraade: string;
  antall: number;
  sisteDato: Date;
  /** Null for Team Norway-protokollene: enhetene er egne, se Team Norway › Tester. */
  sisteScore: number | null;
  erTeamNorway: boolean;
};

export type RundeSammendrag = {
  antall: number;
  snittScore: number | null;
  sgTotal: number | null;
  sgOtt: number | null;
  sgApp: number | null;
  sgArg: number | null;
  sgPutt: number | null;
};

export type KomplettProfil = {
  relasjon: Exclude<Relasjon, "INGEN">;
  navn: string;
  /** Null = spilleren har ikke koblet resultatprofilen ennå. */
  resultater: Spillerprofil | null;
  tester: TestSammendrag[];
  runder: RundeSammendrag;
  /** Null = spilleren har ikke IUP (bare aktive WANG- og Team Norway-spillere har det). */
  iup: { levert: LevertIupProfilrad[]; maaltall: IupMaaltallData | null } | null;
};

const TN_PREFIKS = "tn-v3-";
const ETT_AAR_MS = 365 * 864e5;

/**
 * Bygger profilen fra en ALLEREDE tilgangskontrollert databaseklient. Hvert miljø bruker sin egen
 * port (AgencyOS: lesKomplettProfil under; Team Norway: medTnSpillerData; WANG: medWangElevData) og
 * sender transaksjonen hit, så lesingen skjer under delingslåsen.
 * `kanSeGolfId`: bare når betrakteren er trener og ikke spilleren selv eller en forelder.
 */
export async function byggKomplettProfil(
  db: SpillerDb,
  spillerId: string,
  { kanSeGolfId }: { kanSeGolfId: boolean },
): Promise<Omit<KomplettProfil, "relasjon">> {
  const [bruker, resultater, testRader, rundeAgg, harIup] = await Promise.all([
    db.user.findFirst({ where: { id: spillerId }, select: { name: true } }),
    hentSpillerprofil(spillerId, { inkluderGolfId: kanSeGolfId }, db),
    db.testResult.findMany({
      where: { userId: spillerId },
      orderBy: { takenAt: "desc" },
      select: { testId: true, takenAt: true, score: true, test: { select: { name: true, pyramidArea: true } } },
    }),
    db.round.aggregate({
      where: { userId: spillerId, sharedWithCoach: true, playStatus: "COMPLETED", playedAt: { gte: new Date(Date.now() - ETT_AAR_MS) } },
      _count: { _all: true },
      _avg: { score: true, sgTotal: true, sgOtt: true, sgApp: true, sgArg: true, sgPutt: true },
    }),
    db.user.findFirst({ where: iupSynligForSpillerWhere(spillerId), select: { id: true } }),
  ]);

  const perTest = new Map<string, TestSammendrag>();
  for (const r of testRader) {
    const funnet = perTest.get(r.testId);
    if (funnet) {
      funnet.antall += 1;
      continue;
    }
    const erTn = r.testId.startsWith(TN_PREFIKS);
    perTest.set(r.testId, {
      testId: r.testId,
      navn: r.test?.name ?? "Test",
      omraade: r.test?.pyramidArea ?? "SPILL",
      antall: 1,
      sisteDato: r.takenAt,
      sisteScore: erTn ? null : r.score,
      erTeamNorway: erTn,
    });
  }

  const iup = harIup
    ? {
        levert: await lesLeverteIupForProfil(db, spillerId),
        maaltall: await hentIupMaaltallForSpiller(spillerId, db, { kunDelteRunder: true }),
      }
    : null;

  return {
    navn: bruker?.name ?? resultater?.person.name ?? "Ukjent",
    resultater,
    tester: [...perTest.values()],
    runder: {
      antall: rundeAgg._count._all,
      snittScore: rundeAgg._avg.score,
      sgTotal: rundeAgg._avg.sgTotal,
      sgOtt: rundeAgg._avg.sgOtt,
      sgApp: rundeAgg._avg.sgApp,
      sgArg: rundeAgg._avg.sgArg,
      sgPutt: rundeAgg._avg.sgPutt,
    },
    iup,
  };
}

/** AgencyOS: egen coach eller admin. null = ingen tilgang. */
export async function lesKomplettProfil(
  betrakter: Betrakter,
  spillerId: string,
  opsjoner: { gruppeId?: string } = {},
): Promise<KomplettProfil | null> {
  const svar = await medSpillerTilgang(betrakter, spillerId, opsjoner, (k) =>
    byggKomplettProfil(k.db, spillerId, { kanSeGolfId: k.kanSeGolfId }),
  );
  return svar ? { relasjon: svar.relasjon, ...svar.data } : null;
}
