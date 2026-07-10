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
    prisma.pgaPlayerSeason.count({ where: { tour: "pga", year: CURRENT_YEAR } }),
    prisma.pgaPlayerSeason.count({ where: { tour: "euro", year: CURRENT_YEAR } }),
    prisma.pgaPlayerSeason.count({
      where: {
        tour: { in: ["kft", "korn-ferry"] },
        year: CURRENT_YEAR,
      },
    }),
    prisma.pgaPlayerSeason.findMany({
      where: {
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
      : SEED_SPILLERE;

  const pgaDisplay = pga || 433;
  const euroDisplay = euro || 433;
  const kftDisplay = kft || 433;
  const totalDisplay = total > 0 ? total : 1299;

  return (
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
        <SpillerTabell spillere={spillerData} />
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
  );
}

// ---------------------------------------------------------------------------
// Seed-data (brukes når DB er tom)
// ---------------------------------------------------------------------------

export const SEED_SPILLERE = [
  { dgId: 14321, navn: "Scottie Scheffler",   land: "us", tour: "PGA", runder: 81, sgTotal: 2.45, drive: 298.4, fairway: 62.1, gir: 71.2, scoring: 68.4 },
  { dgId: 12345, navn: "Rory McIlroy",         land: "ie", tour: "PGA", runder: 87, sgTotal: 2.34, drive: 318.5, fairway: 58.4, gir: 71.2, scoring: 70.2 },
  { dgId: 17654, navn: "Xander Schauffele",    land: "us", tour: "PGA", runder: 78, sgTotal: 1.92, drive: 301.4, fairway: 64.2, gir: 72.1, scoring: 69.8 },
  { dgId: 18901, navn: "Jon Rahm",             land: "es", tour: "PGA", runder: 72, sgTotal: 1.89, drive: 305.2, fairway: 60.8, gir: 70.4, scoring: 70.8 },
  { dgId: 16789, navn: "Collin Morikawa",      land: "us", tour: "PGA", runder: 80, sgTotal: 1.74, drive: 291.8, fairway: 68.4, gir: 73.2, scoring: 70.4 },
  { dgId: 19234, navn: "Hideki Matsuyama",     land: "jp", tour: "PGA", runder: 64, sgTotal: 1.68, drive: 295.1, fairway: 65.4, gir: 70.8, scoring: 70.5 },
  { dgId: 11290, navn: "Viggo Halvorsen",      land: "no", tour: "PGA", runder: 65, sgTotal: 1.62, drive: 294.8, fairway: 64.1, gir: 70.5, scoring: 70.9 },
  { dgId: 15432, navn: "Tommy Fleetwood",      land: "gb", tour: "PGA", runder: 71, sgTotal: 1.41, drive: 298.6, fairway: 61.4, gir: 69.8, scoring: 70.8 },
  { dgId: 13456, navn: "Sungjae Im",           land: "kr", tour: "PGA", runder: 84, sgTotal: 1.28, drive: 292.3, fairway: 63.7, gir: 70.2, scoring: 70.6 },
  { dgId: 14567, navn: "Patrick Cantlay",      land: "us", tour: "PGA", runder: 68, sgTotal: 1.22, drive: 290.1, fairway: 64.8, gir: 71.4, scoring: 70.3 },
  { dgId: 20001, navn: "Viktor Hovland",       land: "no", tour: "PGA", runder: 74, sgTotal: 1.18, drive: 302.4, fairway: 60.1, gir: 69.5, scoring: 71.0 },
  { dgId: 20002, navn: "Kristoffer Vangen",    land: "no", tour: "PGA", runder: 52, sgTotal: 0.94, drive: 289.2, fairway: 63.5, gir: 68.9, scoring: 71.4 },
  { dgId: 20003, navn: "Sean Devlin",          land: "ie", tour: "EURO", runder: 88, sgTotal: 2.34, drive: 281.4, fairway: 70.2, gir: 71.8, scoring: 68.9 },
  { dgId: 20004, navn: "Osamu Yamagata",       land: "jp", tour: "EURO", runder: 76, sgTotal: 2.11, drive: 278.1, fairway: 68.9, gir: 70.4, scoring: 69.1 },
  { dgId: 20005, navn: "Anders Nordli",        land: "no", tour: "EURO", runder: 61, sgTotal: 1.31, drive: 285.4, fairway: 65.8, gir: 69.2, scoring: 70.8 },
];
