/**
 * S-13 / AU05Venter: venterom når requiresGuardianConsent og samtykke mangler.
 * Server-oppslaget er uendret.
 */

import { getCurrentUserRaw } from "@/lib/auth/getCurrentUser";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAwaitingGuardianConsent } from "@/lib/auth/minor";
import { SamtykkeVenterV2 } from "@/components/portal/v2/SamtykkeVenterV2";

export const dynamic = "force-dynamic";

export default async function SamtykkeVenterPage() {
  const user = await getCurrentUserRaw();

  if (!user) redirect("/auth/login");

  if (!isAwaitingGuardianConsent(user)) {
    if (user.role === "PARENT") redirect("/forelder");
    if (user.role === "ADMIN" || user.role === "COACH") redirect("/admin");
    redirect("/portal");
  }

  const sisteInvitasjon = await prisma.parentInvitation.findFirst({
    where: {
      playerId: user.id,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    select: { email: true },
  });

  return (
    <SamtykkeVenterV2
      spillerNavn={user.name ?? ""}
      invitasjonEmail={sisteInvitasjon?.email ?? null}
    />
  );
}
