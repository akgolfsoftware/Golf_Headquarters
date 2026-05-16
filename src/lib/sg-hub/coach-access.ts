// Coach-proxy access control for SG Coaching Hub.
//
// Hvilke spillere har en coach lov til å se?
// V1-policy: En coach kan se en spiller hvis ett av følgende er sant:
//   1. Det finnes en `CoachingSession` der coachId = coach.id og userId = spillerId.
//   2. Brukeren har rolle ADMIN — full tilgang.
//
// Senere kan vi utvide med eksplisitt `CoachPlayer`-modell, men `CoachingSession`
// fanger eksisterende coach-spiller-relasjoner uten ny migrasjon. Modellen er
// definert i prisma/schema.prisma rundt linje 936.

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { User, UserRole } from "@/generated/prisma/client";

export type CoachAccessResult = {
  coach: User;
  player: User;
};

/**
 * Verifiser at innlogget bruker er coach med tilgang til spilleren.
 * Redirector ved manglende tilgang.
 */
export async function requireCoachForPlayer(
  user: User,
  spillerId: string,
): Promise<CoachAccessResult> {
  if (user.role !== "COACH" && user.role !== "ADMIN") {
    redirect("/portal");
  }

  const player = await prisma.user.findUnique({
    where: { id: spillerId },
  });
  if (!player) redirect("/portal/mal/sg-hub");

  // ADMIN har full tilgang
  if (user.role === "ADMIN") {
    return { coach: user, player };
  }

  // COACH må ha aktiv relasjon via CoachingSession
  const hasRelation = await prisma.coachingSession.findFirst({
    where: {
      coachId: user.id,
      userId: spillerId,
    },
    select: { id: true },
  });

  if (!hasRelation) {
    redirect("/portal/mal/sg-hub");
  }

  return { coach: user, player };
}

/**
 * Boolean-versjon for visning/UI-logikk uten redirect.
 */
export async function canCoachAccessPlayer(
  coachId: string,
  spillerId: string,
  role: UserRole,
): Promise<boolean> {
  if (role === "ADMIN") return true;
  if (role !== "COACH") return false;
  const rel = await prisma.coachingSession.findFirst({
    where: { coachId, userId: spillerId },
    select: { id: true },
  });
  return rel !== null;
}
