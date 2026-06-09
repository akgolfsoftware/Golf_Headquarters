/**
 * AgencyOS — operations cockpit (coachens kontrolltårn).
 *
 * Pixel-port FRA design-fasit:
 *   - Visuell fasit: public/design-handover/_screens/ag-dashboard.png (desktop ~1320px)
 *   - HTML/CSS-referanse: public/design-handover/agencyos/components-agency-dashboard.html
 *
 * 3-kolonne Bloomberg-tetthet:
 *   COL 1 — Dagens timeline (økter, NÅ-strek, tom-tilstand m/ tidslinje-skinne)
 *   COL 2 — Innboks (type-piller) + Oppgaver (checkbox, tom-tilstand)
 *   COL 3 — Trenger oppmerksomhet (fokus-spillere: signal-pille + quick-actions)
 *   KPI-strip — 4 business-KPIer med sparkline / barchart
 *
 * Presentasjonell + props-drevet (CockpitData). Ingen Prisma/DB/auth her.
 * Token-only farger (ingen hardkodet hex), kun lucide-ikoner, norsk bokmål.
 *
 * Responsivt:
 *   Desktop (≥1024px): 3 kolonner side-om-side + KPI 4-opp — primær-fasit.
 *   Mobil (≤640px): kolonnene stables (Timeline → Innboks → Fokus), KPI 2-opp.
 */

import Link from "next/link";
import {
  CalendarClock,
  Check,
  Minus,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { Sparkline } from "@/components/athletic";
import { cn } from "@/lib/utils";
import { FilterChip, TasksSection } from "./_cockpit-interactive";

// ── Typer ───────────────────────────────────────────────────────
type AvatarTone = "default" | "primary" | "accent";
type SignalTone = "alert" | "warn" | "lime";

export type CockpitTimelineSession = {
  id: string;
  /** Minutter siden midnatt — styrer ferdig/pågår/kommer + NÅ-strek. */
  startMin: number;
  durMin: number;
  time: string;
  initials: string;
  avatarTone?: AvatarTone;
  playerName: string;
  title: string;
  href?: string;
};

export type CockpitInboxItem = {
  id: string;
  initials: string;
  avatarTone?: AvatarTone;
  title: string;
  type: "msg" | "appr" | "req" | "advice";
  typeLabel: string;
  preview: string;
  when: string;
  unread?: boolean;
  href?: string;
};

export type CockpitTask = {
  id: string;
  label: string;
  done?: boolean;
  tag: string;
  due?: boolean;
};

export type CockpitFocusAction = {
  label: string;
  icon: LucideIcon;
  primary?: boolean;
  href?: string;
};

export type CockpitFocusPlayer = {
  id: string;
  initials: string;
  avatarTone?: AvatarTone;
  name: string;
  /** Sekundær-linje, f.eks. "— · INAKTIV". */
  meta: string;
  /** Rød-tonet alarm-kort (kritisk). Default: subtil warn-tint. */
  alert?: boolean;
  signal: { label: string; tone: SignalTone; icon: LucideIcon };
  reason: string;
  actions: CockpitFocusAction[];
};

export type CockpitKpi = {
  label: string;
  value: string;
  unit?: string;
  delta: { text: string; tone: "up" | "down" | "flat" };
  icon: LucideIcon;
  spark: { type: "line" | "bar"; values: number[]; barActive?: number };
};

export type CockpitData = {
  coachFirstName: string;
  /** AI-kontekstlinje etter "—" (italic, dempet). */
  aiContext: string;
  /** Live-klokke-label, f.eks. "MANDAG 1 JUNI · 07:35". */
  liveLabel: string;
  /** Timeline-header undertekst, f.eks. "MANDAG 1 JUNI · 0 ØKTER". */
  timelineDateLabel: string;
  /** Minutter siden midnatt — utleder NÅ-strek/økt-states. */
  now: number;
  timeline: CockpitTimelineSession[];
  inboxCount: number;
  inboxUnread: number;
  inbox: CockpitInboxItem[];
  tasks: CockpitTask[];
  tasksDoneToday: number;
  tasksTotalToday: number;
  focus: CockpitFocusPlayer[];
  /** Antall i fokus-header — kan avvike fra focus.length (AI-foreslått total). */
  focusCount?: number;
  kpis: CockpitKpi[];
};

// ── Token-mappinger ─────────────────────────────────────────────
const avatarToneClass: Record<AvatarTone, string> = {
  default: "bg-secondary text-foreground",
  primary: "bg-primary text-accent",
  accent: "bg-accent text-primary",
};

const inboxTypeClass = {
  appr: "bg-[var(--color-pyr-spill-track)] text-primary",
  req: "bg-[var(--color-pyr-slag-track)] text-[var(--pyr-slag)]",
  msg: "bg-secondary text-muted-foreground",
  advice: "bg-[var(--color-pyr-tek-track)] text-[var(--pyr-tek)]",
} as const;

const signalClass: Record<SignalTone, string> = {
  alert: "bg-destructive/10 text-destructive",
  warn: "bg-[var(--color-pyr-tek-track)] text-[var(--pyr-tek)]",
  lime: "bg-accent text-primary",
};

// ── Kolonne-skall (header + scroll-body) ────────────────────────
function ColShell({
  label,
  count,
  countAlert,
  filter,
  children,
}: {
  label: string;
  count: string;
  countAlert?: boolean;
  filter: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card lg:h-[720px]">
      <div className="flex items-center gap-2 border-b border-border px-3.5 py-3">
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground">
          {label}
        </span>
        <span
          className={cn(
            "font-mono text-[10px] font-bold tracking-[0.04em]",
            countAlert ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {count}
        </span>
        <FilterChip label={filter} />
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

// ── COL 1 — TIMELINE ────────────────────────────────────────────
function TimelineCol({
  sessions,
  now,
  dateLabel,
}: {
  sessions: CockpitTimelineSession[];
  now: number;
  dateLabel: string;
}) {
  const firstUpcomingId = sessions.find((s) => now < s.startMin)?.id ?? null;
  const isEmpty = sessions.length === 0;

  return (
    <ColShell label="DAGENS TIMELINE" count={dateLabel} filter="ALLE">
      <div
        className={cn(
          "relative px-3.5 pb-3.5 pt-2",
          isEmpty && "min-h-[420px] lg:h-full",
        )}
      >
        {/* vertikal tidslinje-skinne — alltid synlig (også tom-tilstand, jf. fasit) */}
        <div className="pointer-events-none absolute bottom-3.5 left-[56px] top-[18px] w-px bg-border" />

        {isEmpty && (
          <div className="flex h-full flex-col items-center justify-center py-16 pl-[56px] text-center">
            <CalendarClock
              className="h-7 w-7 text-muted-foreground/40"
              strokeWidth={1.5}
              aria-hidden
            />
            <p className="mt-3 text-[13px] text-muted-foreground">
              Ingen økter planlagt i dag.
            </p>
          </div>
        )}

        {sessions.map((s) => {
          const end = s.startMin + s.durMin;
          const isDone = now >= end;
          const isActive = now >= s.startMin && now < end;
          const isUpcoming = now < s.startMin;
          const etaMin = s.startMin - now;
          const etaLabel =
            etaMin >= 60
              ? `om ${Math.floor(etaMin / 60)} t ${etaMin % 60} m`
              : `om ${etaMin} m`;

          const card = (
            <div className="grid grid-cols-[44px_1fr] items-start gap-x-4 py-2.5">
              {/* tidskolonne */}
              <div
                className={cn(
                  "font-mono text-xs font-extrabold leading-tight tabular-nums",
                  isActive
                    ? "text-primary"
                    : isDone
                      ? "text-muted-foreground"
                      : "text-foreground",
                )}
              >
                {s.time}
                <span className="mt-0.5 block font-mono text-[9px] font-semibold tracking-[0.04em] text-muted-foreground">
                  {s.durMin} m
                </span>
              </div>

              {/* event-kort */}
              <div
                className={cn(
                  "relative overflow-hidden rounded-lg border border-border px-2.5 pb-2.5 pl-3.5 pt-2",
                  isActive
                    ? "bg-card shadow-[0_0_0_2px_hsl(var(--accent))]"
                    : "bg-background",
                  isDone && "opacity-60",
                )}
              >
                <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-full bg-muted-foreground" />
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full font-display text-[9px] font-bold",
                      avatarToneClass[s.avatarTone ?? "default"],
                    )}
                  >
                    {s.initials}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-bold leading-tight tracking-[-0.005em] text-foreground",
                      isDone && "line-through decoration-border",
                    )}
                  >
                    {s.playerName}
                  </span>
                  {isActive && (
                    <span className="ml-auto inline-flex items-center gap-1 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-primary">
                      <span className="h-[5px] w-[5px] animate-pulse rounded-full bg-accent shadow-[0_0_4px_hsl(var(--accent)/0.7)]" />
                      PÅGÅR
                    </span>
                  )}
                  {isDone && (
                    <span className="ml-auto inline-flex items-center gap-1 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-success">
                      <Check className="h-[11px] w-[11px]" strokeWidth={2.5} aria-hidden />
                      FERDIG
                    </span>
                  )}
                </div>
                <div className="mt-1 text-xs leading-snug tracking-[-0.005em] text-foreground">
                  {s.title}
                </div>
                {isUpcoming && (
                  <div
                    className={cn(
                      "mt-0.5 font-mono text-[9px] font-bold tracking-[0.04em]",
                      s.id === firstUpcomingId ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {etaLabel}
                  </div>
                )}
              </div>
            </div>
          );

          return (
            <div key={s.id}>
              {/* NÅ-strek rett før første kommende økt */}
              {s.id === firstUpcomingId && (
                <div className="relative mb-1 h-0.5 bg-accent shadow-[0_0_8px_hsl(var(--accent)/0.5)]">
                  <span className="absolute -top-1 left-[34px] h-2.5 w-2.5 rounded-full border-2 border-card bg-accent" />
                  <span className="absolute -top-2.5 right-0 rounded-full bg-accent px-2 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-primary">
                    NÅ · {String(Math.floor(now / 60)).padStart(2, "0")}:
                    {String(now % 60).padStart(2, "0")}
                  </span>
                </div>
              )}
              {s.href ? (
                <Link href={s.href} className="block">
                  {card}
                </Link>
              ) : (
                card
              )}
            </div>
          );
        })}
      </div>
    </ColShell>
  );
}

// ── COL 2 — INNBOKS + OPPGAVER ──────────────────────────────────
function InboxCol({
  inbox,
  inboxCount,
  inboxUnread,
  tasks,
  tasksDoneToday,
  tasksTotalToday,
}: {
  inbox: CockpitInboxItem[];
  inboxCount: number;
  inboxUnread: number;
  tasks: CockpitTask[];
  tasksDoneToday: number;
  tasksTotalToday: number;
}) {
  return (
    <ColShell
      label="INNBOKS"
      count={`${inboxUnread} ULESTE`}
      countAlert={inboxUnread > 0}
      filter="ALLE"
    >
      {/* SISTE 24 T */}
      <div className="px-3.5 pb-3.5 pt-1">
        <div className="flex items-center gap-2 px-2 pb-2.5 pt-1">
          <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground">
            SISTE 24 T
          </span>
          <span className="font-mono text-[10px] font-bold text-muted-foreground">
            {inboxCount}
          </span>
          <Link
            href="/admin/innboks"
            className="ml-auto font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-primary transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-card"
          >
            SE ALLE
          </Link>
        </div>

        {inbox.map((it, idx) => {
          const row = (
            <div
              className={cn(
                "relative grid cursor-pointer grid-cols-[24px_1fr_auto] items-center gap-x-2.5 rounded-lg px-2 py-2.5 hover:bg-secondary",
                idx > 0 && "rounded-none border-t border-border",
              )}
            >
              {it.unread && (
                <span className="absolute left-0 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-destructive" />
              )}
              <span
                className={cn(
                  "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-display text-[9px] font-bold",
                  avatarToneClass[it.avatarTone ?? "default"],
                )}
              >
                {it.initials}
              </span>
              <div className="flex min-w-0 flex-col leading-tight">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 text-xs font-semibold tracking-[-0.005em]",
                    it.unread ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {it.title}
                  <span
                    className={cn(
                      "rounded-[3px] px-1.5 py-px font-mono text-[8px] font-extrabold uppercase tracking-[0.12em]",
                      inboxTypeClass[it.type],
                    )}
                  >
                    {it.typeLabel}
                  </span>
                </span>
                <span
                  className={cn(
                    "mt-0.5 truncate text-[11px] tracking-[-0.005em] text-foreground",
                    it.unread && "font-semibold",
                  )}
                >
                  {it.preview}
                </span>
              </div>
              <span className="shrink-0 font-mono text-[10px] font-semibold tracking-[0.04em] text-muted-foreground">
                {it.when}
              </span>
            </div>
          );
          return it.href ? (
            <Link key={it.id} href={it.href} className="block">
              {row}
            </Link>
          ) : (
            <div key={it.id}>{row}</div>
          );
        })}
      </div>

      {/* OPPGAVER — lokal toggle + «+ NY» (client-leaf) */}
      <TasksSection
        initialTasks={tasks}
        doneToday={tasksDoneToday}
        totalToday={tasksTotalToday}
      />
    </ColShell>
  );
}

// ── COL 3 — TRENGER OPPMERKSOMHET ───────────────────────────────
function FocusCol({
  focus,
  focusCount,
}: {
  focus: CockpitFocusPlayer[];
  focusCount?: number;
}) {
  const count = focusCount ?? focus.length;
  return (
    <ColShell
      label="TRENGER OPPMERKSOMHET"
      count={`${count} SPILLERE`}
      filter="AUTO"
    >
      <div className="flex flex-col gap-2.5 p-3.5">
        {focus.map((f) => {
          const SignalIcon = f.signal.icon;
          return (
            <div
              key={f.id}
              className={cn(
                "overflow-hidden rounded-xl border bg-card",
                f.alert
                  ? "border-destructive/30 bg-gradient-to-b from-destructive/[0.04] to-40% to-transparent"
                  : "border-border bg-gradient-to-b from-[var(--color-pyr-tek-track)] to-40% to-transparent",
              )}
            >
              <div className="grid grid-cols-[44px_1fr_auto] items-center gap-x-3 p-3">
                <span
                  className={cn(
                    "inline-flex h-11 w-11 items-center justify-center rounded-full font-display text-sm font-bold",
                    avatarToneClass[f.avatarTone ?? "default"],
                  )}
                >
                  {f.initials}
                </span>
                <div className="min-w-0">
                  <div className="font-display text-[15px] font-bold leading-tight tracking-[-0.015em] text-foreground">
                    {f.name}
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                    {f.meta}
                  </div>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em]",
                    signalClass[f.signal.tone],
                  )}
                >
                  <SignalIcon className="h-[11px] w-[11px]" strokeWidth={2} aria-hidden />
                  {f.signal.label}
                </span>
              </div>
              <div className="px-3 pb-2.5 text-xs leading-relaxed tracking-[-0.005em] text-foreground">
                {f.reason}
              </div>
              <div className="flex gap-1.5 px-3 pb-3">
                {f.actions.map((a, i) => {
                  const ActionIcon = a.icon;
                  const inner = (
                    <span
                      className={cn(
                        "inline-flex h-[30px] cursor-pointer items-center gap-1.5 rounded-lg px-2.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em]",
                        a.primary
                          ? "border border-primary bg-primary text-accent hover:opacity-90"
                          : "border border-border bg-card text-foreground hover:bg-secondary",
                      )}
                    >
                      <ActionIcon className="h-[11px] w-[11px]" strokeWidth={2} aria-hidden />
                      {a.label}
                    </span>
                  );
                  return a.href ? (
                    <Link key={i} href={a.href}>
                      {inner}
                    </Link>
                  ) : (
                    <button key={i} type="button">
                      {inner}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </ColShell>
  );
}

// ── KPI-strip ───────────────────────────────────────────────────
function BarSpark({ values, active }: { values: number[]; active?: number }) {
  const max = Math.max(1, ...values);
  const n = values.length;
  const gap = 6;
  const barW = (80 - gap * (n - 1)) / n;
  return (
    <svg viewBox="0 0 80 24" preserveAspectRatio="none" className="h-6 w-20" aria-hidden>
      {values.map((v, i) => {
        const h = Math.max(2, (v / max) * 22);
        return (
          <rect
            key={i}
            x={i * (barW + gap)}
            y={24 - h}
            width={barW}
            height={h}
            className={i === active ? "fill-accent" : "fill-border"}
          />
        );
      })}
    </svg>
  );
}

function KpiRow({ kpis }: { kpis: CockpitKpi[] }) {
  const deltaIcon = { up: TrendingUp, down: TrendingDown, flat: Minus } as const;
  const deltaClass = {
    up: "text-success",
    down: "text-destructive",
    flat: "text-muted-foreground",
  } as const;

  return (
    <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {kpis.map((k) => {
        const Icon = k.icon;
        const DeltaIcon = deltaIcon[k.delta.tone];
        return (
          <div
            key={k.label}
            className="relative flex flex-col gap-2.5 overflow-hidden rounded-xl border border-border bg-card px-[18px] py-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
                {k.label}
              </span>
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                <Icon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
              </span>
            </div>
            <div className="font-mono text-[34px] font-bold leading-none tracking-[-0.02em] tabular-nums text-foreground">
              {k.value}
              {k.unit && (
                <span className="ml-1 text-base font-bold text-muted-foreground">
                  {k.unit}
                </span>
              )}
            </div>
            <div
              className={cn(
                "inline-flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-[0.04em]",
                deltaClass[k.delta.tone],
              )}
            >
              <DeltaIcon className="h-[11px] w-[11px]" strokeWidth={2} aria-hidden />
              {k.delta.text}
            </div>
            {/* sparkline / barchart — bottom-right, subtil */}
            <div className="pointer-events-none absolute bottom-3.5 right-3.5 h-6 w-20 opacity-60">
              {k.spark.type === "line" ? (
                <Sparkline
                  values={k.spark.values}
                  width={80}
                  height={24}
                  color="hsl(var(--primary))"
                  className="h-6 w-20"
                />
              ) : (
                <BarSpark values={k.spark.values} active={k.spark.barActive} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Hovedkomponent ──────────────────────────────────────────────
export function AgencyCockpit({ data }: { data: CockpitData }) {
  return (
    <div className="mx-auto max-w-[1200px]">
      {/* header */}
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <h1 className="font-display text-[22px] font-bold leading-tight tracking-[-0.02em] text-foreground sm:text-[26px]">
          God formiddag, {data.coachFirstName} —{" "}
          <em className="font-normal italic text-primary">{data.aiContext}</em>
        </h1>
        <div className="inline-flex shrink-0 items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent shadow-[0_0_6px_hsl(var(--accent)/0.7)]" />
            LIVE
          </span>
          {data.liveLabel}
        </div>
      </div>

      {/* 3-kolonne grid */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <TimelineCol
          sessions={data.timeline}
          now={data.now}
          dateLabel={data.timelineDateLabel}
        />
        <InboxCol
          inbox={data.inbox}
          inboxCount={data.inboxCount}
          inboxUnread={data.inboxUnread}
          tasks={data.tasks}
          tasksDoneToday={data.tasksDoneToday}
          tasksTotalToday={data.tasksTotalToday}
        />
        <FocusCol focus={data.focus} focusCount={data.focusCount} />
      </div>

      {/* KPI-strip */}
      <KpiRow kpis={data.kpis} />
    </div>
  );
}
