// Sentral helper for å hente innlogget Prisma-bruker fra RSC, Route Handlers
// og Server Actions. React.cache deduper kall innenfor samme request.

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "./ensureUser";
import { isAwaitingGuardianConsent } from "./minor";
import { resolveTier } from "@/lib/feature-flags";
import type { User } from "@/generated/prisma/client";

// Henter innlogget Prisma-bruker UTEN samtykke-håndheving. Brukes KUN av
// samtykke-flyten (samtykke-venter-siden + onboarding der den mindreårige
// setter fødselsdato og resender invitasjon MENS hen venter på samtykke) og av
// requirePortalUser/requireCapability (som gjør sin egen samtykke-redirect).
// All annen kode skal bruke getCurrentUser, som arver samtykke-gaten under.
export const getCurrentUserRaw = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return null;

  const user = await prisma.user.findUnique({
    where: { authId: authUser.id },
  });
  // GDPR (P20): soft-slettet konto (deletedAt satt) behandles som utlogget —
  // brukeren kan ikke bruke appen i 30-dagers angrevinduet. Gjenoppretting via support.
  if (user?.deletedAt) return null;
  if (user) return withEffektivTilgang(user);

  // Supabase-bruker finnes, men Prisma-rad mangler — opprett via metadata.
  const ny = await ensureUser(authUser);
  return ny ? withEffektivTilgang(ny) : null;
});

// GDPR art. 8 (S-13): standard innloggings-sti for portal/admin. Identisk med
// getCurrentUserRaw, men håndhever foreldresamtykke for mindreårige sentralt —
// en mindreårig som venter på samtykke sendes til venterommet i stedet for å få
// kjøre data-mutasjoner. Dette lukker gapet der ~67 server-actions kalte rå
// getCurrentUser uten requirePortalUser/requireCapability. Returnerer aldri en
// bruker som venter på samtykke (redirect kaster før retur).
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const user = await getCurrentUserRaw();
  if (user && isAwaitingGuardianConsent(user)) {
    redirect("/auth/samtykke-venter");
  }
  return user;
});

// Overskriver `tier` med EFFEKTIV tier etter de låste reglene (se lib/feature-flags.ts):
// PRO = har PlayerHQ-tilgang (gratis ELLER betalt), GRATIS = må betale 299 kr/mnd.
// Laster coaching-pakke (Subscription) + gruppemedlemskap for å avgjøre gratis-tilgang.
// /portal/meg/abonnement viser FAKTISK tier ved å lese prisma.user direkte.
async function withEffektivTilgang(user: User): Promise<User> {
  const [sub, gruppeCount] = await Promise.all([
    prisma.subscription
      .findUnique({ where: { userId: user.id }, select: { monthlyCredits: true, status: true } })
      .catch(() => null),
    prisma.groupMember.count({ where: { userId: user.id } }).catch(() => 0),
  ]);
  const effektiv = resolveTier({
    tier: user.tier,
    createdAt: user.createdAt,
    subscription: sub,
    groupMembershipsCount: gruppeCount,
  });
  if (effektiv === user.tier) return user;
  return { ...user, tier: effektiv };
}
