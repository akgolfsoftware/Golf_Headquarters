/**
 * /stats/aargang — Kohort-explorer index
 * Visuell tidslinje 2000-2012, klikk → /stats/aargang/[aar]
 */

import "../stats.css";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatsEyebrow } from "@/components/stats/eyebrow";
import { Reveal } from "@/components/stats/reveal";
import { StatsBtn } from "@/components/stats/btn";
import { CountUp } from "@/components/stats/count-up";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Årganger | AK Golf Stats",
  description:
    "Utforsk norske golftaler per fødselsår. Hvem er de beste 2009-talentene? Kohort-explorer for 2000-2012.",
  alternates: { canonical: "https://akgolf.no/stats/aargang" },
  openGraph: {
    title: "Årganger | AK Golf Stats",
    description: "Kohort-explorer for norske golftalenter, 2000-2012.",
    url: "https://akgolf.no/stats/aargang",
  },
};

// ---------------------------------------------------------------------------
// Static cohort overview data (DB will eventually supply this)
// ---------------------------------------------------------------------------

// Årganger 2000–2012. Antall spillere hentes fra DB (publicPlayer); alder er avledet.
const KOHORTER = [
  { aar: 2012, alder: 14 },
  { aar: 2011, alder: 15 },
  { aar: 2010, alder: 16 },
  { aar: 2009, alder: 17 },
  { aar: 2008, alder: 18 },
  { aar: 2007, alder: 19 },
  { aar: 2006, alder: 20 },
  { aar: 2005, alder: 21 },
  { aar: 2004, alder: 22 },
  { aar: 2003, alder: 23 },
  { aar: 2002, alder: 24 },
  { aar: 2001, alder: 25 },
  { aar: 2000, alder: 26 },
];

async function hentAargangData() {
  const counts = await prisma.publicPlayer
    .groupBy({
      by: ["birthYear"],
      where: { country: "NO", birthYear: { gte: 2000, lte: 2012, not: null } },
      _count: { id: true },
    })
    .catch(() => []);

  const dbMap = new Map<number, number>(
    counts.map((c) => [c.birthYear!, c._count.id]),
  );

  return KOHORTER.map((k) => ({
    ...k,
    spillere: dbMap.get(k.aar) ?? 0,
  }));
}

export default async function AargangIndexPage() {
  const kohorter = await hentAargangData();
  const totalSpillere = kohorter.reduce((s, k) => s + k.spillere, 0);

  return (
    <div>
      {/* ── HERO ── */}
      <section className="stats-hero compact">
        <Reveal>
          <StatsEyebrow>AK Golf Stats · Årganger</StatsEyebrow>
          <h1>
            Norsk golftalent,{" "}
            <em className="stats-italic-accent">kohort for kohort</em>.
          </h1>
          <p className="stats-hero-sub" style={{ maxWidth: 560 }}>
            Velg en årgang for å utforske hvem som er best, hvor talentet kommer fra,
            og hvordan kohorten utvikler seg over tid.
          </p>
        </Reveal>
      </section>

      {/* ── KPI ── */}
      <div className="stats-kpi-strip">
        <div className="stats-kpi">
          <div className="stats-kpi-eyebrow">Årganger i oversikt</div>
          <div className="stats-kpi-value">
            <CountUp value={kohorter.length} />
          </div>
          <div className="stats-kpi-sub">fra 2000 til 2012</div>
        </div>
        <div className="stats-kpi">
          <div className="stats-kpi-eyebrow">Spillere totalt</div>
          <div className="stats-kpi-value">
            <CountUp value={totalSpillere} />
          </div>
          <div className="stats-kpi-sub">i databasen</div>
        </div>
        <div className="stats-kpi">
          <div className="stats-kpi-eyebrow">Størst kohort</div>
          <div className="stats-kpi-value">2007</div>
          <div className="stats-kpi-sub">102 spillere tracket</div>
        </div>
      </div>

      {/* ── TIDSLINJE ── */}
      <section className="stats-section stats-section-divider">
        <Reveal>
          <div className="stats-section-head">
            <div>
              <StatsEyebrow>Tidslinje</StatsEyebrow>
              <h2>
                Alle årganger{" "}
                <em className="stats-italic-accent">2000–2012</em>.
              </h2>
            </div>
          </div>
        </Reveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 16,
            marginTop: 32,
          }}
        >
          {kohorter.map((k, i) => (
            <Reveal key={k.aar} delay={i * 40}>
              <Link href={`/stats/aargang/${k.aar}`} style={{ textDecoration: "none" }}>
                <div
                  className="stats-aargang-card"
                  style={{
                    background: k.aar === 2009 ? "var(--s-primary)" : "var(--s-card)",
                    border: `1px solid ${k.aar === 2009 ? "var(--s-primary)" : "var(--s-border)"}`,
                    borderRadius: "var(--s-r-lg)",
                    padding: 24,
                    transition: "box-shadow .18s ease, transform .18s ease",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 32,
                        fontWeight: 700,
                        color: k.aar === 2009 ? "var(--s-accent)" : "var(--s-fg)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {k.aar}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        letterSpacing: "0.08em",
                        color: k.aar === 2009 ? "rgba(209,248,67,0.7)" : "var(--s-muted-fg)",
                        background: k.aar === 2009 ? "rgba(255,255,255,0.1)" : "var(--s-secondary)",
                        padding: "3px 8px",
                        borderRadius: 99,
                      }}
                    >
                      {k.alder} år
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: 16,
                      fontFamily: "var(--font-mono)",
                      fontSize: 20,
                      fontWeight: 600,
                      color: k.aar === 2009 ? "var(--s-primary-fg)" : "var(--s-fg)",
                    }}
                  >
                    {k.spillere}
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 400,
                        marginLeft: 6,
                        color: k.aar === 2009 ? "rgba(209,248,67,0.7)" : "var(--s-muted-fg)",
                      }}
                    >
                      spillere
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: 20,
                      fontSize: 12,
                      color: k.aar === 2009 ? "var(--s-accent)" : "var(--s-primary)",
                      fontWeight: 500,
                    }}
                  >
                    Utforsk {k.aar}-årgangen →
                  </div>
                </div>
              </Link>
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
            <p style={{ marginTop: 16, maxWidth: 520, margin: "16px auto 32px" }}>
              Er ditt barn i en av disse årgangene og ikke i listen? Det betyr at
              vi ikke har resultater fra dem. PlayerHQ logger runder automatisk,
              så ditt barn havner i statistikken fra første scorekort.
            </p>
            <Link href="/portal">
              <StatsBtn variant="primary" icon="ArrowRight">
                Prøv PlayerHQ gratis
              </StatsBtn>
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
