/**
 * /stats/pga/spillere/[dg_id] — PGA Spillerprofil (design 21 — detalj)
 *
 * Datakilde: PgaPlayerSeason (DB) — fallback til seed-data.
 * ISR 1 time.
 */

import "./../spillere.css";
import "../../pga.css";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SEED_SPILLERE } from "../page";
import { StatsEyebrow } from "@/components/stats/eyebrow";
import { Reveal } from "@/components/stats/reveal";
import { FlagGlyph } from "@/components/stats/flag-glyph";
import type { FlagCode } from "@/components/stats/flag-glyph";
import { StatsBigRadar } from "@/components/stats/stats-big-radar";
import { StatsBtn } from "@/components/stats/btn";

export const revalidate = 3600;

// ---------------------------------------------------------------------------
// Static params — seed-IDer + noen kjente DG IDs
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return SEED_SPILLERE.map((s) => ({ dg_id: s.dgId.toString() }));
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ dg_id: string }>;
}): Promise<Metadata> {
  const { dg_id } = await params;
  const dgId = parseInt(dg_id, 10);
  const seed = SEED_SPILLERE.find((s) => s.dgId === dgId);
  const navn = seed?.navn ?? "PGA-spiller";

  return {
    title: `${navn} — Stats & SG | AK Golf Stats`,
    description: `SG Total, drive distance, fairway % og scoring average for ${navn}. Sammenlign med Tour-snittet.`,
    alternates: { canonical: `https://akgolf.no/stats/pga/spillere/${dg_id}` },
    openGraph: {
      title: `${navn} — PGA Tour Stats`,
      description: `Interaktiv spillerprofil for ${navn}.`,
      url: `https://akgolf.no/stats/pga/spillere/${dg_id}`,
    },
  };
}

// ---------------------------------------------------------------------------
// Data-henting
// ---------------------------------------------------------------------------

const CURRENT_YEAR = 2026;

type SpillerData = {
  dgId: number;
  navn: string;
  land: string;
  tour: string;
  runder: number;
  sgTotal: number;
  sgOtt: number;
  sgApp: number;
  sgArg: number;
  sgPutt: number;
  drive: number;
  fairway: number;
  gir: number;
  putts: number;
  scoring: number;
};

async function hentSpiller(dgId: number): Promise<SpillerData | null> {
  const db = await prisma.pgaPlayerSeason.findFirst({
    where: { dgPlayerId: dgId, year: CURRENT_YEAR },
  });

  if (db) {
    return {
      dgId: db.dgPlayerId,
      navn: db.playerName,
      land: (db.country ?? "").toLowerCase(),
      tour: db.tour.toUpperCase(),
      runder: db.rounds ?? 0,
      sgTotal: db.sgTotal ?? 0,
      sgOtt: db.sgOtt ?? 0,
      sgApp: db.sgApp ?? 0,
      sgArg: db.sgArg ?? 0,
      sgPutt: db.sgPutt ?? 0,
      drive: db.driveDist ?? 0,
      fairway: db.fairwayPct ?? 0,
      gir: db.girPct ?? 0,
      putts: db.puttsPerRound ?? 0,
      scoring: db.avgScore ?? 0,
    };
  }

  // Fallback til seed
  const seed = SEED_SPILLERE.find((s) => s.dgId === dgId);
  if (!seed) return null;

  // Bygg SG fra sgTotal med estimerte fordelinger
  const sg = seed.sgTotal;
  return {
    dgId: seed.dgId,
    navn: seed.navn,
    land: seed.land,
    tour: seed.tour,
    runder: seed.runder,
    sgTotal: sg,
    sgOtt:  +(sg * 0.36).toFixed(2),
    sgApp:  +(sg * 0.42).toFixed(2),
    sgArg:  +(sg * 0.12).toFixed(2),
    sgPutt: +(sg * 0.10).toFixed(2),
    drive: seed.drive,
    fairway: seed.fairway,
    gir: seed.gir,
    putts: 28.9,
    scoring: seed.scoring,
  };
}

// ---------------------------------------------------------------------------
// Normaliser SG til 0–1 for radar
// ---------------------------------------------------------------------------

function normSg(v: number): number {
  // Tour-snitt = 0 → norm 0.5. Max ~+3 → 1.0
  return Math.max(0.05, Math.min(0.95, 0.5 + v / 6));
}

// ---------------------------------------------------------------------------
// Percentile beregning (simpel estimering)
// ---------------------------------------------------------------------------

function percentile(val: number, avg: number, sd: number): number {
  const z = (val - avg) / sd;
  const p = 0.5 * (1 + erf(z / Math.SQRT2));
  return Math.round(p * 100);
}

function erf(x: number): number {
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const t = 1 / (1 + p * x);
  const y =
    1 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function SpillerProfilPage({
  params,
}: {
  params: Promise<{ dg_id: string }>;
}) {
  const { dg_id } = await params;
  const dgId = parseInt(dg_id, 10);
  if (isNaN(dgId)) notFound();

  const spiller = await hentSpiller(dgId);
  if (!spiller) notFound();

  const initials = spiller.navn
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Radar: du vs tour-snitt (0.5 = snitt)
  const youRadar = [
    normSg(spiller.sgOtt),
    normSg(spiller.sgApp),
    normSg(spiller.sgArg),
    normSg(spiller.sgPutt),
  ];
  const themRadar = [0.5, 0.5, 0.5, 0.5]; // Tour-snitt = 0

  // Stats-grid
  const statsKort = [
    {
      lbl: "Drive Distance",
      val: spiller.drive ? `${spiller.drive.toFixed(1)} yds` : "—",
      pct: percentile(spiller.drive, 297, 15),
      positiv: spiller.drive > 297,
    },
    {
      lbl: "Fairway %",
      val: spiller.fairway ? `${spiller.fairway.toFixed(1)}%` : "—",
      pct: percentile(spiller.fairway, 61, 6),
      positiv: spiller.fairway > 61,
    },
    {
      lbl: "GIR %",
      val: spiller.gir ? `${spiller.gir.toFixed(1)}%` : "—",
      pct: percentile(spiller.gir, 70, 4),
      positiv: spiller.gir > 70,
    },
    {
      lbl: "Putts/runde",
      val: spiller.putts ? spiller.putts.toFixed(1) : "—",
      pct: percentile(-spiller.putts, -28.9, 0.8), // Lavere er bedre
      positiv: spiller.putts < 28.9,
    },
    {
      lbl: "Scoring Avg",
      val: spiller.scoring ? spiller.scoring.toFixed(2) : "—",
      pct: percentile(-spiller.scoring, -70.85, 1.5),
      positiv: spiller.scoring < 70.85,
    },
    {
      lbl: "SG Total",
      val: spiller.sgTotal ? `+${spiller.sgTotal.toFixed(2)}` : "—",
      pct: percentile(spiller.sgTotal, 0, 0.8),
      positiv: spiller.sgTotal > 0,
    },
  ];

  // SG breakdown
  const sgCats = [
    { label: "OTT",  val: spiller.sgOtt,  avg: 0 },
    { label: "APP",  val: spiller.sgApp,  avg: 0 },
    { label: "ARG",  val: spiller.sgArg,  avg: 0 },
    { label: "PUTT", val: spiller.sgPutt, avg: 0 },
  ];

  const maxSgAbs = Math.max(...sgCats.map((c) => Math.abs(c.val)), 0.1);

  return (
    <div className="spillere-page pga-page bg-background text-foreground">
      {/* ── Hero ── */}
      <section className="spillere-hero">
        <Reveal>
          <Link href="/stats/pga/spillere" className="breadcrumb">
            ← Spillerdatabase
          </Link>
          <StatsEyebrow>
            {spiller.tour} · {spiller.land.toUpperCase()}
          </StatsEyebrow>
          <div className="spillere-profil-hero">
            <div className="spillere-avatar-lg">{initials}</div>
            <div>
              <div className="spillere-profil-name">{spiller.navn}</div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 10,
                  flexWrap: "wrap",
                }}
              >
                <FlagGlyph code={spiller.land as FlagCode} size={18} />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.1em",
                    color: "var(--muted-foreground)",
                  }}
                >
                  {spiller.runder} RUNDER · SESONG 2026
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── KPI 5-tall ── */}
      <Reveal>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            borderTop: "1px solid var(--border)",
            borderBottom: "1px solid var(--border)",
            background: "var(--card)",
          }}
        >
          {[
            { lbl: "SG Total",    val: spiller.sgTotal ? `+${spiller.sgTotal.toFixed(2)}` : "—" },
            { lbl: "Drive",       val: spiller.drive ? `${spiller.drive.toFixed(0)}` : "—" },
            { lbl: "Fairway %",   val: spiller.fairway ? `${spiller.fairway.toFixed(1)}%` : "—" },
            { lbl: "GIR %",       val: spiller.gir ? `${spiller.gir.toFixed(1)}%` : "—" },
            { lbl: "Scoring",     val: spiller.scoring ? spiller.scoring.toFixed(2) : "—" },
          ].map((k, i, arr) => (
            <div
              key={k.lbl}
              style={{
                padding: "28px 24px",
                borderRight: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--muted-foreground)",
                  marginBottom: 6,
                }}
              >
                {k.lbl}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 36,
                  fontWeight: 500,
                  fontVariantNumeric: "tabular-nums",
                  lineHeight: 1,
                  color: "var(--foreground)",
                }}
              >
                {k.val}
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* ── Radar vs Tour-snitt ── */}
      <section className="spillere-section spillere-section-divider">
        <Reveal>
          <div className="spillere-section-head">
            <div>
              <StatsEyebrow>SG-profil</StatsEyebrow>
              <h2>
                Radar vs{" "}
                <em className="italic-accent">Tour-snitt</em>.
              </h2>
            </div>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
            }}
          >
            {/* Radar */}
            <div
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: 32,
              }}
            >
              <StatsBigRadar
                axes={["OTT", "APP", "ARG", "PUTT"]}
                you={youRadar}
                them={themRadar}
                youLabel={spiller.navn.split(" ").pop() ?? spiller.navn}
                themLabel="Tour-snitt"
                youRaw={[spiller.sgOtt, spiller.sgApp, spiller.sgArg, spiller.sgPutt]}
                themRaw={[0, 0, 0, 0]}
              />
            </div>

            {/* SG breakdown */}
            <div
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: 32,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--muted-foreground)",
                  marginBottom: 24,
                }}
              >
                Hvor de vinner strokes
              </div>
              <div className="spillere-sg-bar-wrap">
                {sgCats.map((c) => {
                  const pct = Math.abs(c.val / maxSgAbs) * 100;
                  return (
                    <div key={c.label} className="spillere-sg-row">
                      <span className="spillere-sg-label">{c.label}</span>
                      <div className="spillere-sg-bar-inner">
                        <div
                          className={`spillere-sg-fill ${c.val >= 0 ? "positive" : "negative"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span
                        className="spillere-sg-val"
                        style={{
                          color:
                            c.val > 0
                              ? "var(--primary)"
                              : "var(--destructive)",
                        }}
                      >
                        {c.val >= 0 ? "+" : ""}
                        {c.val.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Stats-grid 2×3 ── */}
      <section className="spillere-section spillere-section-divider">
        <Reveal>
          <div className="spillere-section-head">
            <div>
              <StatsEyebrow>Nøkkeltall</StatsEyebrow>
              <h2>
                Alle{" "}
                <em className="italic-accent">kategorier</em>.
              </h2>
            </div>
          </div>
        </Reveal>
        <Reveal delay={60}>
          <div className="spillere-stats-grid">
            {statsKort.map((k) => (
              <div key={k.lbl} className="spillere-stats-card">
                <div className="spillere-stats-card-label">{k.lbl}</div>
                <div
                  className="spillere-stats-card-val"
                  style={{ color: k.positiv ? "var(--primary)" : "inherit" }}
                >
                  {k.val}
                </div>
                <div>
                  <div className="spillere-stats-card-sub">
                    Topp{" "}
                    <strong>
                      {k.pct > 50
                        ? `${100 - k.pct}%`
                        : `${k.pct}% fra bunnen`}
                    </strong>{" "}
                    på Tour
                  </div>
                  <div className="spillere-pct-bar-wrap">
                    <div
                      className="spillere-pct-bar"
                      style={{ width: `${Math.max(k.pct, 3)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── Sammenlign CTA ── */}
      <section className="spillere-section-sm spillere-section-divider">
        <Reveal>
          <div className="spillere-sammenlign-cta">
            <h3>
              Sammenlign deg med {spiller.navn.split(" ").pop()}
            </h3>
            <p>
              Legg inn dine SG-tall og se nøyaktig hvor mange strokes du taper
              per kategori.
            </p>
            <Link href={`/stats/sg-sammenlign?ref=${dgId}`}>
              <StatsBtn
                variant="primary"
                icon="ArrowRight"
              >
                Sammenlign nå
              </StatsBtn>
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ── Mersalg ── */}
      <div className="spillere-mersalg">
        <Reveal>
          <StatsEyebrow tone="lime">PlayerHQ</StatsEyebrow>
          <h2>
            Mål deg mot{" "}
            <em className="italic-accent" style={{ color: "var(--accent)" }}>
              proffene
            </em>
            .
          </h2>
          <p>
            Logg runder, mål Strokes Gained og sammenlign din profil med alle
            spillere i databasen. Gratis å starte.
          </p>
          <div className="spillere-mersalg-ctas">
            <Link href="/registrer">
              <StatsBtn variant="outline" icon="ArrowRight">
                Start gratis
              </StatsBtn>
            </Link>
            <Link href="/stats/pga/spillere">
              <StatsBtn variant="ghost" icon="ArrowRight">
                Alle spillere
              </StatsBtn>
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
