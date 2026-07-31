/**
 * Rene hjelpere for magisk lenke til lydsamtykke (foresatt).
 * Ingen DB — testbart uten Prisma.
 */

import { randomBytes } from "node:crypto";

/** Gyldighet på samtykke-lenke til foresatt (dager). */
export const LYD_SAMTYKKE_TOKEN_TTL_DAGER = 14;

export function lagLydSamtykkeToken(): string {
  return randomBytes(32).toString("base64url");
}

export function lydSamtykkeTokenUtloper(
  fra: Date = new Date(),
  dager: number = LYD_SAMTYKKE_TOKEN_TTL_DAGER,
): Date {
  return new Date(fra.getTime() + dager * 24 * 60 * 60 * 1000);
}

/** Ren: er token gyldig for å kunne bekrefte? */
export function erLydSamtykkeTokenGyldig(input: {
  token: string | null | undefined;
  tokenExpiresAt: Date | null | undefined;
  status: string;
  naa?: Date;
}): boolean {
  if (!input.token) return false;
  if (input.status === "GITT") return false;
  if (!input.tokenExpiresAt) return false;
  const naa = input.naa ?? new Date();
  return input.tokenExpiresAt.getTime() > naa.getTime();
}
