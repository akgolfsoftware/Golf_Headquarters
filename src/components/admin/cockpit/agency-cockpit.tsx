"use client";

/**
 * AgencyOS — Cockpit / Kontrolltårnet (hybrid terminal design 2026-06-17).
 *
 * Layout (fasit: AgencyOS Cockpit (hybrid).dc.html):
 *   Topbar    — «Kontrolltårnet» + mono-subtitle (dato · aktive spillere · forespørsler)
 *               + søkefelt + «Tildel plan»-knapp
 *   KPI-strip — 5 kolonner, hairline-delt, mono-tall (toppen av kroppen)
 *   2-kol grid — VEN (1.15fr) «Dagens timeline» med tidsakse + prikker
 *                HØY (1fr)  «Hvem trenger meg nå» (puls-dot, venstre-farget border)
 *                           + «Innboks» (enkel prikk-liste)
 *
 * Presentasjonell + props-drevet (CockpitData fra loadDailyBrief — ekte Prisma).
 * Client component. Token-only farger, kun lucide, norsk bokmål.
 */

import Link from "next/link";
import { ArrowDown, ArrowUp, Minus, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  COCKPIT_ICONS,
  CockpitAvatar,
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
  /** Tid-på-døgnet-hilsen, f.eks. "God formiddag" — brukes ikke i cockpit-tittel, beholdes for bakoverkompatibilitet. */
  greeting: string;
  coachFirstName: string;
  /** AI-kontekstlinje (reservert, vises ikke i hybrid-layout). */
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
  /** For topbar-subtitle og KPI (hybrid-design). */
  activePlayersCount: number;
  /** Antall ventende forespørsler (sessionRequest PENDING). */
  requestsCount: number;
  /** Antall live-pågående økter akkurat nå. */
  liveSessionsCount: number;
  /** Dag-label for topbar, f.eks. "Mandag 15. juni". */
  dayLabel: string;
};

// ── Hjelpere ────────────────────────────────────────────────────
const queueTagClass: Record<CockpitFocusPlayer["signal"]["tone"], { border: string; tag: string }> = {
  alert: { border: "border-l-destructive", tag: "bg-destructive/10 text-destructive" },
  warn: { border: "border-l-warning", tag: "bg-warning/10 text-warning" },
  info: { border: "border-l-success", tag: "bg-success/10 text-success" },
  lime: { border: "border-l-muted-foreground", tag: "bg-secondary text-muted-foreground" },
};

// ── KPI-strip 5 kolonner, hairline-delt (fasit) ─────────────────
function KpiStrip({ data }: { data: CockpitData }) {
  const deltaIcon = { up: ArrowUp, down: ArrowDown, flat: Minus } as const;
  const deltaClass = {
    up: "text-success",
    down: "text-warning",
    flat: "text-muted-foreground",
  } as const;

  // Hybrid-fasit har 5 KPI-er; vi bruker de fire fra data + lager "Forespørsler" fra requestsCount
  const kpis5 = [
    data.kpis[0], // Aktive spillere
    {
      label: "Forespørsler",
      value: String(data.requestsCount),
      delta:
        data.requestsCount > 0
          ? { text: "venter på svar", tone: "down" as const }
          : { text: "ingen ventende", tone: "flat" as const },
      icon: "help-circle" as CockpitIconName,
    },
    data.kpis[1], // Økter i dag
    // Stall-SG — placeholder til Stall-SG-beregning er låst
    {
      label: "Stall-SG",
      value: "—",
      delta: undefined,
      icon: "activity" as CockpitIconName,
      lime: false,
    },
    // Plan-adherence — placeholder til formelen er låst
    {
      label: "Plan-adherence",
      value: "—",
      delta: undefined,
      icon: "clipboard-check" as CockpitIconName,
    },
  ];

  return (
    <div className="mb-5 grid grid-cols-2 overflow-hidden rounded-[14px] border border-border bg-card sm:grid-cols-3 lg:grid-cols-5">
      {kpis5.map((k, i) => {
        const DeltaIcon = k.delta ? deltaIcon[k.delta.tone] : null;
        const isLast = i === kpis5.length - 1;
        return (
          <div
            key={k.label}
            className={cn(
              "flex flex-col gap-[7px] px-3 py-[11px]",
              !isLast && "border-b border-r border-border lg:border-b-0",
            )}
          >
            <span className="font-mono text-[8.5px] font-medium uppercase tracking-[0.10em] text-muted-foreground">
              {k.label}
            </span>
            <span className="font-mono text-[22px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-foreground">
              {k.value}
              {"unit" in k && k.unit && (
                <span className="ml-0.5 text-[12px] font-semibold text-muted-foreground">
                  {k.unit}
                </span>
              )}
            </span>
            {k.delta && DeltaIcon ? (
              <div
                className={cn(
                  "inline-flex items-center gap-1 font-mono text-[10px] tabular-nums",
                  deltaClass[k.delta.tone],
                )}
              >
                <DeltaIcon className="h-[11px] w-[11px]" strokeWidth={1.6} aria-hidden />
                {k.delta.text}
              </div>
            ) : (
              <span className="h-[14px]" aria-hidden />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Dagens timeline (fasit: tid-akse + prikk-kolonne + tittel) ──
function TimelineCard({
  sessions,
  now,
  dateLabel,
}: {
  sessions: CockpitTimelineSession[];
  now: number;
  dateLabel: string;
}) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-[18px] py-[14px]">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-foreground">
          Dagens timeline
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          {dateLabel}
        </span>
      </div>
      <div className="flex flex-col px-[18px] pb-[18px] pt-3">
        {sessions.length === 0 && (
          <p className="py-10 text-center font-mono text-[12px] text-muted-foreground">
            Ingen økter planlagt i dag.
          </p>
        )}
        {sessions.map((s, i) => {
          const end = s.startMin + s.durMin;
          const isActive = now >= s.startMin && now < end;
          const isDone = now >= end;
          const isLast = i === sessions.length - 1;

          const dotClass = isActive
            ? "bg-accent"
            : isDone
              ? "bg-muted-foreground/50 border-2 border-muted-foreground/30"
              : "bg-card border-2 border-success";

          const row = (
            <div className="flex gap-[14px]">
              {/* tidskolonne */}
              <div className="w-[46px] shrink-0 pt-[1px] text-right font-mono text-[10.5px] text-muted-foreground">
                {s.time}
              </div>
              {/* akse */}
              <div className="relative flex shrink-0 flex-col items-center">
                <span
                  className={cn("h-[11px] w-[11px] rounded-full", dotClass)}
                  aria-hidden
                />
                {!isLast && (
                  <span className="mt-0.5 w-px flex-1 bg-border" aria-hidden />
                )}
              </div>
              {/* innhold */}
              <div className={cn("min-w-0 flex-1", !isLast && "pb-4")}>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-[13px] font-semibold text-foreground",
                      isDone && "opacity-60",
                    )}
                  >
                    {s.title}
                  </span>
                  {isActive && (
                    <span className="rounded-full bg-accent px-[6px] py-[2px] font-mono text-[8px] font-bold uppercase tracking-[0.04em] text-accent-foreground motion-safe:animate-pulse">
                      LIVE
                    </span>
                  )}
                </div>
                <div className="mt-[3px] font-mono text-[10px] text-muted-foreground">
                  {s.playerName}
                  {s.meta.map((m) => {
                    const MetaIcon = COCKPIT_ICONS[m.icon];
                    return (
                      <span key={m.text} className="ml-2 inline-flex items-center gap-0.5">
                        <MetaIcon className="h-2.5 w-2.5" strokeWidth={1.5} aria-hidden />
                        {m.text}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          );

          return s.href ? (
            <Link
              key={s.id}
              href={s.href}
              className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-card"
            >
              {row}
            </Link>
          ) : (
            <div key={s.id}>{row}</div>
          );
        })}
      </div>
    </div>
  );
}

// ── Hvem trenger meg nå (fasit: puls-dot + queue-rader m/ farget left-border) ──
function QueueCard({ players }: { players: CockpitFocusPlayer[] }) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-[18px] py-[14px]">
        <span
          className="h-[6px] w-[6px] rounded-full bg-accent motion-safe:animate-pulse"
          aria-hidden
        />
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-foreground">
          Hvem trenger meg nå
        </span>
      </div>
      <div className="flex flex-col gap-[9px] p-[16px]">
        {players.length === 0 && (
          <p className="py-4 text-center font-mono text-[12px] text-muted-foreground">
            Ingen ventende akkurat nå.
          </p>
        )}
        {players.map((p) => {
          const toneClasses = queueTagClass[p.signal.tone];
          const SignalIcon = COCKPIT_ICONS[p.signal.icon];
          return (
            <div
              key={p.id}
              className={cn(
                "flex items-center gap-[11px] rounded-[8px] border border-l-[3px] border-border bg-card px-3 py-[10px]",
                toneClasses.border,
              )}
            >
              <CockpitAvatar initials={p.initials} tone={p.avatarTone} size={22} />
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] font-semibold text-foreground">{p.name}</div>
                <div className="mt-[2px] font-mono text-[9.5px] text-muted-foreground">
                  {p.signal.label}
                </div>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-[3px] font-mono text-[8.5px] font-bold uppercase tracking-[0.04em]",
                  toneClasses.tag,
                )}
              >
                <SignalIcon className="h-[9px] w-[9px]" strokeWidth={2} aria-hidden />
                {p.signal.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Innboks (fasit: prikk + hvem + tekst + relativ tid) ─────────
function InboxCard({ items }: { items: CockpitInboxItem[] }) {
  const inboxDotClass: Record<CockpitInboxItem["type"], string> = {
    appr: "bg-accent",
    req: "bg-destructive",
    msg: "bg-info",
    advice: "bg-warning",
  };

  return (
    <div className="flex-1 overflow-hidden rounded-[14px] border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-[18px] py-[14px]">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-foreground">
          Innboks
        </span>
        {items.filter((i) => i.unread).length > 0 && (
          <span className="rounded-full bg-accent px-[7px] py-[2px] font-mono text-[9px] font-bold text-accent-foreground">
            {items.filter((i) => i.unread).length} nye
          </span>
        )}
      </div>
      <div className="flex flex-col gap-[11px] px-[18px] py-[14px]">
        {items.length === 0 && (
          <p className="py-4 text-center font-mono text-[12px] text-muted-foreground">
            Ingenting nytt.
          </p>
        )}
        {items.map((it) => {
          const dotCls = inboxDotClass[it.type];
          const inner = (
            <div className="flex gap-[10px]">
              <span
                className={cn("mt-[5px] h-[7px] w-[7px] shrink-0 rounded-full", dotCls)}
                aria-hidden
              />
              <div className="flex-1">
                <div className="text-[12.5px] text-foreground">
                  <strong className="font-semibold">{it.name}</strong>{" "}
                  <span className="text-muted-foreground">{it.preview}</span>
                </div>
                <div className="mt-[2px] font-mono text-[9px] text-muted-foreground">
                  {it.typeLabel}
                </div>
              </div>
            </div>
          );
          return it.href ? (
            <Link
              key={it.id}
              href={it.href}
              className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {inner}
            </Link>
          ) : (
            <div key={it.id}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
}

// ── Topbar (fasit: tittel + mono subtitle + søk + knapp) ─────────
function CockpitTopbar({ data }: { data: CockpitData }) {
  return (
    <div className="flex items-center gap-4 border-b border-border bg-background/50 px-6 py-4">
      <div>
        <div className="font-display text-[19px] font-bold tracking-[-0.01em] text-foreground">
          Kontrolltårnet
        </div>
        <div className="mt-[2px] font-mono text-[10.5px] text-muted-foreground">
          {data.dayLabel} · {data.activePlayersCount} aktive spillere ·{" "}
          {data.requestsCount > 0
            ? `${data.requestsCount} forespørsler venter`
            : "ingen forespørsler"}
        </div>
      </div>
      <div className="ml-auto flex items-center gap-[10px]">
        <div className="flex w-[230px] items-center gap-2 rounded-[14px] border border-border bg-card px-3 py-[9px] text-muted-foreground">
          <Search className="h-[15px] w-[15px]" strokeWidth={1.8} aria-hidden />
          <span className="text-[12px]">Søk spiller, økt, test …</span>
        </div>
        <Link
          href="/admin/spillere"
          className="inline-flex items-center gap-[7px] rounded-[14px] bg-accent px-[14px] py-[9px] font-mono text-[11px] font-bold uppercase tracking-[0.04em] text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="h-[14px] w-[14px]" strokeWidth={2.4} aria-hidden />
          Tildel plan
        </Link>
      </div>
    </div>
  );
}

// ── Hovedkomponent ──────────────────────────────────────────────
export function AgencyCockpit({ data }: { data: CockpitData }) {
  return (
    <div className="flex flex-col">
      {/* Cockpit-topbar (erstatter generisk AgencyOS-topbar på denne ruten) */}
      <CockpitTopbar data={data} />

      <div className="px-6 pb-14 pt-5">
        {/* KPI-strip 5 kolonner */}
        <KpiStrip data={data} />

        {/* 2-kolonne hovednett */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_1fr]">
          {/* VEN: Dagens timeline */}
          <TimelineCard
            sessions={data.timeline}
            now={data.now}
            dateLabel={data.timelineDateLabel}
          />

          {/* HØY: Queue + Innboks stablet */}
          <div className="flex flex-col gap-4">
            <QueueCard players={data.focus} />
            <InboxCard items={data.inbox} />
          </div>
        </div>
      </div>
    </div>
  );
}
