/**
 * AgencyOS — Daglig brief (/admin/agencyos)
 * Pixel-port av public/design-handover/agencyos/components-agency-dashboard.html.
 *
 * 3-kolonne operations cockpit (Bloomberg-tetthet):
 *   COL 1 — Dagens timeline (økter, pyramide-akse-kant, NÅ-strek, ferdig/pågår/kommer)
 *   COL 2 — Innboks (type-piller) + Oppgaver (checkbox)
 *   COL 3 — Trenger oppmerksomhet (fokus-spillere med signal-pille + quick-actions)
 *   KPI-strip — Aktive spillere · Økter i dag · Bookinger uke · Treningstimer stallen
 *
 * Bygget med athletic-primitiver (Sparkline) + DS-tokens. Ingen hardkodet hex,
 * ingen emoji (kun lucide). Server component — "nå"-logikk utledes fra `now`-prop.
 */

import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  CalendarPlus,
  Check,
  ChevronDown,
  ClipboardCheck,
  Clock,
  Cloud,
  Hand,
  Layers,
  MapPin,
  MessageSquare,
  Minus,
  Phone,
  Plus,
  Reply,
  TrendingDown,
  TrendingUp,
  User as UserIcon,
  Users,
  ZapOff,
  type LucideIcon,
} from "lucide-react";
import { Sparkline } from "@/components/athletic";
import { cn } from "@/lib/utils";

export type BriefAxis = "fys" | "tek" | "slag" | "spill" | "turn";
type AvatarTone = "default" | "primary" | "accent";

export type TimelineSession = {
  id: string;
  /** Minutter siden midnatt — styrer ferdig/pågår/kommer + NÅ-strek. */
  startMin: number;
  durMin: number;
  time: string;
  initials: string;
  avatarTone?: AvatarTone;
  playerName: string;
  axis: BriefAxis;
  axisLabel: string;
  title: string;
  meta: { icon: LucideIcon; text: string }[];
  groupChip?: { label: string; tone: "wang" | "gfgk" | "test" };
  href?: string;
};

export type InboxItem = {
  id: string;
  initials: string;
  avatarTone?: AvatarTone;
  name: string;
  type: "appr" | "req" | "msg" | "advice";
  typeLabel: string;
  preview: string;
  when: string;
  unread?: boolean;
  href?: string;
};

export type TaskItem = {
  id: string;
  label: string;
  done?: boolean;
  tag: string;
  due?: boolean;
};

export type FocusAction = { label: string; icon: LucideIcon; primary?: boolean; href?: string };
export type FocusPlayer = {
  id: string;
  initials: string;
  avatarTone?: AvatarTone;
  name: string;
  meta: string;
  alert?: boolean;
  signal: { label: string; tone: "alert" | "warn" | "lime"; icon: LucideIcon };
  /** Rik begrunnelse — kan inneholde <b>/<em>-aktig emfase via segments. */
  reason: React.ReactNode;
  actions: FocusAction[];
};

export type BriefKpi = {
  label: string;
  value: string;
  unit?: string;
  delta: { text: string; tone: "up" | "down" | "flat" };
  icon: LucideIcon;
  spark: { type: "line" | "bar"; values: number[]; barActive?: number };
};

export type DailyBriefProps = {
  coachFirstName: string;
  aiContext: React.ReactNode;
  dateLabel: string;
  timeLabel: string;
  timelineDateLabel: string;
  now: number; // minutter siden midnatt
  timeline: TimelineSession[];
  inboxCount: number;
  inboxUnread: number;
  inbox: InboxItem[];
  tasks: TaskItem[];
  tasksDoneToday: number;
  tasksTotalToday: number;
  focus: FocusPlayer[];
  kpis: BriefKpi[];
};

const avatarToneClass: Record<AvatarTone, string> = {
  default: "bg-secondary text-foreground",
  primary: "bg-primary text-accent",
  accent: "bg-accent text-primary",
};

const axisPillClass: Record<BriefAxis, string> = {
  fys: "bg-[var(--color-pyr-fys-track)] text-[var(--pyr-fys)]",
  tek: "bg-[var(--color-pyr-tek-track)] text-[var(--pyr-tek)]",
  slag: "bg-[var(--color-pyr-slag-track)] text-[var(--pyr-slag)]",
  spill: "bg-[var(--color-pyr-spill-track)] text-primary",
  turn: "bg-destructive/10 text-destructive",
};

const axisBarClass: Record<BriefAxis, string> = {
  fys: "bg-pyr-fys",
  tek: "bg-pyr-tek",
  slag: "bg-pyr-slag",
  spill: "bg-pyr-spill",
  turn: "bg-pyr-turn",
};

const groupChipClass = {
  wang: "bg-muted-foreground/10 text-muted-foreground",
  gfgk: "bg-[var(--color-pyr-fys-track)] text-[var(--pyr-fys)]",
  test: "bg-[var(--color-pyr-slag-track)] text-[var(--pyr-slag)]",
} as const;

const inboxTypeClass = {
  appr: "bg-[var(--color-pyr-spill-track)] text-primary",
  req: "bg-[var(--color-pyr-slag-track)] text-[var(--pyr-slag)]",
  msg: "bg-secondary text-muted-foreground",
  advice: "bg-[var(--color-pyr-tek-track)] text-[var(--pyr-tek)]",
} as const;

const signalClass = {
  alert: "bg-destructive/10 text-destructive",
  warn: "bg-[var(--color-pyr-tek-track)] text-[var(--pyr-tek)]",
  lime: "bg-accent text-primary",
} as const;

/** Mono-caps eyebrow brukt i kolonne-headere og labels. */
function colHeadLbl(text: string) {
  return (
    <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground">
      {text}
    </span>
  );
}

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
    <div className="flex h-[720px] flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-3.5 py-3">
        {colHeadLbl(label)}
        <span
          className={cn(
            "font-mono text-[10px] font-bold tracking-[0.04em]",
            countAlert ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {count}
        </span>
        <span className="ml-auto inline-flex h-[22px] cursor-pointer items-center gap-1 rounded-full bg-secondary px-2 font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          {filter}
          <ChevronDown className="h-2.5 w-2.5" strokeWidth={2} aria-hidden />
        </span>
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
  sessions: TimelineSession[];
  now: number;
  dateLabel: string;
}) {
  const firstUpcomingId = sessions.find((s) => now < s.startMin)?.id ?? null;

  return (
    <ColShell label="DAGENS TIMELINE" count={dateLabel} filter="ALLE">
      <div className="relative px-3.5 pb-3.5 pt-2">
        {/* vertikal akse-linje */}
        <div className="pointer-events-none absolute bottom-3.5 left-[56px] top-[18px] w-px bg-border" />

        {sessions.length === 0 && (
          <div className="px-2 py-16 text-center">
            <CalendarClock className="mx-auto h-7 w-7 text-muted-foreground/40" strokeWidth={1.5} aria-hidden />
            <p className="mt-3 text-[13px] text-muted-foreground">Ingen økter planlagt i dag.</p>
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

          return (
            <div key={s.id}>
              {/* NÅ-strek rett før første kommende økt */}
              {s.id === firstUpcomingId && (
                <div className="relative -mx-0 mb-1 h-0.5 bg-accent shadow-[0_0_8px_hsl(var(--accent)/0.5)]">
                  <span className="absolute -top-1 left-[34px] h-2.5 w-2.5 rounded-full border-2 border-card bg-accent" />
                  <span className="absolute -top-2.5 right-0 rounded-full bg-accent px-2 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-primary">
                    NÅ · {String(Math.floor(now / 60)).padStart(2, "0")}:{String(now % 60).padStart(2, "0")}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-[44px_1fr] items-start gap-x-4 py-2.5">
                {/* tidskolonne */}
                <div
                  className={cn(
                    "font-mono text-xs font-extrabold leading-tight tabular-nums",
                    isActive ? "text-primary" : isDone ? "text-muted-foreground" : "text-foreground",
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
                    isActive ? "bg-card shadow-[0_0_0_2px_hsl(var(--accent))]" : "bg-background",
                    isDone && "opacity-60",
                  )}
                >
                  {/* pyramide-akse-kant */}
                  <span
                    className={cn(
                      "absolute bottom-2 left-0 top-2 w-[3px] rounded-full",
                      axisBarClass[s.axis],
                    )}
                  />
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
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em]",
                        isActive && "ml-2",
                        !isActive && !isDone && "ml-auto",
                        axisPillClass[s.axis],
                      )}
                    >
                      {s.axisLabel}
                    </span>
                  </div>
                  <div className="mt-1 text-xs leading-snug tracking-[-0.005em] text-foreground">
                    {s.title}
                  </div>
                  <div className="mt-1 inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
                    {s.meta.map((m, i) => {
                      const MetaIcon = m.icon;
                      return (
                        <span key={i} className="inline-flex items-center gap-1">
                          <MetaIcon className="h-2.5 w-2.5" strokeWidth={1.5} aria-hidden />
                          {m.text}
                        </span>
                      );
                    })}
                    {s.groupChip && (
                      <span
                        className={cn(
                          "inline-flex h-3.5 items-center rounded-[3px] px-1.5 font-mono text-[8px] font-extrabold uppercase tracking-[0.10em]",
                          groupChipClass[s.groupChip.tone],
                        )}
                      >
                        {s.groupChip.label}
                      </span>
                    )}
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
  inbox: InboxItem[];
  inboxCount: number;
  inboxUnread: number;
  tasks: TaskItem[];
  tasksDoneToday: number;
  tasksTotalToday: number;
}) {
  return (
    <ColShell label="INNBOKS" count={`${inboxUnread} ULESTE`} countAlert={inboxUnread > 0} filter="ALLE">
      {/* SISTE 24 T */}
      <div className="px-3.5 pb-3.5 pt-1">
        <div className="flex items-center gap-2 px-2 pb-2.5 pt-1">
          <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground">
            SISTE 24 T
          </span>
          <span className="font-mono text-[10px] font-bold text-muted-foreground">{inboxCount}</span>
          <span className="ml-auto cursor-pointer font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-primary">
            SE ALLE
          </span>
        </div>

        {inbox.map((it, idx) => {
          const Row = (
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
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[-0.005em] text-muted-foreground">
                  {it.name}
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
              {Row}
            </Link>
          ) : (
            <div key={it.id}>{Row}</div>
          );
        })}
      </div>

      {/* OPPGAVER */}
      <div className="border-t border-border px-3.5 pb-3.5 pt-3.5">
        <div className="flex items-center gap-2 px-2 pb-2.5 pt-1">
          <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground">
            OPPGAVER
          </span>
          <span className="font-mono text-[10px] font-bold text-muted-foreground">
            {tasksDoneToday} av {tasksTotalToday} i dag
          </span>
          <span className="ml-auto cursor-pointer font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-primary">
            + NY
          </span>
        </div>

        {tasks.map((t) => (
          <div
            key={t.id}
            className="grid cursor-pointer grid-cols-[18px_1fr_auto] items-center gap-x-2.5 rounded-md px-2 py-[7px] hover:bg-secondary"
          >
            <span
              className={cn(
                "inline-flex h-4 w-4 items-center justify-center rounded border-[1.5px]",
                t.done ? "border-primary bg-primary text-accent" : "border-input bg-card text-transparent",
              )}
            >
              {t.done && <Check className="h-[11px] w-[11px]" strokeWidth={3} aria-hidden />}
            </span>
            <span
              className={cn(
                "text-xs leading-snug tracking-[-0.005em]",
                t.done ? "text-muted-foreground line-through" : "text-foreground",
              )}
            >
              {t.label}
            </span>
            <span
              className={cn(
                "font-mono text-[9px] font-bold uppercase tracking-[0.10em]",
                t.due ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {t.tag}
            </span>
          </div>
        ))}
      </div>
    </ColShell>
  );
}

// ── COL 3 — TRENGER OPPMERKSOMHET ───────────────────────────────
function FocusCol({ focus }: { focus: FocusPlayer[] }) {
  return (
    <ColShell label="TRENGER OPPMERKSOMHET" count={`${focus.length} SPILLERE`} filter="AUTO">
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
                  : "border-border",
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
                <div>
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
function KpiRow({ kpis }: { kpis: BriefKpi[] }) {
  const deltaIcon = { up: TrendingUp, down: TrendingDown, flat: Minus } as const;
  const deltaClass = { up: "text-success", down: "text-destructive", flat: "text-muted-foreground" } as const;

  return (
    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
              {k.unit && <span className="ml-1 text-base font-bold text-muted-foreground">{k.unit}</span>}
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

// ── Hovedkomponent ──────────────────────────────────────────────
export function DailyBrief({
  coachFirstName,
  aiContext,
  dateLabel,
  timeLabel,
  timelineDateLabel,
  now,
  timeline,
  inboxCount,
  inboxUnread,
  inbox,
  tasks,
  tasksDoneToday,
  tasksTotalToday,
  focus,
  kpis,
}: DailyBriefProps) {
  return (
    <div className="mx-auto max-w-[1200px]">
      {/* header */}
      <div className="mb-3 flex items-end justify-between gap-4">
        <h1 className="font-display text-[26px] font-bold leading-tight tracking-[-0.02em] text-foreground">
          God formiddag, {coachFirstName} —{" "}
          <em className="font-normal italic text-primary">{aiContext}</em>
        </h1>
        <div className="inline-flex shrink-0 items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent shadow-[0_0_6px_hsl(var(--accent)/0.7)]" />
            LIVE
          </span>
          {dateLabel} · {timeLabel}
        </div>
      </div>

      {/* 3-kolonne grid */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <TimelineCol sessions={timeline} now={now} dateLabel={timelineDateLabel} />
        <InboxCol
          inbox={inbox}
          inboxCount={inboxCount}
          inboxUnread={inboxUnread}
          tasks={tasks}
          tasksDoneToday={tasksDoneToday}
          tasksTotalToday={tasksTotalToday}
        />
        <FocusCol focus={focus} />
      </div>

      {/* KPI-strip */}
      <KpiRow kpis={kpis} />
    </div>
  );
}

// re-eksporter ikoner som data-loaderen trenger for meta/actions/signals
export const BriefIcons = {
  Users,
  MapPin,
  UserIcon,
  Layers,
  ClipboardCheck,
  Cloud,
  AlertTriangle,
  Hand,
  ZapOff,
  Plus,
  MessageSquare,
  CalendarPlus,
  Reply,
  Phone,
  CalendarClock,
  Clock,
  Activity,
} as const;
