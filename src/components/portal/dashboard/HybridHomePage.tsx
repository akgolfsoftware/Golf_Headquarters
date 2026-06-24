"use client";

/**
 * HybridHomePage — PlayerHQ Hjem (/portal). Portet til terminal-lys-fasit
 * "PlayerHQ Dashboard (terminal-lys).dc.html" (2026-06-21).
 *
 * Presentasjonslag: all data sendes inn som props fra page.tsx (server).
 * PortalShell (layout) eier topbar/sidebar/bunn-nav — denne rendrer <main>.
 *
 * Seksjoner (mobil-først, etter fasit):
 *   1. Hilsen (tier-pill + dato-eyebrow + hero + sub) — LÅST unntak: tier-pill
 *      "PlayerHQ · {tier}" + profil/tier-topp eies av shell.
 *   2. SG-ticker — mørk skog-stripe med mono SG-KPIer + lime puls.
 *   3. Start dagens økt — lime CTA (når dagens økt finnes).
 *   4. KPI-grid (3): SG TOTALT · RUNDER · SNITTSCORE.
 *   5. SG per kategori — mørk datamodul med 4 barer (sentrert nullakse).
 *   6. Dagens plan — lysere rader per økt i dag.
 *   7. Hva er nytt — siste aktivitet (drill-logger).
 *   8. Coach-notat — beholdt app-funksjon.
 */

import Link from "next/link";
import {
  Play,
  ArrowRight,
  MessageSquare,
  ChevronRight,
  CalendarRange,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WeekProgress } from "./WeekProgress";
import type { DashboardData, TodaySession } from "@/app/portal/actions";

// ── helpers ───────────────────────────────────────────────────────

function formatTime(d: Date): string {
  return d.toLocaleTimeString("nb-NO", {
    hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Oslo",
  });
}

function formatWeekDay(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Oslo",
  });
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function timeAgo(d: Date): string {
  const diffMin = Math.round((Date.now() - d.getTime()) / 60_000);
  if (diffMin < 60) return `${Math.max(0, diffMin)} min siden`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} t siden`;
  return `${Math.floor(diffH / 24)} d siden`;
}

function fmtSg(v: number | null): string {
  if (v == null) return "–";
  const s = Math.abs(v).toLocaleString("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return (v >= 0 ? "+" : "−") + s;
}

// ── 2. SG-ticker ──────────────────────────────────────────────────

function SgTicker({
  sgTotal,
  breakdown,
}: {
  sgTotal: number | null;
  breakdown: DashboardData["kpiStats"]["sgBreakdown"];
}) {
  const items: Array<[string, number | null]> = [
    ["SG TOTALT", sgTotal],
    ["OTT", breakdown.ott],
    ["APP", breakdown.app],
    ["ARG", breakdown.arg],
    ["PUTT", breakdown.putt],
  ];
  return (
    <div
      className="flex items-center gap-4 overflow-x-auto rounded-[12px] px-4 py-2.5 scrollbar-none"
      style={{ background: "var(--forest-deep, #00402F)" }}
      aria-label="Strokes gained — siste 10 runder"
    >
      <span className="h-1.5 w-1.5 flex-none rounded-full bg-accent animate-pulse" aria-hidden />
      {items.map(([label, v]) => (
        <span key={label} className="flex items-baseline gap-1.5 flex-none">
          <span className="font-mono text-[9px] font-medium tracking-[0.1em] uppercase text-white/55">
            {label}
          </span>
          <span
            className={cn(
              "font-mono text-[12px] font-bold tabular-nums",
              v == null ? "text-white/50" : v >= 0 ? "text-[var(--t-up,#4FD08A)]" : "text-[var(--t-down,#F0683E)]",
            )}
          >
            {fmtSg(v)}
          </span>
        </span>
      ))}
    </div>
  );
}

// ── 4. KPI-grid (3) ───────────────────────────────────────────────

function KpiCell({
  label, value, sub, hot,
}: { label: string; value: string; sub?: string; hot?: boolean }) {
  return (
    <div className={cn("flex flex-col px-3 py-3 border-r border-border last:border-r-0", hot && "bg-accent/10")}>
      <span className="font-mono text-[8.5px] font-medium tracking-[0.1em] uppercase text-muted-foreground mb-1.5 leading-none">
        {label}
      </span>
      <span className={cn("font-mono text-[20px] font-semibold tracking-[-0.02em] tabular-nums leading-none", hot ? "text-primary" : "text-foreground")}>
        {value}
      </span>
      {sub && (
        <span className="font-mono text-[9px] font-medium mt-1.5 text-muted-foreground tabular-nums">{sub}</span>
      )}
    </div>
  );
}

// ── 5. SG per kategori (mørk modul) ───────────────────────────────

const SG_CATS: Array<{ key: "ott" | "app" | "arg" | "putt"; label: string }> = [
  { key: "ott", label: "Off the tee" },
  { key: "app", label: "Approach" },
  { key: "arg", label: "Around green" },
  { key: "putt", label: "Putting" },
];

function SgCategoryModule({ breakdown }: { breakdown: DashboardData["kpiStats"]["sgBreakdown"] }) {
  const SCALE = 1.5; // ±1,5 slag = full barbredde fra senter
  const hasAny = SG_CATS.some((c) => breakdown[c.key] != null);
  return (
    <div
      className="relative overflow-hidden rounded-[16px] p-5"
      style={{ background: "var(--t-bg-2, #0D1A14)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{ backgroundImage: "linear-gradient(var(--t-line-soft,rgba(180,225,195,.035)) 1px,transparent 1px),linear-gradient(90deg,var(--t-line-soft,rgba(180,225,195,.035)) 1px,transparent 1px)", backgroundSize: "30px 30px" }}
      />
      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <span className="font-mono text-[10px] font-bold tracking-[0.12em] uppercase text-[var(--t-fg-2,#9DB0A4)]">
            SG per kategori
          </span>
          <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--t-fg-3,#5E726A)]">
            Siste 10 runder
          </span>
        </div>
        {hasAny ? (
          <div className="space-y-3">
            {SG_CATS.map(({ key, label }) => {
              const v = breakdown[key];
              const pct = v == null ? 0 : Math.min(100, (Math.abs(v) / SCALE) * 100);
              const positive = (v ?? 0) >= 0;
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-24 flex-none font-mono text-[11px] text-[var(--t-fg,#EAF2EC)]">{label}</span>
                  <div className="relative h-2 flex-1 rounded-full bg-white/[0.06]">
                    <div className="absolute left-1/2 top-0 h-full w-px bg-white/15" aria-hidden />
                    {v != null && (
                      <div
                        className="absolute top-0 h-full rounded-full"
                        style={{
                          width: `${pct / 2}%`,
                          [positive ? "left" : "right"]: "50%",
                          background: positive
                            ? "linear-gradient(90deg, var(--forest,#005840), var(--lime,#D1F843))"
                            : "var(--t-down,#F0683E)",
                        }}
                      />
                    )}
                  </div>
                  <span
                    className={cn(
                      "w-12 flex-none text-right font-mono text-[12px] font-bold tabular-nums",
                      v == null ? "text-[var(--t-fg-3,#5E726A)]" : positive ? "text-[var(--t-up,#4FD08A)]" : "text-[var(--t-down,#F0683E)]",
                    )}
                  >
                    {fmtSg(v)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="font-mono text-[11px] text-[var(--t-fg-3,#5E726A)] py-2">
            Ingen SG-data ennå — importer runder for å se fordelingen.
          </p>
        )}
      </div>
    </div>
  );
}

// ── 6. Dagens plan-rad ────────────────────────────────────────────

function PlanRow({ session }: { session: TodaySession }) {
  return (
    <Link href={session.href}>
      <div className="flex items-center gap-3 rounded-[14px] border border-border bg-card px-4 py-3 transition-colors hover:bg-secondary">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] bg-primary/10 text-primary">
          <Activity size={18} strokeWidth={1.6} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-bold text-foreground">{session.title}</p>
          <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
            {formatTime(session.startTime)} · {session.drills.length} drills · {session.durationMin} min
          </p>
        </div>
        <ChevronRight size={16} className="flex-none text-muted-foreground" aria-hidden />
      </div>
    </Link>
  );
}

// ── 7. Hva er nytt ────────────────────────────────────────────────

function HvaErNytt({ items }: { items: DashboardData["recentActivity"] }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-2.5">
      <span className="block font-mono text-[10px] font-bold tracking-[0.12em] uppercase text-muted-foreground">
        Hva er nytt
      </span>
      <div className="space-y-2">
        {items.slice(0, 3).map((a) => (
          <Link key={a.id} href={a.href}>
            <div className="flex items-start gap-3 rounded-[14px] border border-border bg-card px-4 py-3 transition-colors hover:bg-secondary">
              <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-primary/10 text-primary">
                <Activity size={14} strokeWidth={1.75} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-bold text-foreground">{a.drillName}</p>
                <p className="mt-0.5 font-mono text-[10.5px] text-muted-foreground tabular-nums">
                  {a.sessionTitle}
                  {a.successRate != null ? ` · ${Math.round(a.successRate)} %` : ""} · {timeAgo(a.loggedAt)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── 8. Coach-notat ────────────────────────────────────────────────

function CoachNoteCard({ message }: { message: DashboardData["coachMessage"] }) {
  if (!message) {
    return (
      <div className="space-y-2.5">
        <span className="block font-mono text-[10px] font-bold tracking-[0.12em] uppercase text-muted-foreground">
          Coach-notat
        </span>
        <div className="flex items-center gap-4 rounded-[20px] border border-l-[3px] border-border border-l-accent bg-card p-4">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-muted">
            <MessageSquare size={18} className="text-muted-foreground" strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground">Ingen notat fra coach ennå.</p>
            <Link href="/portal/coach/melding/ny" className="mt-1 inline-block font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-primary hover:opacity-80">
              Send melding →
            </Link>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-2.5">
      <span className="block font-mono text-[10px] font-bold tracking-[0.12em] uppercase text-muted-foreground">
        Coach-notat
      </span>
      <Link href={message.href}>
        <div className="rounded-[20px] border border-l-[3px] border-border border-l-accent bg-card p-4 shadow-[0_1px_2px_rgba(10,31,23,.05)] transition-colors hover:bg-secondary">
          <div className="mb-3.5 flex items-center gap-3">
            <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-primary font-mono text-[12px] font-bold text-accent ring-2 ring-card ring-offset-[2px] ring-offset-primary">
              {message.coachInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-[14.5px] font-bold leading-tight tracking-[-0.01em] text-foreground">
                {message.coachName}
              </p>
              <p className="mt-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Head Coach
              </p>
            </div>
            <span className="whitespace-nowrap rounded-full bg-secondary px-2.5 py-1 font-mono text-[10px] text-muted-foreground">
              {timeAgo(message.createdAt)}
            </span>
          </div>
          <p className="line-clamp-4 text-[13.5px] leading-[1.55] text-foreground">{message.preview}</p>
          <div className="mt-3 flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-primary">
            Les mer <ChevronRight size={12} aria-hidden />
          </div>
        </div>
      </Link>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────

export type HybridHomePageProps = { data: DashboardData };

export function HybridHomePage({ data }: HybridHomePageProps) {
  const { user, greeting, today, todayAll, coachMessage, kpiStats, recentActivity, weekProgress, weekNumber } = data;

  const kpiItems = [
    { label: "SG totalt", value: fmtSg(kpiStats.sgTotal), hot: (kpiStats.sgTotal ?? 0) > 0 },
    { label: "Runder", value: String(kpiStats.roundsCount), sub: "siste 90 d" },
    { label: "Snittscore", value: kpiStats.avgScore != null ? kpiStats.avgScore.toLocaleString("nb-NO", { maximumFractionDigits: 1 }) : "–" },
  ];

  const now = new Date();
  const dateEyebrow = `${capitalise(formatWeekDay(now))} · ${formatTime(now)}`;

  return (
    <div className="mx-auto max-w-[460px] space-y-4 px-0">
      {/* 1. Hilsen */}
      <div className="pt-1">
        <span className="mb-3 inline-flex items-center rounded-full bg-primary px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-accent">
          PlayerHQ · {user.tier}
        </span>
        <span className="mb-2.5 block font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {dateEyebrow}
        </span>
        <h1 className="font-display text-[38px] font-bold leading-[1.04] tracking-[-0.035em] text-foreground">
          {greeting},{" "}
          <em className="font-medium italic text-primary">{user.fornavn}.</em>
        </h1>
        <p className="mt-2.5 text-[13.5px] leading-[1.5] text-muted-foreground">
          {todayAll.length > 0
            ? `${todayAll.length === 1 ? "Én økt" : `${todayAll.length} økter`} står på planen i dag.${
                (kpiStats.sgTotal ?? 0) > 0 ? " Du er i god form på SG denne måneden." : ""
              }`
            : "Ingen økt planlagt i dag — klar for en fridag?"}
        </p>
      </div>

      {/* 2. SG-ticker */}
      <SgTicker sgTotal={kpiStats.sgTotal} breakdown={kpiStats.sgBreakdown} />

      {/* 3. Start dagens økt */}
      {today && (
        <Link href={today.href}>
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3.5 font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-accent-foreground"
          >
            {today.status === "IN_PROGRESS" ? "Fortsett dagens økt" : "Start dagens økt"}
            <Play size={14} fill="currentColor" aria-hidden />
          </button>
        </Link>
      )}

      {/* 4. KPI-grid */}
      <div className="grid grid-cols-3 overflow-hidden rounded-[14px] border border-border bg-card">
        {kpiItems.map((k) => (
          <KpiCell key={k.label} {...k} />
        ))}
      </div>

      {/* 5. SG per kategori */}
      <SgCategoryModule breakdown={kpiStats.sgBreakdown} />

      {/* 6. Dagens plan */}
      {todayAll.length > 0 ? (
        <div className="space-y-2.5">
          <span className="block font-mono text-[10px] font-bold tracking-[0.12em] uppercase text-muted-foreground">
            Dagens plan
          </span>
          <div className="space-y-2">
            {todayAll.map((s) => (
              <PlanRow key={s.id} session={s} />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-[14px] border border-dashed border-border bg-card px-4 py-4">
          <CalendarRange size={18} className="text-muted-foreground" strokeWidth={1.6} aria-hidden />
          <div className="flex-1">
            <p className="text-[13.5px] text-muted-foreground">Ingen økt planlagt i dag.</p>
            <Link href="/portal/planlegge" className="mt-0.5 inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-primary hover:opacity-80">
              Planlegg økt <ArrowRight size={12} aria-hidden />
            </Link>
          </div>
        </div>
      )}

      {/* 6b. Plan denne uka (fersk fasit — ekte ukeframdrift) */}
      <WeekProgress progress={weekProgress} weekNumber={weekNumber} />

      {/* 7. Hva er nytt */}
      <HvaErNytt items={recentActivity} />

      {/* 8. Coach-notat */}
      <CoachNoteCard message={coachMessage} />
    </div>
  );
}
