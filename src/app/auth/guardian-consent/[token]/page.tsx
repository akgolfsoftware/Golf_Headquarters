/**
 * /auth/guardian-consent/[token]
 *
 * GDPR art. 8 (P17) — foreldresamtykke for mindreårig spiller.
 * Forelder mottar e-post med signing-link, klikker → kommer hit.
 * Bekrefter samtykke → spiller-konto aktiveres + ParentRelation opprettes.
 *
 * v2-redesign (2026-07-10): rendrer <GuardianConsentV2> (retning C «Presis»)
 * — se src/components/portal/v2/GuardianConsentV2.tsx. Token-oppslaget
 * (utløpt/allerede-akseptert/gyldig) SKJER FORTSATT her på server-siden;
 * resultatet styrer hvilken `state` som sendes til komponenten. Gamle
 * guardian-consent-form.tsx står urørt som fallback.
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

  // Sjekk om utløpt
  const expired = invitation.expiresAt < new Date();
  // Sjekk om allerede akseptert
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
