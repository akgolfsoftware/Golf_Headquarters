/**
 * Teknisk plan — Plan-builder (PlayerHQ) · v2.
 *
 * v2-port (2026-07-18): presentasjonen er rekomponert til v2-kanonspråket
 * (V2Shell + Kort/Caps/Tittel/StatusPill/KpiFlis/TomTilstand + T-tokens + Icon +
 * HjelpTips). ALL datalogikk — auth, Prisma-loaderen og de avledede totalene/
 * fordelingene — er bevart 1:1 fra legacy. Flyttet ut av (legacy)-gruppen så
 * skjermen eier sin egen V2Shell-chrome i stedet for den gamle PortalShell.
 *
 * Venstre: P-posisjoner (kollapsible) med oppgavekort. Høyre: Plan-sammendrag,
 * TrackMan-mål per kølle, Pyramide-fordeling, Coach & aktivitet.
 * OppgaveModal (skjema) og server actions (createTask/updateTaskBasics/logReps)
 * er uendret. Drag-and-drop er fortsatt ikke aktiv (grip-håndtak vises).
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { T } from "@/lib/v2/tokens";
import { Caps, Tittel, Kort, KpiFlis, StatusPill, TilbakeLenke, type StatusTone } from "@/components/v2";
import {
  PPosisjonSeksjon,
  PlanSammendragKort,
  TrackmanMaalKort,
  PyramideFordelingKort,
  CoachAktivitetKort,
  TomPlan,
  type PyramidArea,
  type KolleMaalRad,
  type KolleStatus,
  type AktivitetRad,
} from "@/components/portal/v2/TekniskPlanV2";
import { P_POSITIONS, omraadeToTab } from "@/components/teknisk-plan/constants";
import type { OppgaveDraft } from "@/components/teknisk-plan/oppgave-modal";
// Beholdes KUN for OppgaveModal-ens egne tp-*-klasser (tp-btn/tp-tag/tp-task) —
// v2-presentasjonen under bruker ingen tp-klasser, og reglene er .tp-scopet.
import "@/components/teknisk-plan/teknisk-plan.css";
import { OppgaveLauncher, type PositionTarget } from "./oppgave-launcher";
import { OppgaveEditLauncher } from "./oppgave-edit-launcher";
import { TekniskPlanFullsvingShell } from "@/components/portal/v2/TekniskPlanFullsvingShell";
import { erFullsving } from "@/lib/teknisk-plan/fullsving";

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
  const clubRows: KolleMaalRad[] = plan.clubTargets.map((ct) => {
    const status: KolleStatus =
      ct.status === "OPPNAADD" ? "OK" : ct.status === "PAA_VEI_KT" ? "PATH" : "TODO";
    return {
      club: ct.club,
      metric: ct.primaryMetric,
      goalMin: ct.primaryGoalMin ? String(ct.primaryGoalMin) : undefined,
      goalMax: ct.primaryGoalMax ? String(ct.primaryGoalMax) : undefined,
      status,
    };
  });

  // Activity
  const activity: AktivitetRad[] = plan.audits.map((a) => {
    const kind: AktivitetRad["kind"] =
      a.action === "TASK_ADD" ? "add" : a.action === "COMMENT" ? "comment" : "edit";
    return {
      kind,
      actorName: a.actor?.name ?? "Ukjent",
      actorFirstName: a.actor?.name?.split(" ")[0] ?? "Ukjent",
      actionLabel: actionLabel(a.action),
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

  const fullsvingTasks = allTasks
    .filter((t) => erFullsving(t.slagType))
    .map((t) => {
      const pos = plan.positions.find((p) => p.tasks.some((x) => x.id === t.id));
      return {
        id: t.id,
        tittel: t.tittel,
        pNummer: pos?.pNummer ?? "—",
        koller: t.koller,
        goals: t.tmGoals
          .filter((g) => g.targetType !== "HIT_RATE")
          .map((g) => ({
            id: g.id,
            metric: g.metric,
            baseline: g.baselineValue,
            target: g.targetValue,
            current: g.currentValue,
            progressPct: g.progressPct,
            inTarget: g.inTarget,
            lastUpdated: g.lastUpdated
              ? g.lastUpdated.toLocaleDateString("nb-NO", { day: "numeric", month: "short" })
              : null,
          })),
      };
    });

  const periodLabel = formatPeriode(plan.startDato);

  // Standard mål-posisjon for de generiske "Ny oppgave"-knappene: planens
  // hovedfokus/første posisjon, ellers P1.0 fra den kanoniske P-listen.
  const defaultTarget: PositionTarget = sortedPositions[0]
    ? { pNummer: sortedPositions[0].pNummer, pName: sortedPositions[0].navn }
    : { pNummer: P_POSITIONS[0].num, pName: P_POSITIONS[0].name };

  const statusLabel = plan.status === "ACTIVE" ? "AKTIV" : plan.status === "DRAFT" ? "UTKAST" : "ARKIVERT";
  const statusTone: StatusTone = plan.status === "ACTIVE" ? "up" : plan.status === "DRAFT" ? "info" : "warn";

  return (
    <V2Shell aktiv="plan" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {/* Hode */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <Caps>Tren · Teknisk plan</Caps>
            <div style={{ marginTop: 10 }}>
              <Tittel em={`· ${periodLabel}`}>{plan.navn}</Tittel>
            </div>
            <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "10px 0 0" }}>
              {allTasks.length} oppgaver fordelt på {plan.positions.length} P-posisjoner · sist oppdatert{" "}
              {plan.updatedAt.toLocaleDateString("nb-NO", { day: "numeric", month: "short" })}.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <TilbakeLenke href="/portal/tren/teknisk-plan">Tekniske planer</TilbakeLenke>
            <OppgaveLauncher planId={plan.id} target={defaultTarget} variant="primary" label="Ny oppgave" />
          </div>
        </div>

        {/* KPI-strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: T.gap }}>
          <Kort>
            <Caps size={9}>Status</Caps>
            <div style={{ marginTop: 14 }}>
              <StatusPill tone={statusTone}>{statusLabel}</StatusPill>
            </div>
          </Kort>
          <KpiFlis label="P-posisjoner" value={String(plan.positions.length)} hjelp="pPosisjon" instant />
          <KpiFlis label="Oppgaver" value={String(allTasks.length)} instant />
          <KpiFlis label="Reps logget" value={totalCurrent.toLocaleString("nb-NO")} hjelp="planEtterlevelse" />
        </div>

        {/* Innhold: posisjoner + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr]" style={{ gap: T.gap }}>
          <section style={{ display: "flex", flexDirection: "column", gap: T.gap, minWidth: 0 }}>
            <TekniskPlanFullsvingShell fullsvingTasks={fullsvingTasks}>
              {({ onlyFullsving }) => (
                <>
            {sortedPositions.length === 0 ? (
              <TomPlan>
                <OppgaveLauncher planId={plan.id} target={defaultTarget} variant="primary" label="Legg til oppgave" />
              </TomPlan>
            ) : null}

            {sortedPositions
              .filter((position) =>
                !onlyFullsving ||
                position.tasks.some((t) => erFullsving(t.slagType)),
              )
              .map((position, idx) => {
              const tasks = onlyFullsving
                ? position.tasks.filter((t) => erFullsving(t.slagType))
                : position.tasks;
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
                <PPosisjonSeksjon
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
                </PPosisjonSeksjon>
              );
            })}
                </>
              )}
            </TekniskPlanFullsvingShell>
          </section>

          <aside style={{ display: "flex", flexDirection: "column", gap: T.gap, minWidth: 0 }}>
            <PlanSammendragKort
              status={statusLabel}
              statusTone={statusTone}
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
            {clubRows.length > 0 ? <TrackmanMaalKort rows={clubRows} /> : null}
            <PyramideFordelingKort rows={pyramideRows} />
            <CoachAktivitetKort
              coachName={plan.opprettetAv?.name ?? "Coach"}
              coachRole="Head coach · AK Golf Academy"
              items={activity}
            />
          </aside>
        </div>
      </div>
    </V2Shell>
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
