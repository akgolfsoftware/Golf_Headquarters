/**
 * /admin/stats/overview — admin dashboard (design 29)
 *
 * Krever ADMIN.
 * Data hentes fra: User, Tournament, PgaPlayerSeason, PublicPlayer,
 *   BrukerSgInput, BrukerSammenligning, PublicPlayerEntry, git log.
 *
 * Plausible (trafikk, topp-sider): merket som "Krever Plausible-integrasjon".
 */

import "../../../(marketing)/stats/stats.css";
import type { Metadata } from "next";
import { execSync } from "child_process";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { Reveal } from "@/components/stats/reveal";
import { StatsEyebrow } from "@/components/stats/eyebrow";
import { CountUp } from "@/components/stats/count-up";

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

interface SyncRad {
  navn: string;
  status: "ok" | "stale" | "warning" | "error";
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

const SYNC_CFG = {
  ok: { bg: "#2EA66B15", col: "#2EA66B", icon: "+" },
  warning: { bg: "#B5731715", col: "#B57317", icon: "!" },
  error: { bg: "#BE3D3D15", col: "hsl(var(--destructive))", icon: "x" },
  stale: { bg: "#B5731715", col: "#B57317", icon: "!" },
} as const;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function AdminStatsOverviewPage() {
  await requirePortalUser({ allow: ["ADMIN"] });

  const data = await hentAdminOverview();
  const now = new Date();

  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section
        style={{
          padding: "32px 64px 24px",
          background: "var(--s-secondary)",
          borderBottom: "1px solid var(--s-border)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <StatsEyebrow>Admin · Stats</StatsEyebrow>
            <h1
              className="font-display"
              style={{ fontSize: 36, fontWeight: 600, marginTop: 8, letterSpacing: "-0.025em" }}
            >
              Overview
            </h1>
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--s-muted-fg)",
            }}
          >
            SIST OPPDATERT {now.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </section>

      {/* KPI-strip — ekte DB-data */}
      <Reveal>
        <div
          className="stats-kpi-strip"
          style={{ gridTemplateColumns: "repeat(4, 1fr)", borderRadius: 0 }}
        >
          <div className="stats-kpi">
            <div className="stats-kpi-eyebrow">Totale brukere</div>
            <div className="stats-kpi-value">
              <CountUp value={data.totalBrukere} />
            </div>
            <div className="stats-kpi-sub">
              <span style={{ color: "var(--s-primary)", fontWeight: 600, fontFamily: "var(--font-mono)", fontSize: 11 }}>
                {data.brukereSomHarSgInputs}
              </span>{" "}
              med SG-data
            </div>
          </div>
          <div className="stats-kpi">
            <div className="stats-kpi-eyebrow">SG-inputs</div>
            <div className="stats-kpi-value">
              <CountUp value={data.totalSgInputs} />
            </div>
            <div className="stats-kpi-sub">
              <span style={{ color: "var(--s-primary)", fontWeight: 600, fontFamily: "var(--font-mono)", fontSize: 11 }}>
                {data.totalSammenligninger}
              </span>{" "}
              sammenligninger
            </div>
          </div>
          <div className="stats-kpi">
            <div className="stats-kpi-eyebrow">Turneringer i DB</div>
            <div className="stats-kpi-value">
              <CountUp value={data.totalTurneringer} />
            </div>
            <div className="stats-kpi-sub">
              <span style={{ color: "var(--s-primary)", fontWeight: 600, fontFamily: "var(--font-mono)", fontSize: 11 }}>
                {data.totalDeltakerRader.toLocaleString("nb-NO")}
              </span>{" "}
              deltakerrader
            </div>
          </div>
          <div className="stats-kpi">
            <div className="stats-kpi-eyebrow">Norske spillere</div>
            <div className="stats-kpi-value" style={{ color: "var(--s-primary)" }}>
              <CountUp value={data.totalNorskeSpillere} />
            </div>
            <div className="stats-kpi-sub">
              av {data.totalPgaSpillere.toLocaleString("nb-NO")} PGA-spillere
            </div>
          </div>
        </div>
      </Reveal>

      {/* Topp sider + trafikk — Plausible placeholder */}
      <section style={{ padding: "32px 64px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <Reveal>
            <div
              style={{
                background: "var(--s-card)",
                border: "1px solid var(--s-border)",
                borderRadius: "var(--s-r-lg)",
                padding: 28,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <StatsEyebrow>Top 5 sider</StatsEyebrow>
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#B57317",
                    background: "rgba(181,115,23,0.1)",
                    padding: "3px 8px",
                    borderRadius: 4,
                  }}
                >
                  Krever Plausible-integrasjon
                </span>
              </div>
              <div
                style={{
                  padding: "24px 0",
                  textAlign: "center",
                  color: "var(--s-muted-fg)",
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                Sidevisnings-data hentes fra Plausible Analytics.
                <br />
                Koble til Plausible API-nøkkel for å aktivere.
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div
              style={{
                background: "var(--s-card)",
                border: "1px solid var(--s-border)",
                borderRadius: "var(--s-r-lg)",
                padding: 28,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <StatsEyebrow>Trafikkilder</StatsEyebrow>
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#B57317",
                    background: "rgba(181,115,23,0.1)",
                    padding: "3px 8px",
                    borderRadius: 4,
                  }}
                >
                  Krever Plausible-integrasjon
                </span>
              </div>
              <div
                style={{
                  padding: "24px 0",
                  textAlign: "center",
                  color: "var(--s-muted-fg)",
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                Trafikk-fordeling hentes fra Plausible Analytics.
                <br />
                Koble til Plausible API-nøkkel for å aktivere.
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stats-database status */}
      <section style={{ padding: "0 64px 32px" }}>
        <Reveal>
          <StatsEyebrow>Database-status</StatsEyebrow>
          <h2
            className="font-display"
            style={{ fontSize: 24, fontWeight: 600, marginTop: 12, marginBottom: 20, letterSpacing: "-0.02em" }}
          >
            Stats-databasen live.
          </h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { lbl: "PGA-spillere", n: data.totalPgaSpillere },
            { lbl: "Turneringer", n: data.totalTurneringer },
            { lbl: "Deltakerrader", n: data.totalDeltakerRader },
            { lbl: "Norske spillere", n: data.totalNorskeSpillere },
          ].map((rad, i) => (
            <Reveal key={i} delay={i * 40}>
              <div
                style={{
                  background: "var(--s-secondary)",
                  border: "1px solid var(--s-border)",
                  borderRadius: "var(--s-r-md)",
                  padding: 20,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--s-muted-fg)",
                    marginBottom: 8,
                  }}
                >
                  {rad.lbl}
                </div>
                <div
                  className="font-mono"
                  style={{ fontSize: 36, color: "var(--s-fg)", fontWeight: 500 }}
                >
                  {rad.n.toLocaleString("nb-NO")}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Sync-status */}
      <section style={{ padding: "0 64px 32px", borderTop: "1px solid var(--s-border)", paddingTop: 32 }}>
        <Reveal>
          <StatsEyebrow>Sync-status</StatsEyebrow>
          <h2
            className="font-display"
            style={{ fontSize: 24, fontWeight: 600, marginTop: 12, marginBottom: 20, letterSpacing: "-0.02em" }}
          >
            Pipeline — siste kjøring.
          </h2>
        </Reveal>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {data.syncRader.map((s, i) => {
            const cfg = SYNC_CFG[s.status as keyof typeof SYNC_CFG] ?? SYNC_CFG.warning;
            return (
              <Reveal key={i} delay={i * 40}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "32px 1fr auto auto",
                    gap: 16,
                    alignItems: "center",
                    padding: 14,
                    background: cfg.bg,
                    border: `1px solid var(--s-border)`,
                    borderRadius: "var(--s-r-md)",
                  }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: `${cfg.col}15`,
                      color: cfg.col,
                      display: "grid",
                      placeItems: "center",
                      fontWeight: 700,
                      fontSize: 14,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {cfg.icon}
                  </span>
                  <span style={{ fontWeight: 500, fontSize: 14 }}>{s.navn}</span>
                  <span className="font-mono" style={{ fontSize: 12, color: "var(--s-muted-fg)" }}>
                    {s.tid}
                  </span>
                  <span className="font-mono" style={{ fontSize: 12, color: cfg.col, fontWeight: 500 }}>
                    {s.detalj}
                  </span>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Modereringskø — ekte tall */}
      <section
        style={{
          padding: "32px 64px",
          borderTop: "1px solid var(--s-border)",
        }}
      >
        <Reveal>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <StatsEyebrow>Modereringskø</StatsEyebrow>
              <h2 className="font-display" style={{ fontSize: 24, fontWeight: 600, marginTop: 8, letterSpacing: "-0.02em" }}>
                {data.ventendeManuelleTurneringer} ventende turneringer.
              </h2>
            </div>
            <Link href="/admin/stats/moderering">
              <button
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 22px",
                  borderRadius: 999,
                  background: "var(--s-primary)",
                  color: "var(--s-primary-fg)",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontWeight: 500,
                  fontSize: 14,
                }}
              >
                Til moderering
                <ArrowRight size={14} strokeWidth={2} />
              </button>
            </Link>
          </div>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { lbl: "Manuelle turneringer", n: data.ventendeManuelleTurneringer, haster: data.ventendeManuelleTurneringer > 5 },
            { lbl: "SG-inputs", n: data.totalSgInputs, haster: false },
            { lbl: "Sammenligninger", n: data.totalSammenligninger, haster: false },
            { lbl: "PGA-spillere i DB", n: data.totalPgaSpillere, haster: false },
          ].map((m, i) => (
            <Reveal key={i} delay={i * 40}>
              <div
                style={{
                  background: m.haster ? "rgba(190,61,61,0.06)" : "var(--s-secondary)",
                  border: m.haster ? "1px solid #BE3D3D" : "1px solid var(--s-border)",
                  borderRadius: "var(--s-r-md)",
                  padding: 20,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: m.haster ? "hsl(var(--destructive))" : "var(--s-muted-fg)",
                    marginBottom: 8,
                  }}
                >
                  {m.lbl.toUpperCase()}
                </div>
                <div
                  className="font-mono"
                  style={{ fontSize: 40, color: m.haster ? "hsl(var(--destructive))" : "var(--s-fg)", fontWeight: 500 }}
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
        <section style={{ padding: "0 64px 32px", borderTop: "1px solid var(--s-border)", paddingTop: 32 }}>
          <Reveal>
            <StatsEyebrow>Siste commits</StatsEyebrow>
            <h2
              className="font-display"
              style={{ fontSize: 24, fontWeight: 600, marginTop: 12, marginBottom: 20, letterSpacing: "-0.02em" }}
            >
              Kodehistorikk — main branch.
            </h2>
          </Reveal>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {data.sisteCommits.map((c, i) => (
              <Reveal key={i} delay={i * 30}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr",
                    gap: 12,
                    alignItems: "center",
                    padding: "12px 16px",
                    background: "var(--s-card)",
                    border: "1px solid var(--s-border)",
                    borderRadius: "var(--s-r-md)",
                  }}
                >
                  <span
                    className="font-mono"
                    style={{ fontSize: 11, color: "var(--s-primary)", background: "rgba(0,88,64,0.08)", padding: "3px 8px", borderRadius: 4 }}
                  >
                    {c.hash}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{c.melding}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Raske handlinger */}
      <section
        style={{
          padding: "0 64px 64px",
          borderTop: "1px solid var(--s-border)",
          paddingTop: 32,
        }}
      >
        <Reveal>
          <StatsEyebrow>Raske handlinger</StatsEyebrow>
          <h2 className="font-display" style={{ fontSize: 24, fontWeight: 600, marginTop: 8, marginBottom: 20, letterSpacing: "-0.02em" }}>
            Cron + admin-snarveier.
          </h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            "Kjør manuell sync av PGA-data",
            "Send ukentlig roundup nå",
            "Sjekk DB-helse",
            "Roter CRON_SECRET",
          ].map((tekst, i) => (
            <Reveal key={i} delay={i * 40}>
              <button
                style={{
                  background: "var(--s-card)",
                  border: "1px solid var(--s-border)",
                  borderRadius: "var(--s-r-md)",
                  padding: 20,
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 13,
                  lineHeight: 1.4,
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  transition: "border-color .2s",
                }}
              >
                <Play
                  size={16}
                  style={{ color: "var(--s-primary)" }}
                  strokeWidth={1.75}
                />
                <div style={{ fontWeight: 500 }}>{tekst}</div>
              </button>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
