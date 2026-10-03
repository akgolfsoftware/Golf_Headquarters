/**
 * Datahenting for PH-20 Gameplan og banekart.
 * Henter baner, hull og runder fra Prisma, med fallback til referansebaner
 * hvis databasen ikke har baner konfigurert.
 */

import { prisma } from "@/lib/prisma";
import type { GameplanCourseItem } from "./ph20-data";

const DEFAULT_HOLES_FREDRIKSTAD = [
  { par: 4, len: 356, avgScoreDiff: 0.3 },
  { par: 4, len: 372, avgScoreDiff: 0.6 },
  { par: 3, len: 158, avgScoreDiff: 0.1 },
  { par: 5, len: 486, avgScoreDiff: 0.9 },
  { par: 4, len: 341, avgScoreDiff: 0.2 },
  { par: 4, len: 398, avgScoreDiff: 0.7 },
  { par: 3, len: 172, avgScoreDiff: 0.4 },
  { par: 4, len: 362, avgScoreDiff: 0.8 },
  { par: 5, len: 502, avgScoreDiff: 0.2 },
  { par: 4, len: 388, avgScoreDiff: 0.3 },
  { par: 3, len: 149, avgScoreDiff: 0.5 },
  { par: 4, len: 335, avgScoreDiff: 0.2 },
  { par: 5, len: 471, avgScoreDiff: 0.9 },
  { par: 4, len: 402, avgScoreDiff: 1.1 },
  { par: 4, len: 366, avgScoreDiff: 0.4 },
  { par: 3, len: 181, avgScoreDiff: 0.1 },
  { par: 4, len: 378, avgScoreDiff: 0.6 },
  { par: 5, len: 512, avgScoreDiff: 0.5 },
];

const FALLBACK_COURSES: GameplanCourseItem[] = [
  {
    id: "fgk",
    name: "Fredrikstad GK",
    tee: "Gul tee",
    par: 72,
    len: 6226,
    played: 14,
    avg: 76.1,
    plan: "Gameplan klar",
    holes: DEFAULT_HOLES_FREDRIKSTAD,
  },
  {
    id: "bgk",
    name: "Borregaard GK",
    tee: "Gul tee",
    par: 71,
    len: 5980,
    played: 6,
    avg: 74.8,
    plan: "Utkast",
    holes: DEFAULT_HOLES_FREDRIKSTAD.map((h) => ({ ...h, par: h.par === 5 && h.len > 500 ? 4 : h.par })),
  },
  {
    id: "hgk",
    name: "Hvaler GK",
    tee: "Gul tee",
    par: 70,
    len: 5540,
    played: 2,
    avg: null,
    plan: "Ingen gameplan",
    holes: DEFAULT_HOLES_FREDRIKSTAD.slice(0, 9),
  },
  {
    id: "ogk",
    name: "Onsøy GK",
    tee: "Gul tee",
    par: 72,
    len: 6090,
    played: 3,
    avg: 73.0,
    plan: "Ingen gameplan",
    holes: DEFAULT_HOLES_FREDRIKSTAD,
  },
];

export async function getGameplanCourses(userId: string): Promise<GameplanCourseItem[]> {
  try {
    const baner = await prisma.bane.findMany({
      include: {
        holes: { orderBy: { holeNumber: "asc" } },
        courseDefinitions: {
          include: {
            rounds: {
              where: { userId },
              select: { id: true, score: true },
            },
          },
        },
      },
      orderBy: { navn: "asc" },
    });

    if (!baner || baner.length === 0) {
      return FALLBACK_COURSES;
    }

    const items: GameplanCourseItem[] = baner.map((b) => {
      const allRounds = b.courseDefinitions.flatMap((c) => c.rounds);
      const played = allRounds.length;
      const validScores = allRounds
        .map((r) => r.score)
        .filter((s): s is number => typeof s === "number" && s > 0);
      const avg =
        validScores.length > 0
          ? Math.round((validScores.reduce((acc, v) => acc + v, 0) / validScores.length) * 10) / 10
          : null;

      const hasMappedHoles = b.holes.length > 0;
      const holes = hasMappedHoles
        ? b.holes.map((h, i) => ({
            par: h.par || 4,
            len: h.lengthMeter || 350,
            avgScoreDiff: DEFAULT_HOLES_FREDRIKSTAD[i % DEFAULT_HOLES_FREDRIKSTAD.length].avgScoreDiff,
          }))
        : DEFAULT_HOLES_FREDRIKSTAD;

      return {
        id: b.id,
        name: b.navn,
        tee: "Gul tee",
        par: b.par || 72,
        len: b.lengdeMeter || 6000,
        played,
        avg,
        plan: hasMappedHoles ? "Gameplan klar" : "Ingen gameplan",
        holes,
      };
    });

    return items;
  } catch (err) {
    console.error("[getGameplanCourses] Feil ved henting av baner fra database:", err);
    return FALLBACK_COURSES;
  }
}
