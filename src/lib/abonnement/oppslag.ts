/**
 * IO-oppslag for abonnement v2 (plan A1). Bruk disse — eller direkte
 * `findUnique({ where: { userId_kind } })` med EKSPLISITT kind når du trenger
 * select. Aldri anta én rad per bruker (unikheten er (userId, kind) siden A1),
 * og aldri `subscriptions[0]`.
 */

import { prisma } from "@/lib/prisma";
import type { Subscription } from "@/generated/prisma/client";

export function hentCoachingAbonnement(userId: string): Promise<Subscription | null> {
  return prisma.subscription.findUnique({
    where: { userId_kind: { userId, kind: "COACHING" } },
  });
}

export function hentPlayerHqAbonnement(userId: string): Promise<Subscription | null> {
  return prisma.subscription.findUnique({
    where: { userId_kind: { userId, kind: "PLAYERHQ" } },
  });
}

export function hentAbonnementer(userId: string): Promise<Subscription[]> {
  return prisma.subscription.findMany({ where: { userId }, orderBy: { kind: "asc" } });
}
