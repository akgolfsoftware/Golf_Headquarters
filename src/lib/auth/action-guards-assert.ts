/**
 * Rene rolle-asserts for server actions (KS-1).
 * Ingen Next/Prisma-imports — enhetstestbare uten mock.
 */

import type { UserRole } from "@/generated/prisma/client";
import { isAwaitingGuardianConsent } from "./minor";
import { canAccessPortalRoute } from "./cbac";

export type ActionAuthError =
  | "unauthenticated"
  | "forbidden"
  | "guardian-consent-required";

type ConsentFields = {
  requiresGuardianConsent: boolean;
  guardianConsentGivenAt: Date | null;
};

type RoleUser = { role: UserRole } & ConsentFields;

/** Ren: coach eller admin. */
export function assertCoachRole<T extends RoleUser>(user: T | null): T {
  if (!user) throw new Error("unauthenticated");
  if (user.role !== "COACH" && user.role !== "ADMIN") {
    throw new Error("forbidden");
  }
  return user;
}

/** Ren: kun ADMIN. */
export function assertAdminRole<T extends RoleUser>(user: T | null): T {
  if (!user) throw new Error("unauthenticated");
  if (user.role !== "ADMIN") throw new Error("forbidden");
  return user;
}

/** Ren: spiller (eller dual-role coach/admin) med samtykke. */
export function assertSpillerRole<T extends RoleUser>(user: T | null): T {
  if (!user) throw new Error("unauthenticated");
  if (!canAccessPortalRoute(user.role, ["PLAYER", "COACH", "ADMIN"])) {
    throw new Error("forbidden");
  }
  if (isAwaitingGuardianConsent(user)) {
    throw new Error("guardian-consent-required");
  }
  return user;
}

/** Ren: PARENT. */
export function assertParentRole<T extends RoleUser>(user: T | null): T {
  if (!user) throw new Error("unauthenticated");
  if (user.role !== "PARENT") throw new Error("forbidden");
  return user;
}
