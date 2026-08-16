/**
 * Ekstern-leser-scope (plan T8) — ENESTE lovlige spørringsinngang for
 * eksterne lesere (Team Norway-/WANG-ansvarlige med GUEST-innlogging).
 * Mønster: coachScopedPlayerWhere i src/lib/auth/coached.ts.
 *
 * En spiller er i scopet for en leser + et scope når ALLE tre holder:
 *   1. Leseren har aktiv EksternLeserGruppe (revokedAt null) mot gruppen.
 *   2. Spilleren har aktivt PLAYER-medlemskap (endedAt null) i SAMME gruppe.
 *   3. Spilleren har gyldig DelingsSamtykke for scopet mot SAMME gruppe
 *      (nyeste rad vinner; mindreårige krever FORESATT-rad).
 *
 * Punkt 3 (nyeste-rad-vinner + FORESATT-krav) kan ikke uttrykkes rent i én
 * Prisma-where, så filtreringen skjer i to steg: DB henter kandidater,
 * `harGyldigSamtykke` (ren, enhetstestet) avgjør per (spiller, gruppe).
 *
 * IDOR-sikkerhet: helperne returnerer KUN spiller-id-er — all datalasting i
 * /innsyn skal gå gjennom `harEksternLeserTilgang`/`eksternLeserSpillerIder`
 * og deretter hente utelukkende testresultater/stats. Ingenting annet
 * (planer, notater, helse) skal noensinne kunne leses via denne stien.
 */

import "server-only";

import { prisma } from "@/lib/prisma";
import { aktivtSpillerMedlemskapWhere } from "@/lib/domain/grupper";
import {
  velgSamtykkedeSpillerePerGruppe,
  type DelingSamtykkeRad,
  type DelingScope,
} from "@/lib/deling/samtykke-regler";

/** Gruppene leseren har aktiv (ikke-trukket) lesetilgang til. */
export async function eksternLeserGrupper(
  leserId: string,
): Promise<{ id: string; name: string }[]> {
  const rader = await prisma.eksternLeserGruppe.findMany({
    where: { userId: leserId, revokedAt: null },
    select: { groupId: true },
  });
  if (rader.length === 0) return [];

  return prisma.group.findMany({
    where: { id: { in: rader.map((r) => r.groupId) } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

/**
 * Kjernen: per gruppe leseren har tilgang til, hvilke spillere har gyldig
 * samtykke for scopet mot AKKURAT den gruppen? Et samtykke mot gruppe A
 * åpner aldri innsyn via gruppe B — selv om spilleren er medlem i begge.
 */
export async function eksternLeserSpillerIderPerGruppe(
  leserId: string,
  scope: DelingScope,
): Promise<Map<string, string[]>> {
  const grupper = await prisma.eksternLeserGruppe.findMany({
    where: { userId: leserId, revokedAt: null },
    select: { groupId: true },
  });
  const gruppeIder = grupper.map((g) => g.groupId);
  const resultat = new Map<string, string[]>(gruppeIder.map((id) => [id, []]));
  if (gruppeIder.length === 0) return resultat;

  // Kandidater: aktive PLAYER-medlemmer i leserens grupper. Soft-slettede
  // spillere er ute (samme port som coached.ts).
  const kandidater = await prisma.user.findMany({
    where: {
      role: "PLAYER",
      deletedAt: null,
      groupMemberships: {
        some: { ...aktivtSpillerMedlemskapWhere(), groupId: { in: gruppeIder } },
      },
    },
    select: {
      id: true,
      requiresGuardianConsent: true,
      groupMemberships: {
        where: { ...aktivtSpillerMedlemskapWhere(), groupId: { in: gruppeIder } },
        select: { groupId: true },
      },
    },
  });
  if (kandidater.length === 0) return resultat;

  const samtykkeRader = await prisma.delingsSamtykke.findMany({
    where: {
      userId: { in: kandidater.map((k) => k.id) },
      scope,
      mottakerGruppeId: { in: gruppeIder },
    },
    select: {
      userId: true,
      scope: true,
      mottakerGruppeId: true,
      gitt: true,
      gittAvRolle: true,
      createdAt: true,
    },
  });

  const raderPerSpiller = new Map<string, DelingSamtykkeRad[]>();
  for (const rad of samtykkeRader) {
    const liste = raderPerSpiller.get(rad.userId);
    if (liste) liste.push(rad);
    else raderPerSpiller.set(rad.userId, [rad]);
  }

  const samtykket = velgSamtykkedeSpillerePerGruppe(
    kandidater.map((k) => ({
      userId: k.id,
      kreverForesatt: k.requiresGuardianConsent,
      gruppeIder: k.groupMemberships.map((m) => m.groupId),
      samtykkeRader: raderPerSpiller.get(k.id) ?? [],
    })),
    scope,
  );
  for (const [gruppeId, ider] of samtykket) {
    resultat.set(gruppeId, ider);
  }
  return resultat;
}

/** Flat liste: spiller-id-ene leseren har lov til å se for et gitt scope. */
export async function eksternLeserSpillerIder(
  leserId: string,
  scope: DelingScope,
): Promise<string[]> {
  const perGruppe = await eksternLeserSpillerIderPerGruppe(leserId, scope);
  const alle = new Set<string>();
  for (const ider of perGruppe.values()) {
    for (const id of ider) alle.add(id);
  }
  return [...alle];
}

/**
 * Har leseren tilgang til akkurat denne spilleren for scopet? /innsyn-sider
 * som tar en spiller-id MÅ spørre her før datalasting — id utenfor scopet
 * skal gi notFound(), aldri data.
 */
export async function harEksternLeserTilgang(
  leserId: string,
  spillerId: string,
  scope: DelingScope,
): Promise<boolean> {
  const ider = await eksternLeserSpillerIder(leserId, scope);
  return ider.includes(spillerId);
}
