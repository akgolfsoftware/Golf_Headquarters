/**
 * Data-loader for /portal/meg/abonnement.
 *
 * Leser FAKTISK tier + subscription + faktura-historikk fra Prisma og
 * former en view-model. Tier-modell: kun GRATIS + PRO (ELITE er dødt enum
 * og vises aldri). Credit-saldo leses direkte fra subscription —
 * `monthlyCredits` (pakkens tak) og `creditsRemaining` (saldo i perioden).
 * Ingen tall hardkodes; mangler data → 0/null og UI viser tomt/utledet.
 */

import { prisma } from "@/lib/prisma";

export type FakturaType = "BOOKING" | "SUBSCRIPTION" | "INVOICE" | "OTHER";

export type FakturaRad = {
  id: string;
  paidAt: Date | null;
  amountOre: number;
  type: FakturaType;
  stripeInvoiceId: string | null;
  description: string | null;
};

export type AbonnementData = {
  /** FAKTISK tier fra DB — ikke kampanje-overstyrt. Kun GRATIS/PRO i UI. */
  erPro: boolean;
  status: string | null;
  aktivSiden: Date | null;
  nesteTrekk: Date | null;
  /** Antall credits pakken gir per måned (0 for Gratis). */
  monthlyCredits: number;
  /** Saldo igjen i inneværende periode. */
  creditsRemaining: number;
  /** Hele dager til neste trekk, eller null hvis ukjent / ikke Pro. */
  forfallOmDager: number | null;
  fakturaer: FakturaRad[];
};

/** Hele dager mellom nå og en fremtidig dato (gulv på 0). */
function dagerTil(d: Date | null | undefined, now: Date): number | null {
  if (!d) return null;
  const ms = d.getTime() - now.getTime();
  if (ms <= 0) return 0;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export async function getAbonnementData(
  userId: string,
  now: Date = new Date(),
): Promise<AbonnementData> {
  // FAKTISK tier — `user.tier` kan være kampanje-overstyrt i feature-flags,
  // så abonnement-siden leser kilden direkte.
  const [faktisk, subscription, fakturaer] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { tier: true },
    }),
    prisma.subscription.findUnique({
      where: { userId },
      select: {
        tier: true,
        status: true,
        currentPeriodEnd: true,
        createdAt: true,
        monthlyCredits: true,
        creditsRemaining: true,
      },
    }),
    prisma.payment.findMany({
      where: { userId, status: "SUCCEEDED" },
      orderBy: { paidAt: "desc" },
      take: 12,
      select: {
        id: true,
        paidAt: true,
        amountOre: true,
        type: true,
        stripeInvoiceId: true,
        description: true,
      },
    }),
  ]);

  const erPro = (faktisk?.tier ?? "GRATIS") === "PRO";
  const nesteTrekk = subscription?.currentPeriodEnd ?? null;

  return {
    erPro,
    status: subscription?.status ?? null,
    aktivSiden: subscription?.createdAt ?? null,
    nesteTrekk,
    monthlyCredits: subscription?.monthlyCredits ?? 0,
    creditsRemaining: subscription?.creditsRemaining ?? 0,
    forfallOmDager: erPro ? dagerTil(nesteTrekk, now) : null,
    fakturaer,
  };
}
