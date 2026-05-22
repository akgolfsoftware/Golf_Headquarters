/**
 * PlayerHQ Oversikt (slank) — validerings-design 2026-05-22
 *
 * Plan-IA: Hero + 4 KPI + Dagens fokus + Varsler-strip + 3 CTA + Pyramide-footer
 * Bruker athletic/-primitives + felles design-tokens (ingen ad-hoc CSS).
 *
 * Referanse-design: AK Golf Workbench Unified.html (hero + profile-hero-blokk)
 * IA: master-plan PlayerHQ Oversikt-tab
 */

import Link from "next/link";
import {
  Target,
  Flame,
  Trophy,
  TrendingUp,
  Play,
  MessageSquare,
  PenSquare,
  Sparkles,
  Bell,
  ArrowRight,
} from "lucide-react";

import {
  AthleticBadge,
  AthleticButton,
  AthleticEyebrow,
  KpiCard,
  AthleticAvatar,
} from "@/components/athletic";
import type { PyramidArea } from "@/generated/prisma/client";

export type OversiktSlimProps = {
  playerName: string;
  playerInitials: string;
  hcpString: string;
  category: string;
  club: string;
  weekNumber: number;
  weekRange: string;
  streakDays: number;
  longestStreak: number;
  nextGoal: { title: string; pct: number };
  weekFocus: string;
  todaysFocus: { title: string; description: string; ctaHref: string } | null;
  pyramide: { area: PyramidArea; pct: number }[];
  unreadNotifications: number;
  recentNotifications: Array<{ id: string; title: string; timeAgo: string }>;
  resumeSession: { label: string; href: string } | null;
};

const pyrLabels: Record<PyramidArea, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

const pyrColors: Record<PyramidArea, string> = {
  FYS: "var(--color-pyr-fys)",
  TEK: "var(--color-pyr-tek)",
  SLAG: "var(--color-pyr-slag)",
  SPILL: "var(--color-pyr-spill)",
  TURN: "var(--color-pyr-turn)",
};

function greetingForHour(hour: number): string {
  if (hour < 5) return "God natt";
  if (hour < 10) return "God morgen";
  if (hour < 17) return "God dag";
  if (hour < 22) return "God kveld";
  return "God natt";
}

export function OversiktSlim({
  playerName,
  playerInitials,
  hcpString,
  category,
  club,
  weekNumber,
  weekRange,
  streakDays,
  longestStreak,
  nextGoal,
  weekFocus,
  todaysFocus,
  pyramide,
  unreadNotifications,
  recentNotifications,
  resumeSession,
}: OversiktSlimProps) {
  const hour = new Date().getHours();
  const greeting = greetingForHour(hour);
  const firstName = playerName.split(" ")[0];

  return (
    <div className="space-y-6 px-4 py-6 md:px-8 md:py-8 lg:px-12">
      {/* ============= HERO ============= */}
      <section className="grid items-end gap-6 md:grid-cols-[1fr_auto]">
        <div>
          <AthleticEyebrow>PLAYERHQ · OVERSIKT</AthleticEyebrow>
          <h1 className="font-display mt-2 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            {greeting},{" "}
            <em
              className="font-normal not-italic"
              style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", color: "#005840" }}
            >
              {firstName}
            </em>
          </h1>
          <p className="font-mono mt-2 text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            UKE {weekNumber} · {weekRange.toUpperCase()} · {club.toUpperCase()}
          </p>
        </div>

        {/* Profil-hero-kortet */}
        <div
          className="relative overflow-hidden rounded-2xl px-5 py-4 text-white"
          style={{ background: "linear-gradient(165deg, #006C50 0%, #003A2A 100%)" }}
        >
          <div
            className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(209,248,67,0.18), transparent 70%)",
            }}
          />
          <div className="relative flex items-center gap-3">
            <AthleticAvatar
              initials={playerInitials}
              size="md"
              borderColor="card"
              className="!bg-accent !text-primary !border-white/30"
            />
            <div className="min-w-0">
              <div className="font-display text-base font-semibold leading-tight text-white">
                {playerName}
              </div>
              <div className="font-mono mt-0.5 text-[10px] font-semibold tracking-[0.06em] text-[#D1F843]">
                HCP {hcpString} · {category}
              </div>
            </div>
          </div>
          <div
            className="font-mono mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.05em]"
            style={{ background: "#D1F843", color: "#003A2A" }}
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: "#003A2A" }}
            />
            AKTIV {streakDays} DAGER
          </div>
        </div>
      </section>

      {/* ============= KPI-RAD ============= */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <KpiCard label="HCP" value={hcpString} trend={{ value: "−0,3 30d", tone: "positive" }} />
        <KpiCard label="STREAK" value={streakDays} unit={`/${longestStreak}d`} />
        <KpiCard
          label="NESTE MÅL"
          value={`${nextGoal.pct}%`}
          trend={{ value: nextGoal.title, tone: "neutral" }}
        />
        <KpiCard label="UKENS FOKUS" value={weekFocus} size="sm" />
      </section>

      {/* ============= DAGENS FOKUS ============= */}
      {todaysFocus ? (
        <section
          className="rounded-2xl border bg-card p-5 md:p-6"
          style={{ borderColor: "var(--color-accent-deep)" }}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <AthleticEyebrow>DAGENS FOKUS</AthleticEyebrow>
              <h2 className="font-display mt-1.5 text-xl font-semibold tracking-tight md:text-2xl">
                {todaysFocus.title}
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {todaysFocus.description}
              </p>
            </div>
            <Link href={todaysFocus.ctaHref}>
              <AthleticButton variant="lime" size="lg">
                <Play className="h-4 w-4" />
                Start økt
              </AthleticButton>
            </Link>
          </div>
        </section>
      ) : null}

      {/* ============= FORTSETT DER DU SLUTTET ============= */}
      {resumeSession ? (
        <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <AthleticEyebrow>FORTSETT</AthleticEyebrow>
              <p className="font-display mt-1 text-base font-semibold">
                {resumeSession.label}
              </p>
            </div>
            <Link href={resumeSession.href}>
              <AthleticButton variant="ghost-light" size="sm">
                Gå tilbake
                <ArrowRight className="h-4 w-4" />
              </AthleticButton>
            </Link>
          </div>
        </section>
      ) : null}

      {/* ============= QUICK ACTIONS ============= */}
      <section>
        <AthleticEyebrow>RASK START</AthleticEyebrow>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Link
            href="/portal/coach?tab=ny-melding"
            className="group rounded-2xl border border-border bg-card p-4 transition hover:border-[var(--color-accent-deep)] hover:shadow-[var(--shadow-card-hover)]"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-accent">
                <MessageSquare className="h-5 w-5" />
              </span>
              <div>
                <div className="font-display text-sm font-semibold">Be om økt</div>
                <div className="text-xs text-muted-foreground">Send forespørsel til coach</div>
              </div>
            </div>
          </Link>
          <Link
            href="/portal/analysere/runder/ny"
            className="group rounded-2xl border border-border bg-card p-4 transition hover:border-[var(--color-accent-deep)] hover:shadow-[var(--shadow-card-hover)]"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-accent">
                <PenSquare className="h-5 w-5" />
              </span>
              <div>
                <div className="font-display text-sm font-semibold">Logg runde</div>
                <div className="text-xs text-muted-foreground">Registrer dagens runde</div>
              </div>
            </div>
          </Link>
          <Link
            href="/portal/planlegge?tab=treningsplan"
            className="group rounded-2xl border border-border bg-card p-4 transition hover:border-[var(--color-accent-deep)] hover:shadow-[var(--shadow-card-hover)]"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-accent">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <div className="font-display text-sm font-semibold">AI-foreslå uke</div>
                <div className="text-xs text-muted-foreground">Lag plan på 30 sek</div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ============= VARSLER-STRIP ============= */}
      <section className="rounded-2xl border border-border bg-card">
        <header className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-display text-sm font-semibold tracking-tight">
              Siste varsler
            </h3>
            {unreadNotifications > 0 ? (
              <AthleticBadge variant="lime">{unreadNotifications} nye</AthleticBadge>
            ) : null}
          </div>
          <Link
            href="/portal/varsler"
            className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-primary hover:underline"
          >
            Se alle
          </Link>
        </header>
        <ul className="divide-y divide-border">
          {recentNotifications.length === 0 ? (
            <li className="px-5 py-6 text-center text-sm text-muted-foreground">
              Ingen varsler — alt er ajour.
            </li>
          ) : (
            recentNotifications.slice(0, 3).map((n) => (
              <li key={n.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <p className="text-sm text-foreground">{n.title}</p>
                <span className="font-mono shrink-0 text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
                  {n.timeAgo}
                </span>
              </li>
            ))
          )}
        </ul>
      </section>

      {/* ============= PYRAMIDE-FOOTER ============= */}
      <section>
        <AthleticEyebrow>PYRAMIDE · SISTE 14 DAGER</AthleticEyebrow>
        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-5 md:gap-3">
          {pyramide.map((row) => (
            <div
              key={row.area}
              className="rounded-xl border border-border bg-card p-3"
            >
              <div className="flex items-baseline justify-between">
                <span
                  className="font-mono text-[10px] font-bold uppercase tracking-[0.10em]"
                  style={{ color: pyrColors[row.area] }}
                >
                  {pyrLabels[row.area]}
                </span>
                <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                  {row.pct}%
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, row.pct)}%`,
                    background: pyrColors[row.area],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Discrete branding-footer */}
      <footer className="pt-4 text-center">
        <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
          AK Golf · PlayerHQ · v2
        </p>
      </footer>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-unused-vars */
const _iconRefs = { Target, Flame, Trophy, TrendingUp };
