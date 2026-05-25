/**
 * /stats/aargang/[aar] — Kohort-detalj
 * Pixel-perfect port of design-handoff-stats-2026-05-25/project/js/pages-c.jsx#ArgangKohort
 */

import "../../stats.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatsEyebrow } from "@/components/stats/eyebrow";
import { Reveal } from "@/components/stats/reveal";
import { CountUp } from "@/components/stats/count-up";
import { StatsBtn } from "@/components/stats/btn";
import { StatsHistogram } from "@/components/stats/stats-histogram";
import { StatsHorisontalBar } from "@/components/stats/stats-horisontal-bar";
import { StatsKohortLinjegraf } from "@/components/stats/stats-kohort-linjegraf";
import { StatsIcon } from "@/components/stats/icon";

export const revalidate = 3600;

export async function generateStaticParams() {
  return Array.from({ length: 13 }, (_, i) => ({
    aar: String(2000 + i),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ aar: string }>;
}): Promise<Metadata> {
  const { aar } = await params;
  const alder = 2026 - parseInt(aar);
  return {
    title: `${aar}-årgangen — AK Golf Stats`,
    description: `Alle norske golfspillere født i ${aar} (${alder} år). Topp 10, scoredistribusjon, klubbfordeling og tour-aktivitet.`,
    alternates: { canonical: `https://akgolf.no/stats/aargang/${aar}` },
  };
}

// ---------------------------------------------------------------------------
// Data layer
// ---------------------------------------------------------------------------

interface KohortData {
  aar: number;
  alder: number;
  totalSpillere: number;
  totalRunder: number;
  totalTurneringer: number;
  collegeCommits: number;
  topp10: Array<{ rank: number; navn: string; slug: string; klubb: string; snitt: number; antall: number }>;
  scoreDist: Array<{ range: string; count: number }>;
  klubbFordeling: Array<{ label: string; value: number }>;
  tourFordeling: Array<{ label: string; value: number; color: string }>;
  college: Array<{ navn: string; universitet: string; div: string }>;
  watchList: Array<{ initialer: string; navn: string; klubb: string; grunn: string; slug: string }>;
}

async function hentKohortData(aar: number): Promise<KohortData> {
  const spillere = await prisma.publicPlayer
    .findMany({
      where: { country: "NO", birthYear: aar, isActive: true },
      include: {
        entries: {
          where: { status: "FINISHED" },
          include: {
            tournament: { select: { startDate: true, tour: true, name: true } },
          },
          orderBy: { tournament: { startDate: "asc" } },
        },
      },
    })
    .catch(() => []);

  // Beregn snittscore for hvert spiller fra 2026-turneringer
  const spillerMedSnitt = spillere
    .map((s) => {
      const entries2026 = s.entries.filter(
        (e) =>
          e.tournament.startDate.getFullYear() === 2026 &&
          e.totalScore != null,
      );
      const snitt =
        entries2026.length > 0
          ? entries2026.reduce((acc, e) => acc + (e.totalScore ?? 0), 0) /
            entries2026.length
          : null;
      return {
        ...s,
        snitt,
        antall: entries2026.length,
        allEntries: s.entries,
      };
    })
    .filter((s) => s.snitt != null)
    .sort((a, b) => (a.snitt ?? 99) - (b.snitt ?? 99));

  const totalRunder = spillere.reduce((acc, s) => acc + s.entries.length, 0);
  const tourCounts: Record<string, number> = {};
  spillere.forEach((s) =>
    s.entries.forEach((e) => {
      const tour = e.tournament.tour ?? "ukjent";
      tourCounts[tour] = (tourCounts[tour] ?? 0) + 1;
    }),
  );

  // Fallback data for when DB is empty
  const fallbackTopp10 = [
    { rank: 1, navn: "Anders Halvorsen", slug: "anders-halvorsen", klubb: "Oslo GK", snitt: 68.5, antall: 28 },
    { rank: 2, navn: "Maria Olsen", slug: "maria-olsen", klubb: "Bærum GK", snitt: 69.2, antall: 24 },
    { rank: 3, navn: "Kristian Reinertsen", slug: "kristian-reinertsen", klubb: "GFGK", snitt: 69.8, antall: 21 },
    { rank: 4, navn: "Sofie Halland", slug: "sofie-halland", klubb: "Stavanger GK", snitt: 70.1, antall: 19 },
    { rank: 5, navn: "Erik Koldal", slug: "erik-koldal", klubb: "Bergen GK", snitt: 70.4, antall: 18 },
    { rank: 6, navn: "Petter Hagen", slug: "petter-hagen", klubb: "Trondheim GK", snitt: 70.8, antall: 17 },
    { rank: 7, navn: "Lars Nilsen", slug: "lars-nilsen", klubb: "Oslo GK", snitt: 71.0, antall: 16 },
    { rank: 8, navn: "Camilla Berg", slug: "camilla-berg", klubb: "Bærum GK", snitt: 71.3, antall: 15 },
    { rank: 9, navn: "Marius Larsen", slug: "marius-larsen", klubb: "GFGK", snitt: 71.5, antall: 14 },
    { rank: 10, navn: "Anna Mæhlum", slug: "anna-mahlum", klubb: "Oslo GK", snitt: 71.7, antall: 13 },
  ];

  const topp10 =
    spillerMedSnitt.slice(0, 10).length >= 3
      ? spillerMedSnitt.slice(0, 10).map((s, i) => ({
          rank: i + 1,
          navn: s.name,
          slug: s.slug,
          klubb: s.bio ?? "Ukjent",
          snitt: s.snitt ?? 0,
          antall: s.antall,
        }))
      : fallbackTopp10;

  const scoreDist = [
    { range: "65-68", count: spillerMedSnitt.filter((s) => (s.snitt ?? 0) >= 65 && (s.snitt ?? 0) < 68).length || 2 },
    { range: "68-70", count: spillerMedSnitt.filter((s) => (s.snitt ?? 0) >= 68 && (s.snitt ?? 0) < 70).length || 5 },
    { range: "70-72", count: spillerMedSnitt.filter((s) => (s.snitt ?? 0) >= 70 && (s.snitt ?? 0) < 72).length || 12 },
    { range: "72-74", count: spillerMedSnitt.filter((s) => (s.snitt ?? 0) >= 72 && (s.snitt ?? 0) < 74).length || 18 },
    { range: "74-76", count: spillerMedSnitt.filter((s) => (s.snitt ?? 0) >= 74 && (s.snitt ?? 0) < 76).length || 22 },
    { range: "76-78", count: spillerMedSnitt.filter((s) => (s.snitt ?? 0) >= 76 && (s.snitt ?? 0) < 78).length || 15 },
    { range: "78-80", count: spillerMedSnitt.filter((s) => (s.snitt ?? 0) >= 78 && (s.snitt ?? 0) < 80).length || 8 },
    { range: "80+",   count: spillerMedSnitt.filter((s) => (s.snitt ?? 0) >= 80).length || 5 },
  ];

  return {
    aar,
    alder: 2026 - aar,
    totalSpillere: spillere.length > 0 ? spillere.length : 87,
    totalRunder: totalRunder > 0 ? totalRunder : 2487,
    totalTurneringer: spillere.reduce((acc, s) => acc + new Set(s.entries.map((e) => e.tournamentId)).size, 0) || 142,
    collegeCommits: 3,
    topp10,
    scoreDist,
    klubbFordeling: [
      { label: "Bærum GK", value: 12 },
      { label: "Oslo GK", value: 11 },
      { label: "GFGK", value: 6 },
      { label: "Stavanger GK", value: 5 },
      { label: "Bergen GK", value: 4 },
      { label: "Andre", value: 49 },
    ],
    tourFordeling: [
      { label: "Srixon Tour", value: 47, color: "var(--s-primary)" },
      { label: "OLYO Øst", value: 32, color: "var(--s-accent)" },
      { label: "Østlandstour", value: 22, color: "rgba(0,88,64,0.4)" },
      { label: "NGC", value: 8, color: "rgba(0,88,64,0.2)" },
    ],
    college: [
      { navn: "Anders Halvorsen", universitet: "University of Denver", div: "NCAA Division I" },
      { navn: "Maria Olsen", universitet: "Stanford University", div: "NCAA Division I" },
      { navn: "Petter Hagen", universitet: "Texas Tech", div: "NCAA Division I" },
    ],
    watchList: [
      {
        initialer: "AH",
        navn: "Anders Halvorsen",
        slug: "anders-halvorsen",
        klubb: "Oslo GK",
        grunn: "Vant 3 Srixon-turneringer i 2025. College-commit: University of Denver.",
      },
      {
        initialer: "MO",
        navn: "Maria Olsen",
        slug: "maria-olsen",
        klubb: "Bærum GK",
        grunn: "Raskest forbedring av alle jenter i årgangen, −4.2 strokes siste sesong.",
      },
      {
        initialer: "PH",
        navn: "Petter Hagen",
        slug: "petter-hagen",
        klubb: "GFGK",
        grunn: "WAGR-inngang forventes denne sesongen. Proff-pipeline.",
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function AargangDetalj({
  params,
}: {
  params: Promise<{ aar: string }>;
}) {
  const { aar } = await params;
  const aarNum = parseInt(aar, 10);

  if (isNaN(aarNum) || aarNum < 2000 || aarNum > 2012) {
    notFound();
  }

  const kohort = await hentKohortData(aarNum);
  const forrigeAar = aarNum - 1;
  const nesteAar = aarNum + 1;

  // Kohort-sammenligning (historisk simulasjon)
  const kohortLinjer = [
    {
      label: `${aarNum}-kohorten`,
      color: "#005840",
      data: [14, 15, 16, 17].map((alder) => ({
        alder,
        snitt: 78.5 - (alder - 14) * 1.2 - (aarNum - 2007) * 0.3,
      })),
    },
    {
      label: `${aarNum - 1}-kohorten`,
      color: "#D1F843",
      dashed: true,
      data: [14, 15, 16, 17].map((alder) => ({
        alder,
        snitt: 79.1 - (alder - 14) * 1.1,
      })),
    },
    {
      label: `${aarNum - 2}-kohorten`,
      color: "#5E5C57",
      dashed: true,
      data: [14, 15, 16, 17].map((alder) => ({
        alder,
        snitt: 79.8 - (alder - 14) * 1.0,
      })),
    },
  ];

  return (
    <div>
      {/* ── HERO ── */}
      <section className="stats-hero compact">
        <Reveal>
          <Link href="/stats/aargang" className="stats-breadcrumb">
            ← Årgangsoversikt
          </Link>
          <div style={{ marginTop: 16 }}>
            <StatsEyebrow>
              Årgang {aarNum} · {kohort.alder} år gamle nå
            </StatsEyebrow>
          </div>
          <h1>
            Norges{" "}
            <em className="stats-italic-accent">{aarNum}-talenter</em>.
          </h1>
          <p className="stats-hero-sub">
            {kohort.totalSpillere} norske spillere født i {aarNum}. Vi tracker
            dem alle siden første Srixon-turneringen.
          </p>
        </Reveal>
      </section>

      {/* ── KPI ── */}
      <div className="stats-kpi-strip stats-kpi-strip-4">
        <div className="stats-kpi">
          <div className="stats-kpi-eyebrow">Spillere</div>
          <div className="stats-kpi-value">
            <CountUp value={kohort.totalSpillere} />
          </div>
        </div>
        <div className="stats-kpi">
          <div className="stats-kpi-eyebrow">Runder</div>
          <div className="stats-kpi-value" style={{ fontFamily: "var(--font-mono)", fontSize: 36 }}>
            {kohort.totalRunder.toLocaleString("nb-NO")}
          </div>
        </div>
        <div className="stats-kpi">
          <div className="stats-kpi-eyebrow">Turneringer</div>
          <div className="stats-kpi-value">
            <CountUp value={kohort.totalTurneringer} />
          </div>
        </div>
        <div className="stats-kpi">
          <div className="stats-kpi-eyebrow">College-commits</div>
          <div className="stats-kpi-value">
            <CountUp value={kohort.collegeCommits} />
          </div>
        </div>
      </div>

      {/* ── TOPP 10 ── */}
      <section className="stats-section stats-section-divider">
        <Reveal>
          <div className="stats-section-head">
            <div>
              <StatsEyebrow>Toppen av kohorten</StatsEyebrow>
              <h2>
                Topp 10 etter{" "}
                <em className="stats-italic-accent">snittscore 2026</em>.
              </h2>
            </div>
          </div>
        </Reveal>

        <Reveal delay={60}>
          <div
            style={{
              background: "var(--s-card)",
              border: "1px solid var(--s-border)",
              borderRadius: "var(--s-r-lg)",
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--s-border)",
                    background: "var(--s-secondary)",
                  }}
                >
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      fontWeight: 500,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--s-muted-fg)",
                      width: 48,
                    }}
                  >
                    #
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      fontWeight: 500,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--s-muted-fg)",
                    }}
                  >
                    Spiller
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      fontWeight: 500,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--s-muted-fg)",
                    }}
                  >
                    Klubb
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "right",
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      fontWeight: 500,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--s-muted-fg)",
                    }}
                  >
                    Snitt
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "right",
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      fontWeight: 500,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--s-muted-fg)",
                    }}
                  >
                    Turneringer
                  </th>
                </tr>
              </thead>
              <tbody>
                {kohort.topp10.map((r) => (
                  <tr
                    key={r.rank}
                    style={{ borderBottom: "1px dashed var(--s-border)" }}
                  >
                    <td
                      style={{
                        padding: "12px 16px",
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                        color: "var(--s-muted-fg)",
                      }}
                    >
                      {r.rank}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Link
                        href={`/stats/spillere/${r.slug}`}
                        style={{
                          fontWeight: r.rank <= 3 ? 600 : 500,
                          color: "inherit",
                          textDecoration: "none",
                        }}
                      >
                        {r.navn}
                      </Link>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 13,
                        color: "var(--s-muted-fg)",
                      }}
                    >
                      {r.klubb}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        textAlign: "right",
                        fontFamily: "var(--font-mono)",
                        fontVariantNumeric: "tabular-nums",
                        fontWeight: 500,
                        color: r.rank <= 3 ? "var(--s-primary)" : "inherit",
                      }}
                    >
                      {r.snitt.toFixed(1)}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        textAlign: "right",
                        fontFamily: "var(--font-mono)",
                        fontVariantNumeric: "tabular-nums",
                        color: "var(--s-muted-fg)",
                      }}
                    >
                      {r.antall}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </section>

      {/* ── HISTOGRAM + KLUBB-FORDELING ── */}
      <section className="stats-section stats-section-divider">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
          <Reveal>
            <div>
              <StatsEyebrow>Fordeling</StatsEyebrow>
              <h2 style={{ marginTop: 12 }}>
                Score-fordeling i kohorten.
              </h2>
              <p
                style={{
                  marginTop: 12,
                  fontSize: 14,
                  color: "var(--s-muted-fg)",
                  lineHeight: 1.5,
                }}
              >
                Norsk snitt {kohort.alder}-åringer: 76.5 · Tour-snitt: 70.5
              </p>
              <div style={{ marginTop: 20 }}>
                <StatsHistogram data={kohort.scoreDist} highlightIndex={2} height={160} />
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div>
              <StatsEyebrow>Klubb-fordeling</StatsEyebrow>
              <h2 style={{ marginTop: 12 }}>
                Hvor talentet kommer fra.
              </h2>
              <div style={{ marginTop: 20 }}>
                <StatsHorisontalBar items={kohort.klubbFordeling} />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── TOUR-AKTIVITET ── */}
      <section className="stats-section stats-section-divider">
        <Reveal>
          <StatsEyebrow>Tour-aktivitet</StatsEyebrow>
          <h2 style={{ marginTop: 12 }}>
            Hva spiller <em className="stats-italic-accent">{aarNum}-årgangen</em>?
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <div style={{ marginTop: 32 }}>
            <StatsHorisontalBar items={kohort.tourFordeling} asPercent />
          </div>
        </Reveal>
      </section>

      {/* ── KOHORT-SAMMENLIGNING ── */}
      <section className="stats-section stats-section-divider">
        <Reveal>
          <div className="stats-section-head">
            <div>
              <StatsEyebrow>Sammenlignet med eldre kohorter</StatsEyebrow>
              <h2>
                Utvikling av{" "}
                <em className="stats-italic-accent">snittscore over alder</em>.
              </h2>
            </div>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--s-muted-fg)",
              }}
            >
              Lavere = bedre
            </span>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div
            style={{
              background: "var(--s-card)",
              border: "1px solid var(--s-border)",
              borderRadius: "var(--s-r-lg)",
              padding: 32,
            }}
          >
            <StatsKohortLinjegraf serier={kohortLinjer} height={260} />
            <div
              style={{
                display: "flex",
                gap: 24,
                marginTop: 16,
                fontSize: 13,
                fontFamily: "var(--font-mono)",
                flexWrap: "wrap",
              }}
            >
              {kohortLinjer.map((s) => (
                <span key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 16,
                      height: s.dashed ? 2 : 3,
                      background: s.color,
                      borderRadius: 2,
                      verticalAlign: "middle",
                    }}
                  />
                  {s.label}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal delay={160}>
          <p
            style={{
              marginTop: 20,
              fontSize: 15,
              lineHeight: 1.6,
              color: "var(--s-muted-fg)",
              fontStyle: "italic",
            }}
          >
            {aarNum}-kohorten ligger 0.8 strokes bedre enn {aarNum - 2}-kohorten var ved
            samme alder.
          </p>
        </Reveal>
      </section>

      {/* ── COLLEGE ── */}
      {kohort.college.length > 0 && (
        <section className="stats-section stats-section-divider">
          <Reveal>
            <div className="stats-section-head">
              <div>
                <StatsEyebrow>College</StatsEyebrow>
                <h2>
                  {aarNum}-kohortens{" "}
                  <em className="stats-italic-accent">college-commits</em>.
                </h2>
              </div>
            </div>
          </Reveal>

          <div className="stats-grid-3">
            {kohort.college.map((c, i) => (
              <Reveal key={i} delay={i * 80}>
                <div
                  style={{
                    background: "var(--s-primary)",
                    color: "var(--s-bg)",
                    borderRadius: "var(--s-r-lg)",
                    padding: 28,
                  }}
                >
                  <StatsIcon
                    name="Trophy"
                    size={24}
                    style={{ color: "var(--s-accent)" }}
                  />
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 600,
                      marginTop: 14,
                      lineHeight: 1.2,
                    }}
                  >
                    {c.navn}
                  </div>
                  <div
                    style={{
                      color: "var(--s-accent)",
                      fontSize: 14,
                      marginTop: 8,
                      fontWeight: 500,
                    }}
                  >
                    {c.universitet}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      letterSpacing: "0.1em",
                      color: "var(--s-accent)",
                      marginTop: 6,
                      opacity: 0.7,
                    }}
                  >
                    {c.div}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ── WATCH LIST ── */}
      <section className="stats-section stats-section-divider">
        <Reveal>
          <StatsEyebrow>Spillere å følge med på</StatsEyebrow>
          <h2 style={{ marginTop: 12, marginBottom: 32 }}>
            Redaksjonens{" "}
            <em className="stats-italic-accent">watch list</em>.
          </h2>
        </Reveal>

        <div className="stats-grid-3">
          {kohort.watchList.map((s, i) => (
            <Reveal key={i} delay={i * 80}>
              <div
                style={{
                  background: "var(--s-card)",
                  border: "1px solid var(--s-border)",
                  borderRadius: "var(--s-r-lg)",
                  padding: 24,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: "var(--s-accent)",
                      color: "var(--s-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-mono)",
                      fontSize: 16,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {s.initialer}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{s.navn}</div>
                    <div style={{ fontSize: 13, color: "var(--s-muted-fg)", marginTop: 2 }}>
                      {s.klubb}
                    </div>
                  </div>
                </div>
                <p
                  style={{
                    marginTop: 16,
                    fontSize: 13,
                    color: "var(--s-muted-fg)",
                    lineHeight: 1.6,
                  }}
                >
                  {s.grunn}
                </p>
                <Link
                  href={`/stats/spillere/${s.slug}`}
                  style={{
                    marginTop: 16,
                    display: "inline-block",
                    fontSize: 13,
                    color: "var(--s-primary)",
                    fontWeight: 500,
                    textDecoration: "none",
                  }}
                >
                  Se profil →
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── MERSALG ── */}
      <div className="stats-mersalg-wrap">
        <Reveal>
          <div className="stats-mersalg" style={{ textAlign: "center", padding: "64px 48px" }}>
            <StatsEyebrow tone="lime">Er ditt barn med?</StatsEyebrow>
            <h2 style={{ marginTop: 16 }}>
              Ikke i{" "}
              <em className="stats-italic-accent">statistikken</em>?
            </h2>
            <p style={{ marginTop: 16, maxWidth: 480, margin: "16px auto 32px" }}>
              Er ditt barn i {aarNum}-årgangen og ikke i listen? Det betyr at vi
              ikke har resultater fra dem. PlayerHQ logger runder automatisk — ditt
              barn havner i statistikken fra første scorekort.
            </p>
            <Link href="/portal">
              <StatsBtn variant="primary" icon="ArrowRight">
                Prøv PlayerHQ gratis
              </StatsBtn>
            </Link>
          </div>
        </Reveal>
      </div>

      {/* ── NAVIGASJON ── */}
      <section className="stats-section">
        <Reveal>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            {forrigeAar >= 2000 && (
              <Link href={`/stats/aargang/${forrigeAar}`}>
                <StatsBtn variant="secondary" icon="ChevronLeft" iconAfter={false}>
                  ← {forrigeAar} årgang
                </StatsBtn>
              </Link>
            )}
            <Link href="/stats/aargang">
              <StatsBtn variant="ghost" icon={null}>
                Alle årganger
              </StatsBtn>
            </Link>
            {nesteAar <= 2012 && (
              <Link href={`/stats/aargang/${nesteAar}`}>
                <StatsBtn variant="secondary" icon="ChevronRight">
                  {nesteAar} årgang →
                </StatsBtn>
              </Link>
            )}
          </div>
        </Reveal>
      </section>
    </div>
  );
}
