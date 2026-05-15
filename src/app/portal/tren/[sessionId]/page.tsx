import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Play,
  Check,
  Target,
  Clock,
  MapPin,
  Calendar,
  MessageSquare,
  Activity,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import type { PyramidArea } from "@/generated/prisma/client";

const PYR_LABEL: Record<PyramidArea, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

const PYR_PILL: Record<PyramidArea, string> = {
  FYS: "bg-[rgba(0,88,64,0.13)] text-[var(--color-pyr-fys)]",
  TEK: "bg-[rgba(26,125,86,0.13)] text-[var(--color-pyr-tek)]",
  SLAG: "bg-[rgba(184,133,42,0.13)] text-[var(--color-pyr-spill)]",
  SPILL: "bg-[rgba(184,133,42,0.13)] text-[var(--color-pyr-spill)]",
  TURN: "bg-[rgba(94,92,87,0.13)] text-[var(--color-pyr-turn)]",
};

const L_PHASE_LABEL = {
  GRUNN:     "Grunnperiode",
  SPESIAL:   "Spesialiseringsperiode",
  TURNERING: "Turneringsperiode",
} as const;

export default async function SessionDetalj({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await requirePortalUser();
  const { sessionId } = await params;

  const session = await prisma.trainingPlanSession.findUnique({
    where: { id: sessionId },
    include: {
      plan: { select: { userId: true, name: true } },
      drills: {
        include: { exercise: true },
        orderBy: { orderIndex: "asc" },
      },
      log: true,
    },
  });
  if (!session) notFound();

  const erEier = session.plan.userId === user.id;
  const erCoach = user.role === "COACH" || user.role === "ADMIN";
  if (!erEier && !erCoach) {
    redirect("/portal/tren");
  }

  const kanStarte =
    user.tier !== "GRATIS" && erEier && session.status !== "COMPLETED";

  // Hent forrige + neste sesjon i samme plan
  const [forrige, neste] = await Promise.all([
    prisma.trainingPlanSession.findFirst({
      where: {
        planId: session.planId,
        scheduledAt: { lt: session.scheduledAt },
      },
      orderBy: { scheduledAt: "desc" },
      select: { id: true, title: true },
    }),
    prisma.trainingPlanSession.findFirst({
      where: {
        planId: session.planId,
        scheduledAt: { gt: session.scheduledAt },
      },
      orderBy: { scheduledAt: "asc" },
      select: { id: true, title: true },
    }),
  ]);

  const scheduledDate = new Date(session.scheduledAt);
  const datoStr = scheduledDate.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const datoKort = scheduledDate.toLocaleDateString("nb-NO", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
  const tidStr = scheduledDate.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const erFullfort = session.status === "COMPLETED" && session.log != null;

  // KPI-beregning hvis fullført
  let kpiData: {
    fakRepsTotalt: number;
    plRepsTotalt: number;
    andelGodkjent: string;
    varighet: string;
    sgEffekt: string;
  } | null = null;

  if (erFullfort && session.log) {
    const plRepsTotalt = session.drills.length * 10; // estimat
    const fakRepsTotalt = session.log.csAchieved ?? plRepsTotalt;
    const andelGodkjent =
      session.log.rating != null
        ? `${Math.round((session.log.rating / 5) * 100)}%`
        : "—";
    let varighet = `${session.durationMin} min`;
    if (session.log.completedAt) {
      const min = Math.round(
        (session.log.completedAt.getTime() - session.log.startedAt.getTime()) /
          60000,
      );
      varighet = `${min} min`;
    }
    kpiData = {
      fakRepsTotalt,
      plRepsTotalt,
      andelGodkjent,
      varighet,
      sgEffekt:
        session.log.rating != null
          ? `+${(session.log.rating * 0.04).toFixed(2)}`
          : "—",
    };
  }

  return (
    <div className="space-y-6">
      <Link
        href="/portal/tren"
        className="inline-flex items-center gap-1.5 font-mono text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Tilbake til plan
      </Link>

      <PageHeader
        eyebrow={`PlayerHQ · Trening · ${datoKort}`}
        titleLead={PYR_LABEL[session.pyramidArea] + "-økt"}
        titleItalic={session.title}
        actions={
          kanStarte ? (
            <Link
              href={`/portal/live/${session.id}`}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Play className="h-3.5 w-3.5" strokeWidth={2.5} />
              Start live
            </Link>
          ) : session.status === "COMPLETED" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(60,142,109,0.13)] px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--color-pyr-tek)]">
              <Check className="h-3 w-3" strokeWidth={3} />
              Gjennomført
            </span>
          ) : !erEier ? (
            <span className="rounded-md border border-input bg-card px-4 py-2 text-[13px] text-muted-foreground">
              Coach-visning
            </span>
          ) : (
            <span className="rounded-md border border-dashed border-border px-4 py-2 text-[13px] text-muted-foreground">
              Live krever Pro
            </span>
          )
        }
      />

      {/* Hero-rad: dato, tid, varighet, fokus */}
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <HeroFact icon={Calendar} label="Dato" value={datoStr} />
          <HeroFact icon={Clock} label="Tid" value={tidStr} />
          <HeroFact
            icon={Activity}
            label="Varighet"
            value={`${session.durationMin} min`}
          />
          <HeroFact icon={MapPin} label="Plan" value={session.plan.name} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
          <span
            className={`rounded-full px-2.5 py-1 font-mono text-[10.5px] font-bold uppercase tracking-[0.08em] ${
              PYR_PILL[session.pyramidArea]
            }`}
          >
            {session.pyramidArea}
          </span>
          {session.rationale && (
            <p className="text-sm text-muted-foreground">{session.rationale}</p>
          )}
        </div>
      </section>

      {/* KPI-rad: kun fullført */}
      {kpiData && (
        <section>
          <div className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
            Resultat
          </div>
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
            <KpiCard
              label="Faktiske reps"
              value={String(kpiData.fakRepsTotalt)}
              sub={`av ${kpiData.plRepsTotalt} planlagt`}
            />
            <KpiCard
              label="Andel godkjent"
              value={kpiData.andelGodkjent}
              sub="basert på vurdering"
            />
            <KpiCard
              label="Varighet"
              value={kpiData.varighet}
              sub={`av ${session.durationMin} min planlagt`}
            />
            <KpiCard
              label="SG-effekt"
              value={kpiData.sgEffekt}
              sub="estimat for økten"
            />
          </div>
        </section>
      )}

      {/* Coach-feedback fra fullført live-økt */}
      {session.log?.coachFeedback && (
        <section className="grid grid-cols-[auto_1fr] items-start gap-4 rounded-xl bg-primary p-6 text-primary-foreground">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-[var(--color-accent)] text-[14px] font-semibold text-accent-foreground">
            <MessageSquare className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.08em] opacity-70">
              Coach-feedback
              {session.log.coachFeedbackAt && (
                <>
                  {" · "}
                  {session.log.coachFeedbackAt.toLocaleDateString("nb-NO", {
                    day: "2-digit",
                    month: "short",
                  })}
                </>
              )}
            </div>
            <div className="mt-1.5 font-display text-[18px] italic leading-[1.4]">
              «{session.log.coachFeedback}»
            </div>
          </div>
        </section>
      )}

      {/* Spillerens egen notat fra live-økt */}
      {session.log?.notes && (
        <section className="grid grid-cols-[auto_1fr] items-start gap-4 rounded-xl border border-border bg-card p-6">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-secondary text-[14px] font-semibold text-foreground">
            <MessageSquare className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
              Din egen kommentar
            </div>
            <div className="mt-1.5 font-display text-[18px] italic leading-[1.4]">
              «{session.log.notes}»
            </div>
          </div>
        </section>
      )}

      {/* Øvelser */}
      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
            Økt-skjelett · {session.drills.length}{" "}
            {session.drills.length === 1 ? "øvelse" : "øvelser"}
          </div>
        </div>

        {session.drills.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/40 px-8 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Ingen øvelser lagt til ennå.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {session.drills.map((drill, index) => (
              <DrillBlock
                key={drill.id}
                index={index + 1}
                pillLabel={drill.exercise.pyramidArea}
                pillTier={drill.exercise.pyramidArea}
                name={drill.exercise.name}
                repsSets={drill.repsSets}
                lPhase={drill.exercise.lPhase}
                csTarget={drill.csTarget}
                description={drill.exercise.description}
                notes={drill.notes}
                fullfort={erFullfort}
              />
            ))}
          </div>
        )}
      </section>

      {/* Forrige / neste */}
      {(forrige || neste) && (
        <nav className="grid grid-cols-2 gap-4 border-t border-border pt-6">
          <div>
            {forrige ? (
              <Link
                href={`/portal/tren/${forrige.id}`}
                className="group flex flex-col gap-1 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-secondary"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                  ← Forrige sesjon
                </span>
                <span className="truncate font-display text-[14px] font-medium text-foreground">
                  {forrige.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
          </div>
          <div>
            {neste ? (
              <Link
                href={`/portal/tren/${neste.id}`}
                className="group flex flex-col items-end gap-1 rounded-xl border border-border bg-card p-4 text-right transition-colors hover:bg-secondary"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                  Neste sesjon →
                </span>
                <span className="block max-w-full truncate font-display text-[14px] font-medium text-foreground">
                  {neste.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </nav>
      )}
    </div>
  );
}

function HeroFact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        <Icon className="h-3 w-3" strokeWidth={1.75} />
        {label}
      </div>
      <div className="mt-1 truncate font-display text-[15px] font-medium text-foreground">
        {value}
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-mono text-[24px] font-medium leading-tight -tracking-[0.01em] tabular-nums">
        {value}
      </div>
      <div className="mt-0.5 text-[11.5px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function DrillBlock({
  index,
  pillLabel,
  pillTier,
  name,
  repsSets,
  lPhase,
  csTarget,
  description,
  notes,
  fullfort,
}: {
  index: number;
  pillLabel: PyramidArea;
  pillTier: PyramidArea;
  name: string;
  repsSets: string;
  lPhase: keyof typeof L_PHASE_LABEL | null;
  csTarget: number | null;
  description: string | null;
  notes: string | null;
  fullfort: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="grid grid-cols-[auto_auto_1fr_auto] items-center gap-3.5 border-b border-border bg-secondary px-4 py-4">
        <span className="font-mono text-[11px] font-semibold tabular-nums text-muted-foreground">
          {String(index).padStart(2, "0")}
        </span>
        <span
          className={`rounded-md px-2 py-0.5 font-mono text-[10.5px] font-bold tracking-[0.04em] ${PYR_PILL[pillTier]}`}
        >
          {pillLabel}
        </span>
        <div className="min-w-0">
          <div className="truncate font-display text-[15px] font-medium text-foreground">
            {name}
          </div>
          <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
            {lPhase ? `L-fase ${L_PHASE_LABEL[lPhase]}` : ""}
          </div>
        </div>
        {fullfort && (
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--color-pyr-tek)] text-white">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-4">
        <DrillFact label="Rep-mål" value={repsSets} />
        <DrillFact
          label="CS-mål"
          value={csTarget != null ? String(csTarget) : "—"}
        />
        <DrillFact label="L-fase" value={lPhase ? L_PHASE_LABEL[lPhase] : "—"} />
        <DrillFact
          label="Fokus"
          value={
            description
              ? description.split(/[.\n]/)[0].slice(0, 40) +
                (description.length > 40 ? "…" : "")
              : "—"
          }
        />
        {notes && (
          <div className="col-span-2 mt-1 border-t border-dashed border-border pt-2.5 text-[13px] italic text-muted-foreground sm:col-span-4">
            <Target className="mr-1 inline h-3 w-3" />
            {notes}
          </div>
        )}
      </div>
    </div>
  );
}

function DrillFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 truncate font-mono text-[14px] font-medium text-foreground">
        {value}
      </div>
    </div>
  );
}
