/**
 * AgencyOS — Teknisk-plan-detalj (`/admin/teknisk-plan/[spillerId]`), v2.
 * Port av `(legacy)/teknisk-plan/[spillerId]/page.tsx` (2026-07-14, AgencyOS
 * Bølge 3.8) — samme datamodell, ny v2-presentasjon i
 * `AdminTekniskPlanDetaljV2`.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminTekniskPlanDetaljV2, type DrillAggV2, type FaseGruppeV2, type TekOktV2 } from "@/components/admin/v2/AdminTekniskPlanDetaljV2";

export const dynamic = "force-dynamic";

const NB_SHORT = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "short" });
const LFASE_LABELS: Record<string, string> = { GRUNN: "Grunnfase", SPESIAL: "Spesialfase", TURNERING: "Turneringsfase" };

function formatHcp(v: number | null | undefined): string {
  if (v == null) return "—";
  const sign = v >= 0 ? "+" : "−";
  return `${sign}${Math.abs(v).toFixed(1).replace(".", ",")}`;
}

export default async function TekniskPlanSpillerPage({ params }: { params: Promise<{ spillerId: string }> }) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { spillerId } = await params;

  const spiller = await prisma.user.findUnique({
    where: { id: spillerId },
    include: {
      trainingPlans: {
        where: { isActive: true },
        include: {
          sessions: {
            where: { pyramidArea: "TEK" },
            include: {
              drills: { include: { exercise: { select: { name: true, description: true, pyramidArea: true, lPhase: true } } }, orderBy: { orderIndex: "asc" } },
              log: { select: { csAchieved: true, rating: true, startedAt: true, completedAt: true, coachFeedback: true } },
            },
            orderBy: { scheduledAt: "asc" },
          },
        },
        orderBy: { startDate: "desc" },
      },
    },
  });

  if (!spiller || spiller.role !== "PLAYER") notFound();

  const allTekSessions = spiller.trainingPlans.flatMap((p) => p.sessions.map((s) => ({ ...s, planName: p.name, planId: p.id })));

  const faseMap = new Map<string, typeof allTekSessions>();
  for (const s of allTekSessions) {
    const key = s.lPhase ?? "UTEN_FASE";
    const existing = faseMap.get(key) ?? [];
    existing.push(s);
    faseMap.set(key, existing);
  }

  const faseGrupper: FaseGruppeV2[] = Array.from(faseMap.entries()).map(([fase, sessions]) => ({
    fase,
    label: LFASE_LABELS[fase] ?? "Uten fase",
    okter: sessions.map((s): TekOktV2 => {
      const varighet = s.log?.completedAt && s.log?.startedAt
        ? Math.max(1, Math.round((s.log.completedAt.getTime() - s.log.startedAt.getTime()) / 60000))
        : s.durationMin;
      return {
        id: s.id,
        dato: NB_SHORT.format(s.scheduledAt),
        varighetMin: varighet,
        tittel: s.title,
        antallOvelser: s.drills.length,
        planNavn: s.planName,
        csAchieved: s.log?.csAchieved ?? null,
        status: s.status,
      };
    }),
  }));

  const drillMap = new Map<string, { count: number; csSum: number; csCount: number; lPhase: string | null }>();
  for (const s of allTekSessions) {
    for (const d of s.drills) {
      const key = d.exercise.name;
      const existing = drillMap.get(key) ?? { count: 0, csSum: 0, csCount: 0, lPhase: d.exercise.lPhase ?? null };
      existing.count += 1;
      if (s.log?.csAchieved != null) { existing.csSum += s.log.csAchieved; existing.csCount += 1; }
      drillMap.set(key, existing);
    }
  }
  const drillAgg: DrillAggV2[] = Array.from(drillMap.entries()).map(([name, data]) => ({
    name,
    lPhase: data.lPhase,
    antall: data.count,
    snittCs: data.csCount > 0 ? Math.round(data.csSum / data.csCount) : null,
  }));

  const fullfortAntall = allTekSessions.filter((s) => s.status === "COMPLETED").length;

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminTekniskPlanDetaljV2
        spillerId={spiller.id}
        spillerNavn={spiller.name}
        hcpTekst={formatHcp(spiller.hcp)}
        hjemmeklubb={spiller.homeClub}
        antallTekOkter={allTekSessions.length}
        fullfortAntall={fullfortAntall}
        drillAgg={drillAgg}
        faseGrupper={faseGrupper}
        harData={allTekSessions.length > 0}
      />
    </V2Shell>
  );
}
