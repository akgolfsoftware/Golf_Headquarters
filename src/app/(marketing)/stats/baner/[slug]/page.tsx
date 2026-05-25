/**
 * /stats/baner/[slug] — Bane-detalj (design 13 — detalj)
 *
 * Datakilde: SEED_BANER + aggregert turnerings-data fra DB.
 * ISR 1 time.
 */

import "./../baner.css";
import "../../stats.css";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SEED_BANER } from "../page";
import { StatsEyebrow } from "@/components/stats/eyebrow";
import { Reveal } from "@/components/stats/reveal";
import { CountUp } from "@/components/stats/count-up";
import { StatsBtn } from "@/components/stats/btn";
import { StatsHistogram } from "@/components/stats/stats-histogram";

export const revalidate = 3600;

// ---------------------------------------------------------------------------
// Static params
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return SEED_BANER.map((b) => ({ slug: b.slug }));
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const bane = SEED_BANER.find((b) => b.slug === slug);
  if (!bane) return { title: "Bane ikke funnet" };

  return {
    title: `${bane.navn} — Banestatistikk | AK Golf Stats`,
    description: `Slope ${bane.slope}, CR ${bane.cr}, ${bane.lengde} m. ${bane.turneringer} turneringer arrangert på ${bane.navn}. Se leaderboard og score-distribusjon.`,
    alternates: { canonical: `https://akgolf.no/stats/baner/${slug}` },
    openGraph: {
      title: `${bane.navn} — AK Golf Stats`,
      description: `Slope ${bane.slope} · CR ${bane.cr} · ${bane.turneringer} turneringer`,
      url: `https://akgolf.no/stats/baner/${slug}`,
    },
  };
}

// ---------------------------------------------------------------------------
// Detalj-data
// ---------------------------------------------------------------------------

const SCORE_DIST = [
  { range: "60–64", count: 1 },
  { range: "65–69", count: 8 },
  { range: "70–74", count: 34 },
  { range: "75–79", count: 62 },
  { range: "80–84", count: 84 },
  { range: "85–89", count: 71 },
  { range: "90–94", count: 43 },
  { range: "95–99", count: 19 },
  { range: "100+",  count: 7 },
];

const TEE_DATA = [
  { tee: "Hvit", farge: "#F5F5F5", lengde: 6234, slope: 132, cr: 71.5, par: 72 },
  { tee: "Gul",  farge: "#FFD600", lengde: 5812, slope: 127, cr: 70.1, par: 72 },
  { tee: "Rød",  farge: "#E53935", lengde: 5124, slope: 121, cr: 68.4, par: 72 },
];

async function hentBaneDetaljer(baneName: string) {
  // Finn turneringer på denne banen (location-match)
  const [turneringer, spillere] = await Promise.all([
    prisma.tournament.findMany({
      where: {
        location: { contains: baneName.split(" ")[0], mode: "insensitive" },
        mergedIntoId: null,
      },
      orderBy: { startDate: "desc" },
      take: 5,
      select: { id: true, name: true, startDate: true, status: true, norskeAntall: true },
    }),
    prisma.publicPlayer.count({ where: { isActive: true } }),
  ]);

  return { turneringer, totalSpillere: spillere };
}

// ---------------------------------------------------------------------------
// Leaderboard data (statisk seed for illustrasjon)
// ---------------------------------------------------------------------------

const LEADERBOARD = [
  { rank: 1, spiller: "Anders Halvorsen",  score: 63, ar: 2024, turnering: "Srixon Tour 5" },
  { rank: 2, spiller: "Maria Olsen",        score: 65, ar: 2024, turnering: "Bærum Junior Open" },
  { rank: 3, spiller: "Marius Larsen",      score: 66, ar: 2025, turnering: "Srixon Tour 3" },
  { rank: 4, spiller: "Sofie Næss",         score: 67, ar: 2023, turnering: "OLYO Øst 4" },
  { rank: 5, spiller: "Petter Hagen",       score: 68, ar: 2026, turnering: "Srixon Tour 2" },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function BaneDetaljPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const bane = SEED_BANER.find((b) => b.slug === slug);
  if (!bane) notFound();

  const { turneringer, totalSpillere } = await hentBaneDetaljer(bane.navn);

  return (
    <div className="baner-page bg-background text-foreground">
      {/* ── Hero med stort bilde ── */}
      <section className="baner-hero">
        <Reveal>
          <Link href="/stats/baner" className="breadcrumb">
            ← Banedatabase
          </Link>
          <StatsEyebrow>
            {bane.kommune.toUpperCase()} · {bane.region.toUpperCase()}
          </StatsEyebrow>
          <h1>{bane.navn}</h1>
          <div className="baner-hero-img">
            BANEBILDE · {bane.navn.toUpperCase()} · 32:9
          </div>
        </Reveal>
      </section>

      {/* ── KPI 5-tall ── */}
      <Reveal>
        <div className="baner-kpi-strip cols-5">
          <div className="baner-kpi">
            <div className="baner-kpi-eyebrow">Lengde</div>
            <div className="baner-kpi-value">
              <CountUp value={bane.lengde} />
            </div>
            <div className="baner-kpi-sub">meter</div>
          </div>
          <div className="baner-kpi">
            <div className="baner-kpi-eyebrow">Slope</div>
            <div className="baner-kpi-value">{bane.slope}</div>
            <div className="baner-kpi-sub">vanskelighetsgrad</div>
          </div>
          <div className="baner-kpi">
            <div className="baner-kpi-eyebrow">CR</div>
            <div className="baner-kpi-value">{bane.cr}</div>
            <div className="baner-kpi-sub">course rating</div>
          </div>
          <div className="baner-kpi">
            <div className="baner-kpi-eyebrow">Par</div>
            <div className="baner-kpi-value">{bane.par}</div>
            <div className="baner-kpi-sub">{bane.hull} hull</div>
          </div>
          <div className="baner-kpi">
            <div className="baner-kpi-eyebrow">Turneringer</div>
            <div className="baner-kpi-value">
              <CountUp value={bane.turneringer} />
            </div>
            <div className="baner-kpi-sub">arrangert her</div>
          </div>
        </div>
      </Reveal>

      {/* ── Om banen ── */}
      <section className="baner-section baner-section-divider">
        <Reveal>
          <div className="baner-section-head">
            <div>
              <StatsEyebrow>Om banen</StatsEyebrow>
              <h2>
                Etablert i{" "}
                <em className="italic-accent">{bane.oppstart}</em>.
              </h2>
            </div>
          </div>
        </Reveal>
        <Reveal delay={60}>
          <div className="baner-grid-2">
            <div
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: 32,
              }}
            >
              <p
                style={{
                  fontSize: 17,
                  lineHeight: 1.7,
                  color: "var(--muted-foreground)",
                }}
              >
                {bane.navn} er en av Norges mest brukte turneringsbaner og har
                vært vertskap for {bane.turneringer} registrerte turneringer.
                Banen er {bane.lengde} meter fra hvite teer med slope {bane.slope}{" "}
                og course rating {bane.cr}. Spilles fra tee 1 i et typisk
                parklandskap.
              </p>
            </div>
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
                  marginBottom: 20,
                }}
              >
                Bane-fakta
              </div>
              {[
                ["Åpnet", bane.oppstart.toString()],
                ["Bane-type", "Parkland"],
                ["Antall hull", bane.hull.toString()],
                ["Hjemmeklubb", bane.navn],
                ["Region", bane.region],
                ["Kommune", bane.kommune],
              ].map(([key, val]) => (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: "1px dashed var(--border)",
                    fontSize: 14,
                  }}
                >
                  <span style={{ color: "var(--muted-foreground)" }}>{key}</span>
                  <span style={{ fontWeight: 500 }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Vår statistikk ── */}
      <section className="baner-section baner-section-divider">
        <Reveal>
          <div className="baner-section-head">
            <div>
              <StatsEyebrow>Vår statistikk</StatsEyebrow>
              <h2>
                <em className="italic-accent">{bane.turneringer}</em>{" "}
                turneringer — {totalSpillere} spillere.
              </h2>
            </div>
          </div>
        </Reveal>
        <Reveal delay={60}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
              marginBottom: 40,
            }}
          >
            {[
              { lbl: "Laveste runde noensinne", val: "63", sub: "Anders Halvorsen · 2024" },
              { lbl: "Snittscore (alle runder)", val: "78.4", sub: "alle nivåer · 2026" },
              { lbl: "Runder i databasen", val: "2 847", sub: "siden 2018" },
            ].map((k) => (
              <div
                key={k.lbl}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  padding: 24,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--muted-foreground)",
                    marginBottom: 12,
                  }}
                >
                  {k.lbl}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 40,
                    fontWeight: 500,
                    fontVariantNumeric: "tabular-nums",
                    lineHeight: 1,
                    color: "var(--primary)",
                  }}
                >
                  {k.val}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--muted-foreground)",
                    marginTop: 8,
                  }}
                >
                  {k.sub}
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Score-distribusjon */}
        <Reveal delay={80}>
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
                marginBottom: 20,
              }}
            >
              Score-distribusjon · alle runder
            </div>
            <StatsHistogram
              data={SCORE_DIST}
              highlightIndex={4}
              height={160}
            />
          </div>
        </Reveal>
      </section>

      {/* ── Hvem dominerer ── */}
      <section className="baner-section baner-section-divider">
        <Reveal>
          <div className="baner-section-head">
            <div>
              <StatsEyebrow>Leaderboard</StatsEyebrow>
              <h2>
                Hvem <em className="italic-accent">dominerer</em> her?
              </h2>
            </div>
          </div>
        </Reveal>
        <Reveal delay={60}>
          <table className="baner-dtable">
            <thead>
              <tr>
                <th>#</th>
                <th>Spiller</th>
                <th>Turnering</th>
                <th className="num">År</th>
                <th className="num">Score</th>
              </tr>
            </thead>
            <tbody>
              {LEADERBOARD.map((r) => (
                <tr key={r.rank}>
                  <td
                    className="mono"
                    style={{
                      color:
                        r.rank <= 3 ? "var(--primary)" : "var(--muted-foreground)",
                      fontWeight: r.rank <= 3 ? 600 : 400,
                    }}
                  >
                    {r.rank}
                  </td>
                  <td>
                    <span style={{ fontWeight: 500 }}>{r.spiller}</span>
                  </td>
                  <td style={{ color: "var(--muted-foreground)" }}>
                    {r.turnering}
                  </td>
                  <td className="num">{r.ar}</td>
                  <td
                    className="num"
                    style={{
                      color: r.rank <= 3 ? "var(--primary)" : "inherit",
                      fontWeight: r.rank <= 3 ? 600 : 500,
                    }}
                  >
                    {r.score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </section>

      {/* ── Kommende turneringer ── */}
      {turneringer.length > 0 && (
        <section className="baner-section baner-section-divider">
          <Reveal>
            <div className="baner-section-head">
              <div>
                <StatsEyebrow>Turneringer</StatsEyebrow>
                <h2>
                  Siste <em className="italic-accent">aktivitet</em> her.
                </h2>
              </div>
            </div>
          </Reveal>
          <Reveal delay={60}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {turneringer.map((t) => (
                <div
                  key={t.id}
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    padding: "16px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{t.name}</div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "var(--muted-foreground)",
                        marginTop: 4,
                      }}
                    >
                      {t.startDate.toLocaleDateString("nb-NO", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  {t.norskeAntall != null && t.norskeAntall > 0 && (
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                        color: "var(--primary)",
                        fontWeight: 600,
                      }}
                    >
                      {t.norskeAntall} norske
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* ── Tee-sammenligning ── */}
      <section className="baner-section baner-section-divider">
        <Reveal>
          <div className="baner-section-head">
            <div>
              <StatsEyebrow>Teer</StatsEyebrow>
              <h2>
                Tee-<em className="italic-accent">sammenligning</em>.
              </h2>
            </div>
          </div>
        </Reveal>
        <Reveal delay={60}>
          <table className="baner-tee-table">
            <thead>
              <tr>
                <th>Tee</th>
                <th className="num">Lengde (m)</th>
                <th className="num">Slope</th>
                <th className="num">CR</th>
                <th className="num">Par</th>
              </tr>
            </thead>
            <tbody>
              {TEE_DATA.map((t) => (
                <tr key={t.tee}>
                  <td>
                    <span
                      className="baner-tee-swatch"
                      style={{ background: t.farge }}
                    />
                    {t.tee}
                  </td>
                  <td className="num">{t.lengde}</td>
                  <td className="num">{t.slope}</td>
                  <td className="num">{t.cr}</td>
                  <td className="num">{t.par}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </section>

      {/* ── Mersalg ── */}
      <div className="baner-mersalg">
        <Reveal>
          <StatsEyebrow tone="lime">PlayerHQ</StatsEyebrow>
          <h2>
            Mål Strokes Gained på{" "}
            <em className="italic-accent" style={{ color: "var(--accent)" }}>
              {bane.navn}
            </em>
            .
          </h2>
          <p>
            Logg runder, se hull-for-hull-analyse og sammenlign deg med spillere
            på samme bane. Gratis å starte.
          </p>
          <div className="baner-mersalg-ctas">
            <Link href="/registrer">
              <StatsBtn variant="outline" icon="ArrowRight">
                Start gratis
              </StatsBtn>
            </Link>
            <Link href="/stats/baner">
              <StatsBtn variant="ghost" icon="ArrowRight">
                Alle baner
              </StatsBtn>
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
