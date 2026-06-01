/**
 * /portal/stats — PlayerHQ Stats-oversikt (default-tab).
 *
 * Mobile-first landing på Stats-seksjonen. Header + rute-tabs + KPI-strip +
 * HCP-trend + SG-fordeling + Broadie-kontekst.
 *
 * Krever requirePortalUser (PLAYER / COACH / ADMIN).
 * Data: User.hcp, Round, BrukerSgInput, BrukerSammenligning.
 */

import type { Metadata } from "next";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentStatsOverview } from "@/lib/portal-stats/overview-data";
import { StatsOverview } from "@/components/portal/stats/stats-overview";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stats-oversikt | PlayerHQ",
  description: "Din personlige golf-statistikk, HCP-trend og SG-profil.",
  robots: { index: false },
};

export default async function PortalStatsPage() {
  const user = await requirePortalUser();
  const data = await hentStatsOverview(user.id);

  // Nåværende HCP til trend-kortets store tall: foretrekk profil-HCP,
  // ellers siste trend-punkt.
  const hcpNa = data.hcp ?? data.hcpTrend[data.hcpTrend.length - 1]?.hcp ?? null;

  return (
    <StatsOverview data={data} aar={new Date().getFullYear()} hcpNa={hcpNa} />
  );
}
