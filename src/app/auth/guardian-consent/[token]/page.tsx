/**
 * /auth/guardian-consent/[token] — AU05Verge.
 *
 * GDPR art. 8. Token-oppslaget (utløpt, allerede akseptert, gyldig)
 * skjer her. Komponenten viser tilstanden.
 */

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { calculateAge, forelderFrist } from "@/lib/auth/minor";
import { ForelderGodkjenner } from "@/components/auth/precision/ForelderGodkjenner";

type Props = {
  params: Promise<{ token: string }>;
};

export const dynamic = "force-dynamic";

export default async function GuardianConsentPage({ params }: Props) {
  const { token } = await params;

  const invitation = await prisma.parentInvitation.findUnique({
    where: { token },
    include: {
      player: {
        select: {
          id: true,
          name: true,
          email: true,
          dateOfBirth: true,
          requiresGuardianConsent: true,
          guardianConsentGivenAt: true,
          createdAt: true,
        },
      },
    },
  });

  if (!invitation) notFound();

  const expired = invitation.expiresAt < new Date();
  const alreadyAccepted = invitation.acceptedAt !== null;
  const alreadyConsented = invitation.player.guardianConsentGivenAt !== null;
  const playerAge = calculateAge(invitation.player.dateOfBirth);

  if (expired) {
    return (
      <ForelderGodkjenner state="expired" playerName={invitation.player.name} />
    );
  }

  if (alreadyAccepted && alreadyConsented) {
    return (
      <ForelderGodkjenner state="success" playerName={invitation.player.name} />
    );
  }

  return (
    <ForelderGodkjenner
      state="form"
      token={token}
      playerName={invitation.player.name}
      playerAge={playerAge}
      guardianEmail={invitation.email}
      fristTekst={new Intl.DateTimeFormat("nb-NO", { weekday: "short", day: "numeric", month: "long", timeZone: "Europe/Oslo" }).format(forelderFrist(invitation.player.createdAt))}
    />
  );
}
