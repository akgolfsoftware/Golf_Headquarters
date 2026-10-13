import { publicPgaSourceWhere } from "@/lib/datagolf/public-sources";
/**
 * /stats/pga/spillere — PGA Spillerdatabase (design 21)
 * Pixel-perfect port av design-handoff-stats-2026-05-25/project/js/pages-d.jsx (PGASpillerbase)
 *
 * Data: PgaPlayerSeason (DB) — 50 per side med klient-side søk/filter/sortering.
 * ISR 1 time.
 */

import "./spillere.css";
import "../pga.css";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatsEyebrow } from "@/components/stats/eyebrow";
import { Reveal } from "@/components/stats/reveal";
import { StatsBtn } from "@/components/stats/btn";
import { SpillerTabell } from "./spiller-tabell";
import { StatsLegacyShell } from "@/components/marketing/v2/stats-ramme";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "PGA Tour Spillerdatabase: alle spillere | AK Golf Stats",
  description:
    "Stats-database over alle aktive spillere på PGA Tour, European Tour og Korn Ferry. Søk, filtrer og sammenlign med norske spillere fremhevet.",
  alternates: { canonical: "https://akgolf.no/stats/pga/spillere" },
  openGraph: {
    title: "PGA Tour Spillerdatabase | AK Golf Stats",
    description:
      "SG Total, drive distance, fairway %, GIR, scoring average for alle Tour-spillere.",
    url: "https://akgolf.no/stats/pga/spillere",
  },
};

// ---------------------------------------------------------------------------
// Data-henting
// ---------------------------------------------------------------------------

const CURRENT_YEAR = 2026;

async function hentSpillerData() {
  const [pga, euro, kft, spillere] = await Promise.all([
    prisma.pgaPlayerSeason.count({ where: { ...publicPgaSourceWhere(),  tour: "pga", year: CURRENT_YEAR } }),
    prisma.pgaPlayerSeason.count({ where: { ...publicPgaSourceWhere(),  tour: "euro", year: CURRENT_YEAR } }),
    prisma.pgaPlayerSeason.count({
      where: { ...publicPgaSourceWhere(),
        tour: { in: ["kft", "korn-ferry"] },
        year: CURRENT_YEAR,
      },
    }),
    prisma.pgaPlayerSeason.findMany({
      where: { ...publicPgaSourceWhere(),
        year: CURRENT_YEAR,
        sgTotal: { not: null },
      },
      orderBy: { sgTotal: "desc" },
      take: 200,
      select: {
        dgPlayerId: true,
        playerName: true,
        country: true,
        tour: true,
        rounds: true,
        avgScore: true,
        driveDist: true,
        fairwayPct: true,
        girPct: true,
        puttsPerRound: true,
        sgTotal: true,
      },
    }),
  ]);

  return { pga, euro, kft, spillere };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function PGASpillerbasePage() {
  const { pga, euro, kft, spillere } = await hentSpillerData();

  const total = pga + euro + kft;

  // Fallback til seed-data hvis DB er tom
  const spillerData =
    spillere.length > 0
      ? spillere.map((s) => ({
          dgId: s.dgPlayerId,
          navn: s.playerName,
          land: (s.country ?? "").toLowerCase(),
          tour: s.tour.toUpperCase(),
          runder: s.rounds ?? 0,
          sgTotal: s.sgTotal ?? 0,
          drive: s.driveDist ?? 0,
          fairway: s.fairwayPct ?? 0,
          gir: s.girPct ?? 0,
          scoring: s.avgScore ?? 0,
        }))
      : [];

  const pgaDisplay = pga;
  const euroDisplay = euro;
  const kftDisplay = kft;
  const totalDisplay = total;

  return (
    <StatsLegacyShell>
    <div className="spillere-page pga-page bg-background text-foreground">
      {/* ── Hero ── */}
      <section className="spillere-hero">
        <Reveal>
          <Link href="/stats/pga" className="breadcrumb">
            ← PGA Tour Stats
          </Link>
          <StatsEyebrow>PGA Tour · Alle spillere</StatsEyebrow>
          <h1>
            <em className="italic-accent">{totalDisplay.toLocaleString("nb-NO")}</em>{" "}
            spillere. <em className="italic-accent">3</em> tourer.
          </h1>
          <p className="spillere-hero-sub">
            Stats-database over alle aktive spillere på PGA Tour, European Tour
            og Korn Ferry. Søk, sammenlign og åpne spillerprofil.
          </p>
        </Reveal>
      </section>

      {/* ── KPI Strip ── */}
      <Reveal>
        <div className="spillere-kpi-strip">
          <div className="spillere-kpi">
            <div className="spillere-kpi-eyebrow">PGA Tour</div>
            <div className="spillere-kpi-value">{pgaDisplay}</div>
          </div>
          <div className="spillere-kpi">
            <div className="spillere-kpi-eyebrow">European Tour</div>
            <div className="spillere-kpi-value">{euroDisplay}</div>
          </div>
          <div className="spillere-kpi">
            <div className="spillere-kpi-eyebrow">Korn Ferry</div>
            <div className="spillere-kpi-value">{kftDisplay}</div>
          </div>
          <div className="spillere-kpi">
            <div className="spillere-kpi-eyebrow">Samlet</div>
            <div className="spillere-kpi-value">
              {totalDisplay.toLocaleString("nb-NO")}
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── Søk + tabell (klient) ── */}
      <section className="spillere-section spillere-section-divider">
        {spillerData.length ? <SpillerTabell spillere={spillerData} /> : <p>Ingen tillatt offentlig PGA-kilde er koblet til. Manglende målinger vises ikke som null.</p>}
      </section>

      {/* ── Mersalg ── */}
      <div className="spillere-mersalg">
        <Reveal>
          <StatsEyebrow tone="lime">PlayerHQ</StatsEyebrow>
          <h2>
            Sammenlign deg med{" "}
            <em className="italic-accent" style={{ color: "var(--accent)" }}>
              proffene
            </em>
            .
          </h2>
          <p>
            Legg inn dine SG-tall og se nøyaktig hvor mange strokes du taper på
            Rory McIlroy per kategori. Gratis å starte.
          </p>
          <div className="spillere-mersalg-ctas">
            <Link href="/stats/sg-sammenlign">
              <StatsBtn variant="outline" icon="ArrowRight">
                Prøv SG-sammenlign
              </StatsBtn>
            </Link>
            <Link href="/auth/signup">
              <StatsBtn variant="ghost" icon="ArrowRight">
                Lag konto
              </StatsBtn>
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
    </StatsLegacyShell>
  );
}
