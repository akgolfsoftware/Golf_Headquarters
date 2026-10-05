/**
 * /auth/guardian-consent/[token] — AU05Verge.
 *
 * GDPR art. 8. Token-oppslaget (utløpt, allerede akseptert, gyldig)
 * skjer her. Komponenten viser tilstanden.
 */

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { calculateAge } from "@/lib/auth/minor";
import { GuardianConsentV2 } from "@/components/portal/v2/GuardianConsentV2";

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
      <GuardianConsentV2
        state="expired"
        playerName={invitation.player.name}
        playerAge={playerAge}
        email={invitation.email}
      />
    );
  }

  if (alreadyAccepted && alreadyConsented) {
    return (
      <GuardianConsentV2
        state="success"
        playerName={invitation.player.name}
        playerAge={playerAge}
      />
    );
  }

  return (
    <GuardianConsentV2
      state="form"
      token={token}
      playerName={invitation.player.name}
      playerAge={playerAge}
      playerEmail={invitation.player.email}
      guardianEmail={invitation.email}
    />
  );
}
