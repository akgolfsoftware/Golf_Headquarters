import type { SgCategory } from "@/generated/prisma/client";

export interface TrainingLogInput {
  date: Date;
  sgArea: SgCategory;
  minutes: number;
}

export interface UkeVolum {
  uke: string; // ISO-ukenummer: "2026-W20"
  sgArea: SgCategory;
  minutter: number;
}

/** Formater dato til ISO-ukenummer (ISO 8601). */
function isoUkeNummer(dato: Date): string {
  const d = new Date(Date.UTC(dato.getFullYear(), dato.getMonth(), dato.getDate()));
  const dag = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dag);
  const year = d.getUTCFullYear();
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const uke = Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + 1) / 7);
  return `${year}-W${String(uke).padStart(2, "0")}`;
}

/**
 * Aggregerer treningslogger til ukentlig volum per SG-kategori.
 */
export function aggregerVolumPerUke(
  logger: TrainingLogInput[],
  uker: number,
  fraDato: Date = new Date(),
): UkeVolum[] {
  if (logger.length === 0) return [];

  const grense = new Date(fraDato);
  grense.setDate(grense.getDate() - uker * 7);

  const map = new Map<string, Map<SgCategory, number>>();

  for (const log of logger) {
    if (log.date < grense) continue;
    const uke = isoUkeNummer(log.date);
    if (!map.has(uke)) map.set(uke, new Map());
    const ukeMap = map.get(uke)!;
    ukeMap.set(log.sgArea, (ukeMap.get(log.sgArea) ?? 0) + log.minutes);
  }

  const result: UkeVolum[] = [];
  for (const [uke, ukeMap] of map.entries()) {
    for (const [sgArea, minutter] of ukeMap.entries()) {
      result.push({ uke, sgArea, minutter });
    }
  }
  return result.sort((a, b) => a.uke.localeCompare(b.uke));
}

/** Henter treningsvolum for en bruker fra databasen og aggregerer per uke. */
export async function hentTreningsVolum(
  userId: string,
  uker: number = 8,
): Promise<UkeVolum[]> {
  const { prisma } = await import("../prisma");
  const now = new Date();
  const grense = new Date(now);
  grense.setDate(grense.getDate() - uker * 7);

  const logger = await prisma.trainingLog.findMany({
    where: { userId, date: { gte: grense } },
    select: { date: true, sgArea: true, minutes: true },
    orderBy: { date: "asc" },
  });

  return aggregerVolumPerUke(logger, uker, now);
}
