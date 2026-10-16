/**
 * PlayerHQ · Plan-feiring (/portal/tren/feiring/[planId]).
 * PH07Feiring i PlayerHQSkall. Auth, eierskap og best-effort computeEffectiveness er uendret.
 * Tegningsfilen ui_kits/playerhq/screens/PH-07.jsx ligger ikke i git.
 * Registeret knytter ruten til skjermtype PH-07. Økt etter økt er en annen flate.
 */

import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { computeEffectiveness } from "@/lib/ai-plan/effectiveness";
import { logError } from "@/lib/error-tracking";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
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
      createdById: true,
      sessions: {
        select: { id: true, status: true, durationMin: true, pyramidArea: true },
      },
    },
  });
  if (!plan) notFound();

  // Bare eier eller coach kan se siden.
  const erEier = plan.userId === user.id;
  const erCoach = user.role === "COACH" || user.role === "ADMIN";
  if (!erEier && !erCoach) redirect("/portal/tren");

  const uleste = await getUnreadNotifications(user.id, 1);
  const skall = (barn: ReactNode) => (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <div className="pa-side">{barn}</div>
    </PlayerHQSkall>
  );

  const totalSesjoner = plan.sessions.length;
  const ferdigeSesjoner = plan.sessions.filter(
    (s) => s.status === "COMPLETED",
  ).length;
  const prosent =
    totalSesjoner > 0 ? Math.round((ferdigeSesjoner / totalSesjoner) * 100) : 0;

  // Fullført-guard (fasit): er planen ikke ferdig, vis ærlig fremdrift —
  // ingen fest, én vei videre. Ingen redirect.
  const ikkeFerdig =
    plan.status !== "ARCHIVED" &&
    totalSesjoner > 0 &&
    ferdigeSesjoner !== totalSesjoner;

  if (ikkeFerdig) {
    return skall(
        <FeiringV2
          data={{
            planNavn: plan.name,
            prosent,
            ferdige: ferdigeSesjoner,
            total: totalSesjoner,
            timer: null,
            uker: null,
            pyramideTopp: null,
            publisertAv: null,
            forrigeEtterlevelse: null,
            erRekord: false,
            sgTotalDelta: null,
            ikkeFerdig: true,
          }}
        />
    );
  }

  // Forsøk å hente PlanEffectiveness. Hvis den ikke finnes ennå, regn den ut
  // best-effort her — feiringssiden bør alltid kunne vise data.
  let eff = await prisma.planEffectiveness.findUnique({ where: { planId } });
  if (!eff) {
    try {
      eff = await computeEffectiveness(planId);
    } catch (error) {
      await logError({
        context: "feiring.computeEffectiveness",
        error,
        meta: { planId },
        severity: "warn",
      });
    }
  }

  // Treningstimer — sum av fullførte økters varighet. 0 → utelat raden.
  const minutter = plan.sessions
    .filter((s) => s.status === "COMPLETED")
    .reduce((sum, s) => sum + s.durationMin, 0);
  const timer = minutter > 0 ? Math.round(minutter / 60) : null;

  // Uker i perioden — krever sluttdato.
  const uker = plan.endDate
    ? Math.max(
        1,
        Math.round(
          (plan.endDate.getTime() - plan.startDate.getTime()) /
            (7 * 24 * 60 * 60 * 1000),
        ),
      )
    : null;

  // Størst volum — pyramideområdet med flest planlagte minutter.
  const volumPerOmrade = new Map<string, number>();
  for (const s of plan.sessions) {
    volumPerOmrade.set(
      s.pyramidArea,
      (volumPerOmrade.get(s.pyramidArea) ?? 0) + s.durationMin,
    );
  }
  let pyramideTopp: string | null = null;
  let maksVolum = 0;
  for (const [omrade, vol] of volumPerOmrade) {
    if (vol > maksVolum) {
      maksVolum = vol;
      pyramideTopp = omrade;
    }
  }

  // Publisert av — coach-navnet når planen er opprettet av coach.
  let publisertAv: string | null = null;
  if (plan.createdById) {
    const coach = await prisma.user.findUnique({
      where: { id: plan.createdById },
      select: { name: true },
    });
    publisertAv = coach?.name ?? null;
  }

  // Tidligere planer — rekord (SG-Total) + forrige plans etterlevelse.
  const tidligere = await prisma.planEffectiveness.findMany({
    where: { userId: plan.userId, planId: { not: planId } },
    orderBy: { computedAt: "desc" },
    select: { sgTotalDelta: true, completionRate: true },
    take: 20,
  });
  const forrigeEtterlevelse =
    tidligere.length > 0 ? Math.round(tidligere[0].completionRate * 100) : null;
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

  return skall(
      <FeiringV2
        data={{
          planNavn: plan.name,
          prosent,
          ferdige: ferdigeSesjoner,
          total: totalSesjoner,
          timer,
          uker,
          pyramideTopp,
          publisertAv,
          forrigeEtterlevelse,
          erRekord,
          sgTotalDelta: eff?.sgTotalDelta ?? null,
          ikkeFerdig: false,
        }}
      />
  );
}
