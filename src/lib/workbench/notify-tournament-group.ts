"use server";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

/**
 * Varsle alle spillere i coachens grupper om turnering (GroupMember-fan-out).
 * Brukes fra AgencyOS turnerings-fellesmelding.
 */
export async function notifyTournamentToCoachGroups(input: {
  subject: string;
  body: string;
  link?: string;
}): Promise<{ ok: boolean; count: number; error?: string }> {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const subject = input.subject.trim().slice(0, 200);
  const body = input.body.trim().slice(0, 4000);
  if (!subject || !body) {
    return { ok: false, count: 0, error: "Emne og melding er påkrevd" };
  }

  const grupper = await prisma.group.findMany({
    where: { coachId: coach.id },
    select: { id: true },
  });

  if (grupper.length === 0) {
    return { ok: false, count: 0, error: "Ingen grupper koblet til coach" };
  }

  const medlemmer = await prisma.groupMember.findMany({
    where: { groupId: { in: grupper.map((g) => g.id) }, role: "PLAYER" },
    select: { userId: true },
    distinct: ["userId"],
  });

  if (medlemmer.length === 0) {
    return { ok: false, count: 0, error: "Ingen spillere i gruppene" };
  }

  const link = input.link?.trim() || "/portal/tren/turneringer";

  await prisma.notification.createMany({
    data: medlemmer.map((m) => ({
      userId: m.userId,
      type: "tournament",
      title: subject,
      body,
      link,
    })),
  });

  return { ok: true, count: medlemmer.length };
}