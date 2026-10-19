import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { lesTurneringsresultat } from "@/lib/domain/turneringsresultat";
import { hentSpillerprofil } from "@/lib/profil-kobling/data";
import { tilTurneringer } from "@/lib/profil-kobling/til-turneringer";
import {
  byggTurneringshistorikk,
  type Turneringshistorikk,
  type TurneringsRad,
} from "@/lib/domain/turneringshistorikk";

/**
 * Henter spillerens turneringshistorikk fra den felles spillerprofilen (dashboard.profile_links,
 * migrasjon 0023). Det er ÉN kilde for PlayerHQ, AgencyOS, WANG og Team Norway: ingen kopi
 * per miljø, så ingen dobbeltrader. Uten bekreftet kobling vises ingenting fra offisielle kilder.
 *
 * KALLEREN må ha kontrollert at betrakteren har lov til å se spilleren (se
 * profil-kobling/tilgang.ts). Ligger kalleren i en delingslås (WANG/TN), send transaksjonen
 * som `db` så lesingen skjer under låsen.
 *
 * Spillerens egne planlagte og manuelle turneringer (TournamentEntry) tas fortsatt med. De
 * automatiske speilradene ("Automatisk fra turneringsresultat") hoppes over: de er kopier av
 * resultatene som nå kommer fra profilen.
 *
 * Data Golf-turneringer (public.*) tas bare med når kalleren har sjekket kanSeDataGolf (ADMIN).
 * De er disjunkte fra profilens turneringer, som aldri inneholder Data Golf.
 *
 * Formingen ligger i `byggTurneringshistorikk` (ren, testet).
 */
export async function hentTurneringshistorikk(
  userId: string,
  db: Pick<Prisma.TransactionClient, "user" | "publicPlayerEntry" | "tournamentEntry" | "$queryRaw"> = prisma,
  { medDataGolf = false }: { medDataGolf?: boolean } = {},
): Promise<Turneringshistorikk> {
  const [profil, dataGolfEntries, manuelle] = await Promise.all([
    hentSpillerprofil(userId, {}, db),
    medDataGolf ? hentDataGolfEntries(userId, db) : Promise.resolve([]),
    db.tournamentEntry.findMany({
      where: {
        userId,
        withdrawnAt: null,
        OR: [{ tournamentId: null }, { tournament: { mergedIntoId: null } }],
        AND: [{ OR: [{ notes: null }, { notes: { not: AUTOMATISK_NOTAT } }] }],
      },
      select: { id: true, manualName: true, manualDate: true, entryStatus: true, category: true,
        tournament: { select: { id: true, name: true, sourceOrigin: true, tour: true, startDate: true, officialUrl: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const rader: TurneringsRad[] = [
    ...tilTurneringer(profil?.turneringer ?? []).map((t) => ({
      turneringId: t.id,
      navn: t.navn,
      kilde: t.kilde,
      tour: null,
      startDato: t.start,
      ...lesTurneringsresultat(t.resultat),
      klasse: t.klasse,
      kildeUrl: null,
      status: t.resultat.status,
    })),
    ...dataGolfEntries.map((e) => ({
      turneringId: e.tournament.id,
      navn: e.tournament.name,
      kilde: e.tournament.sourceOrigin,
      tour: e.tournament.tour,
      startDato: e.tournament.startDate,
      ...lesTurneringsresultat(e),
      klasse: e.klasseNavn,
      kildeUrl: e.tournament.officialUrl,
      status: e.status,
    })),
  ];
  const seen = new Set(rader.map(r => r.turneringId));
  for (const e of manuelle) {
    const t = e.tournament;
    const id = t?.id ?? e.id;
    const dato = t?.startDate ?? e.manualDate;
    if (seen.has(id) || !dato) continue;
    rader.push({ turneringId: id, navn: t?.name ?? e.manualName ?? "Egen turnering", startDato: dato,
      kilde: t?.sourceOrigin ?? "MANUAL", tour: t?.tour ?? null, status: e.entryStatus,
      plassering: null, motPar: null, brutto: null, runder: [], klasse: e.category, kildeUrl: t?.officialUrl ?? null });
    seen.add(id);
  }
  return byggTurneringshistorikk(rader, profil != null || rader.length > 0);
}

/** Notatet speilingen skrev på TournamentEntry (materialize-entry.ts). Disse radene er kopier. */
const AUTOMATISK_NOTAT = "Automatisk fra turneringsresultat";

/** Bare Data Golf-turneringer fra public.* (gamle koblingen). Brukes aldri uten kanSeDataGolf. */
async function hentDataGolfEntries(userId: string, db: Pick<Prisma.TransactionClient, "user" | "publicPlayerEntry">) {
  const bruker = await db.user.findUnique({ where: { id: userId }, select: { publicPlayerId: true } });
  if (!bruker?.publicPlayerId) return [];
  return db.publicPlayerEntry.findMany({
    where: { playerId: bruker.publicPlayerId, tournament: { mergedIntoId: null, sourceOrigin: "DATAGOLF" } },
    orderBy: { tournament: { startDate: "desc" } },
    select: {
      status: true, position: true, scoreToPar: true, totalScore: true, rounds: true, klasseNavn: true, updatedAt: true,
      roundDetails: { select: { roundNumber: true, score: true, toPar: true, source: true }, orderBy: { roundNumber: "asc" } },
      tournament: { select: { id: true, name: true, sourceOrigin: true, tour: true, startDate: true, officialUrl: true } },
    },
  });
}
