import "server-only";

import { prisma } from "@/lib/prisma";
import type { User } from "@/generated/prisma/client";

/**
 * GDPR / verifisert e-post-eierskap i linkings-stien.
 *
 * guardian-consent-flyten (confirmGuardianConsent) kan opprette en forelder-rad
 * med `authId = "pending-<invitationId>"` FØR forelderen har en Supabase-konto.
 * Den raden kan ikke logge inn, men en `ParentRelation(approved: true)` peker
 * allerede på den.
 *
 * Når forelderen senere får en EKTE Supabase-konto for samme e-post, har
 * Supabase bekreftet at de eier e-posten (email_confirm / e-postbekreftelse).
 * Først DA kobler vi den verifiserte `authId`-en til den eksisterende raden — i
 * stedet for å opprette en ny rad som ville kollidert på unik e-post. Dermed blir
 * en ventende ParentRelation reelt tilgjengelig kun for den som har bevist
 * eierskap, og alle FK-er (ParentRelation.parentId, guardianConsentByUserId)
 * bevares fordi det er SAMME rad som oppdateres.
 *
 * Returnerer den krevde raden, eller null hvis ingen ventende rad matcher.
 * Rører kun rader med `pending-`-prefiks — aldri ekte kontoer.
 */
export async function claimPendingAccountByEmail(
  authId: string,
  email: string,
): Promise<User | null> {
  const existing = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });
  if (!existing) return null;
  if (!existing.authId.startsWith("pending-")) return null;
  if (existing.authId === authId) return existing;

  return prisma.user.update({
    where: { id: existing.id },
    data: { authId },
  });
}
