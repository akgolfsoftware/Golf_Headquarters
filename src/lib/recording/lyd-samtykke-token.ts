/**
 * Rene hjelpere for magisk lenke til lydsamtykke (foresatt).
 * Ingen DB — testbart uten Prisma.
 */

import { createHash, randomBytes } from "node:crypto";

/** Gyldighet på samtykke-lenke til foresatt (dager). */
export const LYD_SAMTYKKE_TOKEN_TTL_DAGER = 14;

export function lagLydSamtykkeToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Hash lagres i DB — rå token kun i e-post/URL. */
export function hashLydSamtykkeToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function lydSamtykkeTokenUtloper(
  fra: Date = new Date(),
  dager: number = LYD_SAMTYKKE_TOKEN_TTL_DAGER,
): Date {
  return new Date(fra.getTime() + dager * 24 * 60 * 60 * 1000);
}

/** Ren: er token gyldig for å kunne bekrefte? */
export function erLydSamtykkeTokenGyldig(input: {
  token?: string | null;
  tokenHash?: string | null;
  tokenExpiresAt: Date | null | undefined;
  status: string;
  naa?: Date;
}): boolean {
  // #11: både GITT og TRUKKET er ugyldig for ny bekreftelse
  if (input.status === "GITT" || input.status === "TRUKKET") return false;
  // Gyldig hvis vi har rå token (legacy) eller hash
  if (!input.token && !input.tokenHash) return false;
  if (!input.tokenExpiresAt) return false;
  const naa = input.naa ?? new Date();
  return input.tokenExpiresAt.getTime() > naa.getTime();
}
