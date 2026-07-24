/**
 * Marker at brukeren har logget inn (setter User.lastLoginAt).
 * Brukes av etter-innlogging + som fallback når getCurrentUser oppdaterer stale verdi.
 * Idempotent nok til å kalles flere ganger — kaller bare Prisma-update.
 */

import { prisma } from "@/lib/prisma";

export async function recordLastLogin(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  });
}
