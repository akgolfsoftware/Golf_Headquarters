import { ArrowLeft, ArrowRight, ArrowDown, Minus, Pin } from "lucide-react";
import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import {
  diffSessions,
  summarizeSession,
  type SessionMetric,
  type SessionMetricDiff,
} from "@/lib/sg-hub/session-diff";
import { SessionPinControl } from "@/components/sg-hub/SessionPinControl";

const numberFmt = (decimals: number) =>
  new Intl.NumberFormat("nb-NO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

const dateFmt = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

type SearchParams = Promise<{ session?: string }>;

export default async function BestVsNowPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requirePortalUser();
  const params = await searchParams;

  const [bestRef, allSessions] = await Promise.all([
    prisma.bestSessionReference.findUnique({ where: { userId: user.id } }),
    prisma.trackManSession.findMany({
      where: { userId: user.id },
      orderBy: { recordedAt: "desc" },
      select: { id: true, recordedAt: true, rawJson: true, shotCount: true },
      take: 30,
    }),
  ]);

  const currentSessionId =
    params.session ??
    allSessions[0]?.id ??
    null;

  const currentSession = currentSessionId
    ? allSessions.find((s) => s.id === currentSessionId) ?? null
    : null;

  const bestSession = bestRef
    ? await prisma.trackManSession.findFirst({
        where: { id: bestRef.trackmanSessionId, userId: user.id },
        select: { id: true, recordedAt: true, rawJson: true, shotCount: true },
      })
    : null;

  return (
    <div className="space-y-6">
      <Link
        href="/portal/mal/sg-hub"
        className="inline-flex items-center gap-1.5 font-mono text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        SG Hub
      </Link>

      <header>
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          Best vs Today
        </p>
        <h2 className="mt-1 font-display text-2xl font-semibold leading-tight tracking-tight">
          Beste økt mot{" "}
          <em className="font-normal text-primary md:italic">dagens</em>
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Speilet sammenligning av aggregat-metrikker. Grønn = bedre, rød =
          verre.
        </p>
      </header>

      {!currentSession ? (
        <EmptyState />
      ) : !bestSession ? (
        <NoPinnedState
          currentSessionId={currentSession.id}
          recordedAt={currentSession.recordedAt}
        />
      ) : (
        <Comparison
          best={{
            id: bestSession.id,
            recordedAt: bestSession.recordedAt,
            rawJson: bestSession.rawJson,
            shotCount: bestSession.shotCount,
          }}
          current={{
            id: currentSession.id,
            recordedAt: currentSession.recordedAt,
            rawJson: currentSession.rawJson,
            shotCount: currentSession.shotCount,
          }}
          isCurrentPinned={bestSession.id === currentSession.id}
        />
      )}

      {allSessions.length > 1 && currentSession && (
        <SessionPicker
          sessions={allSessions.map((s) => ({
            id: s.id,
            recordedAt: s.recordedAt,
            shotCount: s.shotCount,
          }))}
          activeId={currentSession.id}
        />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        Ingen TrackMan-data
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Importer din første økt for å bruke Best vs Today-sammenligning.
      </p>
      <Link
        href="/portal/mal/trackman"
        className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary underline-offset-2 hover:underline"
      >
        Til TrackMan-import
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function NoPinnedState({
  currentSessionId,
  recordedAt,
}: {
  currentSessionId: string;
  recordedAt: Date;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-start gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Pin className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold">
            Ingen pinnet best ever-økt ennå
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Pin en økt som referanse for å aktivere sammenligning. Dagens
            valgte økt er fra {dateFmt.format(recordedAt)}.
          </p>
        </div>
      </div>
      <div className="mt-4">
        <SessionPinControl
          currentSessionId={currentSessionId}
          isCurrentPinned={false}
          suggestPin={false}
        />
      </div>
    </div>
  );
}

function Comparison({
  best,
  current,
  isCurrentPinned,
}: {
  best: { id: string; recordedAt: Date; rawJson: unknown; shotCount: number };
  current: { id: string; recordedAt: Date; rawJson: unknown; shotCount: number };
  isCurrentPinned: boolean;
}) {
  const bestSummary = summarizeSession({
    id: best.id,
    recordedAt: best.recordedAt,
    rawJson: best.rawJson,
  });
  const currentSummary = summarizeSession({
    id: current.id,
    recordedAt: current.recordedAt,
    rawJson: current.rawJson,
  });

  const { metrics, improvedCount, shouldSuggestNewBest } = diffSessions(
    bestSummary,
    currentSummary
  );

  return (
    <div className="space-y-6">
      <SessionPinControl
        currentSessionId={current.id}
        isCurrentPinned={isCurrentPinned}
        suggestPin={shouldSuggestNewBest && !isCurrentPinned}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SessionColumn
          tag="Best ever"
          accent
          recordedAt={best.recordedAt}
          shotCount={bestSummary.shotCount}
          metrics={bestSummary.metrics}
        />
        <SessionColumn
          tag={isCurrentPinned ? "Best ever (denne)" : "Dagens"}
          recordedAt={current.recordedAt}
          shotCount={currentSummary.shotCount}
          metrics={currentSummary.metrics}
          diffs={metrics}
        />
      </div>

      <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {improvedCount} av {metrics.length} metrikker bedre enn best
      </p>
    </div>
  );
}

function SessionColumn({
  tag,
  recordedAt,
  shotCount,
  metrics,
  diffs,
  accent = false,
}: {
  tag: string;
  recordedAt: Date;
  shotCount: number;
  metrics: SessionMetric[];
  diffs?: SessionMetricDiff[];
  accent?: boolean;
}) {
  return (
    <article
      className={`rounded-xl border bg-card p-6 ${
        accent ? "border-primary/30" : "border-border"
      }`}
    >
      <header className="mb-4">
        <p
          className={`font-mono text-[10px] uppercase tracking-[0.12em] ${
            accent ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {tag}
        </p>
        <h3 className="mt-1 font-display text-xl font-semibold leading-tight">
          {dateFmt.format(recordedAt)}
        </h3>
        <p className="mt-0.5 font-mono text-[11px] tabular-nums text-muted-foreground">
          {shotCount} slag
        </p>
      </header>
      <dl className="space-y-2">
        {metrics.map((m, i) => {
          const diff = diffs?.[i];
          return (
            <MetricRow
              key={m.key}
              metric={m}
              diff={diff}
            />
          );
        })}
      </dl>
    </article>
  );
}

function MetricRow({
  metric,
  diff,
}: {
  metric: SessionMetric;
  diff?: SessionMetricDiff;
}) {
  const fmt = numberFmt(metric.decimals);

  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-border/40 pb-2 last:border-b-0 last:pb-0">
      <dt className="text-xs text-muted-foreground">{metric.label}</dt>
      <dd className="flex items-baseline gap-2">
        <span className="font-mono text-sm font-semibold tabular-nums">
          {fmt.format(metric.value)}
          {metric.unit && (
            <span className="ml-0.5 text-[10px] text-muted-foreground">
              {metric.unit}
            </span>
          )}
        </span>
        {diff && <DeltaPill diff={diff} />}
      </dd>
    </div>
  );
}

function DeltaPill({ diff }: { diff: SessionMetricDiff }) {
  const fmt = numberFmt(diff.decimals);
  const isZero = diff.delta === 0;

  if (isZero) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] tabular-nums text-muted-foreground">
        <Minus className="h-2.5 w-2.5" />
        0
      </span>
    );
  }

  const better = diff.betterThanBest;
  const Icon = diff.delta > 0 ? ArrowRight : ArrowDown;
  const cls = better
    ? "bg-primary/10 text-primary"
    : "bg-destructive/10 text-destructive";

  const sign = diff.delta > 0 ? "+" : "";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] tabular-nums ${cls}`}
    >
      <Icon className="h-2.5 w-2.5" />
      {sign}
      {fmt.format(diff.delta)}
    </span>
  );
}

function SessionPicker({
  sessions,
  activeId,
}: {
  sessions: { id: string; recordedAt: Date; shotCount: number }[];
  activeId: string;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-2 text-sm font-semibold">Velg dagens økt</h3>
      <div className="flex flex-wrap gap-2">
        {sessions.map((s) => {
          const aktiv = s.id === activeId;
          return (
            <Link
              key={s.id}
              href={`/portal/mal/sg-hub/best-vs-now?session=${encodeURIComponent(s.id)}`}
              className={`rounded-full border px-4 py-1.5 font-mono text-[11px] tabular-nums transition-colors ${
                aktiv
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {dateFmt.format(s.recordedAt)} · {s.shotCount}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
