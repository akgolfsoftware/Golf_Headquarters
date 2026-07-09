"use server";

/**
 * Server actions for /admin/stats/overview "Raske handlinger".
 *
 * Kun «Sjekk DB-helse» er koblet — den er read-only og intern (trygg å
 * trigge fra en knapp). De andre snarveiene (PGA-sync = utadvendt mot
 * DataGolf, ukentlig roundup = utsending, CRON_SECRET-rotasjon = sensitiv
 * hemmelighet) trigges bevisst fra terminal/ops, ikke autonomt herfra.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

export interface DbHelseResultat {
  ok: boolean;
  latencyMs: number;
  brukere: number | null;
  feil?: string;
}

/** Read-only DB-ping: måler svartid + teller brukere. ADMIN-gated. */
export async function sjekkDbHelse(): Promise<DbHelseResultat> {
  await requirePortalUser({ allow: ["ADMIN"] });

  const start = performance.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const brukere = await prisma.user.count();
    const latencyMs = Math.round(performance.now() - start);
    return { ok: true, latencyMs, brukere };
  } catch (e) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      ok: false,
      latencyMs,
      brukere: null,
      feil: e instanceof Error ? e.message : "Ukjent feil",
    };
  }
}
