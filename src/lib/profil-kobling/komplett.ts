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
import { hentBruttoSnitt } from "@/lib/domain/brutto-snitt-data";
import { osloAar, type BruttoSnitt } from "@/lib/domain/brutto-snitt";
import { tnValiderRader } from "@/lib/domain/tn-test-validering";
import { tnFromDefinitionId } from "@/lib/portal-tester/tn-integration";
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
  /** Brutto snitt i år (Oslo): turneringsrunder og treningsrunder hver for seg (brutto-snitt.ts). */
  aar: number;
  bruttoSnitt: BruttoSnitt;
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
      select: { id: true, testId: true, takenAt: true, score: true, details: true, test: { select: { name: true, pyramidArea: true } } },
    }),
    db.round.aggregate({
      where: { userId: spillerId, sharedWithCoach: true, playStatus: "COMPLETED", playedAt: { gte: new Date(Date.now() - ETT_AAR_MS) } },
      _count: { _all: true },
      _avg: { sgTotal: true, sgOtt: true, sgApp: true, sgArg: true, sgPutt: true },
    }),
    db.user.findFirst({ where: iupSynligForSpillerWhere(spillerId), select: { id: true } }),
  ]);

  // Antall = gyldige forsøk (A10), som i Tester og Haster. Team Norway-forsøk som ikke lar seg
  // reberegne fra de rå verdiene, telles ikke. Andre tester har ingen validering og telles som de er.
  const perTest = new Map<string, TestSammendrag>();
  const tnPerTest = new Map<string, typeof testRader>();
  for (const r of testRader) {
    if (r.testId.startsWith(TN_PREFIKS)) {
      tnPerTest.set(r.testId, [...(tnPerTest.get(r.testId) ?? []), r]);
      continue;
    }
    const funnet = perTest.get(r.testId);
    if (funnet) {
      funnet.antall += 1;
      continue;
    }
    perTest.set(r.testId, {
      testId: r.testId,
      navn: r.test?.name ?? "Test",
      omraade: r.test?.pyramidArea ?? "SPILL",
      antall: 1,
      sisteDato: r.takenAt,
      sisteScore: r.score,
      erTeamNorway: false,
    });
  }
  for (const [testId, liste] of tnPerTest) {
    const protokoll = tnFromDefinitionId(testId);
    const gyldige = protokoll ? tnValiderRader(liste, protokoll).gyldige : [];
    perTest.set(testId, {
      testId,
      navn: liste[0].test?.name ?? "Test",
      omraade: liste[0].test?.pyramidArea ?? "SPILL",
      antall: gyldige.length,
      sisteDato: liste[0].takenAt,
      sisteScore: null,
      erTeamNorway: true,
    });
  }

  const aar = osloAar(new Date());
  const bruttoSnitt = await hentBruttoSnitt(spillerId, { aar, db, profil: resultater, kunDelteRunder: true });

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
      aar,
      bruttoSnitt,
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
