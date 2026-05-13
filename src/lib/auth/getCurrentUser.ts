// Sentral helper for å hente innlogget Prisma-bruker fra RSC, Route Handlers
// og Server Actions. React.cache deduper kall innenfor samme request.

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "./ensureUser";
import { effektivTier } from "@/lib/feature-flags";
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
  if (user) return withEffektivTier(user);

  // Supabase-bruker finnes, men Prisma-rad mangler — opprett via metadata.
  const ny = await ensureUser(authUser);
  return ny ? withEffektivTier(ny) : null;
});

// Overstyrer `tier`-feltet i samsvar med PRO-kampanjen (se lib/feature-flags.ts).
// /portal/meg/abonnement må fortsatt vise FAKTISK tier — den henter direkte
// fra `prisma.user` ved behov.
function withEffektivTier(user: User): User {
  const overstyrt = effektivTier(user.tier);
  if (overstyrt === user.tier) return user;
  return { ...user, tier: overstyrt };
}
