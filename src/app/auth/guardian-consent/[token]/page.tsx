/**
 * /auth/guardian-consent/[token]
 *
 * GDPR art. 8 (P17) — foreldresamtykke for mindreårig spiller.
 * Forelder mottar e-post med signing-link, klikker → kommer hit.
 * Bekrefter samtykke → spiller-konto aktiveres + ParentRelation opprettes.
 *
 * Rendrer <GuardianConsentPrecision> (Precision Athletics, AU-05). Token-oppslaget
 * (utløpt/allerede-akseptert/gyldig) skjer fortsatt her på serversiden og styrer `state`.
 * Gamle GuardianConsentV2 står urørt.
 */

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { calculateAge } from "@/lib/auth/minor";
import { GuardianConsentPrecision } from "@/components/auth/precision/AuSamtykke";

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

  // Sjekk om utløpt
  const expired = invitation.expiresAt < new Date();
  // Sjekk om allerede akseptert
  const alreadyAccepted = invitation.acceptedAt !== null;
  const alreadyConsented = invitation.player.guardianConsentGivenAt !== null;

  const playerAge = calculateAge(invitation.player.dateOfBirth);

  if (expired) {
    return (
      <GuardianConsentPrecision
        state="expired"
        playerName={invitation.player.name}
        playerAge={playerAge}
        email={invitation.email}
      />
    );
  }

  if (alreadyAccepted && alreadyConsented) {
    return (
      <GuardianConsentPrecision
        state="success"
        playerName={invitation.player.name}
        playerAge={playerAge}
      />
    );
  }

  return (
    <GuardianConsentPrecision
      state="form"
      token={token}
      playerName={invitation.player.name}
      playerAge={playerAge}
      playerEmail={invitation.player.email}
      guardianEmail={invitation.email}
    />
  );
}
