import "server-only";

import { prisma } from "@/lib/prisma";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { drillAccessWhere, getMyCoachIds } from "@/lib/portal-drills/drills-data";

type Bruker = { id: string; role: string };

/**
 * Gyldige deltakere for en bruker: medlemmer (endedAt: null) av grupper brukeren selv er aktivt
 * medlem av. En coach (eller ADMIN) velger i tillegg fra stallen sin (coachScopedPlayerWhere).
 * Venner er ikke med før neste versjon, og det finnes ingen delbar lenke
 * (beslutninger.md §VENNER SKJULES TIL NESTE VERSJON, UTFORDRINGER SENDES BARE TIL GRUPPA, 16.10.2026).
 */
export async function hentGyldigeDeltakerIder(user: Bruker): Promise<Set<string>> {
  const egneMedlemskap = await prisma.groupMember.findMany({
    where: { userId: user.id, endedAt: null },
    select: { groupId: true },
  });
  const ider = new Set<string>();
  const gruppeIder = egneMedlemskap.map((m) => m.groupId);
  if (gruppeIder.length > 0) {
    const medlemmer = await prisma.groupMember.findMany({
      where: { groupId: { in: gruppeIder }, endedAt: null, userId: { not: user.id } },
      select: { userId: true },
    });
    for (const m of medlemmer) ider.add(m.userId);
  }
  if (user.role === "COACH" || user.role === "ADMIN") {
    const stall = await prisma.user.findMany({ where: coachScopedPlayerWhere(user), select: { id: true } });
    for (const s of stall) if (s.id !== user.id) ider.add(s.id);
  }
  return ider;
}

/** Øvelser brukeren kan velge: samme tilgang som Øvelsesbanken (drillAccessWhere). */
export async function ovelseTilgangWhere(user: Bruker) {
  const coachIds = user.role === "COACH" || user.role === "ADMIN" ? [user.id] : await getMyCoachIds(user.id);
  return drillAccessWhere(user.id, coachIds);
}

/** Bare eier, valgte deltakere og ADMIN slipper inn i én utfordring. */
export async function harTilgangTilUtfordring(challengeId: string, user: Bruker): Promise<boolean> {
  if (user.role === "ADMIN") return true;
  const treff = await prisma.drillChallenge.findFirst({
    where: { id: challengeId, OR: [{ ownerId: user.id }, { participants: { some: { userId: user.id } } }] },
    select: { id: true },
  });
  return !!treff;
}
