/**
 * PlayerHQ · Runder — data-loader for liste-siden (/portal/mal/runder).
 *
 * Henter spillerens 50 siste runder via Prisma og utleder visnings-modell:
 *   - rader til queue-mønsteret (dato, bane, hull, brutto, mot par, SG, ★beste)
 *   - KPI-aggregat, skilt per rundelengde
 *
 * Par og mot par kommer fra scorekortet, ikke fra banens totalpar — se
 * `runde-omfang.ts` for hvorfor. Mangler data → null, aldri oppdiktede tall.
 */
import { prisma } from "@/lib/prisma";
import {
  utledRundeOmfang,
  sgVisning,
  snittForHullantall,
  type SgVisning,
} from "./runde-omfang";

/** Utvalget spilleren ser og alle snitt regnes over. */
export const RUNDER_UTVALG = 50;

export type RundeRow = {
  id: string;
  /** ISO-streng — formateres i komponenten (server↔klient-trygt). */
  playedAt: Date;
  courseName: string;
  /** Sum av par for spilte hull. null = ukjent (ingen scorekort) → vis «—». */
  par: number | null;
  /** Brutto: summen av spilte hull når scorekortet finnes. */
  score: number;
  /** score − par. null = ukjent → vis «—». Aldri målt mot banens par 72. */
  vsPar: number | null;
  /** null = ukjent rundelengde. */
  antallSpilteHull: number | null;
  /** SG med metode, eller skjult når metoden mangler. */
  sg: SgVisning;
  /** Markerer beste mot par blant runder med kjent par. */
  isBest: boolean;
};

export type RunderKpis = {
  total: number;
  /** Snitt brutto over 18-hullsrunder. null = ingen slike i utvalget. */
  snitt18: { snitt: number; antall: number } | null;
  /** Snitt brutto over nihullsrunder. */
  snitt9: { snitt: number; antall: number } | null;
  /** Snitt mot par over runder med kjent par (begge lengder). */
  snittVsPar: number | null;
  beste: {
    score: number;
    vsPar: number;
    antallSpilteHull: number;
    courseName: string;
    playedAt: Date;
  } | null;
  /** Snitt SG-total over runder som faktisk har en kjent metode. */
  sgTotalSnitt: number | null;
  /** Antall runder i utvalget uten scorekort — der mot par er ukjent. */
  utenScorekort: number;
};

export type RunderListModel = {
  rows: RundeRow[];
  kpis: RunderKpis;
  courses: { id: string; name: string; par: number }[];
};

/**
 * Bygger hele visnings-modellen for liste-siden.
 * `userId` kommer fra auth-guard i page.tsx.
 */
export async function getRunderListModel(userId: string): Promise<RunderListModel> {
  const [rounds, courseDefs] = await Promise.all([
    prisma.round.findMany({
      where: { userId },
      orderBy: { playedAt: "desc" },
      include: {
        course: true,
        holeScores: { select: { par: true, strokes: true }, orderBy: { holeNumber: "asc" } },
      },
      take: RUNDER_UTVALG,
    }),
    prisma.courseDefinition.findMany({ orderBy: { name: "asc" } }),
  ]);

  const beregnet = rounds.map((r) => ({
    runde: r,
    omfang: utledRundeOmfang(r.holeScores, r.score),
    sg: sgVisning(r.sgTotal, r.sgSource),
  }));

  // Beste runde: bare runder med kjent par kan rangeres mot par. Listen er
  // sortert synkende på dato, så uavgjort vinnes av den nyeste.
  let bestId: string | null = null;
  let bestVsPar = Number.POSITIVE_INFINITY;
  for (const b of beregnet) {
    if (b.omfang.motPar == null) continue;
    if (b.omfang.motPar < bestVsPar) {
      bestVsPar = b.omfang.motPar;
      bestId = b.runde.id;
    }
  }

  const rows: RundeRow[] = beregnet.map(({ runde, omfang, sg }) => ({
    id: runde.id,
    playedAt: runde.playedAt,
    courseName: runde.course.name,
    par: omfang.par,
    score: omfang.brutto,
    vsPar: omfang.motPar,
    antallSpilteHull: omfang.antallSpilteHull,
    sg,
    isBest: runde.id === bestId,
  }));

  const medPar = beregnet.filter((b) => b.omfang.motPar != null);
  const medSg = beregnet.filter((b) => b.sg.vis);

  const beste = (() => {
    const b = beregnet.find((x) => x.runde.id === bestId);
    if (!b || b.omfang.motPar == null || b.omfang.antallSpilteHull == null) return null;
    return {
      score: b.omfang.brutto,
      vsPar: b.omfang.motPar,
      antallSpilteHull: b.omfang.antallSpilteHull,
      courseName: b.runde.course.name,
      playedAt: b.runde.playedAt,
    };
  })();

  return {
    rows,
    kpis: {
      total: rounds.length,
      snitt18: snittForHullantall(
        beregnet.map((b) => ({ antallSpilteHull: b.omfang.antallSpilteHull, brutto: b.omfang.brutto })),
        18,
      ),
      snitt9: snittForHullantall(
        beregnet.map((b) => ({ antallSpilteHull: b.omfang.antallSpilteHull, brutto: b.omfang.brutto })),
        9,
      ),
      snittVsPar:
        medPar.length === 0
          ? null
          : medPar.reduce((s, b) => s + (b.omfang.motPar ?? 0), 0) / medPar.length,
      beste,
      sgTotalSnitt:
        medSg.length === 0
          ? null
          : medSg.reduce((s, b) => s + (b.sg.vis ? b.sg.verdi : 0), 0) / medSg.length,
      utenScorekort: beregnet.filter((b) => !b.omfang.harScorekort).length,
    },
    courses: courseDefs.map((c) => ({ id: c.id, name: c.name, par: c.par })),
  };
}
