import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, CalendarClock } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import {
  aggregateByArea,
  prosentPerArea,
  totalMinutter,
} from "@/lib/pyramide";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PlanActions } from "./plan-actions";
import { DraggableSessions, type DraggableSession } from "./draggable-sessions";
import { RejectedBanner } from "./rejected-banner";
import { AddSessionModal } from "@/components/admin/add-session-wizard";
import { buildFaser } from "./_faser";
import { FaseTimeline } from "./_timeline";
import { PhaseCard } from "./_phase-card";
import { KpiCard } from "./_kpi-card";
import { PyramideFordeling } from "./_pyramide-fordeling";
import {
  CompletedSessions,
  type CompletedSession,
} from "./_completed-sessions";

export default async function AdminPlanDetalj({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const me = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { planId } = await params;

  const plan = await prisma.trainingPlan.findUnique({
    where: { id: planId },
    include: {
      user: { select: { id: true, name: true, hcp: true, tier: true } },
      sessions: {
        include: {
          drills: { include: { exercise: true }, orderBy: { orderIndex: "asc" } },
          log: true,
        },
        orderBy: { scheduledAt: "asc" },
      },
    },
  });
  if (!plan) notFound();

  // Alle drills for wizard
  const exercises = await prisma.exerciseDefinition.findMany({
    orderBy: [{ pyramidArea: "asc" }, { name: "asc" }],
  });

  // Liste over alle spillere — brukes av Kopier-plan-modal
  const spillere = await prisma.user.findMany({
    where: { role: "PLAYER" },
    select: { id: true, name: true, hcp: true, homeClub: true },
    orderBy: { name: "asc" },
  });

  // ── Avledet data ────────────────────────────────────────────────
  const totalt = plan.sessions.length;
  const fullført = plan.sessions.filter((s) => s.status === "COMPLETED").length;
  const aktiv = plan.sessions.filter((s) => s.status === "ACTIVE").length;
  const gjennomforing = totalt === 0 ? 0 : Math.round((fullført / totalt) * 100);
  const totMinutter = totalMinutter(aggregateByArea(plan.sessions));
  const totTimer = (totMinutter / 60).toFixed(1).replace(".", ",");
  const fordeling = prosentPerArea(aggregateByArea(plan.sessions));

  // Serialiserbar liste av alle ikke-fullførte økter, til drag-and-drop
  const draggableSessions: DraggableSession[] = plan.sessions
    .filter((s) => s.status !== "COMPLETED")
    .map((s) => ({
      id: s.id,
      scheduledAt: s.scheduledAt.toISOString(),
      durationMin: s.durationMin,
      title: s.title,
      pyramidArea: s.pyramidArea,
      skillArea: s.skillArea ?? null,
      environment: s.environment ?? null,
      lPhase: s.lPhase ?? null,
      status: s.status,
      drillCount: s.drills.length,
      rationale: s.rationale ?? null,
    }));

  // Faser = grupper økter per kalenderuke i planens varighet
  const faser = buildFaser(plan.sessions);

  // Fullførte økter — coach kan sende feedback
  const fullforteSessions: CompletedSession[] = plan.sessions
    .filter((s) => s.status === "COMPLETED" && s.log != null)
    .sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime())
    .slice(0, 8)
    .map((s) => ({
      id: s.id,
      title: s.title,
      scheduledAt: s.scheduledAt,
      durationMin: s.durationMin,
      pyramidArea: s.pyramidArea,
      log: s.log
        ? {
            startedAt: s.log.startedAt,
            completedAt: s.log.completedAt,
            csAchieved: s.log.csAchieved,
            rating: s.log.rating,
            coachFeedback: s.log.coachFeedback,
            coachFeedbackAt: s.log.coachFeedbackAt,
          }
        : null,
    }));

  // Periode-tekst
  const periodeFra = plan.startDate.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
  });
  const periodeTil = plan.endDate
    ? plan.endDate.toLocaleDateString("nb-NO", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "åpen";

  const planTittel = plan.name.trim() || "Treningsplan";

  return (
    <div className="space-y-6">
      <Link
        href="/admin/plans"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.8} />
        Alle planer
      </Link>

      <PageHeader
        eyebrow={`Treningsplaner · ${plan.user.name}${
          plan.user.hcp != null ? ` · HCP ${plan.user.hcp}` : ""
        } · ${plan.isActive ? "Aktiv" : "Inaktiv"}`}
        titleItalic={planTittel}
        sub={`${periodeFra} – ${periodeTil} · ${totalt} økter totalt · ${totTimer} t volum`}
        actions={
          <PlanActions
            planId={plan.id}
            isActive={plan.isActive}
            isAdmin={me.role === "ADMIN"}
            originalPlanNavn={plan.name}
            originalUserId={plan.userId}
            spillere={spillere}
          />
        }
      />

      {plan.status === "REJECTED" && plan.playerComment && (
        <RejectedBanner
          planId={plan.id}
          playerComment={plan.playerComment}
          playerName={plan.user.name}
        />
      )}

      <FaseTimeline faser={faser} />

      {/* ── Hovedgrid: faser-kort + KPI/kommende økter ─────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1fr]">
        {/* Venstre: faser-kort */}
        <div className="flex flex-col gap-4">
          {faser.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              titleItalic="Ingen økter"
              titleTrail="lagt til ennå"
              sub="Legg til økter for å bygge fase-strukturen og pyramide-vektingen."
            />
          ) : (
            faser.map((f, idx) => (
              <PhaseCard
                key={f.key}
                num={`Uke ${idx + 1}`}
                statusTone={f.status}
                name={f.ukeLabel}
                dates={f.dateRangeLabel}
                pct={
                  f.totalSessions === 0
                    ? "—"
                    : `${Math.round((f.done / f.totalSessions) * 100)} %`
                }
                pctLabel={f.status === "current" ? "På plan" : "Fullført"}
                pctMuted={f.totalSessions === 0}
                current={f.status === "current"}
                pyr={f.pyrFordeling}
                sessions={[
                  { value: `${f.done}/${f.totalSessions}`, label: "Økter" },
                  {
                    value: `${(f.totMin / 60).toFixed(1).replace(".", ",")} t`,
                    label: "Volum",
                  },
                  {
                    value:
                      f.totalSessions === 0
                        ? "—"
                        : `${Math.round((f.done / f.totalSessions) * 100)} %`,
                    label: "Adherence",
                  },
                  {
                    value: f.dominantArea ?? "—",
                    label: "Fokus",
                  },
                ]}
              />
            ))
          )}
        </div>

        {/* Høyre: KPI + kommende økter */}
        <aside className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            <KpiCard
              label="Total tid"
              value={`${totTimer} t`}
              sub={`${totMinutter} min planlagt`}
            />
            <KpiCard
              label="Økter"
              value={`${totalt}`}
              sub={`${aktiv} aktive · ${fullført} fullført`}
            />
            <KpiCard
              label="Gjennomføring"
              value={`${gjennomforing} %`}
              sub={`${fullført} av ${totalt} fullført`}
            />
            <KpiCard label="SG-utvikling" value="—" sub="Krever round-data" />
          </div>

          <PyramideFordeling fordeling={fordeling} />

          <CompletedSessions
            sessions={fullforteSessions}
            playerName={plan.user.name}
          />

          {/* Kommende økter — drag-and-drop for å flytte mellom uker */}
          <section
            id="plan-okter"
            className="scroll-mt-6 rounded-lg border border-border bg-card p-6"
          >
            <div className="mb-4 flex items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-[16px] font-semibold leading-snug">
                  Kommende økter
                </h3>
                <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Dra for å flytte · Rediger med blyant-ikon
                </span>
              </div>
              <AddSessionModal
                planId={plan.id}
                exercises={exercises}
                triggerLabel="Legg til økt"
              />
            </div>
            <DraggableSessions sessions={draggableSessions} />
          </section>
        </aside>
      </div>
    </div>
  );
}
