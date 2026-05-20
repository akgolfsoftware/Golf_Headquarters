import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BookOpen,
  CalendarClock,
  ChevronLeft,
  ClipboardList,
  FileText,
  TrendingUp,
} from "lucide-react";
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
import { AgentStrip } from "@/components/coachhq/agent-strip";
import {
  CompletedSessions,
  type CompletedSession,
} from "./_completed-sessions";

const TABS = [
  { key: "oversikt", label: "Oversikt", icon: ClipboardList },
  { key: "ovelser", label: "Øvelser", icon: BookOpen },
  { key: "notater", label: "Notater", icon: FileText },
  { key: "rapport", label: "Rapport", icon: TrendingUp },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default async function AdminPlanDetalj({
  params,
  searchParams,
}: {
  params: Promise<{ planId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const me = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { planId } = await params;
  const sp = await searchParams;
  const tab: TabKey = (TABS.map((t) => t.key).includes(sp.tab as TabKey)
    ? sp.tab
    : "oversikt") as TabKey;

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

  // Utvidet spiller-liste for Tildel-modal: inkluderer tier og aktive planer
  // for konflikt-detektor. Vi henter alle PLAYER-brukere og deres aktive planer
  // i én batch så modalen kan vise konflikt-varsel inline per spiller.
  const spillereMedPlaner = await prisma.user.findMany({
    where: { role: "PLAYER" },
    select: {
      id: true,
      name: true,
      hcp: true,
      homeClub: true,
      tier: true,
      trainingPlans: {
        where: { isActive: true, status: { in: ["ACTIVE", "PENDING_PLAYER"] } },
        select: { id: true, name: true },
      },
    },
    orderBy: { name: "asc" },
  });
  const assignSpillere = spillereMedPlaner.map((s) => ({
    id: s.id,
    name: s.name,
    hcp: s.hcp,
    homeClub: s.homeClub,
    tier: s.tier,
    aktivePlaner: s.trainingPlans,
  }));

  // Beregn varighet i uker for modal-header og sluttdato-preview
  const msPerUke = 7 * 24 * 60 * 60 * 1000;
  const planSluttForVarighet =
    plan.endDate ??
    plan.sessions.at(-1)?.scheduledAt ??
    plan.startDate;
  const planVarighetUker = Math.max(
    1,
    Math.round(
      (planSluttForVarighet.getTime() - plan.startDate.getTime()) / msPerUke,
    ),
  );

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
        eyebrow={`Plan · Spiller: ${plan.user.name}${
          plan.user.hcp != null ? ` · HCP ${plan.user.hcp}` : ""
        } · ${plan.status}`}
        titleItalic={planTittel}
        sub={`${periodeFra} – ${periodeTil} · ${totalt} økter totalt · ${fullført} av ${totalt} fullført · ${totTimer} t volum`}
        actions={
          <PlanActions
            planId={plan.id}
            isActive={plan.isActive}
            status={plan.status}
            isAdmin={me.role === "ADMIN"}
            originalPlanNavn={plan.name}
            originalUserId={plan.userId}
            spillere={spillere}
            assignSpillere={assignSpillere}
            planVarighetUker={planVarighetUker}
            planTier={plan.user.tier ?? "PRO"}
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

      <AgentStrip label="Periodiserings-agent">
        Overvåker fasebytter og foreslår justeringer hvis planen sklir.
        Klikk på en fase under for å se status og blokker.
      </AgentStrip>

      <FaseTimeline faser={faser} />

      {/* Tab-navigasjon */}
      <nav className="flex gap-0.5 rounded-lg border border-border bg-secondary p-1">
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = tab === key;
          return (
            <Link
              key={key}
              href={`/admin/plans/${planId}?tab=${key}`}
              className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-[12px] font-medium transition-colors ${
                active
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={13} strokeWidth={1.5} />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Tab: OVERSIKT */}
      {tab === "oversikt" && (
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

            {/* Kommende økter */}
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
      )}

      {/* Tab: ØVELSER */}
      {tab === "ovelser" && (
        <section className="space-y-4">
          {plan.sessions.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              titleItalic="Ingen øvelser"
              titleTrail="lagt til"
              sub="Legg til økter med øvelser via Oversikt-fanen."
            />
          ) : (
            plan.sessions.map((s) => {
              const NB_SHORT = new Intl.DateTimeFormat("nb-NO", {
                day: "2-digit",
                month: "short",
              });
              return (
                <div
                  key={s.id}
                  className="rounded-lg border border-border bg-card"
                >
                  <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-6 py-3">
                    <div>
                      <span className="text-[13px] font-semibold text-foreground">
                        {s.title}
                      </span>
                      <span className="ml-2 font-mono text-[10px] uppercase text-muted-foreground">
                        {s.pyramidArea}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {NB_SHORT.format(s.scheduledAt)} · {s.durationMin} min
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-medium ${
                          s.status === "COMPLETED"
                            ? "bg-primary/10 text-primary"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>
                  </div>
                  {s.drills.length === 0 ? (
                    <p className="px-6 py-4 text-[12px] text-muted-foreground">
                      Ingen øvelser lagt til for denne økten.
                    </p>
                  ) : (
                    <ul className="divide-y divide-border">
                      {s.drills.map((d, i) => (
                        <li
                          key={d.id}
                          className="flex items-center gap-4 px-6 py-3"
                        >
                          <span className="w-5 text-center font-mono text-[10px] text-muted-foreground">
                            {i + 1}
                          </span>
                          <div className="flex-1">
                            <div className="text-[13px] font-medium text-foreground">
                              {d.exercise.name}
                            </div>
                            <div className="font-mono text-[10px] text-muted-foreground">
                              {d.exercise.pyramidArea} · {d.repsSets}
                            </div>
                          </div>
                          {d.notes && (
                            <p className="max-w-xs text-[11px] text-muted-foreground">
                              {d.notes}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })
          )}
        </section>
      )}

      {/* Tab: NOTATER */}
      {tab === "notater" && (
        <section className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Coach-notater · fullførte økter
            </h2>
            {fullforteSessions.filter((s) => s.log?.coachFeedback).length === 0 ? (
              <div className="rounded-md border border-dashed border-border bg-muted/40 p-6 text-center text-[13px] text-muted-foreground">
                Ingen coach-notater ennå. Send feedback på fullførte økter via Oversikt-fanen.
              </div>
            ) : (
              <ol className="relative space-y-6 border-l border-border pl-6">
                {fullforteSessions
                  .filter((s) => s.log?.coachFeedback)
                  .map((s) => {
                    const NB_SHORT = new Intl.DateTimeFormat("nb-NO", {
                      day: "numeric",
                      month: "long",
                    });
                    return (
                      <li key={s.id} className="relative">
                        <span className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full border border-border bg-card" />
                        <div className="mb-1 flex items-center justify-between gap-4">
                          <span className="text-[13px] font-semibold text-foreground">
                            {s.title}
                          </span>
                          <time className="shrink-0 font-mono text-[11px] text-muted-foreground">
                            {s.log?.coachFeedbackAt
                              ? NB_SHORT.format(s.log.coachFeedbackAt)
                              : NB_SHORT.format(s.scheduledAt)}
                          </time>
                        </div>
                        <p className="text-[13px] leading-[1.6] text-foreground">
                          {s.log?.coachFeedback}
                        </p>
                      </li>
                    );
                  })}
              </ol>
            )}
          </div>

          {/* Spiller-notater fra live-logg */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Spiller-notater · live-logger
            </h2>
            {fullforteSessions.filter((s) => s.log && "notes" in s.log && s.log.notes).length === 0 ? (
              <div className="rounded-md border border-dashed border-border bg-muted/40 p-4 text-[13px] text-muted-foreground">
                Ingen spillernotater registrert fra live-logger.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {fullforteSessions
                  .filter((s) => s.log && "notes" in s.log && s.log.notes)
                  .map((s) => (
                    <li key={s.id} className="py-4">
                      <div className="mb-1 font-mono text-[10px] uppercase text-muted-foreground">
                        {s.title} · {new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short" }).format(s.scheduledAt)}
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* Tab: RAPPORT */}
      {tab === "rapport" && (
        <section className="space-y-4">
          {/* KPI-sammendrag */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Total økt-tid
              </div>
              <div className="mt-3 font-mono text-[32px] font-semibold tabular-nums leading-none text-foreground">
                {totTimer} t
              </div>
              <div className="mt-2 text-[12px] text-muted-foreground">
                {totMinutter} min planlagt totalt
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Fullføringsprosent
              </div>
              <div
                className={`mt-3 font-mono text-[32px] font-semibold tabular-nums leading-none ${
                  gjennomforing >= 75
                    ? "text-primary"
                    : gjennomforing >= 50
                      ? "text-foreground"
                      : "text-muted-foreground"
                }`}
              >
                {gjennomforing} %
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${gjennomforing}%` }}
                />
              </div>
              <div className="mt-2 text-[12px] text-muted-foreground">
                {fullført} av {totalt} økter fullført
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Trend
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-mono text-[32px] font-semibold leading-none text-foreground">
                  {gjennomforing >= 75 ? "↑" : gjennomforing >= 50 ? "→" : "↓"}
                </span>
                <span className="text-[13px] text-muted-foreground">
                  {gjennomforing >= 75
                    ? "God fremgang"
                    : gjennomforing >= 50
                      ? "På rett vei"
                      : "Behov for oppfølging"}
                </span>
              </div>
              <div className="mt-2 text-[12px] text-muted-foreground">
                Basert på gjennomføring hittil
              </div>
            </div>
          </div>

          {/* Pyramide-fordeling i rapporten */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Pyramide-fordeling
            </h2>
            <PyramideFordeling fordeling={fordeling} />
          </div>

          {/* Per-uke oppsummering */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Per-uke oppsummering · {faser.length} uker
            </h2>
            {faser.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">Ingen uker i planen ennå.</p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary text-left font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Uke</th>
                      <th className="px-4 py-3 font-medium">Dato</th>
                      <th className="px-4 py-3 text-right font-medium">Volum</th>
                      <th className="px-4 py-3 text-right font-medium">Fullført</th>
                      <th className="px-4 py-3 font-medium">Fokus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {faser.map((f, idx) => (
                      <tr
                        key={f.key}
                        className="border-b border-border last:border-b-0 hover:bg-secondary/40"
                      >
                        <td className="px-4 py-3 font-mono text-[12px] font-semibold text-foreground">
                          Uke {idx + 1}
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                          {f.dateRangeLabel}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-[12px] tabular-nums text-foreground">
                          {(f.totMin / 60).toFixed(1).replace(".", ",")} t
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-[12px] tabular-nums">
                          <span
                            className={
                              f.totalSessions > 0 &&
                              Math.round((f.done / f.totalSessions) * 100) >= 75
                                ? "text-primary"
                                : "text-muted-foreground"
                            }
                          >
                            {f.done}/{f.totalSessions}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                          {f.dominantArea ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
