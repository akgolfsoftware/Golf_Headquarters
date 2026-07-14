/**
 * Teknisk plan — Plan-builder (PlayerHQ)
 * Implementering av "AK Golf Plan-builder.html" fra design-bundle.
 *
 * Venstre kolonne: P-posisjoner (kollapsible) med oppgave-kort.
 * Høyre sidebar: Plan-sammendrag, TM-mål per kølle, Pyramide-fordeling, Coach & aktivitet.
 *
 * NB: Drag-and-drop er ikke aktiv ennå (vises som grip-handles).
 * Server actions for reorder/edit/log kommer i Steg 6.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHead } from "@/components/teknisk-plan/page-head";
import { PRow } from "@/components/teknisk-plan/p-row";
import {
  PlanSummaryCard,
  TrackmanGoalsCard,
  PyramideCard,
  CoachActivityCard,
  type ClubTargetRow,
  type ActivityItem,
} from "@/components/teknisk-plan/sidebar";
import { type PyramidArea, P_POSITIONS, omraadeToTab } from "@/components/teknisk-plan/constants";
import type { OppgaveDraft } from "@/components/teknisk-plan/oppgave-modal";
import "@/components/teknisk-plan/teknisk-plan.css";
import { OppgaveLauncher, type PositionTarget } from "./oppgave-launcher";
import { OppgaveEditLauncher } from "./oppgave-edit-launcher";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ planId: string }>;
}

export default async function PlanBuilderPage({ params }: PageProps) {
  const { planId } = await params;
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const plan = await prisma.technicalPlan.findFirst({
    where: { id: planId, userId: user.id },
    include: {
      opprettetAv: { select: { name: true, role: true } },
      positions: {
        orderBy: { sortOrder: "asc" },
        include: {
          tasks: {
            orderBy: { sortOrder: "asc" },
            include: {
              tmGoals: true,
            },
          },
        },
      },
      clubTargets: { orderBy: { club: "asc" } },
      audits: {
        orderBy: { createdAt: "desc" },
        take: 4,
        include: { actor: { select: { name: true, role: true } } },
      },
    },
  });

  if (!plan) return notFound();

  // Totals
  const allTasks = plan.positions.flatMap((p) => p.tasks);
  const totalCurrent = allTasks.reduce(
    (s, t) => s + (t.repsGjortDry ?? 0) + (t.repsGjortLav ?? 0) + (t.repsGjortFull ?? 0),
    0,
  );
  const totalTarget = allTasks.reduce(
    (s, t) => s + (t.repsMaalDry ?? 0) + (t.repsMaalLav ?? 0) + (t.repsMaalFull ?? 0),
    0,
  );
  const progressPct = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;

  // Pyramide-fordeling — telles fra antall logget reps per pyramide-område
  const pyramideMap: Record<PyramidArea, number> = {
    FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0,
  };
  allTasks.forEach((t) => {
    const reps = (t.repsGjortDry ?? 0) + (t.repsGjortLav ?? 0) + (t.repsGjortFull ?? 0);
    pyramideMap[t.pyramide as PyramidArea] += reps;
  });
  const totalReps = Object.values(pyramideMap).reduce((s, v) => s + v, 0) || 1;
  const pyramideRows = (Object.keys(pyramideMap) as PyramidArea[]).map((k) => ({
    area: k,
    pct: Math.round((pyramideMap[k] / totalReps) * 100),
  }));

  // Club targets
  const clubRows: ClubTargetRow[] = plan.clubTargets.map((ct) => {
    const status: ClubTargetRow["status"] =
      ct.status === "OPPNAADD" ? "OK" : ct.status === "PAA_VEI_KT" ? "PATH" : "TODO";
    return {
      club: ct.club,
      target: (
        <>
          {ct.primaryMetric.toUpperCase()} <strong>
            {ct.primaryGoalMin ? `≥ ${ct.primaryGoalMin}` : ""}
            {ct.primaryGoalMax ? ` ≤ ${ct.primaryGoalMax}` : ""}
          </strong>
        </>
      ),
      status,
    };
  });

  // Activity
  const activity: ActivityItem[] = plan.audits.map((a) => {
    const initials = (a.actor?.name ?? "??")
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    const role = a.actor?.role === "PLAYER" ? "player" : "coach";
    const kind: ActivityItem["kind"] =
      a.action === "TASK_ADD" ? "add" : a.action === "COMMENT" ? "comment" : "edit";
    return {
      kind,
      actorInitials: initials,
      actorRole: role,
      content: (
        <>
          <strong>{a.actor?.name?.split(" ")[0] ?? "Ukjent"}</strong>{" "}
          {actionLabel(a.action)}
        </>
      ),
      timestamp: a.createdAt.toLocaleString("nb-NO", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  });

  // Sort positions by sortOrder; show "hovedfokus" first
  const sortedPositions = [...plan.positions].sort((a, b) => {
    if (a.hovedfokus && !b.hovedfokus) return -1;
    if (!a.hovedfokus && b.hovedfokus) return 1;
    return a.sortOrder - b.sortOrder;
  });

  const periodLabel = formatPeriode(plan.startDato);

  // Standard mål-posisjon for de generiske "Ny oppgave"-knappene: planens
  // hovedfokus/første posisjon, ellers P1.0 fra den kanoniske P-listen.
  const defaultTarget: PositionTarget = sortedPositions[0]
    ? { pNummer: sortedPositions[0].pNummer, pName: sortedPositions[0].navn }
    : { pNummer: P_POSITIONS[0].num, pName: P_POSITIONS[0].name };

  return (
    <div className="tp-scope">
      <PageHead
        crumb={
          <>
            <span>Tren</span>
            <span style={{ color: "hsl(var(--muted-foreground))" }}>›</span>
            <Link href="/portal/tren/teknisk-plan" style={{ color: "hsl(var(--muted-foreground))", textDecoration: "none" }}>
              Tekniske planer
            </Link>
            <span style={{ color: "hsl(var(--muted-foreground))" }}>›</span>
            <b>{plan.navn}</b>
          </>
        }
        title={
          <>
            {plan.navn} <em>· {periodLabel}</em>
          </>
        }
        sub={`${allTasks.length} oppgaver fordelt på ${plan.positions.length} P-posisjoner. Sist oppdatert ${plan.updatedAt.toLocaleDateString("nb-NO", { day: "numeric", month: "short" })}.`}
        actions={
          <>
            <Link className="tp-btn outline" href="/portal/tren/teknisk-plan">Tilbake</Link>
            <OppgaveLauncher
              planId={plan.id}
              target={defaultTarget}
              variant="primary"
              label="Ny oppgave"
            />
          </>
        }
      />

      <main className="tp-builder">
        <section>
          {sortedPositions.length === 0 ? (
            <div className="tp-empty-state">
              <div className="ic" aria-hidden>
                <ChevronRight size={18} />
              </div>
              <div className="body">
                <span className="ttl">Ingen P-posisjoner i denne planen enda.</span>
                <span className="desc">
                  Legg til P-posisjoner (P1.0 – P10.0) som du vil fokusere på i denne perioden.
                </span>
              </div>
              <OppgaveLauncher
                planId={plan.id}
                target={defaultTarget}
                variant="primary"
                label="Legg til oppgave"
              />
            </div>
          ) : null}

          {sortedPositions.map((position, idx) => {
            const tasks = position.tasks;
            const repsCurrent = tasks.reduce(
              (s, t) => s + (t.repsGjortDry ?? 0) + (t.repsGjortLav ?? 0) + (t.repsGjortFull ?? 0),
              0,
            );
            const repsTarget = tasks.reduce(
              (s, t) => s + (t.repsMaalDry ?? 0) + (t.repsMaalLav ?? 0) + (t.repsMaalFull ?? 0),
              0,
            );
            const newCount = tasks.filter((t) => isNewThisWeek(t.createdAt)).length;
            const lastUpdated = tasks
              .map((t) => t.updatedAt.getTime())
              .reduce((max, v) => (v > max ? v : max), 0);
            const lastUpdatedStr = lastUpdated
              ? new Date(lastUpdated).toLocaleTimeString("nb-NO", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";

            return (
              <PRow
                key={position.id}
                pNumber={position.pNummer}
                pName={position.navn}
                prio={idx + 1}
                taskCount={tasks.length}
                newCount={newCount}
                lastUpdated={lastUpdatedStr}
                repsCurrent={repsCurrent}
                repsTarget={repsTarget}
                highPrio={position.hovedfokus}
                defaultOpen={idx === 0}
              >
                {tasks.map((t, i) => {
                  const hitRateGoals = t.tmGoals.filter((g) => g.targetType === "HIT_RATE");
                  const spreadGoals = t.tmGoals.filter((g) => g.targetType !== "HIT_RATE");
                  const draft: OppgaveDraft = {
                    id: t.id,
                    pNummer: position.pNummer,
                    pName: position.navn,
                    tittel: t.tittel,
                    beskrivelse: t.beskrivelse ?? "",
                    pyramide: t.pyramide as PyramidArea,
                    omraadeTab: omraadeToTab(t.omraade),
                    omraade: t.omraade,
                    koller: t.koller,
                    lFase: t.lFase ?? undefined,
                    cs: t.cs ?? undefined,
                    m: t.miljo ?? undefined,
                    pr: t.prPress ?? undefined,
                    kategori: t.kategori ?? undefined,
                    bildeUrl: t.bildeUrl ?? undefined,
                    videoUrl: t.videoUrl ?? undefined,
                    repsMaalDry: t.repsMaalDry,
                    repsMaalLav: t.repsMaalLav,
                    repsMaalFull: t.repsMaalFull,
                    repsGjortDry: t.repsGjortDry,
                    repsGjortLav: t.repsGjortLav,
                    repsGjortFull: t.repsGjortFull,
                    tmGoals: spreadGoals.map((g) => ({
                      id: g.id,
                      metric: g.metric,
                      klubb: g.klubb,
                      baselineValue: g.baselineValue,
                      targetValue: g.targetValue,
                      targetType: (g.targetType === "SECONDARY" ? "SECONDARY" : g.targetType === "CAUSAL" ? "CAUSAL" : "PRIMARY") as
                        | "PRIMARY"
                        | "SECONDARY"
                        | "CAUSAL",
                      comparison: g.comparison as "LESS_THAN" | "GREATER_THAN" | "RANGE" | "EQUAL",
                    })),
                    hitRateGoals: hitRateGoals.map((g) => ({
                      id: g.id,
                      metric: g.metric,
                      klubb: g.klubb,
                      protocol: (g.protocol ?? "ROLLING_WINDOW") as OppgaveDraft["hitRateGoals"][number]["protocol"],
                      corridorMin: g.corridorMin ?? "",
                      corridorMax: g.corridorMax ?? "",
                      requiredHits: g.requiredHits ?? "",
                      windowSize: g.windowSize ?? "",
                      currentHits: g.currentHits ?? undefined,
                      currentBatchSize: g.currentBatchSize ?? undefined,
                      bestHits: g.bestHits ?? undefined,
                      currentStreak: g.currentStreak ?? undefined,
                      inTarget: g.inTarget,
                    })),
                    drillIds: [],
                  };
                  return (
                    <OppgaveEditLauncher
                      key={t.id}
                      taskId={t.id}
                      draft={draft}
                      cardProps={{
                        prio: i + 1,
                        tittel: t.tittel,
                        pyramide: t.pyramide as PyramidArea,
                        omraade: t.omraade,
                        koller: t.koller,
                        lFase: t.lFase ?? undefined,
                        cs: t.cs ?? undefined,
                        m: t.miljo ?? undefined,
                        pr: t.prPress ?? undefined,
                        reps: {
                          dry: { current: t.repsGjortDry, target: t.repsMaalDry },
                          lav: { current: t.repsGjortLav, target: t.repsMaalLav },
                          full: { current: t.repsGjortFull, target: t.repsMaalFull },
                        },
                        isNew: isNewThisWeek(t.createdAt),
                      }}
                    />
                  );
                })}
                {tasks.length === 0 ? (
                  <OppgaveLauncher
                    planId={plan.id}
                    target={{ pNummer: position.pNummer, pName: position.navn }}
                    variant="ghost-dashed"
                    label={`Legg til oppgave i ${position.pNummer}`}
                  />
                ) : null}
              </PRow>
            );
          })}
        </section>

        <aside className="sidebar">
          <PlanSummaryCard
            status={plan.status === "ACTIVE" ? "AKTIV" : plan.status === "DRAFT" ? "UTKAST" : "ARKIVERT"}
            progressPct={progressPct}
            repsCurrent={totalCurrent}
            repsTarget={totalTarget}
            activePCount={plan.positions.length}
            activePTotal={10}
            taskCount={allTasks.length}
            taskNewCount={allTasks.filter((t) => isNewThisWeek(t.createdAt)).length}
            repsThisWeek={Math.round(totalCurrent / 14) * 7}
            estimertFerdig={
              totalTarget > 0 && totalCurrent > 0
                ? estimateFerdig(plan.startDato, totalCurrent, totalTarget)
                : undefined
            }
          />
          {clubRows.length > 0 ? <TrackmanGoalsCard rows={clubRows} /> : null}
          <PyramideCard rows={pyramideRows} />
          <CoachActivityCard
            coachName={plan.opprettetAv?.name ?? "Coach"}
            coachRole="HEAD COACH · AK GOLF ACADEMY"
            coachInitials={
              (plan.opprettetAv?.name ?? "??")
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()
            }
            items={activity}
          />
        </aside>
      </main>
    </div>
  );
}

function formatPeriode(d: Date): string {
  const month = d.getMonth();
  const year = d.getFullYear();
  if (month >= 2 && month <= 5) return `vår ${year}`;
  if (month >= 6 && month <= 8) return `sommer ${year}`;
  if (month >= 9 && month <= 10) return `høst ${year}`;
  return `vinter ${year}/${(year + 1).toString().slice(2)}`;
}

function isNewThisWeek(createdAt: Date): boolean {
  const diff = Date.now() - createdAt.getTime();
  return diff < 7 * 86_400_000;
}

function estimateFerdig(start: Date, current: number, target: number): string {
  if (current <= 0) return "—";
  const now = Date.now();
  const elapsed = now - start.getTime();
  const totalEstimateMs = (elapsed / current) * target;
  const ferdigDate = new Date(start.getTime() + totalEstimateMs);
  return ferdigDate.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
}

function actionLabel(action: string): string {
  switch (action) {
    case "TASK_ADD":
      return "la til ny oppgave";
    case "TASK_EDIT":
      return "redigerte oppgave";
    case "COMMENT":
      return "kommenterte";
    case "PRIO_CHANGE":
      return "endret prioritering";
    case "STATUS_CHANGE":
      return "endret status";
    case "GOAL_ADD":
      return "la til mål";
    default:
      return action;
  }
}
