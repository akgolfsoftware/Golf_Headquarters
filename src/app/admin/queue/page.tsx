/**
 * AgencyOS — Oppfølgingskø (/admin/queue, alias /admin/oppfolging)
 * Coachens kontrolltårn: "Hvem trenger en samtale denne uka?"
 *
 * Restylet til athletic operations-tetthet (matcher daily-brief.tsx):
 *   - Mono-caps eyebrow + font-display-hero
 *   - KPI-strip (Risiko · Watch · Sjekk inn · Løst) i DS-tokens
 *   - Kanban-kolonner med signal-pille, SG-stats og hurtig-aksjoner per spiller
 *
 * All klassifiserings-logikk beholdt 1:1 (aktiv plan, inaktivitet, SG-fall).
 * Ekte Prisma. Tomstate per kolonne. Ingen hardkodet hex, ingen emoji.
 */

import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CalendarPlus,
  CheckCircle2,
  Clock,
  MessageSquare,
  Phone,
  Settings,
  Sparkles,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AthleticEyebrow } from "@/components/athletic";
import { cn } from "@/lib/utils";

type Status = "risk" | "watch" | "check" | "ok";

type Card = {
  id: string;
  initials: string;
  name: string;
  sub: string;
  signal: React.ReactNode;
  signalIcon: LucideIcon;
  stats: { k: string; v: string; tone?: "up" | "down" | "warn" | "success" }[];
  tags: { label: string; tone?: "danger" | "warning" | "success" }[];
  since: string;
  priority?: boolean;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function dagerSiden(d: Date | null): number | null {
  if (!d) return null;
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export default async function OppfolgingsKo() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const players = await prisma.user.findMany({
    where: { role: "PLAYER" },
    include: {
      trainingPlans: { where: { isActive: true }, select: { id: true } },
      signals: {
        where: { kind: "SG_TOTAL" },
        orderBy: { computedAt: "desc" },
        take: 1,
      },
    },
  });

  // Klassifiser hver spiller
  const risk: Card[] = [];
  const watch: Card[] = [];
  const check: Card[] = [];

  for (const p of players) {
    const grunner: string[] = [];
    const tags: { label: string; tone?: "danger" | "warning" | "success" }[] = [];
    const stats: Card["stats"] = [];

    if (p.trainingPlans.length === 0) {
      grunner.push("Ingen aktiv plan");
      tags.push({ label: "uten plan", tone: "danger" });
    }
    const dager = dagerSiden(p.lastLoginAt);
    if (!p.lastLoginAt || (dager !== null && dager > 14)) {
      grunner.push(`Ikke aktiv ${dager ?? "∞"}d`);
      tags.push({ label: "stille", tone: "warning" });
    }
    const sg = p.signals[0]?.value;
    if (sg != null) {
      stats.push({
        k: "SG · siste",
        v: `${sg >= 0 ? "+" : ""}${sg.toFixed(1).replace(".", ",")}`,
        tone: sg < 0 ? "down" : "up",
      });
    }
    if (sg != null && sg < -0.5) {
      tags.push({ label: "score-fall", tone: "danger" });
    }
    if (dager != null) {
      stats.push({ k: "Siste innlogg", v: `${dager}d` });
    }

    if (grunner.length === 0) continue;

    const card: Card = {
      id: p.id,
      initials: initials(p.name),
      name: p.name,
      sub: p.email,
      signalIcon:
        sg != null && sg < -0.5
          ? TrendingDown
          : grunner.length >= 2
            ? AlertCircle
            : Clock,
      signal: (
        <>
          <b className="font-semibold">{grunner.join(" · ")}</b>
        </>
      ),
      stats,
      tags,
      since: p.lastLoginAt
        ? `flagget ${dagerSiden(p.lastLoginAt) ?? 0} dager siden`
        : "flagget nylig",
      priority: grunner.length >= 3,
    };

    if (grunner.length >= 3) risk.push(card);
    else if (grunner.length === 2) watch.push(card);
    else check.push(card);
  }

  // Løste saker — placeholder inntil vi har en CoachingTask-modell
  // TODO: hent faktisk «løste oppfølgings-saker» fra database
  const ok: Card[] = [];

  const cols: { status: Status; title: string; desc: string; cards: Card[] }[] = [
    {
      status: "risk",
      title: "Risiko",
      desc: "Krever en samtale innen 48 timer.",
      cards: risk,
    },
    {
      status: "watch",
      title: "Watch",
      desc: "Trender feil retning — følg med.",
      cards: watch,
    },
    {
      status: "check",
      title: "Sjekk inn",
      desc: "Lett oppdatering — kjapp melding holder.",
      cards: check,
    },
    {
      status: "ok",
      title: "Løst · siste 7d",
      desc: "Tett-tett. Du kan markere «ikke vis» per sak.",
      cards: ok,
    },
  ];

  const totalAktive = risk.length + watch.length + check.length;

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8 lg:px-8">
      {/* Hero */}
      <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <AthleticEyebrow>AGENCYOS · OPPFØLGINGSKØ</AthleticEyebrow>
          <h1 className="mt-1.5 font-display text-3xl font-bold leading-tight tracking-tight md:text-[34px]">
            Hvem trenger en{" "}
            <em className="font-display font-normal italic text-primary">
              samtale
            </em>{" "}
            denne uka.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Plattformen flagger — du bestemmer.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/settings"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3.5 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <Settings className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Justere regler
          </Link>
          <button
            type="button"
            disabled
            title="AI-aksjoner kommer i v2"
            className="inline-flex h-9 cursor-not-allowed items-center gap-2 rounded-lg bg-primary px-3.5 text-[13px] font-medium text-primary-foreground opacity-50"
          >
            <Sparkles className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Generer AI-aksjoner
          </button>
        </div>
      </header>

      {/* KPI-strip */}
      <section className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="RISIKO"
          value={risk.length}
          meta="krever samtale < 48 t"
          icon={AlertTriangle}
          tone="danger"
        />
        <KpiCard
          label="WATCH"
          value={watch.length}
          meta="trender feil retning"
          icon={TrendingDown}
          tone="warn"
        />
        <KpiCard
          label="SJEKK INN"
          value={check.length}
          meta="lett oppdatering"
          icon={Clock}
        />
        <KpiCard
          label="LØST · 7D"
          value={ok.length}
          meta="markert ferdig"
          icon={CheckCircle2}
          tone="good"
        />
      </section>

      {/* Aktivitets-stripe */}
      <div className="mb-5 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-border bg-card px-4 py-3">
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground">
          AKTIVITET · 24 T
        </span>
        <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          Løst <b className="font-semibold text-foreground">{ok.length}</b> saker
        </span>
        <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <Bell className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          Flagget <b className="font-semibold text-foreground">{totalAktive}</b> aktive
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em]">
            Av {players.length} spillere totalt
          </span>
        </span>
      </div>

      {/* Board */}
      <section className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cols.map((col) => (
          <Column key={col.status} col={col} />
        ))}
      </section>

      <footer className="mt-8 flex items-center justify-between border-t border-border pt-5 text-[12px] text-muted-foreground">
        <span className="font-mono uppercase tracking-[0.08em]">
          AgencyOS · Oppfølgingskø
        </span>
        <span className="font-mono tabular-nums">{totalAktive} aktive saker</span>
      </footer>
    </div>
  );
}

// ── KPI-kort ────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  meta,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  meta: string;
  icon: LucideIcon;
  tone?: "danger" | "warn" | "good";
}) {
  const valueColor =
    tone === "danger"
      ? "text-destructive"
      : tone === "good"
        ? "text-primary"
        : "text-foreground";
  const iconWrap =
    tone === "danger"
      ? "bg-destructive/10 text-destructive"
      : tone === "good"
        ? "bg-accent text-primary"
        : "bg-secondary text-muted-foreground";
  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-card px-[18px] py-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </span>
        <span
          className={cn(
            "inline-flex h-6 w-6 items-center justify-center rounded-md",
            iconWrap,
          )}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
        </span>
      </div>
      <div
        className={cn(
          "font-mono text-[34px] font-bold leading-none tabular-nums tracking-[-0.02em]",
          valueColor,
        )}
      >
        {value}
      </div>
      <div className="text-[11px] text-muted-foreground">{meta}</div>
    </div>
  );
}

// ── Kanban-kolonne ──────────────────────────────────────────────
function Column({
  col,
}: {
  col: { status: Status; title: string; desc: string; cards: Card[] };
}) {
  const dotColor: Record<Status, string> = {
    risk: "bg-destructive",
    watch: "bg-warning",
    check: "bg-primary",
    ok: "bg-accent",
  };
  return (
    <div className="flex min-h-[480px] flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-3.5 py-3">
        <span className={cn("h-2 w-2 rounded-full", dotColor[col.status])} />
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground">
          {col.title}
        </span>
        <span className="ml-auto inline-flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-secondary px-1.5 font-mono text-[10px] font-bold tabular-nums text-muted-foreground">
          {col.cards.length}
        </span>
      </div>
      <div className="border-b border-border px-3.5 py-2 text-[11px] leading-snug text-muted-foreground">
        {col.desc}
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-3">
        {col.cards.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-3 py-8 text-center text-[12px] text-muted-foreground">
            Ingen saker her.
          </div>
        ) : (
          col.cards.map((c) => <CardItem key={c.id} card={c} />)
        )}
      </div>
    </div>
  );
}

// ── Spiller-kort ────────────────────────────────────────────────
function CardItem({ card }: { card: Card }) {
  const SignalIcon = card.signalIcon;
  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 rounded-lg border bg-background p-3 transition-colors",
        card.priority
          ? "border-destructive/30 bg-gradient-to-b from-destructive/[0.04] to-40% to-transparent"
          : "border-border",
      )}
    >
      {/* Header: avatar + navn → spillerprofil */}
      <Link
        href={`/admin/spillere/${card.id}`}
        className="group flex items-center gap-2.5"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary font-display text-[11px] font-bold text-foreground">
          {card.initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-[14px] font-bold leading-tight tracking-[-0.01em] text-foreground group-hover:text-primary">
            {card.name}
          </div>
          <div className="truncate text-[11px] text-muted-foreground">{card.sub}</div>
        </div>
      </Link>

      {/* Signal */}
      <div className="flex items-start gap-1.5 rounded-md bg-secondary px-2.5 py-2 text-[12px] leading-snug text-foreground">
        <SignalIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} aria-hidden />
        <span>{card.signal}</span>
      </div>

      {/* Stats */}
      {card.stats.length > 0 && (
        <div className="flex gap-4 px-0.5">
          {card.stats.map((s, i) => (
            <div key={i} className="flex flex-col gap-0.5">
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
                {s.k}
              </span>
              <span
                className={cn(
                  "font-mono text-[13px] font-bold tabular-nums",
                  s.tone === "down"
                    ? "text-destructive"
                    : s.tone === "up" || s.tone === "success"
                      ? "text-primary"
                      : s.tone === "warn"
                        ? "text-warning"
                        : "text-foreground",
                )}
              >
                {s.v}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tags */}
      {card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {card.tags.map((t, i) => (
            <span
              key={i}
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.06em]",
                t.tone === "danger"
                  ? "bg-destructive/10 text-destructive"
                  : t.tone === "warning"
                    ? "bg-warning/10 text-warning"
                    : t.tone === "success"
                      ? "bg-accent text-primary"
                      : "bg-secondary text-muted-foreground",
              )}
            >
              {t.label}
            </span>
          ))}
        </div>
      )}

      {/* Footer: tid siden + hurtig-aksjoner */}
      <div className="flex items-center justify-between border-t border-border pt-2.5">
        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          {card.since}
        </span>
        <div className="flex gap-1">
          <ActionIcon href="/admin/innboks" label="Send melding" icon={MessageSquare} />
          <ActionIcon href={`/admin/spillere/${card.id}`} label="Ring / kontakt" icon={Phone} />
          <ActionIcon href="/admin/bookinger/ny" label="Book økt" icon={CalendarPlus} />
        </div>
      </div>
    </div>
  );
}

function ActionIcon({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="grid h-7 w-7 place-items-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
    </Link>
  );
}
