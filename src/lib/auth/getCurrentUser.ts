// Sentral helper for å hente innlogget Prisma-bruker fra RSC, Route Handlers
// og Server Actions. React.cache deduper kall innenfor samme request.

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "./ensureUser";
import { isAwaitingGuardianConsent } from "./minor";
import { resolveTilgang, type Tilgang } from "@/lib/feature-flags";
import { aktivtAkGruppeMedlemskapWhere } from "@/lib/domain/grupper";
import type { User } from "@/generated/prisma/client";

/** Prisma-bruker + beregnet tilgangsnivå (A3). tier er alltid EFFEKTIV tier. */
export type UserMedTilgang = User & { tilgang: Tilgang };

// Henter innlogget Prisma-bruker UTEN samtykke-håndheving. Brukes KUN av
// samtykke-flyten (samtykke-venter-siden + onboarding der den mindreårige
// setter fødselsdato og resender invitasjon MENS hen venter på samtykke) og av
// requirePortalUser/requireCapability (som gjør sin egen samtykke-redirect).
// All annen kode skal bruke getCurrentUser, som arver samtykke-gaten under.
export const getCurrentUserRaw = cache(async (): Promise<UserMedTilgang | null> => {
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
  if (user) {
    // Marker innlogging for alle stier (passord + OAuth). OAuth-callback setter
    // også lastLoginAt, men passord-login gikk tidligere rett til /portal uten
    // å oppdatere — aktiveringsmetrikken (31 spillere / 0 innlogginger) ble da
    // feil. Oppdater maks én gang per 6 timer for å unngå write-storm.
    const staleMs = 6 * 60 * 60 * 1000;
    const needsLoginStamp =
      !user.lastLoginAt || Date.now() - user.lastLoginAt.getTime() > staleMs;
    if (needsLoginStamp) {
      const now = new Date();
      await prisma.user
        .update({ where: { id: user.id }, data: { lastLoginAt: now } })
        .catch(() => null);
      return withEffektivTilgang({ ...user, lastLoginAt: now });
    }
    return withEffektivTilgang(user);
  }

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
export const getCurrentUser = cache(async (): Promise<UserMedTilgang | null> => {
  const user = await getCurrentUserRaw();
  if (user && isAwaitingGuardianConsent(user)) {
    redirect("/auth/samtykke-venter");
  }
  return user;
});

// Beregner tilgangsnivået (FULL/TALENT/INGEN — plan A3) og overskriver `tier`
// med EFFEKTIV tier (PRO = FULL). Laster begge abonnementsrader + aktive
// AK-gruppe-medlemskap (managedByAkGolf, plan G1-kontrakten).
// /portal/meg/abonnement viser FAKTISK tier ved å lese prisma.user direkte.
async function withEffektivTilgang(user: User): Promise<UserMedTilgang> {
  const [coaching, playerhq, akGruppeCount] = await Promise.all([
    prisma.subscription
      .findUnique({
        where: { userId_kind: { userId: user.id, kind: "COACHING" } },
        select: { monthlyCredits: true, status: true, currentPeriodEnd: true },
      })
      .catch(() => null),
    prisma.subscription
      .findUnique({
        where: { userId_kind: { userId: user.id, kind: "PLAYERHQ" } },
        select: {
          status: true,
          currentPeriodEnd: true,
          plan: true,
          stripeSubscriptionId: true,
        },
      })
      .catch(() => null),
    prisma.groupMember
      .count({ where: { userId: user.id, ...aktivtAkGruppeMedlemskapWhere() } })
      .catch(() => 0),
  ]);
  const tilgang = resolveTilgang({
    tier: user.tier,
    profilType: user.profilType,
    createdAt: user.createdAt,
    trialEndsAt: user.trialEndsAt,
    coaching,
    playerhq,
    akGruppeCount,
  });
  return { ...user, tier: tilgang.effektivTier, tilgang };
}
