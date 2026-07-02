// Lazy oppretter Prisma-User basert på Supabase user_metadata (role + tier).
// Brukes når Supabase-bruker finnes, men Prisma-raden mangler — typisk etter
// e-post-bekreftelse hvor signup-formen lagret meta før Prisma-rad ble opprettet.

import { prisma } from "@/lib/prisma";
import { claimPendingAccountByEmail } from "./claim-pending-account";
import type { User, UserRole } from "@/generated/prisma/client";
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

  // SIKKERHET: user_metadata er klient-kontrollert og kan ALDRI gi privilegert
  // tilgang. Whitelist rollen til selvbetjente verdier (PLAYER/PARENT) — COACH/
  // ADMIN settes kun server-side av en eksisterende ADMIN. Tier tvinges til
  // GRATIS; ekte PRO settes av Stripe-webhooken ved betaling (aldri av signup).
  const requestedRole = meta.role as UserRole;
  const role: UserRole =
    requestedRole === "PLAYER" || requestedRole === "PARENT"
      ? requestedRole
      : "PLAYER";

  return prisma.user.upsert({
    where: { authId: authUser.id },
    update: {},
    create: {
      authId: authUser.id,
      email: authUser.email!,
      name,
      role,
      tier: "GRATIS",
    },
  });
}
