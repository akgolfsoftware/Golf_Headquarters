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

  // Gratisnivået er nå standard for alle nye spillere (Anders 2026-08-29).
  //
  // profilType TALENT gir tilgangsnivå TALENT i resolveTilgang: testbatteri,
  // DataGolf-verktøy, runde- og statistikkføring og booking av enkelttimer —
  // gratis, uten utløp. Full app krever kort via Stripe.
  //
  // Dette MÅ henge sammen med at den usynlige prøveperioden er fjernet fra
  // resolveTilgang: uten TALENT som standard ville en ny spiller landet på
  // INGEN og vært stengt ute av hele appen fra første innlogging.
  //
  // Foreldre holdes utenfor — de har sin egen app (/forelder) og styres ikke
  // av portalens tilgangsnivåer.
  //
  // Settes KUN i create-grenen: update er tom, så en eksisterende brukers
  // profilType røres aldri ved senere innlogginger. Trygt selv om metadata
  // er klient-kontrollert — TALENT er en INNSNEVRING av gratis-tilgangen.
  const erTalent = role === "PLAYER";
  const kilde = meta.kilde === "talenthq" ? "TALENTHQ" : "SIGNUP";

  return prisma.user.upsert({
    where: { authId: authUser.id },
    update: {},
    create: {
      authId: authUser.id,
      email: authUser.email!,
      name,
      role,
      tier: "GRATIS",
      ...(erTalent ? { profilType: "TALENT", profilKilde: kilde } : {}),
    },
  });
}
