import "server-only";

import type { UserRole } from "@/generated/prisma/client";
import { aktivtTrenerMedlemskapWhere } from "@/lib/domain/grupper";
import { prisma } from "@/lib/prisma";

const WANG_PROGRAM = ["WANG_UNG", "WANG_TOPPIDRETT"] as const;
const TN_SLUG = "team-norway";

export type WangResultatSkoleScope = {
  groupId: string;
  schoolName: string;
  playerIds: string[];
  players: { id: string; name: string }[];
};

async function hentAktiveWangSkoler(groupIds?: string[]): Promise<WangResultatSkoleScope[]> {
  const grupper = await prisma.group.findMany({
    where: {
      ...(groupIds ? { id: { in: groupIds } } : {}),
      program: { in: [...WANG_PROGRAM] },
      arkivertAt: null,
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      members: {
        where: {
          role: "PLAYER",
          endedAt: null,
          user: { deletedAt: null, anonymisertAt: null, role: "PLAYER" },
        },
        select: { userId: true, user: { select: { name: true } } },
      },
    },
  });
  return grupper.map((gruppe) => {
    const players = [...new Map(gruppe.members.map((medlem) => [medlem.userId, { id: medlem.userId, name: medlem.user.name ?? "Ukjent" }])).values()];
    return { groupId: gruppe.id, schoolName: gruppe.name, playerIds: players.map((player) => player.id), players };
  });
}

/**
 * WANG-trener ser testresultater for aktive spillere i sine egne WANG-skolegrupper.
 * GroupMember er skoleporten; fri tekst på User.school gir aldri tilgang.
 */
export async function hentWangTestresultatSkolerForTrener(
  bruker: { id: string; role: UserRole },
): Promise<WangResultatSkoleScope[]> {
  if (bruker.role === "ADMIN") return hentAktiveWangSkoler();
  if (bruker.role !== "COACH") return [];

  const medlemskap = await prisma.groupMember.findMany({
    where: {
      ...aktivtTrenerMedlemskapWhere(bruker.id),
      group: { program: { in: [...WANG_PROGRAM] }, arkivertAt: null },
    },
    select: { groupId: true },
  });
  const groupIds = [...new Set(medlemskap.map((rad) => rad.groupId))];
  return groupIds.length ? hentAktiveWangSkoler(groupIds) : [];
}

/**
 * Team Norway trener ser testresultater fra alle aktive WANG-skolegrupper.
 * WANG-testresultater deles automatisk etter vedtaket 28.09.2026; dette gir
 * ikke tilgang til andre profiler, planer, meldinger eller helseopplysninger.
 */
export async function hentWangTestresultatSkolerForTeamNorway(
  bruker: { id: string; role: UserRole },
): Promise<WangResultatSkoleScope[]> {
  if (bruker.role === "ADMIN") return hentAktiveWangSkoler();
  if (bruker.role !== "COACH") return [];

  const gruppe = await prisma.group.findUnique({
    where: { slug: TN_SLUG },
    select: { id: true },
  });
  if (!gruppe) return [];
  const medlemskap = await prisma.groupMember.findFirst({
    where: { groupId: gruppe.id, ...aktivtTrenerMedlemskapWhere(bruker.id) },
    select: { id: true },
  });
  return medlemskap ? hentAktiveWangSkoler() : [];
}
