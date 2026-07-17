/**
 * PlayerHQ · Plan-feiring (/portal/tren/feiring/[planId]) — v2.
 * v2-port 17. juli 2026 (Team D2): `FeiringV2` erstatter legacy-siden, ruten
 * flyttet ut av (legacy). Auth/eierskaps-sjekk, fullført-guarden (redirect til
 * /portal/tren hvis planen ikke er ferdig), best-effort computeEffectiveness
 * og rekord-sammenligningen mot tidligere planer er uendret — kun
 * presentasjonslaget er nytt.
 */

import { notFound, redirect } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { computeEffectiveness } from "@/lib/ai-plan/effectiveness";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { FeiringV2 } from "@/components/portal/v2/FeiringV2";

type Params = Promise<{ planId: string }>;

export default async function PlanFeiring({ params }: { params: Params }) {
  const user = await requirePortalUser();
  const { planId } = await params;

  const plan = await prisma.trainingPlan.findUnique({
    where: { id: planId },
    select: {
      id: true,
      userId: true,
      name: true,
      startDate: true,
      endDate: true,
      status: true,
      sessions: {
        select: { id: true, status: true },
      },
    },
  });
  if (!plan) notFound();

  // Bare eier eller coach kan se siden.
  const erEier = plan.userId === user.id;
  const erCoach = user.role === "COACH" || user.role === "ADMIN";
  if (!erEier && !erCoach) redirect("/portal/tren");

  // Sjekk om planen faktisk er fullført. Hvis ikke, redirect tilbake.
  if (plan.status !== "ARCHIVED" && plan.sessions.length > 0) {
    const alle = plan.sessions.length;
    const ferdige = plan.sessions.filter((s) => s.status === "COMPLETED").length;
    if (ferdige !== alle) {
      redirect("/portal/tren");
    }
  }

  // Forsøk å hente PlanEffectiveness. Hvis den ikke finnes ennå, regn den ut
  // best-effort her — feiringssiden bør alltid kunne vise data.
  let eff = await prisma.planEffectiveness.findUnique({ where: { planId } });
  if (!eff) {
    try {
      eff = await computeEffectiveness(planId);
    } catch (err) {
      console.error("[feiring] computeEffectiveness failed", err);
    }
  }

  const totalSesjoner = plan.sessions.length;
  const ferdigeSesjoner = plan.sessions.filter(
    (s) => s.status === "COMPLETED",
  ).length;

  const prosent =
    totalSesjoner > 0 ? Math.round((ferdigeSesjoner / totalSesjoner) * 100) : 0;

  // Personlig rekord — sammenlign SG-Total-delta med tidligere planer.
  const tidligere = await prisma.planEffectiveness.findMany({
    where: { userId: plan.userId, planId: { not: planId } },
    orderBy: { computedAt: "desc" },
    select: { sgTotalDelta: true },
    take: 20,
  });
  const tidligereSgTotal = tidligere
    .map((t) => t.sgTotalDelta)
    .filter((v): v is number => v !== null);
  const personligRekord =
    tidligereSgTotal.length === 0 ? null : Math.max(...tidligereSgTotal);
  const erRekord =
    eff?.sgTotalDelta !== null &&
    eff?.sgTotalDelta !== undefined &&
    personligRekord !== null &&
    eff.sgTotalDelta > personligRekord;

  return (
    <V2Shell aktiv="gjor" nav={PLAYERHQ_NAV} navn={user.name ?? undefined} avatarUrl={user.avatarUrl}>
      <FeiringV2
        data={{
          planNavn: plan.name,
          prosent,
          ferdige: ferdigeSesjoner,
          total: totalSesjoner,
          erRekord,
          eff: eff
            ? {
                total: eff.sgTotalDelta,
                ott: eff.sgOttDelta,
                app: eff.sgAppDelta,
                arg: eff.sgArgDelta,
                putt: eff.sgPuttDelta,
              }
            : null,
          personligRekord,
          antallPlaner: tidligere.length + 1,
        }}
      />
    </V2Shell>
  );
}
