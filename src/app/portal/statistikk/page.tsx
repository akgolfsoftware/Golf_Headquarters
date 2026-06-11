/**
 * PlayerHQ Statistikk (/portal/statistikk) — v10-design.
 *
 * Rendrer <Statistikk> (v10-fasit fra pl-stats.png) med EKTE data fra Prisma.
 * mapStatistikkData oversetter spillerens loggede runder til SG-metrikk-celler.
 * Tom-tilstand bevares: ny spiller / 0 runder med SG-data ⇒ "Statistikk vises
 * når du har logget runder." — aldri liksom-tall.
 *
 * Server component. Auth-guard via requirePortalUser. Skall (sidebar/bunn-nav)
 * eies av portal-layoutet; denne siden rendrer kun innholdet.
 *
 * Byttet fra StatistikkClient (gammelt design med dummy-fallback) til v10
 * Statistikk-komponenten (3. juni).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { Statistikk } from "@/components/portal/statistikk/statistikk";
import { mapStatistikkData } from "./statistikk-v10-data";

export const dynamic = "force-dynamic";

export default async function StatistikkDashboard() {
  const user = await requirePortalUser();

  const rounds = await prisma.round.findMany({
    where: { userId: user.id },
    orderBy: { playedAt: "asc" },
    select: {
      score: true,
      sgTotal: true,
      sgOtt: true,
      sgApp: true,
      sgArg: true,
      sgPutt: true,
    },
  });

  return <Statistikk data={mapStatistikkData(rounds)} />;
}
