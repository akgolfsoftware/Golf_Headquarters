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

/**
 * Sist delte uke for denne spilleren — inneværende uke, ellers forrige.
 * Null når ingen av dem er delt.
 *
 * Hvorfor forrige uke også: coachen deler søndag kveld, for uka som da
 * avsluttes. Åpner spilleren appen mandag morgen står han i NESTE uke, og et
 * oppslag på inneværende uke alene finner ingenting — digesten var usynlig
 * resten av uka selv om den var delt. Vi stopper ved forrige uke med vilje:
 * en digest som er eldre enn det er ikke «uka di» lenger.
 *
 * `ukeStart` forteller kalleren hvilken uke svaret gjelder, slik at resten av
 * digesten regnes for samme uke som ble delt.
 */
export async function hentSisteDeling(
  playerId: string,
  now = new Date(),
): Promise<{ deltAt: Date; coachId: string; ukeStart: Date } | null> {
  const denne = startOfWeek(now);
  // Midt i forrige uke → startOfWeek: trygt over sommertid-skiftet, der et
  // rått «minus sju døgn» ellers kan bomme med en time.
  const forrige = startOfWeek(new Date(denne.getTime() - 3 * 86_400_000));
  const d = isoUke(denne);
  const f = isoUke(forrige);

  const rad = await prisma.ukesrapportDeling.findFirst({
    where: {
      playerId,
      OR: [
        { ar: d.ar, uke: d.uke },
        { ar: f.ar, uke: f.uke },
      ],
    },
    // Nyeste først — er begge uker delt, er inneværende den riktige.
    orderBy: [{ ar: "desc" }, { uke: "desc" }],
    select: { deltAt: true, coachId: true, ar: true, uke: true },
  });

  if (!rad) return null;

  const erDenne = rad.ar === d.ar && rad.uke === d.uke;
  return {
    deltAt: rad.deltAt,
    coachId: rad.coachId,
    ukeStart: erDenne ? denne : forrige,
  };
}
