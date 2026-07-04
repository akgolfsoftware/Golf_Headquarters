"use client";

/**
 * HybridHomePage — PlayerHQ Hjem (/portal). Recomponert fra v13-designsystemet
 * (Bolk 1, 2026-07-04). Bygget av golfdata-komponentene: KpiTile (dataliv),
 * SgKategoriBar (kanonisk SG-dekomponering), Button (signal-CTA), Card, Eyebrow.
 * Den gamle terminal-lys-fasiten (juni) er obsolet — v13 er eneste gjeldende design.
 *
 * Presentasjonslag: all data sendes inn som props fra page.tsx (server).
 * PortalShell (layout) eier topbar/sidebar/bunn-nav — denne rendrer <main>.
 * Alt v13-innhold rendres under .golfdata-scope (lys PlayerHQ-tema).
 *
 * Seksjoner (mobil-først):
 *   1. Hilsen (tier-pill + dato-eyebrow + display-hero + lead).
 *   2. Start dagens økt — lime signal-CTA (når dagens økt finnes).
 *   3. KPI-grid (3): SG TOTALT · RUNDER · SNITTSCORE — KpiTile m/ count-up.
 *   4. SG per kategori — SgKategoriBar (divergerende stolper mot baseline).
 *   5. Dagens plan — Card-rader per økt i dag.
 *   6. Plan denne uka — WeekProgress (ekte ukeframdrift).
 *   7. Hva er nytt — siste aktivitet (drill-logger).
 *   8. Coach-notat — beholdt app-funksjon, v13 Card.
 */

import Link from "next/link";
import { Play, ArrowRight, MessageSquare, ChevronRight, CalendarRange, Activity } from "lucide-react";
import { Button, Card, Eyebrow, KpiTile, SgKategoriBar, type SgKategori } from "@/components/athletic/golfdata";
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

// ── 5. Dagens plan-rad ────────────────────────────────────────────

function PlanRow({ session }: { session: TodaySession }) {
  return (
    <Link href={session.href} className="block">
      <Card interactive compact>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] bg-primary/10 text-primary">
            <Activity size={18} strokeWidth={1.6} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-bold text-foreground">{session.title}</p>
            <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
              {formatTime(session.startTime)} · {session.drills.length} drills · {session.durationMin} min
            </p>
          </div>
          <ChevronRight size={16} className="flex-none text-muted-foreground" aria-hidden />
        </div>
      </Card>
    </Link>
  );
}

// ── 7. Hva er nytt ────────────────────────────────────────────────

function HvaErNytt({ items }: { items: DashboardData["recentActivity"] }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-2.5">
      <Eyebrow>Hva er nytt</Eyebrow>
      <div className="space-y-2">
        {items.slice(0, 3).map((a) => (
          <Link key={a.id} href={a.href} className="block">
            <Card interactive compact>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Activity size={14} strokeWidth={1.75} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold text-foreground">{a.drillName}</p>
                  <p className="mt-0.5 font-mono text-[10.5px] text-muted-foreground tabular-nums">
                    {a.sessionTitle}
                    {a.successRate != null ? ` · ${Math.round(a.successRate)} %` : ""} · {timeAgo(a.loggedAt)}
                  </p>
                </div>
              </div>
            </Card>
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
        <Eyebrow>Coach-notat</Eyebrow>
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-muted">
              <MessageSquare size={18} className="text-muted-foreground" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] text-muted-foreground">Ingen notat fra coach ennå.</p>
              <Link href="/portal/coach/melding/ny" className="mt-1 inline-block font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-primary hover:opacity-80">
                Send melding →
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }
  return (
    <div className="space-y-2.5">
      <Eyebrow>Coach-notat</Eyebrow>
      <Link href={message.href} className="block">
        <Card interactive>
          <div className="mb-3.5 flex items-center gap-3">
            <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-primary font-mono text-[12px] font-bold text-accent ring-2 ring-card ring-offset-[2px] ring-offset-primary">
              {message.coachInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-[15px] font-bold leading-tight tracking-[-0.01em] text-foreground">
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
          <p className="line-clamp-4 text-[15px] leading-[1.55] text-foreground">{message.preview}</p>
          <div className="mt-3 flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-primary">
            Les mer <ChevronRight size={12} aria-hidden />
          </div>
        </Card>
      </Link>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────

export type HybridHomePageProps = { data: DashboardData };

export function HybridHomePage({ data }: HybridHomePageProps) {
  const { user, greeting, today, todayAll, coachMessage, kpiStats, recentActivity, weekProgress, weekNumber } = data;

  const now = new Date();
  const dateEyebrow = `${capitalise(formatWeekDay(now))} · ${formatTime(now)}`;

  const sgKategorier: SgKategori[] = [
    { akse: "OTT", sg: kpiStats.sgBreakdown.ott ?? 0 },
    { akse: "APP", sg: kpiStats.sgBreakdown.app ?? 0 },
    { akse: "ARG", sg: kpiStats.sgBreakdown.arg ?? 0 },
    { akse: "PUTT", sg: kpiStats.sgBreakdown.putt ?? 0 },
  ];
  const hasSgBreakdown = (["ott", "app", "arg", "putt"] as const).some((k) => kpiStats.sgBreakdown[k] != null);

  return (
    <div className="golfdata-scope mx-auto max-w-[460px] space-y-5 px-0">
      {/* 1. Hilsen */}
      <div className="pt-1">
        <span className="mb-3 inline-flex items-center rounded-full bg-primary px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-accent">
          PlayerHQ · {user.tier}
        </span>
        <Eyebrow className="mb-2.5 block" style={{ fontSize: "var(--text-11)", letterSpacing: "0.16em" }}>
          {dateEyebrow}
        </Eyebrow>
        <h1 className="font-display text-[38px] font-bold leading-[1.04] tracking-[-0.035em] text-foreground">
          {greeting}, <em className="font-medium italic text-primary">{user.fornavn}.</em>
        </h1>
        <p className="mt-2.5 text-[15px] leading-[1.5] text-muted-foreground">
          {todayAll.length > 0
            ? `${todayAll.length === 1 ? "Én økt" : `${todayAll.length} økter`} står på planen i dag.${
                (kpiStats.sgTotal ?? 0) > 0 ? " Du er i god form på SG denne måneden." : ""
              }`
            : "Ingen økt planlagt i dag — klar for en fridag?"}
        </p>
      </div>

      {/* 2. Start dagens økt — til live-status-router */}
      {today && (
        <Link href={`/portal/live/${today.id}`} className="block">
          <Button variant="signal" size="lg" block iconRight={<Play size={16} fill="currentColor" strokeWidth={0} aria-hidden />}>
            {today.status === "IN_PROGRESS" ? "Fortsett dagens økt" : "Start dagens økt"}
          </Button>
        </Link>
      )}

      {/* 3. KPI-grid — dataliv count-up */}
      <Card compact bodyStyle={{ padding: 0 }}>
        <div className="grid grid-cols-3 divide-x divide-border">
          <div className="px-4 py-4">
            <KpiTile size="md" label="SG totalt" value={fmtSg(kpiStats.sgTotal)} />
          </div>
          <div className="px-4 py-4">
            <KpiTile size="md" label="Runder" value={kpiStats.roundsCount} deltaSuffix="siste 90 d" />
          </div>
          <div className="px-4 py-4">
            <KpiTile
              size="md"
              label="Snittscore"
              value={kpiStats.avgScore != null ? kpiStats.avgScore.toLocaleString("nb-NO", { maximumFractionDigits: 1 }) : "–"}
            />
          </div>
        </div>
      </Card>

      {/* 4. SG per kategori */}
      {hasSgBreakdown ? (
        <SgKategoriBar kategorier={sgKategorier} nivaa="ovet" baseline="Broadie scratch" />
      ) : (
        <SgKategoriBar kategorier={[]} />
      )}

      {/* 5. Dagens plan */}
      {todayAll.length > 0 ? (
        <div className="space-y-2.5">
          <Eyebrow>Dagens plan</Eyebrow>
          <div className="space-y-2">
            {todayAll.map((s) => (
              <PlanRow key={s.id} session={s} />
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <div className="flex items-center gap-3">
            <CalendarRange size={18} className="text-muted-foreground" strokeWidth={1.6} aria-hidden />
            <div className="flex-1">
              <p className="text-[15px] text-muted-foreground">Ingen økt planlagt i dag.</p>
              <Link href="/portal/planlegge" className="mt-0.5 inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-primary hover:opacity-80">
                Planlegg økt <ArrowRight size={12} aria-hidden />
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* 6. Plan denne uka */}
      <WeekProgress progress={weekProgress} weekNumber={weekNumber} />

      {/* 7. Hva er nytt */}
      <HvaErNytt items={recentActivity} />

      {/* 8. Coach-notat */}
      <CoachNoteCard message={coachMessage} />
    </div>
  );
}
