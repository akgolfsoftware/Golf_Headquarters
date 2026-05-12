import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, CalendarClock } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import {
  aggregateByArea,
  prosentPerArea,
  totalMinutter,
  PYR_REKKEFOLGE,
  PYR_LABEL,
} from "@/lib/pyramide";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import type { PyramidArea, SessionStatus } from "@/generated/prisma/client";
import { PlanActions } from "./plan-actions";
import { DraggableSessions, type DraggableSession } from "./draggable-sessions";
import { EditSessionModal } from "./edit-session-modal";

/**
 * Anti-AI farger: kun 3 lime-relaterte aksentpunkter
 *  1) primary (mørk grønn) i CTAer/lenker
 *  2) accent (lime) i status-pill/highlight
 *  3) pyr-fargene som data-koder (FYS/TEK/SLAG/SPILL/TURN)
 */
const PYR_COLOR: Record<PyramidArea, string> = {
  FYS: "var(--color-pyr-fys, #005840)",
  TEK: "var(--color-pyr-tek, #1A7D56)",
  SLAG: "var(--color-pyr-slag, #D1F843)",
  SPILL: "var(--color-pyr-spill, #B8852A)",
  TURN: "var(--color-pyr-turn, #5E5C57)",
};

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
      status: s.status,
      drillCount: s.drills.length,
      rationale: s.rationale ?? null,
    }));

  // Faser = grupper økter per kalenderuke i planens varighet
  const faser = buildFaser(plan.sessions);

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
          />
        }
      />

      {/* ── Fase-bar ───────────────────────────────────────────── */}
      {faser.length > 0 && (
        <section className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                {faser.length}-ukers tidslinje · auto-generert
              </div>
              <h3 className="mt-2 font-display text-[18px] font-semibold leading-snug">
                Faseinndeling og pyramide-vekting per uke
              </h3>
              <p className="mt-2 text-[12px] leading-[1.5] text-muted-foreground">
                Striper viser dominerende pyramide-lag. Aktiv uke er framhevet.
              </p>
            </div>
            {faser.find((f) => f.status === "current") && (
              <span className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-foreground">
                Aktiv · {faser.find((f) => f.status === "current")!.ukeLabel}
              </span>
            )}
          </div>

          {/* Uke-rad */}
          <div
            className="grid gap-px rounded-md bg-border p-px"
            style={{
              gridTemplateColumns: `80px repeat(${faser.length}, minmax(0, 1fr))`,
            }}
          >
            <div className="bg-card" />
            {faser.map((f) => (
              <div
                key={f.key}
                className="bg-card py-2 text-center"
                style={
                  f.status === "current"
                    ? { background: "rgba(209,248,67,0.15)" }
                    : undefined
                }
              >
                <div className="font-mono text-[11px] font-semibold text-muted-foreground">
                  {f.ukeLabel}
                </div>
                <div className="mt-1 text-[10px] font-medium text-muted-foreground">
                  {f.dateLabel}
                  {f.status === "current" && " · NÅ"}
                </div>
              </div>
            ))}
          </div>

          {/* Status-stripe */}
          <TimelineBar label="Status" count={faser.length}>
            {faser.map((f, i) => (
              <BarFill
                key={f.key}
                left={(i / faser.length) * 100}
                width={100 / faser.length}
                color={
                  f.status === "done"
                    ? PYR_COLOR.FYS
                    : f.status === "current"
                      ? PYR_COLOR.SLAG
                      : "var(--secondary)"
                }
                textDark={f.status === "current"}
              >
                {f.status === "done"
                  ? "Fullført"
                  : f.status === "current"
                    ? "Pågår"
                    : "Planlagt"}
              </BarFill>
            ))}
          </TimelineBar>

          {/* SLAG-vekt */}
          <TimelineBar label="SLAG-vekt" thin count={faser.length}>
            {faser.map((f, i) => (
              <BarFill
                key={f.key}
                left={(i / faser.length) * 100}
                width={100 / faser.length}
                color={`rgba(209,248,67,${0.2 + (f.slagPct / 100) * 0.75})`}
              />
            ))}
          </TimelineBar>

          {/* SPILL-vekt */}
          <TimelineBar label="SPILL-vekt" thin count={faser.length}>
            {faser.map((f, i) => (
              <BarFill
                key={f.key}
                left={(i / faser.length) * 100}
                width={100 / faser.length}
                color={`rgba(184,133,42,${0.2 + (f.spillPct / 100) * 0.7})`}
              />
            ))}
          </TimelineBar>
        </section>
      )}

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
            <KpiCard
              label="SG-utvikling"
              value="—"
              sub="Krever round-data"
            />
          </div>

          {/* Pyramide-fordeling */}
          <section className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 font-display text-[16px] font-semibold leading-snug">
              Pyramide-fordeling
            </h3>
            <div className="space-y-2">
              {PYR_REKKEFOLGE.map((omr) => (
                <div key={omr} className="flex items-center gap-2 text-xs">
                  <span className="w-14 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    {PYR_LABEL[omr]}
                  </span>
                  <div className="relative h-3 flex-1 overflow-hidden rounded-sm bg-secondary">
                    <div
                      className="h-full"
                      style={{
                        width: `${Math.max(fordeling[omr], 2)}%`,
                        background: PYR_COLOR[omr],
                      }}
                    />
                  </div>
                  <span className="w-10 text-right font-mono tabular-nums">
                    {fordeling[omr]} %
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Kommende økter — drag-and-drop for å flytte mellom uker */}
          <section className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-[16px] font-semibold leading-snug">
                  Kommende økter
                </h3>
                <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Dra for å flytte · Rediger med blyant-ikon
                </span>
              </div>
              <EditSessionModal
                mode={{ kind: "create", planId: plan.id }}
                triggerVariant="primary"
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

// ────────────────────────────────────────────────────────────────
// Sub-komponenter (interne)
// ────────────────────────────────────────────────────────────────

function TimelineBar({
  label,
  thin,
  count,
  children,
}: {
  label: string;
  thin?: boolean;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="mt-2 grid items-center gap-2 py-1"
      style={{ gridTemplateColumns: `80px repeat(1, 1fr)` }}
      data-count={count}
    >
      <div className="font-mono text-[11px] font-semibold text-muted-foreground">
        {label}
      </div>
      <div
        className="relative overflow-hidden rounded-md bg-secondary"
        style={{ height: thin ? 18 : 28 }}
      >
        {children}
      </div>
    </div>
  );
}

function BarFill({
  left,
  width,
  color,
  children,
  textDark,
}: {
  left: number;
  width: number;
  color: string;
  children?: React.ReactNode;
  textDark?: boolean;
}) {
  return (
    <div
      className={`absolute top-0 flex h-full items-center px-2 font-mono text-[11px] font-semibold ${
        textDark ? "text-foreground" : "text-white"
      }`}
      style={{ left: `${left}%`, width: `${width}%`, background: color }}
    >
      {children}
    </div>
  );
}

type PhaseStatus = "done" | "current" | "upcoming";

function PhaseCard({
  num,
  statusTone,
  name,
  dates,
  pct,
  pctLabel,
  pctMuted,
  current,
  pyr,
  sessions,
}: {
  num: string;
  statusTone: PhaseStatus;
  name: string;
  dates: string;
  pct: string;
  pctLabel: string;
  pctMuted?: boolean;
  current?: boolean;
  pyr: Record<PyramidArea, number>;
  sessions: { value: string; label: string }[];
}) {
  return (
    <section
      className={`rounded-lg bg-card p-6 ${
        current ? "border-2 border-accent" : "border border-border"
      }`}
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span
              className={`rounded-sm px-2 py-1 font-mono text-[10px] font-semibold ${
                current
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {num}
            </span>
            <Pill tone={statusTone}>
              {statusTone === "done"
                ? "Fullført"
                : statusTone === "current"
                  ? "Pågår"
                  : "Planlagt"}
            </Pill>
          </div>
          <h2 className="font-display text-[22px] font-bold leading-[1.1] tracking-tight">
            {name}
          </h2>
          <div className="mt-2 font-mono text-[12px] text-muted-foreground">
            {dates}
          </div>
        </div>
        <div className="text-right">
          <div
            className={`font-mono text-[28px] font-semibold tabular-nums leading-none ${
              pctMuted ? "text-muted-foreground" : "text-foreground"
            }`}
          >
            {pct}
          </div>
          <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            {pctLabel}
          </div>
        </div>
      </div>

      <div className="mt-2 flex h-2 gap-1 overflow-hidden rounded-sm bg-secondary">
        {PYR_REKKEFOLGE.map((omr) => (
          <div
            key={omr}
            style={{ width: `${pyr[omr]}%`, background: PYR_COLOR[omr] }}
          />
        ))}
      </div>
      <div className="mt-2 mb-4 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
        {PYR_REKKEFOLGE.map((omr) => (
          <span key={omr} className="inline-flex items-center gap-2">
            <i
              className="h-2 w-2 rounded-sm"
              style={{ background: PYR_COLOR[omr] }}
            />
            {omr} {pyr[omr]} %
          </span>
        ))}
      </div>

      <div className="flex justify-between border-t border-border pt-4">
        {sessions.map((s) => (
          <div key={s.label}>
            <div className="font-mono text-[16px] font-semibold tabular-nums leading-none text-foreground">
              {s.value}
            </div>
            <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pill({
  tone,
  children,
}: {
  tone: PhaseStatus;
  children: React.ReactNode;
}) {
  const styles =
    tone === "done"
      ? "bg-primary/10 text-primary"
      : tone === "current"
        ? "bg-accent text-accent-foreground"
        : "bg-secondary text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${styles}`}
    >
      {children}
    </span>
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
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 mb-1 font-mono text-[24px] font-semibold tabular-nums leading-none text-foreground">
        {value}
      </div>
      <div className="text-[11px] leading-[1.3] text-muted-foreground">
        {sub}
      </div>
    </div>
  );
}

function SessionRow({
  href,
  date,
  time,
  title,
  layer,
  duration,
  meta,
  status,
  last,
}: {
  href: string;
  date: string;
  time: string;
  title: string;
  layer: PyramidArea;
  duration: string;
  meta: string;
  status: { label: string; tone: "lime" | "muted" };
  last?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`grid grid-cols-[60px_1fr_auto] items-center gap-2 py-2 transition-opacity hover:opacity-80 ${
        last ? "" : "border-b border-border"
      }`}
    >
      <div className="font-mono text-[11px] font-semibold leading-tight">
        {date}
        <span className="mt-1 block font-sans text-[10px] font-normal text-muted-foreground">
          {time}
        </span>
      </div>
      <div className="min-w-0">
        <div className="truncate text-[13px] font-semibold leading-tight">
          {title}
        </div>
        <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <i
              className="inline-block h-2 w-2 rounded-sm"
              style={{ background: PYR_COLOR[layer] }}
            />
            {layer} · {duration}
          </span>
          <span>{meta}</span>
        </div>
      </div>
      <Pill tone={status.tone === "lime" ? "current" : "upcoming"}>
        {status.label}
      </Pill>
    </Link>
  );
}

// ────────────────────────────────────────────────────────────────
// Faser-beregning (ukentlig gruppering)
// ────────────────────────────────────────────────────────────────

type SessionWithRel = {
  id: string;
  scheduledAt: Date;
  durationMin: number;
  pyramidArea: PyramidArea;
  status: SessionStatus;
};

type Fase = {
  key: string;
  ukeLabel: string;
  dateLabel: string;
  dateRangeLabel: string;
  status: PhaseStatus;
  totalSessions: number;
  done: number;
  totMin: number;
  pyrFordeling: Record<PyramidArea, number>;
  slagPct: number;
  spillPct: number;
  dominantArea: PyramidArea | null;
};

function getISOWeek(d: Date): { year: number; week: number } {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: date.getUTCFullYear(), week };
}

function startOfISOWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - (day - 1));
  date.setHours(0, 0, 0, 0);
  return date;
}

function buildFaser(sessions: SessionWithRel[]): Fase[] {
  if (sessions.length === 0) return [];

  const groups = new Map<string, SessionWithRel[]>();
  for (const s of sessions) {
    const { year, week } = getISOWeek(s.scheduledAt);
    const key = `${year}-${String(week).padStart(2, "0")}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(s);
  }

  const now = new Date();
  const { year: curYear, week: curWeek } = getISOWeek(now);
  const currentKey = `${curYear}-${String(curWeek).padStart(2, "0")}`;

  const result: Fase[] = [];
  const sortedKeys = Array.from(groups.keys()).sort();

  for (const key of sortedKeys) {
    const list = groups.get(key)!;
    const first = list[0].scheduledAt;
    const weekStart = startOfISOWeek(first);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const done = list.filter((s) => s.status === "COMPLETED").length;
    const totMin = list.reduce((sum, s) => sum + s.durationMin, 0);

    // Pyramide-fordeling per uke
    const minPerArea: Record<PyramidArea, number> = {
      FYS: 0,
      TEK: 0,
      SLAG: 0,
      SPILL: 0,
      TURN: 0,
    };
    for (const s of list) {
      minPerArea[s.pyramidArea] += s.durationMin;
    }
    const pyrFordeling: Record<PyramidArea, number> = {
      FYS: 0,
      TEK: 0,
      SLAG: 0,
      SPILL: 0,
      TURN: 0,
    };
    if (totMin > 0) {
      for (const area of PYR_REKKEFOLGE) {
        pyrFordeling[area] = Math.round((minPerArea[area] / totMin) * 100);
      }
    }

    let dominantArea: PyramidArea | null = null;
    let maxMin = 0;
    for (const area of PYR_REKKEFOLGE) {
      if (minPerArea[area] > maxMin) {
        maxMin = minPerArea[area];
        dominantArea = area;
      }
    }

    let status: PhaseStatus;
    if (key === currentKey) status = "current";
    else if (key < currentKey) status = "done";
    else status = "upcoming";

    const ukeLabel = `u${key.split("-")[1]}`;
    const dateLabel = weekStart.toLocaleDateString("nb-NO", {
      day: "numeric",
      month: "short",
    });
    const dateRangeLabel = `${weekStart.toLocaleDateString("nb-NO", {
      day: "numeric",
      month: "short",
    })} – ${weekEnd.toLocaleDateString("nb-NO", {
      day: "numeric",
      month: "short",
    })} · ${list.length} økter`;

    result.push({
      key,
      ukeLabel,
      dateLabel,
      dateRangeLabel,
      status,
      totalSessions: list.length,
      done,
      totMin,
      pyrFordeling,
      slagPct: pyrFordeling.SLAG,
      spillPct: pyrFordeling.SPILL,
      dominantArea,
    });
  }

  return result;
}
