"use client";

/**
 * PlayerHQ Workbench (/portal/planlegge/workbench) — MOBIL-FØRST 430px.
 *
 * Spiller-versjon av den delte Workbench-kjernen. Coach-versjonen ligger i
 * src/components/admin/coach-workbench/coach-workbench.tsx (samme datamodell,
 * samme DS-tokens). Denne er forenklet for mobil per design-FASIT:
 *   [historisk fasit, fjernet 2026-07-03] agencyos/components-workbench-week.html  (uke-grid)
 *   [historisk fasit, fjernet 2026-07-03] agencyos/components-workbench-sidebar.html (slide-over)
 *   [historisk fasit, fjernet 2026-07-03] agencyos/components-workbench-day.html   (økt-blokk)
 *
 * Layout (430px):
 *   TOPBAR  — hamburger (åpner slide-over) + "WORKBENCH · UKE N" + "+" + plan A/B-toggle
 *   ZOOM    — pills: År / Mnd / Uke (aktiv) / Dag · uke-navigasjon
 *   UKE     — vertikal stack, én blokk per dag. Økt-card: 3px pyramide-venstrekant
 *             + tittel + meta + "Start økt". Hviledag = muted "Ingen økt".
 *   SLIDE-OVER — 7 dropdown-seksjoner (sesong-tre / planer / standardøkter /
 *             turneringer / treningsplaner / mål / stats+pyramide).
 *
 * Spilleren ser SIN plan. Ingen coach-only-blokk. Ekte data fra
 * loadPlayerWorkbench. Ingen hardkodet hex, ingen emoji (kun lucide).
 */

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  CalendarRange,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Flag,
  GripVertical,
  Layers,
  LayoutGrid,
  Menu,
  Play,
  Plus,
  Target,
  X,
  type LucideIcon,
} from "lucide-react";
import type { PlanStatus } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

type Tone = "fys" | "tek" | "slag" | "spill" | "turn";

export type WBP_Session = {
  id: string;
  dow: number; // 0 = mandag
  startMin: number;
  time: string;
  tone: Tone;
  axisLabel: string;
  title: string;
  meta: string;
  durMin: number;
  done: boolean;
  skipped: boolean;
  live: boolean;
};

export type WBP_DaySessions = {
  dow: string;
  dowLong: string;
  date: number;
  monthLabel: string;
  isToday: boolean;
  isWeekend: boolean;
  sessions: WBP_Session[];
};

export type WBP_TreeWeek = { week: number; isNow: boolean };
export type WBP_PlanRow = { id: string; name: string; status: string; active: boolean };
export type WBP_StandardSession = { id: string; name: string; tone: Tone; durMin: number; drillCount: number };
export type WBP_GoalRow = { id: string; title: string; meta: string; tone: Tone };
export type WBP_PyramidRow = { label: string; tone: Tone; pct: number; hours: number };

export type PlayerWorkbenchData = {
  playerFirstName: string;
  weekNumber: number;
  weekRangeLabel: string;
  nowLabel: string;
  days: WBP_DaySessions[];
  weekTotalSessions: number;
  weekDoneSessions: number;
  seasonLabel: string;
  seasonWeeks: number;
  treeWeeks: WBP_TreeWeek[];
  planRows: WBP_PlanRow[];
  standardSessions: WBP_StandardSession[];
  goalRows: WBP_GoalRow[];
  pyramidRows: WBP_PyramidRow[];
  pyramidAlarm: string | null;
  activePlan: {
    id: string;
    name: string;
    status: PlanStatus;
    statusLabel: string;
  } | null;
};

// ── Token-maps (rå --pyr-* tokens per design-spec) ────────────────
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

const ZOOM_LEVELS = ["År", "Mnd", "Uke", "Dag"] as const;

function monoLabel(text: string) {
  return (
    <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground">
      {text}
    </span>
  );
}

// ── Økt-card (vertikal stack-variant) ─────────────────────────────
function SessionCard({ session }: { session: WBP_Session }) {
  return (
    <Link
      href={`/portal/tren/${session.id}`}
      className={cn(
        "block rounded-xl border border-l-[3px] border-border bg-card px-3.5 py-3 shadow-[0_1px_2px_rgba(10,31,23,0.04)] transition active:scale-[0.99]",
        axisBorderClass[session.tone],
        session.live && "ring-2 ring-accent",
        session.done && "opacity-70",
        session.skipped && "opacity-50",
      )}
    >
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] font-bold tabular-nums tracking-[0.02em] text-foreground">
          {session.time}
        </span>
        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          {session.axisLabel}
        </span>
        {session.live && (
          <span className="ml-auto inline-flex items-center gap-1 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent shadow-[0_0_6px_hsl(var(--accent)/0.7)]" />
            Pågår
          </span>
        )}
        {session.done && !session.live && (
          <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-success" strokeWidth={2} aria-hidden />
        )}
      </div>
      <div
        className={cn(
          "mt-1.5 text-[15px] font-semibold leading-tight tracking-[-0.01em] text-foreground",
          session.skipped && "line-through decoration-border",
        )}
      >
        {session.title}
      </div>
      <div className="mt-1 font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
        {session.meta}
      </div>
      {!session.done && !session.skipped && (
        <span className="mt-2.5 inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-accent px-4 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-primary shadow-[0_4px_12px_hsl(var(--accent)/0.3)]">
          <Play className="h-3 w-3" strokeWidth={2.5} aria-hidden />
          Start økt
        </span>
      )}
    </Link>
  );
}

// ── Dag-blokk i vertikal stack ────────────────────────────────────
function DayBlock({ day }: { day: WBP_DaySessions }) {
  return (
    <section className="px-4 py-3">
      <div className="mb-2 flex items-center gap-2">
        <span
          className={cn(
            "font-mono text-[11px] font-bold uppercase tracking-[0.12em]",
            day.isToday ? "text-primary" : day.isWeekend ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {day.dow} {day.date}
        </span>
        <span className="font-mono text-[10px] tracking-[0.04em] text-muted-foreground">{day.monthLabel}</span>
        {day.isToday && (
          <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_hsl(var(--accent)/0.7)]" />
            i dag
          </span>
        )}
        <span className="h-px flex-1 bg-border" />
        {day.sessions.length > 0 && (
          <span className="font-mono text-[9px] tabular-nums tracking-[0.04em] text-muted-foreground">
            {day.sessions.length} {day.sessions.length === 1 ? "økt" : "økter"}
          </span>
        )}
      </div>
      {day.sessions.length === 0 ? (
        <p className="font-mono text-[11px] tracking-[0.04em] text-muted-foreground">Ingen økt</p>
      ) : (
        <div className="flex flex-col gap-2">
          {day.sessions.map((s) => (
            <SessionCard key={s.id} session={s} />
          ))}
        </div>
      )}
    </section>
  );
}

// ── Slide-over-seksjon (dropdown-gruppe) ──────────────────────────
function DrawerGroup({
  icon: Icon,
  label,
  count,
  defaultOpen,
  children,
}: {
  icon: LucideIcon;
  label: string;
  count?: string;
  defaultOpen?: boolean;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  const hasBody = Boolean(children);
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => hasBody && setOpen((v) => !v)}
        aria-expanded={hasBody ? open : undefined}
        className="grid w-full grid-cols-[16px_1fr_auto_12px] items-center gap-2 px-4 py-3 text-left hover:bg-primary/[0.04]"
      >
        <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} aria-hidden />
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-foreground">{label}</span>
        {count ? (
          <span className="font-mono text-[10px] font-semibold tabular-nums text-muted-foreground">{count}</span>
        ) : (
          <span />
        )}
        {hasBody ? (
          <ChevronRight
            className={cn("h-3 w-3 text-muted-foreground", open && "rotate-90 text-foreground")}
            strokeWidth={2}
            aria-hidden
          />
        ) : (
          <span />
        )}
      </button>
      {open && hasBody && <div className="px-3 pb-4 pt-1">{children}</div>}
    </div>
  );
}

// ── Slide-over (sidemeny) ─────────────────────────────────────────
function Drawer({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: PlayerWorkbenchData;
}) {
  const { seasonLabel, seasonWeeks, treeWeeks, planRows, standardSessions, goalRows, pyramidRows, pyramidAlarm } = data;
  const seasonYear = String(new Date().getFullYear());

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-foreground/30 transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden
      />
      {/* Panel */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[61] flex w-[88%] max-w-[340px] flex-col bg-card shadow-[16px_0_40px_rgba(10,31,23,0.16)] transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Workbench sidemeny"
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3.5">
          <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary font-display text-[13px] font-bold tracking-[-0.02em] text-accent">
            ak
            <span className="absolute right-[5px] top-[5px] h-1 w-1 rounded-full bg-accent" />
          </span>
          {monoLabel("WORKBENCH")}
          <button
            type="button"
            onClick={onClose}
            aria-label="Lukk sidemeny"
            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* 1. Sesong-tre */}
          <DrawerGroup icon={CalendarRange} label="Sesong" count={seasonYear} defaultOpen>
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
          </DrawerGroup>

          {/* 2. Planer A/B */}
          <DrawerGroup
            icon={Layers}
            label="Planer"
            count={planRows.length > 0 ? `${planRows.length}` : undefined}
            defaultOpen={planRows.length > 0}
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
          </DrawerGroup>

          {/* 3. Standardøkter */}
          <DrawerGroup
            icon={LayoutGrid}
            label="Standardøkter"
            count={standardSessions.length > 0 ? `${standardSessions.length}` : undefined}
            defaultOpen={standardSessions.length > 0}
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
          </DrawerGroup>

          {/* 4. Turneringer */}
          <DrawerGroup icon={Flag} label="Turneringer" />

          {/* 5. Treningsplaner */}
          <DrawerGroup icon={ClipboardList} label="Treningsplaner" />

          {/* 6. Mål */}
          <DrawerGroup
            icon={Target}
            label="Mål"
            count={goalRows.length > 0 ? `${goalRows.length}` : undefined}
            defaultOpen={goalRows.length > 0}
          >
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
          </DrawerGroup>

          {/* 7. Stats / pyramide */}
          <DrawerGroup icon={BarChart3} label="Stats · pyramide" count="30 d" defaultOpen>
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
                      <span
                        className={cn("absolute inset-y-0 left-0 rounded-full", axisDotClass[r.tone])}
                        style={{ width: `${r.pct}%` }}
                      />
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
          </DrawerGroup>
        </div>
      </aside>
    </>
  );
}

// ── Hovedkomponent ────────────────────────────────────────────────
export function PlayerWorkbench({ data }: { data: PlayerWorkbenchData }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const hasAnySession = data.days.some((d) => d.sessions.length > 0);

  return (
    <div className="mx-auto flex h-full max-w-[430px] flex-col bg-background">
      {/* TOPBAR */}
      <header className="sticky top-0 z-50 border-b border-border bg-background pt-[env(safe-area-inset-top)]">
        <div className="flex items-center gap-2 px-4 py-3">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Åpne sidemeny"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground hover:bg-secondary"
          >
            <Menu className="h-5 w-5" strokeWidth={2} aria-hidden />
          </button>
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.10em] text-foreground">
            Workbench · Uke {data.weekNumber}
          </span>
          <Link
            href="/portal/planlegge"
            aria-label="Ny økt"
            className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-accent hover:opacity-90"
          >
            <Plus className="h-5 w-5" strokeWidth={2.5} aria-hidden />
          </Link>
        </div>

        {/* Plan A/B-toggle */}
        {data.planRows.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto px-4 pb-2.5">
            {data.planRows.map((p) => (
              <span
                key={p.id}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em]",
                  p.active
                    ? "border-primary bg-primary text-accent"
                    : "border-border bg-card text-muted-foreground",
                )}
              >
                {p.active && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                {p.name}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* ZOOM-BAR */}
      <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-2.5">
        <div className="flex items-center gap-1">
          {ZOOM_LEVELS.map((z) => (
            <span
              key={z}
              aria-current={z === "Uke" ? "page" : undefined}
              className={cn(
                "cursor-default rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em]",
                z === "Uke" ? "bg-primary text-accent" : "text-muted-foreground",
              )}
            >
              {z}
            </span>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            disabled
            title="Uke-navigasjon kommer"
            aria-label="Forrige uke (kommer)"
            className="inline-flex h-7 w-7 cursor-not-allowed items-center justify-center rounded-lg border border-border text-muted-foreground/40"
          >
            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          </button>
          <span className="font-mono text-[10px] tabular-nums tracking-[0.04em] text-muted-foreground">
            {data.weekRangeLabel}
          </span>
          <button
            type="button"
            disabled
            title="Uke-navigasjon kommer"
            aria-label="Neste uke (kommer)"
            className="inline-flex h-7 w-7 cursor-not-allowed items-center justify-center rounded-lg border border-border text-muted-foreground/40"
          >
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          </button>
        </div>
      </div>

      {/* UKE-GRID — vertikal stack */}
      <main className="flex-1 overflow-y-auto pb-8">
        {!hasAnySession ? (
          <div className="px-6 py-16 text-center">
            <CalendarRange className="mx-auto h-8 w-8 text-muted-foreground" strokeWidth={1.5} aria-hidden />
            <p className="mx-auto mt-3 max-w-[280px] text-sm leading-snug text-muted-foreground">
              Ingen økter denne uka. Coachen din bygger plan, eller bygg din egen.
            </p>
            <Link
              href="/portal/planlegge"
              className="mt-4 inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-primary px-5 font-mono text-[11px] font-extrabold uppercase tracking-[0.10em] text-accent hover:opacity-90"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
              Legg til økt
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {data.days.map((d) => (
              <DayBlock key={d.dow} day={d} />
            ))}
          </div>
        )}
      </main>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} data={data} />
    </div>
  );
}
