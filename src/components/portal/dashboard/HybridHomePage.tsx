"use client";

/**
 * HybridHomePage — PlayerHQ Hjem (hybrid-design 2026-06-17)
 *
 * Presentasjonslag for /portal. All data sendes inn som props fra
 * page.tsx (server component). Ingen data-henting her.
 *
 * Layout (mobil-første, etter design-fasit):
 *   1. Ukenummer / dato-eyebrow + hilsen
 *   2. KPI-strip 4 kolonner (Snittscore · SG total · Økter uke · Handicap)
 *   3. Dagens økt — forest featured card med drill-chips + Start-knapp
 *   4. Øvrige økt(er) i dag — kompakt rad per ekstra økt
 *   5. Coach-notat — lys kort med venstre lime-border
 *
 * Knapper koblet til riktige ruter (ingen døde lenker):
 *   - "Start økt" / "Fortsett økt" → /portal/gjennomfore/[id]
 *   - "Se plan" → /portal/planlegge
 *   - "Logg runde" → toast.info("Logg runde kommer snart")
 *   - "Se turnering" → tournament.href (settes av server-action)
 *   - Coach-notat lenke → /portal/coach/melding/[id]
 */

import Link from "next/link";
import {
  Play,
  BarChart2,
  Flag,
  ArrowRight,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/components/shared/toast-provider";
import { cn } from "@/lib/utils";
import type { DashboardData, TodaySession } from "@/app/portal/actions";

// ── helpers ───────────────────────────────────────────────────────

function formatTime(d: Date): string {
  return d.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Oslo",
  });
}

function formatWeekDay(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Oslo",
  });
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function timeAgo(d: Date): string {
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.round(diffMs / 60_000);
  if (diffMin < 60) return `${diffMin} min siden`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} t siden`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD} d siden`;
}

const PRACTICE_ICON_COLOR: Record<string, string> = {
  FYS: "bg-[var(--pyr-fys)]/15 text-[var(--pyr-fys)]",
  TEK: "bg-[var(--pyr-tek)]/15 text-[var(--pyr-tek)]",
  SLAG: "bg-[var(--pyr-slag)]/15 text-[var(--pyr-slag)]",
  SPILL: "bg-accent/20 text-accent-foreground",
  TURN: "bg-destructive/10 text-destructive",
};

// ── KPI strip ─────────────────────────────────────────────────────

type KpiCellProps = {
  label: string;
  value: string;
  delta?: string;
  deltaUp?: boolean;
  hot?: boolean;
};

function KpiCell({ label, value, delta, deltaUp, hot }: KpiCellProps) {
  return (
    <div
      className={cn(
        "flex flex-col px-3 py-3 border-r border-border last:border-r-0",
        hot && "bg-accent/10",
      )}
    >
      <span className="font-mono text-[8.5px] font-500 tracking-[0.1em] uppercase text-muted-foreground mb-1.5 leading-none">
        {label}
      </span>
      <span
        className={cn(
          "font-mono text-[20px] font-semibold tracking-[-0.02em] tabular-nums leading-none",
          hot ? "text-primary" : "text-foreground",
        )}
      >
        {value}
      </span>
      {delta != null && (
        <span
          className={cn(
            "font-mono text-[9px] font-medium mt-1.5 flex items-center gap-0.5 tabular-nums",
            deltaUp ? "text-[var(--up,#1A7D56)]" : "text-[var(--down,#A32D2D)]",
          )}
        >
          <svg
            viewBox="0 0 24 24"
            width="10"
            height="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d={deltaUp ? "m6 15 6-6 6 6" : "m18 15-6-6-6 6"} />
          </svg>
          {delta}
        </span>
      )}
    </div>
  );
}

// ── Today featured card ───────────────────────────────────────────

function TodayFeaturedCard({ session }: { session: TodaySession }) {
  const isActive = session.status === "IN_PROGRESS";
  const isDone = session.status === "COMPLETED";

  return (
    <div
      className="relative overflow-hidden rounded-[20px] p-5 text-white shadow-[0_14px_40px_-12px_rgba(0,88,64,0.45)]"
      style={{ background: "linear-gradient(150deg, #005840, #00402F)" }}
    >
      {/* lime radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-14 h-52 w-52 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(209,248,67,.22), transparent 70%)" }}
      />

      <div className="relative z-10">
        {/* header row */}
        <div className="flex items-center justify-between mb-3.5">
          <span className="font-mono text-[10px] font-bold tracking-[0.16em] uppercase text-accent">
            Dagens økt · {formatTime(session.startTime)}
          </span>
          <span className="font-mono text-[11px] font-bold bg-accent text-accent-foreground px-2.5 py-1 rounded-full whitespace-nowrap">
            {session.durationMin} min
          </span>
        </div>

        {/* title */}
        <h2 className="font-display text-[22px] font-bold tracking-[-0.02em] leading-tight mb-4">
          {session.title}
        </h2>

        {/* meta row */}
        <div className="flex gap-6 mb-4">
          {session.sted && (
            <div>
              <div className="font-mono text-[9.5px] tracking-[0.1em] uppercase text-white/55 mb-0.5">
                Sted
              </div>
              <div className="font-mono text-[14px] font-bold text-white">{session.sted}</div>
            </div>
          )}
          <div>
            <div className="font-mono text-[9.5px] tracking-[0.1em] uppercase text-white/55 mb-0.5">
              Drills
            </div>
            <div className="font-mono text-[14px] font-bold text-white">
              {session.drills.length}
            </div>
          </div>
          <div>
            <div className="font-mono text-[9.5px] tracking-[0.1em] uppercase text-white/55 mb-0.5">
              Status
            </div>
            <div className="font-mono text-[14px] font-bold text-white">
              {isDone ? "Fullført" : isActive ? "Pågår" : "Planlagt"}
            </div>
          </div>
        </div>

        {/* drill chips */}
        {session.drills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {session.drills.slice(0, 4).map((d) => (
              <span
                key={d.id}
                className="font-mono text-[9px] font-bold tracking-[0.06em] uppercase text-accent border border-accent/30 rounded-[4px] px-1.5 py-1"
              >
                {d.name}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <Link href={isDone ? session.href : session.href}>
          <button
            className="flex items-center justify-center gap-2 w-full bg-accent text-accent-foreground border-none rounded-full py-3 font-mono text-[12px] font-bold tracking-[0.08em] uppercase cursor-pointer disabled:opacity-70"
            disabled={isDone}
          >
            {isDone ? (
              "Fullført"
            ) : (
              <>
                {isActive ? "Fortsett økt" : "Start økt"}
                <Play size={14} fill="currentColor" aria-hidden />
              </>
            )}
          </button>
        </Link>
      </div>
    </div>
  );
}

// ── Empty today state ─────────────────────────────────────────────

function NoSessionCard() {
  const toast = useToast();
  return (
    <div
      className="relative overflow-hidden rounded-[20px] p-5 text-white shadow-[0_14px_40px_-12px_rgba(0,88,64,0.45)]"
      style={{ background: "linear-gradient(150deg, #005840, #00402F)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-14 h-52 w-52 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(209,248,67,.22), transparent 70%)" }}
      />
      <div className="relative z-10">
        <span className="font-mono text-[10px] font-bold tracking-[0.16em] uppercase text-accent block mb-3">
          Dagens økt
        </span>
        <p className="font-display text-lg font-bold mb-2">Ingen økt planlagt i dag</p>
        <p className="text-sm text-white/75 mb-5">
          Planlegg neste økt i Workbench, eller logg en runde.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/portal/planlegge">
            <button className="flex items-center gap-2 bg-accent text-accent-foreground border-none rounded-full px-5 py-2.5 font-mono text-[11px] font-bold tracking-[0.08em] uppercase cursor-pointer">
              Planlegg økt
              <ArrowRight size={13} aria-hidden />
            </button>
          </Link>
          <button
            type="button"
            onClick={() => toast.info("Logg runde kommer snart")}
            className="flex items-center gap-2 bg-white/15 text-white border border-white/25 rounded-full px-5 py-2.5 font-mono text-[11px] font-bold tracking-[0.08em] uppercase cursor-pointer"
          >
            <Flag size={13} aria-hidden />
            Logg runde
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Compact extra-session row ─────────────────────────────────────

function ExtraSessionRow({ session }: { session: TodaySession }) {
  const iconClass = PRACTICE_ICON_COLOR[session.pyramidArea] ?? "bg-secondary text-foreground";
  return (
    <Link href={session.href}>
      <div className="flex items-center gap-3 bg-card border border-border rounded-[14px] px-4 py-3 hover:bg-secondary transition-colors">
        <span
          className={cn(
            "w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0",
            iconClass,
          )}
        >
          <BarChart2 size={18} strokeWidth={1.6} aria-hidden />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-foreground truncate">{session.title}</p>
          <p className="font-mono text-[11px] text-muted-foreground mt-0.5">
            {formatTime(session.startTime)} · {session.durationMin} min
          </p>
        </div>
        <span
          className={cn(
            "font-mono text-[10px] font-semibold tracking-[0.04em] uppercase px-2.5 py-1 rounded-full",
            session.status === "COMPLETED"
              ? "bg-[var(--color-chip-ok-bg)] text-[var(--color-chip-ok-fg)]"
              : session.status === "IN_PROGRESS"
                ? "bg-accent/20 text-accent-foreground"
                : "bg-secondary text-muted-foreground",
          )}
        >
          {session.status === "COMPLETED"
            ? "Ferdig"
            : session.status === "IN_PROGRESS"
              ? "Pågår"
              : "Senere"}
        </span>
      </div>
    </Link>
  );
}

// ── Coach note card ───────────────────────────────────────────────

function CoachNoteCard({
  message,
}: {
  message: DashboardData["coachMessage"];
}) {
  if (!message) return null;

  return (
    <div className="space-y-2.5">
      <span className="font-mono text-[10px] font-bold tracking-[0.12em] uppercase text-muted-foreground block">
        Coach-notat
      </span>
      <Link href={message.href}>
        <div className="bg-card border border-border border-l-[3px] border-l-accent rounded-[20px] p-4 shadow-[0_1px_2px_rgba(10,31,23,.05)] hover:bg-secondary transition-colors">
          {/* author row */}
          <div className="flex items-center gap-3 mb-3.5">
            <div className="w-9 h-9 rounded-full flex-none bg-primary flex items-center justify-center font-mono text-[12px] font-bold text-accent ring-2 ring-card ring-offset-[2px] ring-offset-primary">
              {message.coachInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-[14.5px] font-bold tracking-[-0.01em] text-foreground leading-tight">
                {message.coachName}
              </p>
              <p className="font-mono text-[9.5px] font-bold tracking-[0.12em] uppercase text-muted-foreground mt-0.5">
                Head Coach
              </p>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-full whitespace-nowrap">
              {timeAgo(message.createdAt)}
            </span>
          </div>

          {/* message body */}
          <p className="text-[13.5px] leading-[1.55] text-foreground line-clamp-4">
            {message.preview}
          </p>

          {/* read more */}
          <div className="mt-3 flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-primary">
            Les mer <ChevronRight size={12} aria-hidden />
          </div>
        </div>
      </Link>
    </div>
  );
}

// ── Empty coach note ──────────────────────────────────────────────

function NoCoachNote() {
  return (
    <div className="space-y-2.5">
      <span className="font-mono text-[10px] font-bold tracking-[0.12em] uppercase text-muted-foreground block">
        Coach-notat
      </span>
      <div className="bg-card border border-border border-l-[3px] border-l-accent rounded-[20px] p-4 flex items-center gap-4">
        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <MessageSquare size={18} className="text-muted-foreground" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground">Ingen notat fra coach ennå.</p>
          <Link
            href="/portal/coach/melding/ny"
            className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-primary hover:opacity-80 mt-1 inline-block"
          >
            Send melding →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Root component ────────────────────────────────────────────────

export type HybridHomePageProps = {
  data: DashboardData;
};

export function HybridHomePage({ data }: HybridHomePageProps) {
  const { user, greeting, weekNumber, today, todayAll, coachMessage, kpiStats } = data;

  // Extra sessions today (beyond the first/primary)
  const extraSessions = todayAll.length > 1 ? todayAll.slice(1) : [];

  // Build KPI values
  const kpiItems: KpiCellProps[] = [
    {
      label: "Snittscore",
      value: kpiStats.avgScore != null ? kpiStats.avgScore.toLocaleString("nb-NO", { maximumFractionDigits: 1 }) : "–",
      hot: false,
    },
    {
      label: "SG total",
      value:
        kpiStats.sgTotal != null
          ? (kpiStats.sgTotal >= 0 ? "+" : "") + kpiStats.sgTotal.toLocaleString("nb-NO", { maximumFractionDigits: 1 })
          : "–",
      delta: kpiStats.sgTotal != null ? Math.abs(kpiStats.sgTotal).toLocaleString("nb-NO", { maximumFractionDigits: 1 }) : undefined,
      deltaUp: (kpiStats.sgTotal ?? 0) >= 0,
      hot: false,
    },
    {
      label: "Økter uke",
      value: String(kpiStats.sessionsThisWeek),
      hot: kpiStats.sessionsThisWeek > 0,
    },
    {
      label: "Handicap",
      value: user.hcp != null ? user.hcp.toLocaleString("nb-NO", { maximumFractionDigits: 1 }) : "–",
      hot: false,
    },
  ];

  // Date eyebrow: "Uke 25 · Tirsdag 17. juni"
  const now = new Date();
  const dateEyebrow = `Uke ${weekNumber} · ${capitalise(formatWeekDay(now))}`;

  return (
    <div className="max-w-[460px] mx-auto space-y-4 px-0">
      {/* ── 1. Greeting section ── */}
      <div className="pt-1">
        <span className="inline-flex items-center font-mono text-[10px] font-bold tracking-[0.08em] uppercase bg-primary text-accent rounded-full px-2.5 py-1 mb-3">
          PlayerHQ · {user.tier}
        </span>
        <span className="font-mono text-[11px] font-semibold tracking-[0.16em] uppercase text-muted-foreground block mb-2.5">
          {dateEyebrow}
        </span>
        <h1 className="font-display text-[38px] font-bold tracking-[-0.035em] leading-[1.04] text-foreground">
          {greeting},{" "}
          <em className="italic font-medium text-primary">
            {user.fornavn}.
          </em>
        </h1>
        <p className="text-[13.5px] leading-[1.5] text-muted-foreground mt-2.5">
          {todayAll.length > 0
            ? `${todayAll.length === 1 ? "Én økt" : `${todayAll.length} økter`} står på planen i dag.${
                kpiStats.sgTotal != null && kpiStats.sgTotal > 0
                  ? " Du er i god form på SG denne måneden."
                  : ""
              }`
            : "Ingen økt planlagt i dag — klar for en fridag?"}
        </p>
      </div>

      {/* ── 2. KPI strip ── */}
      <div className="border border-border rounded-[14px] overflow-hidden bg-card grid grid-cols-4">
        {kpiItems.map((k) => (
          <KpiCell key={k.label} {...k} />
        ))}
      </div>

      {/* ── 3. Dagens økt featured card ── */}
      {today ? <TodayFeaturedCard session={today} /> : <NoSessionCard />}

      {/* ── 4. Extra sessions compact rows ── */}
      {extraSessions.length > 0 && (
        <div className="space-y-2">
          {extraSessions.map((s) => (
            <ExtraSessionRow key={s.id} session={s} />
          ))}
        </div>
      )}

      {/* ── 5. Coach-notat ── */}
      {coachMessage ? (
        <CoachNoteCard message={coachMessage} />
      ) : (
        <NoCoachNote />
      )}
    </div>
  );
}
