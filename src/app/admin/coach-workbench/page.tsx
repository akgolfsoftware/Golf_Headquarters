/**
 * Coach Workbench — Sprint 2-leveranse.
 *
 * Bruker 10 nye komponenter fra src/components/coachhq/workbench/.
 * Modus: individuelt (spiller=<id>) eller gruppe (gruppe=<id>).
 *
 * Når godkjent: erstatter eller utvides under /admin/agencyos.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import {
  CoachWorkbenchTopBar,
  CoachSpillerHero,
  CoachKeyMetrics,
  CoachTabs,
  CoachWorkbenchShell,
  type CoachTab,
} from "@/components/coachhq/workbench";
import { CoachCaddieChat } from "@/components/coachhq/workbench/caddie-chat";
import { IdagPanel } from "@/components/coachhq/workbench/panels/idag-panel";
import { PlanPanel } from "@/components/coachhq/workbench/panels/plan-panel";
import { AnalysePanel } from "@/components/coachhq/workbench/panels/analyse-panel";
import { NotaterPanel } from "@/components/coachhq/workbench/panels/notater-panel";
import { KommunikasjonPanel } from "@/components/coachhq/workbench/panels/kommunikasjon-panel";

export const dynamic = "force-dynamic";

type SearchParams = {
  modus?: "individuelt" | "gruppe";
  spiller?: string;
  gruppe?: string;
  tab?: CoachTab;
};

export default async function CoachWorkbenchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const params = await searchParams;

  const modus = params.modus ?? "individuelt";
  const activeTab: CoachTab = params.tab ?? "idag";

  // Hent alle spillere coach kan se
  const spillere = await prisma.user
    .findMany({
      where: { role: "PLAYER" },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        hcp: true,
        tier: true,
      },
      orderBy: { name: "asc" },
    })
    .catch(() => []);

  // Hent alle grupper coach kan se
  const grupper = await prisma.group
    .findMany({
      where: { coachId: coach.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    })
    .catch(() => []);

  // Velg spiller (default: første)
  const spillerId = params.spiller ?? spillere[0]?.id;
  if (!spillerId) {
    return (
      <div className="mx-auto max-w-2xl p-8 text-center">
        <h1 className="text-2xl font-bold">Ingen spillere tilgjengelig</h1>
        <p className="mt-2 text-muted-foreground">
          Inviter spillere først for å bruke Coach Workbench.
        </p>
      </div>
    );
  }

  // Hent valgt spiller
  const spiller = await prisma.user.findUnique({
    where: { id: spillerId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      tier: true,
      hcp: true,
    },
  });
  if (!spiller) redirect("/admin/coach-workbench");

  // Hent neste turnering
  const nesteTurnering = await prisma.tournamentEntry
    .findFirst({
      where: {
        userId: spillerId,
        entryStatus: { in: ["PLANNED", "CONFIRMED"] },
      },
      include: { tournament: true },
      orderBy: { createdAt: "desc" },
    })
    .catch(() => null);

  // Hent siste runder for SG-snitt
  const recentRounds = await prisma.round
    .findMany({
      where: { userId: spillerId },
      orderBy: { playedAt: "desc" },
      take: 5,
      select: {
        sgTotal: true,
        sgOtt: true,
        sgApp: true,
        sgArg: true,
        sgPutt: true,
        playedAt: true,
      },
    })
    .catch(() => []);

  const sgTotal =
    recentRounds.length > 0
      ? recentRounds
          .map((r) => r.sgTotal ?? 0)
          .reduce((a, b) => a + b, 0) / recentRounds.length
      : null;

  // KPI-data
  const aktivePlan = await prisma.trainingPlan
    .findFirst({
      where: { userId: spillerId, isActive: true },
      select: { id: true, name: true, sessions: { select: { status: true } } },
    })
    .catch(() => null);
  const planAdherence = aktivePlan?.sessions.length
    ? aktivePlan.sessions.filter((s) => s.status === "COMPLETED").length /
      aktivePlan.sessions.length
    : null;

  // Tester overdue (skjelett — TODO: ekte query)
  const testerOverdue = 0;

  // Goals
  const aktiveMaal = await prisma.goal
    .count({ where: { userId: spillerId, status: "ACTIVE" } })
    .catch(() => 0);
  const totaleMaal = await prisma.goal
    .count({ where: { userId: spillerId } })
    .catch(() => 0);

  return (
    <CoachWorkbenchShell
      topBar={
        <CoachWorkbenchTopBar
          modus={modus}
          valgtSpillerId={spillerId}
          valgtGruppeId={params.gruppe}
          spillere={spillere.map((s) => ({
            id: s.id,
            name: s.name,
            avatarUrl: s.avatarUrl ?? undefined,
            hcp: s.hcp ?? null,
          }))}
          grupper={grupper}
        />
      }
      hero={
        <CoachSpillerHero
          spiller={{
            id: spiller.id,
            name: spiller.name,
            avatarUrl: spiller.avatarUrl ?? undefined,
            tier: spiller.tier,
            hcp: spiller.hcp,
            hcpTrend: undefined,
          }}
          nesteTurnering={
            nesteTurnering?.tournament?.startDate
              ? {
                  navn: nesteTurnering.tournament.name ?? "Turnering",
                  dato: nesteTurnering.tournament.startDate,
                }
              : undefined
          }
        />
      }
      metrics={
        <CoachKeyMetrics
          spillerId={spiller.id}
          sgTotal={sgTotal}
          sgTotalTrend="FLAT"
          planAdherence={planAdherence}
          testerOverdue={testerOverdue}
          mal={{ aktive: aktiveMaal, total: totaleMaal || 4 }}
        />
      }
      caddieChat={
        <CoachCaddieChat spillerId={spiller.id} spillerName={spiller.name} />
      }
      tabs={
        <CoachTabs
          active={activeTab}
          spillerId={spiller.id}
          counts={{ kommunikasjon: 0, notater: 0 }}
        />
      }
      tabContent={
        <>
          {activeTab === "idag" && (
            <IdagPanel spillerId={spiller.id} okter={[]} />
          )}
          {activeTab === "plan" && (
            <PlanPanel spillerId={spiller.id} aktivPlan={undefined} />
          )}
          {activeTab === "analyse" && (
            <AnalysePanel
              spillerId={spiller.id}
              hcpUtvikling={[]}
              sg={{
                ott: null,
                app: null,
                arg: null,
                putt: null,
                trend: "FLAT",
                benchmark: "A1",
              }}
              pyramide={{ fys: 0, tek: 0, slag: 0, spill: 0, turn: 0 }}
              sisteTester={[]}
            />
          )}
          {activeTab === "notater" && (
            <NotaterPanel spillerId={spiller.id} notater={[]} />
          )}
          {activeTab === "kommunikasjon" && (
            <KommunikasjonPanel spillerId={spiller.id} meldinger={[]} />
          )}
        </>
      }
    />
  );
}
