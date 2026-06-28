/**
 * S-13: Venterom for mindreårige som venter på foreldresamtykke.
 *
 * Brukeren havner her via requirePortalUser-gaten når
 * requiresGuardianConsent=true && guardianConsentGivenAt=null.
 *
 * Viser:
 * - Forklaring på situasjonen
 * - Resend-invitasjon-skjema
 * - Logg ut-link
 */

import { getCurrentUserRaw } from "@/lib/auth/getCurrentUser";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAwaitingGuardianConsent } from "@/lib/auth/minor";
import { SamtykkeVenterKlient } from "./samtykke-venter-klient";

export const dynamic = "force-dynamic";

export default async function SamtykkeVenterPage() {
  // getCurrentUserRaw (ikke getCurrentUser): denne siden ER venterommet, så den
  // må kunne lese den ventende brukeren. getCurrentUser ville redirecte hit på
  // nytt → uendelig loop.
  const user = await getCurrentUserRaw();

  // Ikke innlogget → logg inn
  if (!user) redirect("/auth/login");

  // Samtykke allerede gitt → send til portalen
  if (!isAwaitingGuardianConsent(user)) {
    if (user.role === "PARENT") redirect("/forelder");
    if (user.role === "ADMIN" || user.role === "COACH") redirect("/admin");
    redirect("/portal");
  }

  // Finn siste aktive invitasjon for å vise e-postadressen
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
    <SamtykkeVenterKlient
      spillerNavn={user.name ?? ""}
      invitasjonEmail={sisteInvitasjon?.email ?? null}
    />
  );
}
