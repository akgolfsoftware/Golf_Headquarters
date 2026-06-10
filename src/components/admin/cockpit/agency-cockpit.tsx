"use client";

/**
 * AgencyOS — operations cockpit (coachens kontrolltårn).
 *
 * Pixel-port FRA FERSK design-fasit (mørkt tema, desktop 1280):
 *   - JSX:  public/design-handover/AK Golf HQ Design System/agencyos-app/screens-dashboard.jsx
 *   - Prim: …/agencyos-app/core.jsx (PageHead, KpiCard, Avatar)
 *   - CSS:  …/agencyos-app/agency.css (.page-head .grid3 .col .tl .ix .task .focus .kpis)
 *   - PNG:  /tmp/ag-fasit/dashboard.png
 *
 * Struktur (fasit, ovenfra og ned):
 *   PageHead — «{greeting}, {navn} — » + italic AI-kontekst | lime-dot LIVE + mono-klokke
 *   grid3   — KOL 1 Dagens timeline (akse-kant, state-piller, meta-ikoner)
 *             KOL 2 Innboks (inline-handling per type) + Oppgaver
 *             KOL 3 Trenger oppmerksomhet (pinnet + AI-forslag · Caddie)
 *   KPI-strip — 4 kort (mono-tall, ikon oppe til høyre, delta m/ pil — INGEN spark, jf. core.jsx)
 *
 * Presentasjonell + props-drevet (CockpitData fra loadDailyBrief — ekte Prisma).
 * Client component: all data serialiserbar (ikoner som navn via COCKPIT_ICONS,
 * rik tekst som CockpitRichSeg[]). Interaksjoner bor i _cockpit-interactive.tsx.
 * Token-only farger (.dark-scope aktiv), kun lucide, norsk bokmål.
 */

import Link from "next/link";
import { Check, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  COCKPIT_ICONS,
  CockpitAvatar,
  ColShell,
  FocusColumn,
  InboxColumn,
  type CockpitAvatarTone,
  type CockpitIconName,
} from "./_cockpit-interactive";

export type { CockpitAvatarTone, CockpitIconName };

// ── Typer (serialiserbare — krysser server→client-grensen) ──────
export type CockpitAxis = "fys" | "tek" | "slag" | "spill" | "turn";

/** Rik tekst-segment for fokus-begrunnelser (fasit <b>/<em>). */
export type CockpitRichSeg = { text: string; style?: "b" | "em" };

export type CockpitTimelineSession = {
  id: string;
  /** Minutter siden midnatt — styrer ferdig/pågår/kommer. */
  startMin: number;
  durMin: number;
  time: string;
  initials: string;
  avatarTone?: CockpitAvatarTone;
  playerName: string;
  /** Pyramide-akse — farger venstrekanten (--pyr-*). */
  axis: CockpitAxis;
  axisLabel: string;
  title: string;
  meta: { icon: CockpitIconName; text: string }[];
  href?: string;
};

export type CockpitInboxItem = {
  id: string;
  initials: string;
  avatarTone?: CockpitAvatarTone;
  name: string;
  type: "appr" | "req" | "msg" | "advice";
  typeLabel: string;
  preview: string;
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
  icon: CockpitIconName;
  primary?: boolean;
  /** Navigasjon (Profil/Melding/Book). Utelukker confirm. */
  href?: string;
  /** Inline-bekreftelse ved klikk («Ringer … »). Optimistisk, m/ Angre. */
  confirm?: string;
};

export type CockpitFocusPlayer = {
  id: string;
  initials: string;
  avatarTone?: CockpitAvatarTone;
  name: string;
  /** Mono-meta, f.eks. "WANG · KONK · 12 DG TIL SRIXON #2". */
  meta: string;
  /** Coral-tonet kort (kritisk) når upinnet. */
  alert?: boolean;
  /** Server-default for pinnet kort — localStorage overstyrer. */
  pinned?: boolean;
  signal: {
    label: string;
    tone: "alert" | "warn" | "info" | "lime";
    icon: CockpitIconName;
  };
  reason: CockpitRichSeg[];
  actions: CockpitFocusAction[];
};

export type CockpitKpi = {
  label: string;
  value: string;
  unit?: string;
  delta?: { text: string; tone: "up" | "down" | "flat" };
  icon: CockpitIconName;
};

export type CockpitData = {
  /** Tid-på-døgnet-hilsen, f.eks. "God formiddag". */
  greeting: string;
  coachFirstName: string;
  /** AI-kontekstlinje etter "—" (italic, primary). */
  aiContext: string;
  /** Mono-klokke, f.eks. "ONSDAG 28 MAI · 11:24". */
  liveLabel: string;
  /** Timeline-header, f.eks. "ONS 28 MAI · 4 ØKTER". */
  timelineDateLabel: string;
  /** Minutter siden midnatt — utleder økt-states. */
  now: number;
  timeline: CockpitTimelineSession[];
  /** Antall i «Siste 24 t»-headeren. */
  inboxCount: number;
  inbox: CockpitInboxItem[];
  tasks: CockpitTask[];
  tasksDoneToday: number;
  tasksTotalToday: number;
  focus: CockpitFocusPlayer[];
  /** Antall i fokus-header — kan avvike fra focus.length. */
  focusCount?: number;
  kpis: CockpitKpi[];
};

// ── Akse-farger (eneste tillatte regnbue — kun pyramide-akser) ──
const axisBarClass: Record<CockpitAxis, string> = {
  fys: "bg-[var(--pyr-fys)]",
  tek: "bg-[var(--pyr-tek)]",
  slag: "bg-[var(--pyr-slag)]",
  spill: "bg-[var(--pyr-spill)]",
  turn: "bg-[var(--pyr-turn)]",
};

// ── COL 1 — DAGENS TIMELINE (fasit .tl) ─────────────────────────
function TimelineCol({
  sessions,
  now,
  dateLabel,
}: {
  sessions: CockpitTimelineSession[];
  now: number;
  dateLabel: string;
}) {
  return (
    <ColShell label="Dagens timeline" count={dateLabel} filter="Alle">
      <div className="px-3.5 pb-3.5 pt-2">
        {sessions.length === 0 && (
          <p className="px-2 py-10 text-center text-[13px] text-muted-foreground">
            Ingen økter planlagt i dag.
          </p>
        )}

        {sessions.map((s) => {
          const end = s.startMin + s.durMin;
          const isDone = now >= end;
          const isActive = now >= s.startMin && now < end;
          const hasStatePill = isActive || isDone;

          const card = (
            <div
              className={cn(
                "relative rounded-lg border border-border px-2.5 pb-2.5 pl-3.5 pt-2",
                isActive
                  ? "bg-card shadow-[0_0_0_2px_hsl(var(--accent))]"
                  : "bg-background hover:bg-secondary",
                isDone && "opacity-[0.62]",
              )}
            >
              {/* akse-farget venstrekant */}
              <span
                className={cn(
                  "absolute bottom-2 left-0 top-2 w-[3px] rounded-full",
                  axisBarClass[s.axis],
                )}
                aria-hidden
              />
              <div className="flex items-center gap-2">
                <CockpitAvatar initials={s.initials} tone={s.avatarTone} size={22} />
                <span
                  className={cn(
                    "text-xs font-bold tracking-[-0.005em] text-foreground",
                    isDone && "line-through decoration-border",
                  )}
                >
                  {s.playerName}
                </span>
                {isActive && (
                  <span className="ml-auto inline-flex items-center gap-1 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-primary">
                    <span
                      className="h-[5px] w-[5px] rounded-full bg-accent shadow-[0_0_4px_hsl(var(--accent)/0.7)] motion-safe:animate-pulse"
                      aria-hidden
                    />
                    Pågår
                  </span>
                )}
                {isDone && (
                  <span className="ml-auto inline-flex items-center gap-1 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-success">
                    <Check className="h-[11px] w-[11px]" strokeWidth={2.5} aria-hidden />
                    Ferdig
                  </span>
                )}
                <span
                  className={cn(
                    "rounded-full bg-secondary px-1.5 py-[2px] font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground",
                    hasStatePill ? "ml-2" : "ml-auto",
                  )}
                >
                  {s.axisLabel}
                </span>
              </div>
              <div className="mt-1 text-xs leading-snug text-foreground">{s.title}</div>
              {s.meta.length > 0 && (
                <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[10px] text-muted-foreground">
                  {s.meta.map((m, i) => {
                    const MetaIcon = COCKPIT_ICONS[m.icon];
                    return (
                      <span key={i} className="inline-flex items-center gap-0.5">
                        <MetaIcon className="h-2.5 w-2.5" strokeWidth={1.5} aria-hidden />
                        {m.text}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          );

          return (
            <div
              key={s.id}
              className="grid grid-cols-[44px_1fr] items-start gap-x-3.5 py-[9px]"
            >
              {/* tidskolonne */}
              <div
                className={cn(
                  "font-mono text-xs font-extrabold leading-[1.2] tabular-nums",
                  isActive ? "text-primary" : "text-foreground",
                )}
              >
                {s.time}
                <span className="mt-0.5 block font-mono text-[9px] font-semibold text-muted-foreground">
                  {s.durMin} m
                </span>
              </div>
              {s.href ? (
                <Link href={s.href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
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

// ── KPI-strip (fasit .kpis/.kpi — uten spark, jf. core.jsx) ─────
function KpiRow({ kpis }: { kpis: CockpitKpi[] }) {
  const deltaIcon = { up: TrendingUp, down: TrendingDown, flat: Minus } as const;
  const deltaClass = {
    up: "text-success",
    down: "text-destructive",
    flat: "text-muted-foreground",
  } as const;

  return (
    <div className="mt-3.5 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {kpis.map((k) => {
        const KpiIcon = COCKPIT_ICONS[k.icon];
        const DeltaIcon = k.delta ? deltaIcon[k.delta.tone] : null;
        return (
          <div
            key={k.label}
            className="flex flex-col gap-2.5 rounded-xl border border-border bg-card px-[18px] py-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
                {k.label}
              </span>
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                <KpiIcon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
              </span>
            </div>
            <div className="font-mono text-[32px] font-bold leading-none tracking-[-0.02em] tabular-nums text-foreground">
              {k.value}
              {k.unit && (
                <span className="ml-[3px] text-[15px] font-bold text-muted-foreground">
                  {k.unit}
                </span>
              )}
            </div>
            {k.delta && DeltaIcon && (
              <div
                className={cn(
                  "inline-flex items-center gap-[5px] font-mono text-[11px] font-bold leading-[1.2] tracking-[0.04em]",
                  deltaClass[k.delta.tone],
                )}
              >
                <DeltaIcon className="h-[11px] w-[11px]" strokeWidth={2} aria-hidden />
                {k.delta.text}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Hovedkomponent ──────────────────────────────────────────────
export function AgencyCockpit({ data }: { data: CockpitData }) {
  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-14 pt-6 sm:px-7">
      {/* PageHead (fasit .page-head + .when-live) */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <h1 className="mt-2 font-display text-[28px] font-bold leading-[1.08] tracking-[-0.02em] text-foreground">
          {data.greeting}, {data.coachFirstName} —{" "}
          <em className="font-normal italic text-primary">{data.aiContext}</em>
        </h1>
        <div className="inline-flex shrink-0 items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          <span className="inline-flex items-center gap-[5px] text-primary">
            <span
              className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_hsl(var(--accent)/0.7)] motion-safe:animate-pulse"
              aria-hidden
            />
            LIVE
          </span>
          {data.liveLabel}
        </div>
      </div>

      {/* 3-kolonne grid (fasit .grid3: 1.05fr 1.05fr 1fr) */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.05fr_1.05fr_1fr]">
        <TimelineCol
          sessions={data.timeline}
          now={data.now}
          dateLabel={data.timelineDateLabel}
        />
        <InboxColumn
          items={data.inbox}
          totalCount={data.inboxCount}
          tasks={data.tasks}
          tasksDoneToday={data.tasksDoneToday}
          tasksTotalToday={data.tasksTotalToday}
        />
        <FocusColumn players={data.focus} totalCount={data.focusCount} />
      </div>

      {/* KPI-strip */}
      <KpiRow kpis={data.kpis} />
    </div>
  );
}
