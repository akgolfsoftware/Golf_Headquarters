/**
 * /stats/pga/putt-explorer — pixel-perfect PGA Putt Explorer (design 04)
 *
 * Sections:
 * 1. Hero — myth-busting tone
 * 2. Interaktiv slider + 4 bar charts (client component)
 * 3. "Tre avstander der amatører taper mest" — 3 insight cards
 * 4. Heatmap — avstand × ferdighetsnivå
 * 5. Pull-quote (Broadie)
 * 6. Mersalg-bånd (putt-tracking i PlayerHQ)
 * 7. Footer crossref
 *
 * ISR 1 time. Data: PgaPuttDistance-tabell.
 */

import "./putt.css";
import "./../pga.css";

import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StatsEyebrow } from "@/components/stats/eyebrow";
import { Reveal } from "@/components/stats/reveal";
import { StatsHeatmap } from "@/components/stats/stats-heatmap";
import { PuttExplorer } from "./explorer";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Putt Explorer — PGA Tour synkeprosent per avstand | AK Golf Stats",
  description:
    "Selv proffer bommer fra 3 meter. PGA Tour synker 82% fra 3m — se hele fordelingen fra 1–20 meter og sammenlign med din egen putting.",
  alternates: { canonical: "https://akgolf.no/stats/pga/putt-explorer" },
  openGraph: {
    title: "Putt Explorer — PGA Tour synkeprosent per avstand | AK Golf Stats",
    description:
      "Interaktiv putt-statistikk: se synkeprosent for PGA Tour, topp 10 putters og amatører på alle avstander.",
    url: "https://akgolf.no/stats/pga/putt-explorer",
    siteName: "AK Golf Stats",
    locale: "nb_NO",
    type: "website",
  },
};

const YEAR = new Date().getUTCFullYear();

// Broadie-estimater for heatmap (alle rader × kolonner)
const HEATMAP_ROWS = ["PGA Tour", "Topp 10", "HCP 0", "HCP 10", "HCP 20"];
const HEATMAP_COLS = ["1m", "2m", "3m", "4m", "5m", "6m", "8m", "10m", "15m", "20m"];
const HEATMAP_DATA = [
  [99, 94, 82, 64, 51, 42, 29, 23, 15, 10], // PGA Tour
  [100, 97, 90, 75, 62, 53, 39, 31, 21, 15], // Topp 10
  [98, 85, 60, 45, 30, 24, 15,  6,  2,  1], // HCP 0
  [95, 72, 45, 32, 18, 14,  8,  3,  1,  0], // HCP 10
  [90, 55, 30, 20, 10,  7,  4,  1,  0,  0], // HCP 20
];

async function hentPuttData() {
  return prisma.pgaPuttDistance.findMany({
    where: { year: YEAR },
    orderBy: { distanceMeters: "asc" },
    select: {
      distanceMeters: true,
      tourAvgSunkPct: true,
      top10AvgSunkPct: true,
      proximityNext: true,
    },
  });
}

export default async function PuttExplorerPage() {
  const puttData = await hentPuttData();

  // Fall back to Broadie estimates if no DB data yet
  const data =
    puttData.length > 0
      ? puttData.map((r) => ({
          distanceMeters: r.distanceMeters,
          tourAvgSunkPct: r.tourAvgSunkPct,
          top10AvgSunkPct: r.top10AvgSunkPct,
          proximityNext: r.proximityNext,
        }))
      : [
          { distanceMeters: 1,  tourAvgSunkPct: 99, top10AvgSunkPct: 100, proximityNext: 0.3 },
          { distanceMeters: 2,  tourAvgSunkPct: 94, top10AvgSunkPct: 97,  proximityNext: 0.6 },
          { distanceMeters: 3,  tourAvgSunkPct: 82, top10AvgSunkPct: 90,  proximityNext: 0.8 },
          { distanceMeters: 4,  tourAvgSunkPct: 64, top10AvgSunkPct: 75,  proximityNext: 1.0 },
          { distanceMeters: 5,  tourAvgSunkPct: 51, top10AvgSunkPct: 62,  proximityNext: 1.2 },
          { distanceMeters: 6,  tourAvgSunkPct: 42, top10AvgSunkPct: 53,  proximityNext: 1.5 },
          { distanceMeters: 8,  tourAvgSunkPct: 29, top10AvgSunkPct: 39,  proximityNext: 2.0 },
          { distanceMeters: 10, tourAvgSunkPct: 23, top10AvgSunkPct: 31,  proximityNext: 2.5 },
          { distanceMeters: 15, tourAvgSunkPct: 15, top10AvgSunkPct: 21,  proximityNext: 3.5 },
          { distanceMeters: 20, tourAvgSunkPct: 10, top10AvgSunkPct: 15,  proximityNext: 5.0 },
        ];

  return (
    <div className="pga-page bg-background text-foreground">
      {/* ── Hero ── */}
      <section className="putt-hero">
        <Reveal>
          <Link href="/stats/pga" className="putt-breadcrumb">
            <ChevronLeft style={{ width: 14, height: 14 }} />
            PGA Tour Stats
          </Link>
          <div style={{ marginTop: 20 }}>
            <StatsEyebrow dot tone="default">PGA TOUR · PUTT EXPLORER</StatsEyebrow>
          </div>
          <h1>
            Selv proffer <em className="italic-accent">bommer</em> fra 3 meter.
          </h1>
          <p className="hero-sub">
            PGA Tour synker 82% fra 3m. Amatører tror tallet er høyere. Lek deg
            med data og se hvor stor forskjellen egentlig er.
          </p>
        </Reveal>
      </section>

      {/* ── Interactive slider + 4 bars ── */}
      <section className="putt-section">
        <Reveal>
          <div className="putt-section-head">
            <div>
              <StatsEyebrow dot tone="default">Interaktivt</StatsEyebrow>
              <h2>
                Velg avstand —{" "}
                <em className="italic-accent">se hva proffer gjør</em>.
              </h2>
            </div>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <PuttExplorer data={data} />
        </Reveal>
      </section>

      {/* ── Tre puttavstander der amatører taper mest ── */}
      <section className="putt-section">
        <Reveal>
          <div className="putt-section-head">
            <div>
              <StatsEyebrow dot tone="default">Innsikt</StatsEyebrow>
              <h2>
                Tre avstander der amatører{" "}
                <em className="italic-accent">taper mest</em>.
              </h2>
            </div>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="putt-step-grid">
            {[
              {
                d: "3m · DIFF HCP 10 VS TOUR",
                diff: "−37%-poeng",
                h: "3-meteren",
                t: "Lavhengende frukt. 30 putter à 5 min i uka = +1 birdie per runde.",
              },
              {
                d: "5m · DIFF HCP 10 VS TOUR",
                diff: "−33%-poeng",
                h: "5-meteren",
                t: "Speed-control. Amatører er 2× mer offensive enn de burde på denne lengden.",
              },
              {
                d: "1m · DIFF HCP 10 VS TOUR",
                diff: "−4%-poeng",
                h: "Tomp-tomp",
                t: "Du synker nesten like ofte som proffene fra 1 meter. Glem ikke det.",
              },
            ].map((card, i) => (
              <div key={i} className="putt-step-card">
                <div className="putt-step-dist">{card.d}</div>
                <div className="putt-step-diff">{card.diff}</div>
                <h3>{card.h}</h3>
                <p>{card.t}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── Heatmap ── */}
      <section className="putt-section">
        <Reveal>
          <div className="putt-section-head">
            <div>
              <StatsEyebrow dot tone="default">Heatmap</StatsEyebrow>
              <h2>
                Hele fordelingen —{" "}
                <em className="italic-accent">avstand × nivå</em>.
              </h2>
            </div>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <StatsHeatmap
            rows={HEATMAP_ROWS}
            cols={HEATMAP_COLS}
            data={HEATMAP_DATA}
          />
        </Reveal>

        <div className="putt-pull-quote">
          Amatører undervurderer 5-meteren og overvurderer 10-meteren.
          Tour-spillerne vet at 5 meter er gjennombrudd-avstanden — den de
          jobber hardest med.
          <div className="putt-pull-quote-credit">
            Mark Broadie · «Every Shot Counts»
          </div>
        </div>
      </section>

      {/* ── Mersalg ── */}
      <section className="putt-section">
        <Reveal>
          <div className="putt-mersalg">
            <div>
              <div
                className="stats-eyebrow"
                style={{ color: "var(--accent)" }}
              >
                <span
                  className="stats-eyebrow-dot"
                  style={{ background: "var(--primary)" }}
                />
                <span>PlayerHQ</span>
              </div>
              <h2>
                Tracker du{" "}
                <em>putter per hull</em>?
              </h2>
              <p>
                PlayerHQ logger antall putter per hull og regner ut din
                synket-prosent per avstand. Sammenlign deg med PGA Tour på
                hver avstand — automatisk.
              </p>
              <Link
                href="/playerhq"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "var(--accent)",
                  color: "hsl(var(--foreground))",
                  padding: "12px 24px",
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Prøv PlayerHQ gratis
              </Link>
            </div>
            <div className="putt-mersalg-card">
              <h4>FUNKSJONER</h4>
              <ul>
                <li>Logger antall putter per hull etter runden</li>
                <li>Beregner synket-prosent per avstand automatisk</li>
                <li>Sammenlign direkte med PGA Tour-benchmark</li>
              </ul>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Footer crossref ── */}
      <section className="putt-section">
        <Reveal>
          <div className="putt-mini-mono" style={{ marginBottom: 16 }}>
            LURER DU OGSÅ PÅ...
          </div>
          <div className="putt-crossref">
            <Link href="/stats/pga/drive-distance" className="putt-crossref-link">
              Drive distance — hvor langt slår proffene? →
            </Link>
            <Link href="/stats/pga/gir-pct" className="putt-crossref-link">
              GIR forutsier scoring — sjekk hvordan du ligger an →
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
