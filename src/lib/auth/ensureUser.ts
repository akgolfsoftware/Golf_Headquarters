// Lazy oppretter Prisma-User basert på Supabase user_metadata (role + tier).
// Brukes når Supabase-bruker finnes, men Prisma-raden mangler — typisk etter
// e-post-bekreftelse hvor signup-formen lagret meta før Prisma-rad ble opprettet.

import { prisma } from "@/lib/prisma";
import { claimPendingAccountByEmail } from "./claim-pending-account";
import type { User, UserRole, Tier } from "@/generated/prisma/client";
import type { User as AuthUser } from "@supabase/supabase-js";

export async function ensureUser(authUser: AuthUser): Promise<User | null> {
  // Verifisert eierskap: hvis guardian-consent-flyten opprettet en ventende
  // forelder-rad for denne (nå Supabase-bekreftede) e-posten, koble den til denne
  // auth-brukeren i stedet for å opprette en kollisjon på unik e-post. Raden har
  // allerede role=PARENT, så vi returnerer den direkte uten metadata-kravet under.
  if (authUser.email) {
    const claimed = await claimPendingAccountByEmail(authUser.id, authUser.email);
    if (claimed) return claimed;
  }

  const meta = authUser.user_metadata ?? {};
  if (!meta.role || !meta.tier) return null;

  const firstName = typeof meta.firstName === "string" ? meta.firstName : "";
  const lastName = typeof meta.lastName === "string" ? meta.lastName : "";
  const name = `${firstName} ${lastName}`.trim() || authUser.email!;

  return prisma.user.upsert({
    where: { authId: authUser.id },
    update: {},
    create: {
      authId: authUser.id,
      email: authUser.email!,
      name,
      role: meta.role as UserRole,
      tier: meta.tier as Tier,
    },
  });
}
