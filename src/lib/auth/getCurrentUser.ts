// Sentral helper for å hente innlogget Prisma-bruker fra RSC, Route Handlers
// og Server Actions. React.cache deduper kall innenfor samme request.

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "./ensureUser";
import { isAwaitingGuardianConsent } from "./minor";
import { resolveTilgang, type ResolveTilgangInput, type Tilgang } from "@/lib/feature-flags";
import { aktivtAkGruppeMedlemskapWhere } from "@/lib/domain/grupper";
import { TilgangHentefeil, erTilgangHentefeil } from "./tilgang-hentefeil";
import type { User } from "@/generated/prisma/client";

/** Prisma-bruker + beregnet tilgangsnivå (A3). tier er alltid EFFEKTIV tier. */
export type UserMedTilgang = User & { tilgang: Tilgang };

/** Duck-type slik at enhetstester kan sende inn en mock uten PrismaClient. */
export type TilgangsDb = {
  subscription: { findUnique: (args: unknown) => Promise<unknown> };
  groupMember: { count: (args: unknown) => Promise<number> };
};

/**
 * Laster abonnementsrader og AK-gruppe-telling.
 * Null-rad = finnes ikke. Kastet spørring = TilgangHentefeil (ikke INGEN).
 */
export async function lastTilgangsRader(
  db: TilgangsDb,
  userId: string,
): Promise<{
  coaching: ResolveTilgangInput["coaching"];
  playerhq: ResolveTilgangInput["playerhq"];
  akGruppeCount: number;
}> {
  try {
    const [coaching, playerhq, akGruppeCount] = await Promise.all([
      db.subscription.findUnique({
        where: { userId_kind: { userId, kind: "COACHING" } },
        select: { monthlyCredits: true, status: true, currentPeriodEnd: true },
      }),
      db.subscription.findUnique({
        where: { userId_kind: { userId, kind: "PLAYERHQ" } },
        select: {
          status: true,
          currentPeriodEnd: true,
          plan: true,
          stripeSubscriptionId: true,
        },
      }),
      db.groupMember.count({
        where: { userId, ...aktivtAkGruppeMedlemskapWhere() },
      }),
    ]);
    return {
      coaching: (coaching ?? null) as ResolveTilgangInput["coaching"],
      playerhq: (playerhq ?? null) as ResolveTilgangInput["playerhq"],
      akGruppeCount,
    };
  } catch (e) {
    if (erTilgangHentefeil(e)) throw e;
    throw new TilgangHentefeil();
  }
}

export const getCurrentUserRaw = cache(async (): Promise<UserMedTilgang | null> => {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return null;

  const user = await prisma.user.findUnique({
    where: { authId: authUser.id },
  });
  if (user?.deletedAt) return null;
  if (user) {
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

  const ny = await ensureUser(authUser);
  return ny ? withEffektivTilgang(ny) : null;
});

export const getCurrentUser = cache(async (): Promise<UserMedTilgang | null> => {
  let user: UserMedTilgang | null;
  try {
    user = await getCurrentUserRaw();
  } catch (e) {
    if (erTilgangHentefeil(e)) redirect("/auth/tjeneste-utilgjengelig");
    throw e;
  }
  if (user && isAwaitingGuardianConsent(user)) {
    redirect("/auth/samtykke-venter");
  }
  return user;
});

async function withEffektivTilgang(user: User): Promise<UserMedTilgang> {
  const { coaching, playerhq, akGruppeCount } = await lastTilgangsRader(
    prisma as unknown as TilgangsDb,
    user.id,
  );
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
