/**
 * /admin/analysere/compliance — Compliance-sporing (stall-analyse plan vs reps).
 * Synlig underside av Innsikt-hub-en. (Lå tidligere feilaktig på /admin/analyse
 * som er en legacy-rute redirected til /admin/analysere — redesign 2026-06-01.)
 *
 * Rendrer v10-fasit <Compliance> (fra ag-compliance) med EKTE data fra
 * loadComplianceData (Prisma). mapComplianceData oversetter loaderens
 * ComplianceData → v10-komponentens ComplianceData. Tom-tilstander bevares
 * (panel/drillSession = null, tomme lister) — aldri liksom-tall.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import {
  Compliance,
  type ComplianceData as V10ComplianceData,
} from "@/components/admin/compliance/compliance";
import {
  loadComplianceData,
  type ComplianceData as LoaderComplianceData,
} from "@/lib/admin-compliance/compliance-data";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ periode?: string; studentId?: string }>;

function windowDaysFra(periode: string | undefined): { days: number; label: string } {
  switch (periode) {
    case "7d": return { days: 7, label: "Siste 7 dager" };
    case "90d": return { days: 90, label: "Siste 90 dager" };
    case "365d": return { days: 365, label: "Siste 365 dager" };
    default: return { days: 30, label: "Siste 30 dager" };
  }
}

/** Oversetter loaderens ComplianceData → v10 ComplianceData. Tom-tilstand bevares. */
function mapComplianceData(d: LoaderComplianceData): V10ComplianceData {
  return {
    periodLabel: d.periodLabel,
    windowDays: d.windowDays,
    panel: d.panel
      ? {
          playerId: d.panel.playerId,
          playerName: d.panel.playerName,
          totalPlanned: d.panel.totalPlanned,
          totalDone: d.panel.totalDone,
          pct: d.panel.pct,
          band: d.panel.band,
          axes: d.panel.axes,
          weeks: d.panel.weeks,
          diagnosis: d.panel.diagnosis,
        }
      : null,
    players: d.players,
    selectedPlayerId: d.selectedPlayerId,
    stall: d.stall.map((s) => ({
      playerId: s.playerId,
      playerName: s.playerName,
      initials: s.initials,
      hcp: s.hcp,
      homeClub: s.homeClub,
      planned: s.planned,
      done: s.done,
      pct: s.pct,
      band: s.band,
      lastLog: s.lastLog,
      lastLogBand: s.lastLogBand,
      spark: s.spark,
      staleDays: s.staleDays,
    })),
    cohortAvg: d.cohortAvg,
    cohortMedian: d.cohortMedian,
    staleCount: d.staleCount,
    drillSession: d.drillSession
      ? {
          sessionId: d.drillSession.sessionId,
          title: d.drillSession.title,
          playerName: d.drillSession.playerName,
          dateLabel: d.drillSession.dateLabel,
          durationMin: d.drillSession.durationMin,
          plannedCount: d.drillSession.plannedCount,
          doneCount: d.drillSession.doneCount,
          drills: d.drillSession.drills.map((dr) => ({
            id: dr.id,
            name: dr.name,
            axis: dr.axis,
            axisLabel: dr.axisLabel,
            planned: dr.planned,
            done: dr.done,
          })),
        }
      : null,
  };
}

export default async function CompliancePage({ searchParams }: { searchParams: SearchParams }) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const params = await searchParams;
  const { days, label } = windowDaysFra(params.periode);

  const data = await loadComplianceData({
    windowDays: days,
    periodLabel: label,
    selectedPlayerId: params.studentId,
  });

  return <Compliance data={mapComplianceData(data)} />;
}
