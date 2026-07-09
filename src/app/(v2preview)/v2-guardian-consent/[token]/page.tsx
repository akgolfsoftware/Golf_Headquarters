/**
 * v2-forhåndsvisning — Foreldresamtykke (retning C). OFFENTLIG flate: ingen
 * auth-guard (verger er ikke innlogget), MEN samme Prisma-token-oppslag som
 * den ekte /auth/guardian-consent/[token] — notFound() ved ukjent token, slik
 * at forhåndsvisningen aldri lekker samtykke-data for en ugyldig lenke. Egen
 * top-level route-group (v2preview) som ikke arver PortalShell.
 *
 * GuardianConsentV2 leverer sin egen dark-scope + fluid AuthRamme (BrandPanel
 * + samtykke-kort) — bevisst UTEN V2Shell. Utløpt/allerede-akseptert-tilstand
 * er IKKE duplisert her (komponenten viser alltid skjemaet — meldt som gap i
 * GuardianConsentV2.tsx sin egen docstring); selve GDPR-innsendingen bor i
 * src/app/auth/guardian-consent/[token]/guardian-consent-form.tsx.
 */

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { calculateAge } from "@/lib/auth/minor";
import { GuardianConsentV2 } from "@/components/portal/v2/GuardianConsentV2";

type Props = {
  params: Promise<{ token: string }>;
};

export const dynamic = "force-dynamic";

export default async function V2GuardianConsentPreviewPage({ params }: Props) {
  const { token } = await params;

  const invitation = await prisma.parentInvitation.findUnique({
    where: { token },
    include: {
      player: {
        select: {
          name: true,
          email: true,
          dateOfBirth: true,
        },
      },
    },
  });

  if (!invitation) notFound();

  const playerAge = calculateAge(invitation.player.dateOfBirth);

  return (
    <GuardianConsentV2
      token={token}
      playerName={invitation.player.name}
      playerEmail={invitation.player.email}
      guardianEmail={invitation.email}
      playerAge={playerAge}
    />
  );
}
