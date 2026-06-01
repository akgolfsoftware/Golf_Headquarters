/**
 * PlayerHQ · Runder — data-loader for liste-siden (/portal/mal/runder).
 *
 * Henter spillerens runder via Prisma og utleder visnings-modell:
 *   - rader til queue-mønsteret (dato, bane, score, vs-par, SG, ★beste)
 *   - KPI-aggregat (snitt-score, vs-par snitt, beste runde, SG-total snitt)
 *
 * Følger samme separasjon-av-ansvar som lib/agencyos/daily-brief-data:
 * sidekomponenten gjør ingen aggregering selv, den får ferdig modell herfra.
 * Mangler data → null/tomt, aldri oppdiktede tall.
 */
import { prisma } from "@/lib/prisma";

export type RundeRow = {
  id: string;
  /** ISO-streng — formateres i komponenten (server↔klient-trygt). */
  playedAt: Date;
  courseName: string;
  par: number;
  score: number;
  /** score − par. Negativ = under par. */
  vsPar: number;
  sgTotal: number | null;
  /** Markerer rundens beste vs-par-resultat (★ i lista). */
  isBest: boolean;
};

export type RunderKpis = {
  total: number;
  snittScore: number | null;
  snittVsPar: number | null;
  beste: { score: number; vsPar: number; courseName: string; playedAt: Date } | null;
  sgTotalSnitt: number | null;
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
      include: { course: true },
      take: 50,
    }),
    prisma.courseDefinition.findMany({ orderBy: { name: "asc" } }),
  ]);

  const total = rounds.length;

  // Finn beste runde (lavest vs-par; uavgjort brytes av nyeste dato siden
  // listen allerede er sortert synkende på playedAt → første treff vinner).
  let bestId: string | null = null;
  let bestVsPar = Number.POSITIVE_INFINITY;
  for (const r of rounds) {
    const vsPar = r.score - r.course.par;
    if (vsPar < bestVsPar) {
      bestVsPar = vsPar;
      bestId = r.id;
    }
  }

  const rows: RundeRow[] = rounds.map((r) => ({
    id: r.id,
    playedAt: r.playedAt,
    courseName: r.course.name,
    par: r.course.par,
    score: r.score,
    vsPar: r.score - r.course.par,
    sgTotal: r.sgTotal,
    isBest: r.id === bestId,
  }));

  const snittScore =
    total === 0 ? null : rounds.reduce((s, r) => s + r.score, 0) / total;
  const snittVsPar =
    total === 0
      ? null
      : rounds.reduce((s, r) => s + (r.score - r.course.par), 0) / total;

  const beste =
    bestId == null
      ? null
      : (() => {
          const r = rounds.find((x) => x.id === bestId)!;
          return {
            score: r.score,
            vsPar: r.score - r.course.par,
            courseName: r.course.name,
            playedAt: r.playedAt,
          };
        })();

  const sgTotalSnitt = (() => {
    const med = rounds.filter((r) => r.sgTotal != null);
    if (med.length === 0) return null;
    return med.reduce((s, r) => s + (r.sgTotal ?? 0), 0) / med.length;
  })();

  return {
    rows,
    kpis: { total, snittScore, snittVsPar, beste, sgTotalSnitt },
    courses: courseDefs.map((c) => ({ id: c.id, name: c.name, par: c.par })),
  };
}
