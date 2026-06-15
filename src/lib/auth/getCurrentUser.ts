// Sentral helper for å hente innlogget Prisma-bruker fra RSC, Route Handlers
// og Server Actions. React.cache deduper kall innenfor samme request.

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "./ensureUser";
import { resolveTier } from "@/lib/feature-flags";
import type { User } from "@/generated/prisma/client";

export const getCurrentUser = cache(async (): Promise<User | null> => {
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

// Overskriver `tier` med EFFEKTIV tier etter de låste reglene (se lib/feature-flags.ts):
// PRO = har PlayerHQ-tilgang (gratis ELLER betalt), GRATIS = må betale 300 kr/mnd.
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
