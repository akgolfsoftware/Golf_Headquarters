/**
 * Deling av ukesdigest (D3) — coachens manuelle handling.
 *
 * Fasitens regel: «delt av coachen, aldri automatisk». Ingen agent, ingen cron
 * og ingen webhook kaller dette; det skjer bare når et menneske trykker.
 *
 * Én rad per spiller per uke. Fravær av rad betyr «ikke delt», og spillerens
 * digest viser da tom tilstand.
 */

import { prisma } from "@/lib/prisma";
import { startOfWeek } from "@/lib/uke-helpers";

/** ISO-år og ISO-uke for en dato — nøkkelen delingen lagres på. */
export function isoUke(d: Date): { ar: number; uke: number } {
  const dato = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dag = dato.getUTCDay() || 7;
  dato.setUTCDate(dato.getUTCDate() + 4 - dag);
  const arsstart = new Date(Date.UTC(dato.getUTCFullYear(), 0, 1));
  const uke = Math.ceil(((dato.getTime() - arsstart.getTime()) / 86_400_000 + 1) / 7);
  // Året følger torsdagen i uka (ISO), ikke kalenderdatoen — ellers havner
  // nyttårsuka i feil år og digesten blir usynlig i årsskiftet.
  return { ar: dato.getUTCFullYear(), uke };
}

/**
 * Deler inneværende ukes digest med spillerne. Idempotent: å dele to ganger
 * gir samme resultat, og det opprinnelige delingstidspunktet står.
 *
 * Returnerer antall spillere som fikk digesten delt for første gang.
 */
export async function delUkesdigest(
  coachId: string,
  spillerIder: string[],
  now = new Date(),
): Promise<number> {
  if (spillerIder.length === 0) return 0;

  const { ar, uke } = isoUke(startOfWeek(now));

  const res = await prisma.ukesrapportDeling.createMany({
    data: spillerIder.map((playerId) => ({ coachId, playerId, ar, uke })),
    skipDuplicates: true,
  });

  return res.count;
}

/** Når uka ble delt med denne spilleren — null når den ikke er delt. */
export async function hentDeling(
  playerId: string,
  now = new Date(),
): Promise<{ deltAt: Date; coachId: string } | null> {
  const { ar, uke } = isoUke(startOfWeek(now));

  const rad = await prisma.ukesrapportDeling.findUnique({
    where: { playerId_ar_uke: { playerId, ar, uke } },
    select: { deltAt: true, coachId: true },
  });

  return rad ?? null;
}
