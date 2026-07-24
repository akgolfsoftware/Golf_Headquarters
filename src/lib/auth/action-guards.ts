/**
 * Server-action auth guards (KS-1, 2026-07-24).
 *
 * Layout-guards (`requirePortalUser`) kjører IKKE for server actions — en
 * innlogget spiller kan POST-e direkte mot en admin-action. Disse helpers
 * er den eneste sikre autorisasjonen for actions.
 *
 * Bruk:
 *   const user = await requireCoachActionUser();
 * eller HOF for nye actions:
 *   export const lagreX = coachAction(async (user, input) => { ... });
 *
 * Rene asserts: `./action-guards-assert` (enhetstestet uten Next).
 */

import "server-only";

import type { User } from "@/generated/prisma/client";
import { getCurrentUser } from "./getCurrentUser";
import {
  assertAdminRole,
  assertCoachRole,
  assertParentRole,
  assertSpillerRole,
} from "./action-guards-assert";

export type { ActionAuthError } from "./action-guards-assert";
export {
  assertAdminRole,
  assertCoachRole,
  assertParentRole,
  assertSpillerRole,
} from "./action-guards-assert";

/** Coach eller admin — AgencyOS-mutasjoner. */
export async function requireCoachActionUser(): Promise<User> {
  return assertCoachRole(await getCurrentUser());
}

/** Kun ADMIN — f.eks. klubbinnstillinger, wipe, API-nøkler. */
export async function requireAdminActionUser(): Promise<User> {
  return assertAdminRole(await getCurrentUser());
}

/**
 * Spiller (eller coach/admin i dual-role på portal) med gyldig
 * foreldresamtykke. Erstatter `getCurrentUser` + manuell null/consent-sjekk.
 */
export async function requireSpillerActionUser(): Promise<User> {
  return assertSpillerRole(await getCurrentUser());
}

/** Forelder med gyldig innlogging. */
export async function requireParentActionUser(): Promise<User> {
  return assertParentRole(await getCurrentUser());
}

/** HOF: pakk inn en action som krever coach/admin. `user` er første arg. */
export function coachAction<TArgs extends unknown[], TResult>(
  fn: (user: User, ...args: TArgs) => Promise<TResult>,
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs) => {
    const user = await requireCoachActionUser();
    return fn(user, ...args);
  };
}

/** HOF: pakk inn en action som krever spiller (portal). */
export function spillerAction<TArgs extends unknown[], TResult>(
  fn: (user: User, ...args: TArgs) => Promise<TResult>,
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs) => {
    const user = await requireSpillerActionUser();
    return fn(user, ...args);
  };
}

/** HOF: pakk inn en action som krever ADMIN. */
export function adminAction<TArgs extends unknown[], TResult>(
  fn: (user: User, ...args: TArgs) => Promise<TResult>,
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs) => {
    const user = await requireAdminActionUser();
    return fn(user, ...args);
  };
}

/**
 * Markør for bevisst offentlige actions (token-lenker, kontakt-skjema,
 * marketing). Importeres slik at `check-action-auth` godtar fila — gjør
 * INGENTING runtime.
 */
export function publicAction(): void {
  // no-op — lint/gate-signal
}
