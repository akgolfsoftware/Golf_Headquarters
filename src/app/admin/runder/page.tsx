/**
 * v2-preview: AgencyOS Runder-admin (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver AdminShell — kun root-layout — så V2Shell leverer
 * all chrome (IkonRail/BunnNav) i mørk v2-scope.
 *
 * Auth + data følger den ekte /admin/runder-flaten: samme requirePortalUser-
 * guard (ADMIN/COACH), samme Prisma-spørring (Round, nyeste 50 + totaltelling)
 * og samme KPI-aggregat. Mapper til AdminRunderV2Data (ærlige tomrom, brutto
 * score, ingen fabrikerte tall).
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import {
  AdminRunderV2,
  type AdminRunderV2Data,
  type AdminRunderV2Round,
} from "@/components/admin/v2/AdminRunderV2";

export const dynamic = "force-dynamic";

function formatDate(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" });
}

export default async function V2AdminRunderPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const rounds = await prisma.round.findMany({
    orderBy: { playedAt: "desc" },
    take: 50,
    include: {
      user: { select: { id: true, name: true, hcp: true } },
      course: { select: { id: true, name: true, par: true } },
    },
  });

  const totalRounds = await prisma.round.count();

  // ── Aggregat-KPI (identisk med den ekte /admin/runder-siden) ──────
  const validScores = rounds.filter((r) => r.score != null);
  const snittScore =
    validScores.length === 0
      ? null
      : validScores.reduce((s, r) => s + r.score, 0) / validScores.length;

  const vsParSnitt =
    validScores.length === 0
      ? null
      : validScores.reduce((s, r) => s + (r.score - r.course.par), 0) / validScores.length;

  const sgRunderList = rounds.filter((r) => r.sgTotal != null);
  const sgSnitt =
    sgRunderList.length === 0
      ? null
      : sgRunderList.reduce((s, r) => s + (r.sgTotal ?? 0), 0) / sgRunderList.length;

  const besteRunde = rounds.reduce<(typeof rounds)[number] | null>(
    (b, r) => (b == null || r.score - r.course.par < b.score - b.course.par ? r : b),
    null,
  );

  const uniquePlayers = new Set(rounds.map((r) => r.userId)).size;

  const runder: AdminRunderV2Round[] = rounds.map((r) => ({
    id: r.id,
    spiller: r.user.name,
    spillerId: r.user.id,
    hcp: r.user.hcp != null ? r.user.hcp.toFixed(1).replace(".", ",") : null,
    bane: r.course.name,
    par: r.course.par,
    dato: formatDate(r.playedAt),
    score: r.score,
    vsPar: r.score - r.course.par,
    sg: r.sgTotal ?? null,
  }));

  const data: AdminRunderV2Data = {
    vist: rounds.length,
    total: totalRounds,
    spillere: uniquePlayers,
    snittScore,
    vsParSnitt,
    beste: besteRunde
      ? {
          score: besteRunde.score,
          vsPar: besteRunde.score - besteRunde.course.par,
          spiller: besteRunde.user.name,
          bane: besteRunde.course.name,
        }
      : null,
    sgSnitt,
    sgRunder: sgRunderList.length,
    runder,
  };

  return (
    <V2Shell aktiv="innsikt" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <AdminRunderV2 data={data} />
    </V2Shell>
  );
}
