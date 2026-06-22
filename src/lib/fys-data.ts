/**
 * FYS-datalag — henter rå FYS-testverdier fra DB og regner stall-relativ FYS-score.
 *
 * Skiller datatilgang (prisma) fra ren formel (src/lib/domain/fys-score.ts). Mønster som
 * src/lib/forelder.ts. RÅverdiene ligger i TestResult.score (kg/cm/mph) per testens scoringRule,
 * kroppsvekt i siste HealthEntry.weightKg.
 *
 * v1: «stallen» = alle spillere som HAR FYS-resultater (de definerer spennet beste=100).
 */

import { prisma } from "@/lib/prisma";
import {
  byggStallSpenn,
  fysScore,
  type FysRaw,
  type FysResultat,
  type FysTestKey,
} from "@/lib/domain/fys-score";

/** Testnavn (TestDefinition.name) → intern FYS-nøkkel. */
const NAVN_TIL_KEY: Record<string, FysTestKey> = {
  "Trapbar Deadlift": "markloft",
  Benkpress: "benkpress",
  "Standing Long Jump": "lengde",
  "Ball Throw": "ballkast",
  "Clubhead Speed (CHS)": "chs",
};

const tomRaw = (): FysRaw => ({
  markloft: null,
  benkpress: null,
  lengde: null,
  ballkast: null,
  chs: null,
  kroppsvektKg: null,
});

/** FYS-score for én spiller, beregnet relativt til hele stallens FYS-spenn. */
export async function hentFysScore(userId: string): Promise<FysResultat & { harTester: boolean }> {
  const defs = await prisma.testDefinition.findMany({
    where: { name: { in: Object.keys(NAVN_TIL_KEY) } },
    select: { id: true, name: true },
  });
  const idTilKey = new Map<string, FysTestKey>();
  for (const d of defs) {
    const key = NAVN_TIL_KEY[d.name];
    if (key) idTilKey.set(d.id, key);
  }
  const fysIds = [...idTilKey.keys()];
  if (fysIds.length === 0) {
    const tom = fysScore(tomRaw(), byggStallSpenn([tomRaw()]));
    return { ...tom, harTester: false };
  }

  // Alle FYS-resultater (hele stallen), nyest først → behold siste per (spiller, test).
  const [resultater, vekter] = await Promise.all([
    prisma.testResult.findMany({
      where: { testId: { in: fysIds } },
      orderBy: { takenAt: "desc" },
      select: { userId: true, testId: true, score: true },
    }),
    prisma.healthEntry.findMany({
      where: { weightKg: { not: null } },
      orderBy: { date: "desc" },
      select: { userId: true, weightKg: true },
    }),
  ]);

  const sisteVekt = new Map<string, number>();
  for (const v of vekter) {
    if (v.weightKg != null && !sisteVekt.has(v.userId)) sisteVekt.set(v.userId, v.weightKg);
  }

  // Bygg FysRaw per spiller (siste verdi per test).
  const perSpiller = new Map<string, FysRaw>();
  const settTest = new Map<string, Set<FysTestKey>>();
  for (const r of resultater) {
    const key = idTilKey.get(r.testId);
    if (!key) continue;
    let raw = perSpiller.get(r.userId);
    if (!raw) {
      raw = tomRaw();
      raw.kroppsvektKg = sisteVekt.get(r.userId) ?? null;
      perSpiller.set(r.userId, raw);
      settTest.set(r.userId, new Set());
    }
    const sett = settTest.get(r.userId)!;
    if (!sett.has(key)) {
      raw[key] = r.score;
      sett.add(key);
    }
  }

  const alle = [...perSpiller.values()];
  const spenn = byggStallSpenn(alle.length > 0 ? alle : [tomRaw()]);
  const minRaw = perSpiller.get(userId) ?? tomRaw();
  const resultat = fysScore(minRaw, spenn);
  return { ...resultat, harTester: resultat.antallTester > 0 };
}
