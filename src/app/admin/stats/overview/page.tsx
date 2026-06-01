/**
 * AgencyOS — Stats-oversikt (admin) (/admin/stats/overview)
 *
 * Krever ADMIN.
 * Data hentes fra: User, Tournament, PgaPlayerSeason, PublicPlayer,
 *   BrukerSgInput, BrukerSammenligning, PublicPlayerEntry, git log.
 *
 * Plausible (trafikk, topp-sider): merket som "Krever Plausible-integrasjon".
 *
 * Server component — ekte Prisma, ingen falske tall. Re-stylet til athletic
 * DS-tokens (ingen hardkodet hex, ingen marketing-stats.css). Reveal + CountUp
 * beholdt som behavioral animasjons-primitiver.
 */

import type { Metadata } from "next";
import { execSync } from "child_process";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  GitCommitHorizontal,
  Play,
  type LucideIcon,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { Reveal } from "@/components/stats/reveal";
import { CountUp } from "@/components/stats/count-up";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Stats overview | Admin",
  description: "Admin-dashboard for AK Golf Stats.",
  robots: { index: false },
};

// ---------------------------------------------------------------------------
// Git log — siste 5 commits (caches via revalidate 300)
// ---------------------------------------------------------------------------

function hentSisteCommits(): { hash: string; melding: string }[] {
  try {
    const raw = execSync("git -C /Users/anderskristiansen/Developer/akgolf-hq log -5 --oneline", {
      encoding: "utf-8",
      timeout: 5000,
    }).trim();
    return raw.split("\n").map((linje) => {
      const spaceIdx = linje.indexOf(" ");
      return {
        hash: linje.slice(0, spaceIdx),
        melding: linje.slice(spaceIdx + 1),
      };
    });
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Data-henting
// ---------------------------------------------------------------------------

type SyncStatus = "ok" | "stale" | "warning" | "error";

interface SyncRad {
  navn: string;
  status: SyncStatus;
  tid: string;
  detalj: string;
}

async function hentAdminOverview() {
  const [
    totalBrukere,
    brukereSomHarSgInputs,
    totalSgInputs,
    totalSammenligninger,
    ventendeManuelleTurneringer,
    datagolfSyncStatus,
    turneeringSyncStatus,
    totalPgaSpillere,
    totalTurneringer,
    totalDeltakerRader,
    totalNorskeSpillere,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: null, sgInputs: { some: {} } } }),
    prisma.brukerSgInput.count(),
    prisma.brukerSammenligning.count(),
    prisma.tournament.count({
      where: { sourceOrigin: "MANUAL", mergedIntoId: null },
    }),
    prisma.pgaPlayerSeason.findFirst({
      orderBy: { lastUpdated: "desc" },
      select: { lastUpdated: true, playerName: true },
    }),
    prisma.tournament.findFirst({
      where: { sourceOrigin: "DATAGOLF", lastSyncAt: { not: null } },
      orderBy: { lastSyncAt: "desc" },
      select: { lastSyncAt: true, name: true },
    }),
    prisma.pgaPlayerSeason.count(),
    prisma.tournament.count(),
    prisma.publicPlayerEntry.count(),
    prisma.publicPlayer.count({ where: { country: "NO" } }),
  ]);

  const sisteCommits = hentSisteCommits();

  // Beregn sync-alder her (server-side, unngår Date.now() i render)
  const now = Date.now();

  function minSiden(dato: Date | null | undefined): number {
    if (!dato) return Infinity;
    return (now - new Date(dato).getTime()) / 60000;
  }

  const datagolfMinSiden = minSiden(datagolfSyncStatus?.lastUpdated);
  const turneeringMinSiden = minSiden(turneeringSyncStatus?.lastSyncAt);

  const syncRader: SyncRad[] = [
    {
      navn: "DataGolf PGA-spillerdata",
      status: datagolfMinSiden < 1440 ? "ok" : datagolfMinSiden < 4320 ? "stale" : "error",
      tid: formaterTidSiden(datagolfSyncStatus?.lastUpdated),
      detalj: datagolfSyncStatus ? `Siste: ${datagolfSyncStatus.playerName}` : "Ingen data",
    },
    {
      navn: "Turneringer (DataGolf-sync)",
      status: turneeringMinSiden < 1440 ? "ok" : turneeringMinSiden < 4320 ? "stale" : "error",
      tid: formaterTidSiden(turneeringSyncStatus?.lastSyncAt),
      detalj: turneeringSyncStatus ? `Siste: ${turneeringSyncStatus.name}` : "Ingen data",
    },
    {
      navn: "Manuelle turneringer (ventende)",
      status: ventendeManuelleTurneringer === 0 ? "ok" : "warning",
      tid: "Live",
      detalj: `${ventendeManuelleTurneringer} ventende modereringer`,
    },
  ];

  return {
    totalBrukere,
    brukereSomHarSgInputs,
    totalSgInputs,
    totalSammenligninger,
    ventendeManuelleTurneringer,
    syncRader,
    totalPgaSpillere,
    totalTurneringer,
    totalDeltakerRader,
    totalNorskeSpillere,
    sisteCommits,
  };
}

// ---------------------------------------------------------------------------
// Hjelpere
// ---------------------------------------------------------------------------

function formaterTidSiden(dato: Date | null | undefined): string {
  if (!dato) return "Aldri synkronisert";
  const minSiden = Math.round((Date.now() - new Date(dato).getTime()) / 60000);
  if (minSiden < 60) return `${minSiden} min siden`;
  const timSiden = Math.round(minSiden / 60);
  if (timSiden < 24) return `${timSiden}t siden`;
  return `${Math.round(timSiden / 24)}d siden`;
}

const SYNC_CFG: Record<SyncStatus, { wrap: string; dot: string; text: string; icon: LucideIcon }> = {
  ok: {
    wrap: "border-success/30 bg-success/[0.06]",
    dot: "bg-success/15 text-success",
    text: "text-success",
    icon: Check,
  },
  warning: {
    wrap: "border-warning/40 bg-warning/[0.06]",
    dot: "bg-warning/15 text-warning",
    text: "text-warning",
    icon: AlertTriangle,
  },
  stale: {
    wrap: "border-warning/40 bg-warning/[0.06]",
    dot: "bg-warning/15 text-warning",
    text: "text-warning",
    icon: AlertTriangle,
  },
  error: {
    wrap: "border-destructive/40 bg-destructive/[0.06]",
    dot: "bg-destructive/15 text-destructive",
    text: "text-destructive",
    icon: AlertTriangle,
  },
};

// ---------------------------------------------------------------------------
// Små byggeklosser
// ---------------------------------------------------------------------------

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-primary">
      <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
      {children}
    </span>
  );
}

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <Reveal>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-2.5 font-display text-[24px] font-bold leading-tight tracking-[-0.02em] text-foreground">
        {title}
      </h2>
    </Reveal>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <div className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 font-mono text-[34px] font-bold leading-none tracking-[-0.02em] tabular-nums text-foreground">
        {value.toLocaleString("nb-NO")}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function AdminStatsOverviewPage() {
  await requirePortalUser({ allow: ["ADMIN"] });

  const data = await hentAdminOverview();
  const now = new Date();

  return (
    <div className="space-y-1">
      {/* Hero */}
      <div className="mb-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
            AGENCYOS · STATS
          </span>
          <h1 className="mt-2 font-display text-[30px] font-bold leading-[1.05] tracking-[-0.025em] text-foreground">
            Plattformen i <em className="font-normal italic text-primary">tall</em>.
          </h1>
          <p className="mt-1.5 max-w-[760px] text-sm leading-relaxed text-muted-foreground">
            Admin-dashboard for AK Golf Stats — brukere, SG-data, turneringsdatabase og pipeline-status,
            alt live fra databasen.
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          SIST OPPDATERT {now.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      {/* KPI-strip — ekte DB-data */}
      <Reveal>
        <div className="grid grid-cols-1 gap-3 pt-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card px-[18px] py-4">
            <div className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
              Totale brukere
            </div>
            <div className="mt-2 font-mono text-[34px] font-bold leading-none tracking-[-0.02em] tabular-nums text-foreground">
              <CountUp value={data.totalBrukere} />
            </div>
            <div className="mt-3 font-mono text-[11px] font-bold tracking-[0.04em] text-muted-foreground">
              <span className="text-primary">{data.brukereSomHarSgInputs}</span> med SG-data
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card px-[18px] py-4">
            <div className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
              SG-inputs
            </div>
            <div className="mt-2 font-mono text-[34px] font-bold leading-none tracking-[-0.02em] tabular-nums text-foreground">
              <CountUp value={data.totalSgInputs} />
            </div>
            <div className="mt-3 font-mono text-[11px] font-bold tracking-[0.04em] text-muted-foreground">
              <span className="text-primary">{data.totalSammenligninger}</span> sammenligninger
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card px-[18px] py-4">
            <div className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
              Turneringer i DB
            </div>
            <div className="mt-2 font-mono text-[34px] font-bold leading-none tracking-[-0.02em] tabular-nums text-foreground">
              <CountUp value={data.totalTurneringer} />
            </div>
            <div className="mt-3 font-mono text-[11px] font-bold tracking-[0.04em] text-muted-foreground">
              <span className="text-primary">{data.totalDeltakerRader.toLocaleString("nb-NO")}</span>{" "}
              deltakerrader
            </div>
          </div>
          <div className="rounded-xl border border-border bg-primary px-[18px] py-4 text-primary-foreground">
            <div className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-accent">
              Norske spillere
            </div>
            <div className="mt-2 font-mono text-[34px] font-bold leading-none tracking-[-0.02em] tabular-nums text-accent">
              <CountUp value={data.totalNorskeSpillere} />
            </div>
            <div className="mt-3 font-mono text-[11px] font-bold tracking-[0.04em] text-primary-foreground/70">
              av {data.totalPgaSpillere.toLocaleString("nb-NO")} PGA-spillere
            </div>
          </div>
        </div>
      </Reveal>

      {/* Topp sider + trafikk — Plausible placeholder */}
      <div className="grid grid-cols-1 gap-3 pt-5 lg:grid-cols-2">
        <PlausibleCard delay={0} title="Top 5 sider" />
        <PlausibleCard delay={100} title="Trafikkilder" />
      </div>

      {/* Stats-database status */}
      <section className="pt-7">
        <SectionHead eyebrow="Database-status" title="Stats-databasen live." />
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { lbl: "PGA-spillere", n: data.totalPgaSpillere },
            { lbl: "Turneringer", n: data.totalTurneringer },
            { lbl: "Deltakerrader", n: data.totalDeltakerRader },
            { lbl: "Norske spillere", n: data.totalNorskeSpillere },
          ].map((rad, i) => (
            <Reveal key={i} delay={i * 40}>
              <MiniStat label={rad.lbl} value={rad.n} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Sync-status */}
      <section className="mt-7 border-t border-border pt-7">
        <SectionHead eyebrow="Sync-status" title="Pipeline — siste kjøring." />
        <div className="mt-5 flex flex-col gap-2">
          {data.syncRader.map((s, i) => {
            const cfg = SYNC_CFG[s.status];
            const Icon = cfg.icon;
            return (
              <Reveal key={i} delay={i * 40}>
                <div
                  className={cn(
                    "grid grid-cols-[32px_1fr_auto_auto] items-center gap-4 rounded-xl border p-3.5",
                    cfg.wrap,
                  )}
                >
                  <span className={cn("grid h-7 w-7 place-items-center rounded-full", cfg.dot)}>
                    <Icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                  </span>
                  <span className="text-sm font-medium text-foreground">{s.navn}</span>
                  <span className="font-mono text-xs text-muted-foreground">{s.tid}</span>
                  <span className={cn("font-mono text-xs font-bold", cfg.text)}>{s.detalj}</span>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Modereringskø — ekte tall */}
      <section className="mt-7 border-t border-border pt-7">
        <Reveal>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Eyebrow>Modereringskø</Eyebrow>
              <h2 className="mt-2.5 font-display text-[24px] font-bold leading-tight tracking-[-0.02em] text-foreground">
                {data.ventendeManuelleTurneringer} ventende turneringer.
              </h2>
            </div>
            <Link
              href="/admin/stats/moderering"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Til moderering
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            </Link>
          </div>
        </Reveal>
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { lbl: "Manuelle turneringer", n: data.ventendeManuelleTurneringer, haster: data.ventendeManuelleTurneringer > 5 },
            { lbl: "SG-inputs", n: data.totalSgInputs, haster: false },
            { lbl: "Sammenligninger", n: data.totalSammenligninger, haster: false },
            { lbl: "PGA-spillere i DB", n: data.totalPgaSpillere, haster: false },
          ].map((m, i) => (
            <Reveal key={i} delay={i * 40}>
              <div
                className={cn(
                  "rounded-xl border p-5",
                  m.haster ? "border-destructive/40 bg-destructive/[0.06]" : "border-border bg-background",
                )}
              >
                <div
                  className={cn(
                    "font-mono text-[10px] font-extrabold uppercase tracking-[0.12em]",
                    m.haster ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  {m.lbl}
                </div>
                <div
                  className={cn(
                    "mt-2 font-mono text-[34px] font-bold leading-none tracking-[-0.02em] tabular-nums",
                    m.haster ? "text-destructive" : "text-foreground",
                  )}
                >
                  {m.n.toLocaleString("nb-NO")}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Git-commits */}
      {data.sisteCommits.length > 0 && (
        <section className="mt-7 border-t border-border pt-7">
          <SectionHead eyebrow="Siste commits" title="Kodehistorikk — main branch." />
          <div className="mt-5 flex flex-col gap-2">
            {data.sisteCommits.map((c, i) => (
              <Reveal key={i} delay={i * 30}>
                <div className="grid grid-cols-[auto_1fr] items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 rounded bg-primary/10 px-2 py-1 font-mono text-[11px] font-bold text-primary">
                    <GitCommitHorizontal className="h-3 w-3" strokeWidth={2} aria-hidden />
                    {c.hash}
                  </span>
                  <span className="truncate text-[13px] font-medium text-foreground">{c.melding}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Raske handlinger */}
      <section className="mt-7 border-t border-border pb-2 pt-7">
        <SectionHead eyebrow="Raske handlinger" title="Cron + admin-snarveier." />
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            "Kjør manuell sync av PGA-data",
            "Send ukentlig roundup nå",
            "Sjekk DB-helse",
            "Roter CRON_SECRET",
          ].map((tekst, i) => (
            <Reveal key={i} delay={i * 40}>
              <button
                type="button"
                className="flex w-full flex-col gap-2.5 rounded-xl border border-border bg-card p-5 text-left transition-colors hover:border-primary"
              >
                <Play className="h-4 w-4 text-primary" strokeWidth={1.75} aria-hidden />
                <span className="text-[13px] font-medium leading-snug text-foreground">{tekst}</span>
              </button>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}

function PlausibleCard({ delay, title }: { delay: number; title: string }) {
  return (
    <Reveal delay={delay}>
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <Eyebrow>{title}</Eyebrow>
          <span className="rounded bg-warning/10 px-2 py-1 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-warning">
            Krever Plausible-integrasjon
          </span>
        </div>
        <div className="py-6 text-center text-[13px] leading-relaxed text-muted-foreground">
          Data hentes fra Plausible Analytics.
          <br />
          Koble til Plausible API-nøkkel for å aktivere.
        </div>
      </div>
    </Reveal>
  );
}
