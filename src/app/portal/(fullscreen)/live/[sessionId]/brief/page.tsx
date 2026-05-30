/**
 * PlayerHQ · Live-økt brief (sesjon 2 · pixel-perfect)
 *
 * Spec: BATCH PR7 · Skjerm 7.1
 * - Hero med coach-quote (Mac O'Grady-stil italic)
 * - Drill-liste read-only
 * - KPI-strip: total tid + reps + pyramide-fokus
 * - "Start"-CTA stor + lime
 */

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Play,
  Target,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { PyramidArea } from "@/generated/prisma/client";

const PYR_LABEL: Record<PyramidArea, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

const PYR_TONE: Record<PyramidArea, { bg: string; text: string; tile: string }> =
  {
    FYS: {
      bg: "bg-[rgba(0,88,64,0.13)]",
      text: "text-primary",
      tile: "bg-primary",
    },
    TEK: {
      bg: "bg-[rgba(26,125,86,0.13)]",
      text: "text-success",
      tile: "bg-success",
    },
    SLAG: {
      bg: "bg-[rgba(209,248,67,0.45)]",
      text: "text-foreground",
      tile: "bg-accent",
    },
    SPILL: {
      bg: "bg-[rgba(184,133,42,0.13)]",
      text: "text-warning",
      tile: "bg-warning",
    },
    TURN: {
      bg: "bg-[rgba(94,92,87,0.13)]",
      text: "text-muted-foreground",
      tile: "bg-muted-foreground",
    },
  };

export default async function LiveBriefPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await requirePortalUser({
    allow: ["PLAYER", "COACH", "ADMIN"],
  });
  const { sessionId } = await params;

  const session = await prisma.trainingPlanSession.findUnique({
    where: { id: sessionId },
    include: {
      plan: { select: { userId: true, name: true } },
      drills: {
        include: { exercise: true },
        orderBy: { orderIndex: "asc" },
      },
    },
  });
  if (!session) notFound();

  const erEier = session.plan.userId === user.id;
  const erCoach = user.role === "COACH" || user.role === "ADMIN";
  if (!erEier && !erCoach) redirect("/portal/tren");

  const scheduled = new Date(session.scheduledAt);
  const datoStr = scheduled.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
  const tidStr = scheduled.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const totalReps = session.drills.reduce((sum, d) => {
    const m = d.repsSets.match(/(\d+)\s*[x×*]\s*(\d+)/i);
    if (m) return sum + Number(m[1]) * Number(m[2]);
    const n = parseInt(d.repsSets, 10);
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

  const pyrCount = new Map<PyramidArea, number>();
  for (const d of session.drills) {
    const a = d.exercise.pyramidArea;
    pyrCount.set(a, (pyrCount.get(a) ?? 0) + 1);
  }
  const dominant: PyramidArea =
    Array.from(pyrCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    session.pyramidArea;

  const kanStarte =
    user.tier !== "GRATIS" && erEier && session.status !== "COMPLETED";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[920px] space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <Link
          href={`/portal/tren/${session.id}`}
          className="inline-flex h-11 items-center gap-1.5 font-mono text-[12px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Tilbake til økt-detalj
        </Link>

        {/* HERO med coach-quote */}
        <section
          className="relative overflow-hidden rounded-2xl border border-border p-6 sm:p-8"
          style={{
            background:
              "linear-gradient(135deg, #FAFAF7 0%, #FFFFFF 60%, rgba(209,248,67,0.16) 100%)",
          }}
        >
          <div className="inline-flex items-center gap-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            <span
              className="h-1.5 w-1.5 rounded-full bg-primary"
              style={{ boxShadow: "0 0 0 3px rgba(0,88,64,0.12)" }}
            />
            LIVE-ØKT · BRIEF · {datoStr.toUpperCase()}
          </div>
          <h1 className="mt-2 font-display text-[28px] font-medium leading-[1.05] -tracking-[0.02em] text-foreground sm:text-[40px]">
            {PYR_LABEL[session.pyramidArea]}-økt{" "}
            <em
              className="font-normal italic text-muted-foreground"
              style={{ fontFamily: "var(--font-instrument-serif, var(--font-inter-tight))" }}
            >
              {session.title}
            </em>
          </h1>

          <blockquote className="mt-6 border-l-2 border-accent pl-4 sm:pl-6">
            <p
              className="font-display text-[16px] italic leading-[1.5] text-foreground sm:text-[18px]"
              style={{ fontFamily: "var(--font-instrument-serif, serif)" }}
            >
              {session.rationale ??
                `«Det handler ikke om å treffe perfekt — det handler om å treffe samme avvik bevisst, igjen og igjen. Da bygger du data du kan stole på.»`}
            </p>
            <footer className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
              — Mac O&apos;Grady-prinsipp · {session.plan.name}
            </footer>
          </blockquote>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
            <MetaItem icon={<Calendar className="h-3.5 w-3.5" />} label="Dato" value={datoStr} />
            <MetaItem icon={<Clock className="h-3.5 w-3.5" />} label="Start" value={tidStr} />
            <MetaItem icon={<Target className="h-3.5 w-3.5" />} label="Varighet" value={`${session.durationMin} min`} />
          </div>
        </section>

        {/* KPI-STRIP */}
        <section className="grid grid-cols-3 gap-2.5 sm:gap-2">
          <Kpi
            label="TOTAL TID"
            value={String(session.durationMin)}
            unit="min"
            featured
            icon={<Clock className="h-3.5 w-3.5" strokeWidth={1.75} />}
          />
          <Kpi
            label="TOTAL REPS"
            value={totalReps > 0 ? String(totalReps) : "—"}
            unit="reps"
            icon={<Flame className="h-3.5 w-3.5" strokeWidth={1.75} />}
          />
          <Kpi
            label="PYRAMIDE-FOKUS"
            value={dominant}
            unit={PYR_LABEL[dominant].toLowerCase()}
            tone={PYR_TONE[dominant]}
            icon={<Target className="h-3.5 w-3.5" strokeWidth={1.75} />}
          />
        </section>

        {/* DRILL-LISTE READ-ONLY */}
        <section>
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="font-display text-[16px] font-semibold -tracking-[0.01em] text-foreground">
              Drill-plan
            </h2>
            <span className="font-mono text-[11px] text-muted-foreground">
              {session.drills.length}{" "}
              {session.drills.length === 1 ? "drill" : "drills"}
            </span>
          </div>

          {session.drills.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/40 px-8 py-12 text-center">
              <p className="text-sm text-muted-foreground">Ingen drills lagt til.</p>
            </div>
          ) : (
            <ol className="flex flex-col gap-2">
              {session.drills.map((d, i) => {
                const tone = PYR_TONE[d.exercise.pyramidArea];
                return (
                  <li
                    key={d.id}
                    className="flex items-center gap-2 rounded-xl border border-border bg-card p-4 sm:p-4"
                  >
                    <div
                      className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-md font-mono text-[11px] font-bold text-white ${tone.tile}`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-display text-[14px] font-semibold -tracking-[0.005em] text-foreground sm:text-[15px]">
                        {d.exercise.name}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span
                          className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-[0.06em] ${tone.bg} ${tone.text}`}
                        >
                          {d.exercise.pyramidArea}
                        </span>
                        {d.exercise.lPhase && (
                          <span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                            {d.exercise.lPhase}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[14px] font-semibold text-foreground tabular-nums">
                        {d.repsSets}
                      </div>
                      <div className="font-mono text-[9.5px] uppercase tracking-[0.06em] text-muted-foreground">
                        reps
                      </div>
                    </div>
                    {d.csTarget && (
                      <div className="hidden text-right sm:block">
                        <div className="font-mono text-[14px] font-semibold text-foreground tabular-nums">
                          {d.csTarget}
                        </div>
                        <div className="font-mono text-[9.5px] uppercase tracking-[0.06em] text-muted-foreground">
                          CS
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        {/* STORT START-CTA */}
        <section className="sticky bottom-4 pt-4">
          {kanStarte ? (
            <Link
              href={`/portal/live/${session.id}/active`}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-6 py-6 font-display text-[20px] font-semibold -tracking-[0.01em] text-accent-foreground shadow-lg shadow-accent/30 transition-transform hover:scale-[1.01]"
            >
              <Play className="h-5 w-5 fill-current" strokeWidth={2.5} />
              Start økt nå
            </Link>
          ) : (
            <div className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card px-6 py-6 font-sans text-[14px] text-muted-foreground">
              {session.status === "COMPLETED" ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-success" strokeWidth={2} />
                  Økten er fullført
                </>
              ) : (
                "Live krever PRO"
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="inline-flex items-center gap-1.5 font-mono text-[11.5px] text-muted-foreground">
      <span className="text-muted-foreground/70">{icon}</span>
      <span>
        {label}: <b className="font-semibold text-foreground">{value}</b>
      </span>
    </div>
  );
}

function Kpi({
  label,
  value,
  unit,
  featured,
  tone,
  icon,
}: {
  label: string;
  value: string;
  unit: string;
  featured?: boolean;
  tone?: { bg: string; text: string; tile: string };
  icon: React.ReactNode;
}) {
  if (featured) {
    return (
      <div
        className="relative overflow-hidden rounded-xl p-4 text-primary-foreground"
        style={{
          background: "linear-gradient(135deg, #003A2A 0%, #005840 100%)",
        }}
      >
        <div className="flex items-center gap-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.10em] opacity-70">
          <span className="opacity-60">{icon}</span>
          {label}
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="font-display text-[30px] font-semibold -tracking-[0.02em] text-accent tabular-nums">
            {value}
          </span>
          <span className="font-mono text-[11px] opacity-70">{unit}</span>
        </div>
      </div>
    );
  }
  return (
    <div
      className={`rounded-xl border border-border p-4 ${tone ? tone.bg : "bg-card"}`}
    >
      <div className="flex items-center gap-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
        <span className="text-muted-foreground/70">{icon}</span>
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span
          className={`font-display text-[26px] font-semibold -tracking-[0.02em] tabular-nums ${tone ? tone.text : "text-foreground"}`}
        >
          {value}
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">
          {unit}
        </span>
      </div>
    </div>
  );
}
