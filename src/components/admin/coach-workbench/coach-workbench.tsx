/**
 * Coach-Workbench (/admin/spillere/[id]/workbench) — coach opererer i
 * spillerens workbench (role=coach).
 *
 * Pixel-port av:
 *   [historisk fasit, fjernet 2026-07-03] agencyos/components-workbench-sidebar.html
 *   [historisk fasit, fjernet 2026-07-03] agencyos/components-workbench-week.html
 *   [historisk fasit, fjernet 2026-07-03] agencyos/components-workbench-day.html
 *
 * Desktop 3-søyle:
 *   VENSTRE — sidemeny med tre-struktur (Sesong / Planer / Standardøkter /
 *             Turneringer / Mål / Stats+pyramide)
 *   MIDT    — uke-kalender (7 kol × tidsrader 07–21, økt-blokker farget per akse,
 *             NÅ-strek i dag-kolonnen) + 7 faner
 *   HØYRE   — inspector: plan-godkjenning, avvik fra plan, ønsker veiledning,
 *             tildel oppgave + COACH-ONLY-blokk (gul-aksent)
 *
 * Server component. Ekte Prisma-data via loadCoachWorkbench. Ingen hardkodet
 * hex, ingen emoji (kun lucide). Data-tett spacing.
 */

import { Avatar } from "@/components/athletic/golfdata";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CalendarRange,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Flag,
  GripVertical,
  Hand,
  Layers,
  LayoutGrid,
  Plus,
  Reply,
  ShieldCheck,
  Sparkles,
  Target,
  Undo2,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import type { PlanStatus } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import {
  GRID_START_HOUR,
  GRID_END_HOUR,
  PIXEL_PER_HOUR as HOUR_PX,
  GRID_BODY_PX as GRID_HEIGHT,
  gridHours,
} from "@/lib/calendar/notion-grid";

type Tone = "fys" | "tek" | "slag" | "spill" | "turn";

export type WBWeekSession = {
  id: string;
  dow: number; // 0 = mandag
  startMin: number;
  durMin: number;
  time: string;
  tone: Tone;
  axisLabel: string;
  title: string;
  meta: string;
  done: boolean;
  skipped: boolean;
};

export type WBDay = {
  dow: string;
  date: number;
  monthLabel: string | null;
  isToday: boolean;
  isWeekend: boolean;
};

export type WBTreeWeek = { week: number; isNow: boolean };
export type WBPlanRow = { id: string; name: string; status: string; active: boolean };
export type WBStandardSession = { id: string; name: string; tone: Tone; durMin: number; drillCount: number };
export type WBGoalRow = { id: string; title: string; meta: string; tone: Tone };
export type WBPyramidRow = { label: string; tone: Tone; pct: number; hours: number; deltaMin: number };

export type CoachWorkbenchProps = {
  playerId: string;
  playerName: string;
  playerInitials: string;
  playerAvatarUrl: string | null;
  playerMeta: string;
  nowLabel: string;
  nowMin: number;
  weekNumber: number;
  weekRangeLabel: string;
  days: WBDay[];
  weekGrid: WBWeekSession[];
  seasonLabel: string;
  seasonWeeks: number;
  treeWeeks: WBTreeWeek[];
  planRows: WBPlanRow[];
  standardSessions: WBStandardSession[];
  goalRows: WBGoalRow[];
  pyramidRows: WBPyramidRow[];
  pyramidAlarm: string | null;
  activePlan: {
    id: string;
    name: string;
    status: PlanStatus;
    statusLabel: string;
    weekNumber: number;
  } | null;
  deviation: {
    pct: number | null;
    total: number;
    done: number;
    skipped: number;
    elapsedMissed: number;
  };
  guidance: { id: string; reason: string; area: string | null; when: string }[];
  coachOnlyActions: { id: string; actionType: string; agentName: string; when: string }[];
};

// ── Token-maps (rå --pyr-* tokens per design-spec) ──────────────
const axisBorderClass: Record<Tone, string> = {
  fys: "border-l-pyr-fys",
  tek: "border-l-pyr-tek",
  slag: "border-l-pyr-slag",
  spill: "border-l-pyr-spill",
  turn: "border-l-pyr-turn",
};
const axisDotClass: Record<Tone, string> = {
  fys: "bg-pyr-fys",
  tek: "bg-pyr-tek",
  slag: "bg-pyr-slag",
  spill: "bg-pyr-spill",
  turn: "bg-pyr-turn",
};
const axisFillClass: Record<Tone, string> = {
  fys: "bg-pyr-fys",
  tek: "bg-pyr-tek",
  slag: "bg-pyr-slag",
  spill: "bg-pyr-spill",
  turn: "bg-pyr-turn",
};

const TABS = [
  "Oversikt",
  "Pyramide",
  "Treningsplan",
  "Statistikk",
  "Økonomi",
  "Notater",
  "Admin",
] as const;

function monoLabel(text: string) {
  return (
    <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground">
      {text}
    </span>
  );
}

// ── Sidemeny-seksjon (expandable group) ─────────────────────────
function SidebarGroup({
  icon: Icon,
  label,
  count,
  open,
  children,
}: {
  icon: LucideIcon;
  label: string;
  count?: string;
  open?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="border-b border-border last:border-b-0">
      <div className="grid w-full grid-cols-[16px_1fr_auto_12px] items-center gap-2 px-3.5 py-2.5 text-left">
        <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} aria-hidden />
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-foreground">
          {label}
        </span>
        {count ? (
          <span className="font-mono text-[10px] font-semibold tabular-nums text-muted-foreground">{count}</span>
        ) : (
          <span />
        )}
        <ChevronRight
          className={cn("h-3 w-3 text-muted-foreground", open && "rotate-90 text-foreground")}
          strokeWidth={2}
          aria-hidden
        />
      </div>
      {open && children && <div className="px-3 pb-3.5 pt-1">{children}</div>}
    </div>
  );
}

function WorkbenchSidebar({
  playerName,
  seasonLabel,
  seasonWeeks,
  treeWeeks,
  planRows,
  standardSessions,
  goalRows,
  pyramidRows,
  pyramidAlarm,
}: Pick<
  CoachWorkbenchProps,
  | "playerName"
  | "seasonLabel"
  | "seasonWeeks"
  | "treeWeeks"
  | "planRows"
  | "standardSessions"
  | "goalRows"
  | "pyramidRows"
  | "pyramidAlarm"
>) {
  return (
    <aside className="flex h-[760px] w-[280px] shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-3 py-3.5">
        <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary font-display text-[13px] font-bold tracking-[-0.02em] text-primary-foreground">
          ak
          <span className="absolute right-[5px] top-[5px] h-1 w-1 rounded-full bg-accent" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            WORKBENCH
          </span>
          <span className="mt-0.5 truncate font-display text-sm font-bold tracking-[-0.015em] text-foreground">
            {playerName}
          </span>
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {/* 1. Sesong-tre */}
        <SidebarGroup icon={CalendarRange} label="Sesong" count={String(new Date().getFullYear())} open>
          {treeWeeks.length === 0 ? (
            <p className="px-2 py-2 text-[11px] text-muted-foreground">Ingen aktiv sesong.</p>
          ) : (
            <>
              <div className="grid grid-cols-[14px_1fr] items-center gap-2 rounded-lg px-2 py-1.5">
                <ChevronRight className="h-3 w-3 rotate-90 text-foreground" strokeWidth={2} aria-hidden />
                <span className="inline-flex items-center gap-1.5 text-xs tracking-[-0.005em] text-foreground">
                  {seasonLabel}
                  <span className="font-mono text-[10px] font-medium text-muted-foreground">{seasonWeeks} u</span>
                </span>
              </div>
              <div className="ml-[18px] border-l border-dashed border-border pl-2">
                {treeWeeks.map((w) => (
                  <div
                    key={w.week}
                    className={cn(
                      "grid grid-cols-[1fr_auto] items-center gap-2 rounded-lg px-2 py-1.5",
                      w.isNow && "bg-accent/[0.18]",
                    )}
                  >
                    <span className="inline-flex items-center gap-1.5 text-xs tracking-[-0.005em] text-foreground">
                      {w.isNow && (
                        <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_hsl(var(--accent)/0.7)]" />
                      )}
                      <span className={cn(w.isNow && "font-semibold")}>Uke {w.week}</span>
                      {w.isNow && <span className="font-mono text-[10px] text-muted-foreground">nå</span>}
                    </span>
                    <span />
                  </div>
                ))}
              </div>
            </>
          )}
        </SidebarGroup>

        {/* 2. Planer A/B */}
        <SidebarGroup
          icon={Layers}
          label="Planer"
          count={planRows.length > 0 ? `${planRows.length}` : undefined}
          open
        >
          {planRows.length === 0 ? (
            <p className="px-2 py-2 text-[11px] text-muted-foreground">Ingen planer enda.</p>
          ) : (
            planRows.map((p) => (
              <div key={p.id} className="grid grid-cols-[8px_1fr_auto] items-center gap-2 rounded-md px-2 py-1.5">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    p.active ? "bg-accent shadow-[0_0_6px_hsl(var(--accent)/0.7)]" : "bg-muted-foreground/40",
                  )}
                />
                <span className={cn("truncate text-xs text-foreground", p.active && "font-semibold")}>{p.name}</span>
                <span className="font-mono text-[9px] tracking-[0.04em] text-muted-foreground">{p.status}</span>
              </div>
            ))
          )}
        </SidebarGroup>

        {/* 3. Standardøkter */}
        <SidebarGroup
          icon={LayoutGrid}
          label="Standardøkter"
          count={standardSessions.length > 0 ? `${standardSessions.length}` : undefined}
          open
        >
          {standardSessions.length === 0 ? (
            <p className="px-2 py-2 text-[11px] text-muted-foreground">Ingen økter i uka.</p>
          ) : (
            standardSessions.map((o) => (
              <div key={o.id} className="grid grid-cols-[12px_8px_1fr_auto] items-center gap-2 rounded-lg px-2 py-2">
                <GripVertical className="h-3 w-3 text-muted-foreground/50" strokeWidth={1.5} aria-hidden />
                <span className={cn("h-2 w-2 rounded-full", axisDotClass[o.tone])} />
                <span className="text-xs leading-tight tracking-[-0.005em] text-foreground">
                  {o.name}
                  {o.drillCount > 0 && (
                    <span className="mt-0.5 block font-mono text-[9px] tracking-[0.04em] text-muted-foreground">
                      {o.drillCount} drills
                    </span>
                  )}
                </span>
                <span className="font-mono text-[10px] font-semibold tabular-nums text-muted-foreground">
                  {o.durMin} m
                </span>
              </div>
            ))
          )}
          <button
            type="button"
            className="mt-2 inline-flex w-full items-center gap-1.5 rounded-lg border border-dashed border-border px-2.5 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground hover:border-primary hover:text-primary"
          >
            <Plus className="h-3 w-3" strokeWidth={2} aria-hidden />
            Ny standardøkt
          </button>
        </SidebarGroup>

        {/* 4. Turneringer */}
        <SidebarGroup icon={Flag} label="Turneringer" />

        {/* 5. Treningsplaner */}
        <SidebarGroup icon={ClipboardList} label="Treningsplaner" />

        {/* 6. Mål */}
        <SidebarGroup icon={Target} label="Mål" count={goalRows.length > 0 ? `${goalRows.length}` : undefined} open>
          {goalRows.length === 0 ? (
            <p className="px-2 py-2 text-[11px] text-muted-foreground">Ingen aktive mål.</p>
          ) : (
            goalRows.map((g) => (
              <div key={g.id} className="px-2 py-1.5">
                <span className="text-xs tracking-[-0.005em] text-foreground">
                  {g.title}
                  <span className="mt-0.5 block font-mono text-[9px] tracking-[0.04em] text-muted-foreground">
                    {g.meta}
                  </span>
                </span>
              </div>
            ))
          )}
        </SidebarGroup>

        {/* 7. Stats / pyramide */}
        <SidebarGroup icon={BarChart3} label="Stats · pyramide" count="30 d" open>
          {pyramidRows.every((r) => r.pct === 0) ? (
            <p className="px-2 py-2 text-[11px] text-muted-foreground">Ingen registrert trening siste 30 d.</p>
          ) : (
            <>
              {pyramidRows.map((r) => (
                <div key={r.label} className="grid grid-cols-[38px_1fr_44px] items-center gap-2 px-1 py-1.5">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-foreground">
                    {r.label}
                  </span>
                  <span className="relative h-2 overflow-hidden rounded-full bg-primary/[0.06]">
                    <span className={cn("absolute inset-y-0 left-0 rounded-full", axisFillClass[r.tone])} style={{ width: `${r.pct}%` }} />
                  </span>
                  <span className="text-right font-mono text-[10px] font-semibold tabular-nums text-muted-foreground">
                    {r.pct}%
                  </span>
                </div>
              ))}
              {pyramidAlarm && (
                <div className="mt-2.5 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/[0.06] p-2.5">
                  <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0 text-destructive" strokeWidth={1.5} aria-hidden />
                  <p className="text-[11px] leading-snug text-foreground">
                    <span className="font-bold text-destructive">Ubalanse.</span> {pyramidAlarm}
                  </p>
                </div>
              )}
            </>
          )}
        </SidebarGroup>
      </div>
    </aside>
  );
}

// ── Uke-kalender (midt) ─────────────────────────────────────────
function WeekCalendar({
  days,
  weekGrid,
  weekNumber,
  weekRangeLabel,
  nowMin,
  nowLabel,
}: Pick<
  CoachWorkbenchProps,
  "days" | "weekGrid" | "weekNumber" | "weekRangeLabel" | "nowMin" | "nowLabel"
>) {
  const nowTop = ((nowMin - GRID_START_HOUR * 60) / 60) * HOUR_PX;
  const nowVisible = nowMin >= GRID_START_HOUR * 60 && nowMin <= GRID_END_HOUR * 60;
  const hours = gridHours();

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Toolbar */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        {monoLabel(`UKE ${weekNumber}`)}
        <span className="font-mono text-[11px] tracking-[0.04em] text-muted-foreground">{weekRangeLabel}</span>
        <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.10em] text-primary">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent shadow-[0_0_6px_hsl(var(--accent)/0.7)]" />
          NÅ {nowLabel}
        </span>
      </div>

      {/* Dag-headere */}
      <div className="grid grid-cols-[48px_repeat(7,1fr)] border-b border-border">
        <div className="border-r border-border" />
        {days.map((d, i) => (
          <div
            key={i}
            className={cn(
              "flex flex-col gap-0.5 border-r border-border px-2 py-2.5 last:border-r-0",
              d.isWeekend && "bg-foreground/[0.02]",
            )}
          >
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {d.dow}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 font-display text-base font-bold tabular-nums tracking-[-0.015em]",
                d.isToday ? "text-primary" : d.isWeekend ? "text-muted-foreground" : "text-foreground",
              )}
            >
              {d.date}
              {d.isToday && <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_hsl(var(--accent)/0.7)]" />}
              {d.monthLabel && (
                <span className="font-mono text-[10px] font-medium tracking-[0.04em] text-muted-foreground">
                  {d.monthLabel}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-[48px_repeat(7,1fr)]">
        {/* Tidskolonne */}
        <div className="relative border-r border-border" style={{ height: GRID_HEIGHT }}>
          {hours.map((h, i) => (
            <span
              key={h}
              className="absolute right-2 -translate-y-1/2 font-mono text-[10px] font-semibold tabular-nums tracking-[0.04em] text-muted-foreground"
              style={{ top: i * HOUR_PX }}
            >
              {String(h).padStart(2, "0")}
            </span>
          ))}
        </div>

        {/* 7 dag-kolonner */}
        {days.map((d, dayIdx) => {
          const isToday = d.isToday;
          const sessions = weekGrid.filter((s) => s.dow === dayIdx);
          return (
            <div
              key={dayIdx}
              className={cn(
                "relative border-r border-border last:border-r-0",
                d.isWeekend && "bg-foreground/[0.02]",
                isToday && "bg-accent/[0.05]",
              )}
              style={{ height: GRID_HEIGHT }}
            >
              {/* time-linjer */}
              {hours.slice(1).map((h, i) => (
                <span
                  key={h}
                  className="pointer-events-none absolute inset-x-0 h-px bg-border opacity-45"
                  style={{ top: (i + 1) * HOUR_PX }}
                />
              ))}

              {/* NÅ-strek */}
              {isToday && nowVisible && (
                <span
                  className="pointer-events-none absolute inset-x-0 z-[4] h-0.5 bg-accent shadow-[0_0_8px_hsl(var(--accent)/0.5)]"
                  style={{ top: nowTop }}
                >
                  <span className="absolute -left-1 -top-[3px] h-2 w-2 rounded-full bg-accent" />
                </span>
              )}

              {/* økt-blokker */}
              {sessions.map((s) => {
                const top = ((s.startMin - GRID_START_HOUR * 60) / 60) * HOUR_PX;
                const height = Math.max(28, (s.durMin / 60) * HOUR_PX);
                return (
                  <div
                    key={s.id}
                    className={cn(
                      "absolute inset-x-1.5 flex flex-col gap-0.5 overflow-hidden rounded-lg border border-l-[3px] border-border bg-card px-2 py-1.5 shadow-[0_1px_2px_rgba(10,31,23,0.04)]",
                      axisBorderClass[s.tone],
                      s.done && "opacity-70",
                      s.skipped && "opacity-50",
                    )}
                    style={{ top: Math.max(0, top), height }}
                  >
                    <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold tabular-nums tracking-[0.02em] text-foreground">
                      <span>{s.time}</span>
                      <span className="text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
                        {s.axisLabel}
                      </span>
                      {s.done && (
                        <Check className="ml-auto h-2.5 w-2.5 text-success" strokeWidth={2.5} aria-hidden />
                      )}
                    </div>
                    <div
                      className={cn(
                        "truncate text-[11px] font-semibold leading-tight tracking-[-0.005em] text-foreground",
                        s.skipped && "line-through decoration-border",
                      )}
                    >
                      {s.title}
                    </div>
                    {height > 44 && (
                      <div className="truncate font-mono text-[9px] tracking-[0.04em] text-muted-foreground">
                        {s.meta}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {weekGrid.length === 0 && (
        <div className="border-t border-border px-4 py-3 text-center font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
          Ingen planlagte økter denne uka.
        </div>
      )}
    </div>
  );
}

// ── Inspector-seksjon ───────────────────────────────────────────
function InspectorSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-border px-4 py-4 first:border-t-0">
      <div className="mb-2.5 flex items-center gap-2">
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground">
          {label}
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>
      {children}
    </div>
  );
}

function Inspector({
  playerId,
  activePlan,
  deviation,
  guidance,
  coachOnlyActions,
}: Pick<CoachWorkbenchProps, "playerId" | "activePlan" | "deviation" | "guidance" | "coachOnlyActions">) {
  const needsApproval = activePlan?.status === "PENDING_PLAYER" || activePlan?.status === "DRAFT" || activePlan?.status === "REJECTED";

  return (
    <aside className="flex h-[760px] w-[320px] shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3.5">
        {monoLabel("COACH-HANDLINGER")}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* 1. Plan-godkjenning */}
        <InspectorSection label="Plan-godkjenning">
          {activePlan ? (
            <>
              <div className="rounded-lg border border-border bg-background px-3 py-2.5">
                <div className="text-[13px] font-semibold tracking-[-0.005em] text-foreground">{activePlan.name}</div>
                <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-secondary px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
                  Uke {activePlan.weekNumber} · {activePlan.statusLabel}
                </div>
              </div>
              {needsApproval ? (
                <div className="mt-2.5 flex gap-1.5">
                  <Link
                    href={`/admin/spillere/${playerId}/plan`}
                    className="inline-flex h-[30px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-primary bg-primary px-2.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-primary-foreground hover:opacity-90"
                  >
                    <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                    Godkjenn
                  </Link>
                  <Link
                    href={`/admin/spillere/${playerId}/plan`}
                    className="inline-flex h-[30px] items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-2.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-foreground hover:bg-secondary"
                  >
                    <Undo2 className="h-3 w-3" strokeWidth={2} aria-hidden />
                    Returnér
                  </Link>
                </div>
              ) : (
                <div className="mt-2.5 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                  Ingen godkjenning venter
                </div>
              )}
            </>
          ) : (
            <p className="text-[12px] text-muted-foreground">Ingen aktiv plan å godkjenne.</p>
          )}
        </InspectorSection>

        {/* 2. Avvik fra plan */}
        <InspectorSection label="Avvik fra plan">
          {deviation.total === 0 ? (
            <p className="text-[12px] text-muted-foreground">Ingen planlagte økter denne uka.</p>
          ) : (
            <>
              <div className="flex items-baseline gap-2">
                <span
                  className={cn(
                    "font-mono text-[28px] font-bold leading-none tabular-nums tracking-[-0.02em]",
                    deviation.pct != null && deviation.pct > 30 ? "text-destructive" : "text-foreground",
                  )}
                >
                  {deviation.pct != null ? `${deviation.pct}%` : "—"}
                </span>
                <span className="text-[12px] leading-snug text-muted-foreground">
                  av planlagte økter ikke fullført uka
                </span>
              </div>
              {/* mini bar: fullført / gjenstår / hoppet over */}
              <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-primary/[0.06]">
                {deviation.done > 0 && (
                  <span className="bg-success" style={{ width: `${(deviation.done / deviation.total) * 100}%` }} />
                )}
                {deviation.skipped > 0 && (
                  <span className="bg-destructive" style={{ width: `${(deviation.skipped / deviation.total) * 100}%` }} />
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
                <span>{deviation.done} fullført</span>
                {deviation.skipped > 0 && <span className="text-destructive">{deviation.skipped} hoppet over</span>}
                {deviation.elapsedMissed > 0 && <span>{deviation.elapsedMissed} forfalt</span>}
              </div>
            </>
          )}
        </InspectorSection>

        {/* 3. Ønsker veiledning */}
        <InspectorSection label="Ønsker veiledning">
          {guidance.length === 0 ? (
            <div className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
              <Hand className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
              Ingen forespørsler
            </div>
          ) : (
            guidance.map((g) => (
              <div key={g.id} className="mb-2.5 last:mb-0 rounded-lg border border-border bg-background px-3 py-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-primary">
                    <Hand className="h-2.5 w-2.5" strokeWidth={2} aria-hidden />
                    Ønsker veiledning
                  </span>
                  {g.area && (
                    <span className="font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                      {g.area}
                    </span>
                  )}
                  <span className="ml-auto font-mono text-[9px] tracking-[0.04em] text-muted-foreground">{g.when}</span>
                </div>
                <p className="mt-1.5 text-[12px] leading-snug tracking-[-0.005em] text-foreground">
                  &laquo;{g.reason}&raquo;
                </p>
                <Link
                  href="/admin/foresporsler"
                  className="mt-2 inline-flex h-[28px] items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-foreground hover:bg-secondary"
                >
                  <Reply className="h-3 w-3" strokeWidth={2} aria-hidden />
                  Svar
                </Link>
              </div>
            ))
          )}
        </InspectorSection>

        {/* 4. Tildel oppgave */}
        <InspectorSection label="Tildel oppgave">
          <Link
            href={`/admin/spillere/${playerId}/tildel-test`}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border px-2.5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground hover:border-primary hover:text-primary"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Ny oppgave eller test
          </Link>
        </InspectorSection>

        {/* COACH-ONLY-blokk — gul-aksent, kun coach ser dette */}
        <div className="m-4 mt-2 overflow-hidden rounded-xl border border-warning/30 bg-warning/[0.06]">
          <div className="flex items-center gap-2 border-b border-warning/20 px-3.5 py-2.5">
            <ShieldCheck className="h-3.5 w-3.5 text-warning" strokeWidth={2} aria-hidden />
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-warning">
              COACH-ONLY
            </span>
            <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
              skjult for spiller
            </span>
          </div>
          <div className="px-3.5 py-3">
            <div className="mb-2 flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
              <Sparkles className="h-3 w-3 text-warning" strokeWidth={2} aria-hidden />
              Agent-forslag som venter
            </div>
            {coachOnlyActions.length === 0 ? (
              <p className="text-[12px] text-muted-foreground">Ingen forslag fra AI-agentene akkurat nå.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {coachOnlyActions.map((a) => (
                  <Link
                    key={a.id}
                    href={`/admin/godkjenninger#${a.id}`}
                    className="group grid grid-cols-[1fr_auto] items-center gap-2 rounded-lg border border-warning/20 bg-card px-2.5 py-2 hover:border-warning/40"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[12px] font-semibold tracking-[-0.005em] text-foreground">
                        {a.actionType}
                      </span>
                      <span className="block font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground">
                        {a.agentName} · {a.when}
                      </span>
                    </span>
                    <ArrowUpRight
                      className="h-3.5 w-3.5 text-muted-foreground group-hover:text-warning"
                      strokeWidth={2}
                      aria-hidden
                    />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

// ── Hovedkomponent ──────────────────────────────────────────────
export function CoachWorkbench(props: CoachWorkbenchProps) {
  const {
    playerId,
    playerName,
    playerAvatarUrl,
    playerMeta,
  } = props;

  return (
    <div className="w-full">
      {/* Spiller-context-bar */}
      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
        <Avatar src={playerAvatarUrl ?? undefined} name={playerName} size="md" />
        <div className="min-w-0">
          <div className="truncate font-display text-xl font-bold leading-tight tracking-[-0.02em] text-foreground">
            {playerName}
          </div>
          <div className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
            {playerMeta}
          </div>
        </div>
        <Link
          href={`/admin/spillere/${playerId}`}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-foreground hover:bg-secondary"
        >
          <UserPlus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          Åpne profil
        </Link>
      </div>

      {/* Tittel */}
      <div className="mb-3">
        <h1 className="font-display text-[26px] font-bold leading-tight tracking-[-0.02em] text-foreground">
          Workbench — <em className="font-normal italic text-primary">{playerName}</em>
        </h1>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
          Sesong · Planer · Standardøkter · Mål · Stats
        </p>
      </div>

      {/* Faner */}
      <div className="mb-4 flex flex-wrap items-center gap-1 border-b border-border">
        {TABS.map((t, i) => (
          <span
            key={t}
            className={cn(
              "relative -mb-px cursor-default border-b-2 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.08em]",
              i === 0
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground",
            )}
          >
            {t}
          </span>
        ))}
      </div>

      {/* 3-søyle */}
      <div className="flex gap-4">
        <WorkbenchSidebar
          playerName={playerName}
          seasonLabel={props.seasonLabel}
          seasonWeeks={props.seasonWeeks}
          treeWeeks={props.treeWeeks}
          planRows={props.planRows}
          standardSessions={props.standardSessions}
          goalRows={props.goalRows}
          pyramidRows={props.pyramidRows}
          pyramidAlarm={props.pyramidAlarm}
        />
        <div className="min-w-0 flex-1">
          <WeekCalendar
            days={props.days}
            weekGrid={props.weekGrid}
            weekNumber={props.weekNumber}
            weekRangeLabel={props.weekRangeLabel}
            nowMin={props.nowMin}
            nowLabel={props.nowLabel}
          />
        </div>
        <Inspector
          playerId={playerId}
          activePlan={props.activePlan}
          deviation={props.deviation}
          guidance={props.guidance}
          coachOnlyActions={props.coachOnlyActions}
        />
      </div>
    </div>
  );
}
