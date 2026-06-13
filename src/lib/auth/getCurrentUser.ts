// Sentral helper for å hente innlogget Prisma-bruker fra RSC, Route Handlers
// og Server Actions. React.cache deduper kall innenfor samme request.

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "./ensureUser";
import { beregnEffektivTier } from "@/lib/feature-flags";
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
  const effektiv = beregnEffektivTier({
    tier: user.tier,
    createdAt: user.createdAt,
    coachingMonthlyCredits: sub?.monthlyCredits ?? 0,
    subscriptionActive: sub?.status === "ACTIVE",
    iGruppe: gruppeCount > 0,
  });
  if (effektiv === user.tier) return user;
  return { ...user, tier: effektiv };
}
