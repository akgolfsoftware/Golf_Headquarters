/**
 * AgencyOS — Lag-snitt (`/admin/lag-snitt`), v2.
 * Port av `(legacy)/lag-snitt/page.tsx` (2026-07-14, AgencyOS Bølge 3.4) —
 * samme datamodell (COMPLETED TrainingPlanSession gruppert på pyramidArea
 * per gruppe), ny v2-presentasjon i `AdminLagSnittV2`.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminLagSnittV2, type AdminLagSnittV2Lag } from "@/components/admin/v2/AdminLagSnittV2";
import type { AkseKey } from "@/lib/v2/tokens";

export const dynamic = "force-dynamic";
export const metadata = { title: "Lag-snitt · AgencyOS (v2)" };

const AKSER: { key: AkseKey; label: string }[] = [
  { key: "TURN", label: "Turnering" },
  { key: "SPILL", label: "Spill" },
  { key: "SLAG", label: "Golfslag" },
  { key: "TEK", label: "Teknisk" },
  { key: "FYS", label: "Fysisk" },
];

export default async function LagSnittPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const grupper = await prisma.group.findMany({
    select: { id: true, name: true, members: { select: { userId: true } } },
    orderBy: { name: "asc" },
  });

  const lag: AdminLagSnittV2Lag[] = await Promise.all(
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

      const total = AKSER.reduce((s, a) => s + counts[a.key], 0);
      const rader = AKSER.map((a) => {
        const pct = total > 0 ? Math.round((counts[a.key] / total) * 100) : 0;
        return { label: a.label, akse: a.key, pct, value: total > 0 ? `${pct} %` : "—" };
      });
      return { id: g.id, navn: g.name, antallMedlemmer: memberIds.length, rader };
    }),
  );

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminLagSnittV2 lag={lag} />
    </V2Shell>
  );
}
