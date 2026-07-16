/**
 * AgencyOS — Lag-snitt (ANALYSERE · LAG-SNITT), /admin/lag-snitt.
 * v2-port 16. juli 2026.
 *
 * Datakilde: prisma.group → members → COMPLETED TrainingPlanSession gruppert
 * på pyramidArea per gruppe (samme grunnlag som /admin/analyse). Prosent =
 * andel av gruppas fullførte økter per akse. Grupper uten loggede økter viser
 * «—» per akse — aldri liksom-tall.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminLagSnittV2, type AdminLagSnittV2Data, type LagSnittRad } from "@/components/admin/v2/AdminLagSnittV2";
import type { AkseKey } from "@/lib/v2/tokens";

export const dynamic = "force-dynamic";

const AKSER: readonly AkseKey[] = ["TURN", "SPILL", "SLAG", "TEK", "FYS"];

export default async function LagSnittPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const grupper = await prisma.group.findMany({
    select: { id: true, name: true, members: { select: { userId: true } } },
    orderBy: { name: "asc" },
  });

  const lag = await Promise.all(
    grupper.map(async (g) => {
      const memberIds = g.members.map((m) => m.userId);
      const counts: Record<AkseKey, number> = { TURN: 0, SPILL: 0, SLAG: 0, TEK: 0, FYS: 0 };

      if (memberIds.length > 0) {
        const grouped = await prisma.trainingPlanSession.groupBy({
          by: ["pyramidArea"],
          _count: { _all: true },
          where: { status: "COMPLETED", plan: { userId: { in: memberIds } } },
        });
        for (const row of grouped) counts[row.pyramidArea as AkseKey] = row._count._all;
      }

      const total = AKSER.reduce((s, a) => s + counts[a], 0);
      const rader: LagSnittRad[] = AKSER.map((a) => ({
        akse: a,
        pct: total > 0 ? Math.round((counts[a] / total) * 100) : 0,
        harData: total > 0,
      }));
      return { id: g.id, navn: g.name, antallMedlemmer: memberIds.length, rader };
    }),
  );

  const data: AdminLagSnittV2Data = { grupper: lag };

  return <AdminLagSnittV2 data={data} />;
}
