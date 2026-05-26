/**
 * /stats/sammenlign-spillere — head-to-head sammenligning av 2 norske spillere
 * Pixel-perfect port av design 10 fra design-handoff-stats-2026-05-25.
 *
 * URL: ?a={slug}&b={slug}
 * Søke-modus: ingen params → 2-kolonne søk med VS-glyph
 * Resultat-modus: begge params → sticky bar, KPI, linjegraf, beste resultater
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StatsEyebrow } from "@/components/stats/eyebrow";
import { Reveal } from "@/components/stats/reveal";
import { SammenlignResultat } from "./resultat";
import "../stats.css";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ a?: string; b?: string; query_a?: string; query_b?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { a, b } = await searchParams;
  if (a && b) {
    return {
      title: `Sammenlign ${a} vs ${b} — AK Golf Stats`,
      description: "Side-by-side sammenligning av to norske golfspillere. Snittscore over tid, beste resultater og tour-fordeling.",
    };
  }
  return {
    title: "Sammenlign norske spillere — AK Golf Stats",
    description: "Velg to norske golfspillere og sammenlign dem side-by-side. Snittscore, beste resultater og utvikling over tid.",
    alternates: { canonical: "https://akgolf.no/stats/sammenlign-spillere" },
  };
}

export default async function SammenlignSpillerePage({ searchParams }: Props) {
  const { a: slugA, b: slugB } = await searchParams;
  const beggeValgt = Boolean(slugA && slugB);

  // Hent spillerne hvis begge er valgt
  const [spillerA, spillerB] = await Promise.all([
    slugA
      ? prisma.publicPlayer.findUnique({
          where: { slug: slugA },
          include: {
            entries: {
              include: { tournament: true },
              orderBy: { createdAt: "desc" },
              take: 20,
            },
          },
        })
      : null,
    slugB
      ? prisma.publicPlayer.findUnique({
          where: { slug: slugB },
          include: {
            entries: {
              include: { tournament: true },
              orderBy: { createdAt: "desc" },
              take: 20,
            },
          },
        })
      : null,
  ]);

  // Hent søke-forslag (top 20 spillere for quick-picks)
  const topSpillere = await prisma.publicPlayer.findMany({
    orderBy: [{ tier: "asc" }, { name: "asc" }],
    take: 20,
    select: { slug: true, name: true, tier: true, birthYear: true },
  });

  return (
    <div className="bg-background text-foreground">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section
        className="stats-section stats-section-divider"
        style={{ paddingBottom: beggeValgt ? 48 : 56 }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <StatsEyebrow>AK Golf Stats · Sammenlign</StatsEyebrow>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(40px, 5vw, 72px)",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                lineHeight: 0.97,
                marginTop: 20,
              }}
            >
              Sammenlign{" "}
              <em
                style={{
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: "hsl(var(--primary))",
                }}
              >
                to
              </em>{" "}
              norske spillere.
            </h1>
            <p
              style={{
                fontSize: 18,
                color: "hsl(var(--muted-foreground))",
                marginTop: 20,
                maxWidth: 560,
                lineHeight: 1.5,
              }}
            >
              Velg to spillere og se side-by-side: snittscore over tid, beste
              resultater, og tour-fordeling.
            </p>
          </Reveal>
        </div>
      </section>

      {!beggeValgt ? (
        /* ── SØKE-MODUS ─────────────────────────────────────────── */
        <section className="stats-section stats-section-divider">
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <form method="GET" action="/stats/sammenlign-spillere">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto 1fr",
                  gap: 24,
                  alignItems: "stretch",
                }}
              >
                {/* Spiller A */}
                <Reveal>
                  <SpillerSok
                    name="a"
                    label="SPILLER A"
                    suggested={topSpillere.slice(0, 8)}
                    currentSlug={slugA}
                  />
                </Reveal>

                {/* VS glyph */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 8px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 48,
                      fontStyle: "italic",
                      color: "hsl(var(--accent))",
                      background: "hsl(var(--primary))",
                      width: 72,
                      height: 72,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: "50%",
                      lineHeight: 1,
                    }}
                  >
                    vs
                  </span>
                </div>

                {/* Spiller B */}
                <Reveal delay={80}>
                  <SpillerSok
                    name="b"
                    label="SPILLER B"
                    suggested={topSpillere.slice(8, 16)}
                    currentSlug={slugB}
                  />
                </Reveal>
              </div>

              <Reveal delay={120}>
                <div style={{ textAlign: "center", marginTop: 40 }}>
                  <button
                    type="submit"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "14px 32px",
                      background: "hsl(var(--primary))",
                      color: "hsl(var(--accent))",
                      border: "none",
                      borderRadius: 999,
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    Sammenlign
                    <ArrowRight size={16} />
                  </button>
                </div>
              </Reveal>
            </form>
          </div>
        </section>
      ) : (
        /* ── RESULTAT-MODUS ─────────────────────────────────────── */
        <SammenlignResultat
          spillerA={spillerA}
          spillerB={spillerB}
          slugA={slugA!}
          slugB={slugB!}
        />
      )}

      {/* ── MERSALG ──────────────────────────────────────────────── */}
      <section
        className="stats-section stats-section-divider"
        style={{ background: "hsl(var(--primary))", color: "hsl(var(--background))" }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "3fr 2fr",
            gap: 56,
            alignItems: "center",
          }}
        >
          <div>
            <StatsEyebrow tone="lime">PlayerHQ</StatsEyebrow>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 36,
                fontWeight: 600,
                letterSpacing: "-0.025em",
                marginTop: 12,
                color: "hsl(var(--background))",
                lineHeight: 1.1,
              }}
            >
              Vil du{" "}
              <em
                style={{ fontStyle: "italic", fontWeight: 400, color: "hsl(var(--accent))" }}
              >
                også
              </em>{" "}
              være sammenlignbar?
            </h2>
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.55,
                marginTop: 16,
                color: "rgba(250,250,247,0.8)",
                maxWidth: 440,
              }}
            >
              Logg dine egne runder i PlayerHQ — så kommer du automatisk inn i
              databasen og kan sammenlignes med andre norske spillere.
            </p>
            <Link
              href="/playerhq"
              className="stats-btn stats-btn-outline stats-btn-lg"
              style={{ marginTop: 24, textDecoration: "none" }}
            >
              <span>Prøv PlayerHQ gratis</span>
              <ArrowRight size={16} className="stats-btn-icon" />
            </Link>
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(209,248,67,0.2)",
              borderRadius: 14,
              padding: 24,
            }}
          >
            {[
              "Automatisk SG per runde",
              "Trend vs norsk snitt",
              "AI-coach tips per kategori",
              "Sammenlignbar med peers",
            ].map((b) => (
              <div
                key={b}
                style={{
                  display: "flex",
                  gap: 10,
                  marginBottom: 12,
                  fontSize: 14,
                  color: "rgba(250,250,247,0.88)",
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "hsl(var(--accent))",
                    marginTop: 6,
                    flexShrink: 0,
                  }}
                />
                {b}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULÆRE SAMMENLIGNINGER ─────────────────────────────── */}
      {topSpillere.length >= 4 && (
        <section className="stats-section stats-section-divider">
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <Reveal>
              <div className="stats-section-head">
                <div>
                  <StatsEyebrow>Populære sammenligninger</StatsEyebrow>
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 28,
                      fontWeight: 600,
                      letterSpacing: "-0.02em",
                      marginTop: 10,
                    }}
                  >
                    Andre som{" "}
                    <em
                      style={{
                        fontStyle: "italic",
                        fontWeight: 400,
                        color: "hsl(var(--primary))",
                      }}
                    >
                      sammenligner
                    </em>
                    .
                  </h2>
                </div>
              </div>
            </Reveal>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
              }}
            >
              {topSpillere
                .slice(0, 6)
                .reduce<Array<[typeof topSpillere[0], typeof topSpillere[0]]>>(
                  (pairs, _, i, arr) => {
                    if (i % 2 === 0 && arr[i + 1]) {
                      pairs.push([arr[i]!, arr[i + 1]!]);
                    }
                    return pairs;
                  },
                  [],
                )
                .map(([pa, pb], i) => (
                  <Reveal key={i} delay={i * 60}>
                    <Link
                      href={`/stats/sammenlign-spillere?a=${pa.slug}&b=${pb.slug}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "14px 16px",
                        background: "#FFFFFF",
                        border: "1px solid #E5E3DD",
                        borderRadius: 12,
                        textDecoration: "none",
                        transition: "all 0.18s",
                        color: "hsl(var(--foreground))",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        {pa.name}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontStyle: "italic",
                          color: "hsl(var(--primary))",
                          fontSize: 13,
                        }}
                      >
                        vs
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        {pb.name}
                      </span>
                      <ArrowRight
                        size={12}
                        color="hsl(var(--muted-foreground))"
                        style={{ marginLeft: "auto" }}
                      />
                    </Link>
                  </Reveal>
                ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// ─── SpillerSok component ────────────────────────────────────────────────────

function SpillerSok({
  name,
  label,
  suggested,
  currentSlug,
}: {
  name: "a" | "b";
  label: string;
  suggested: Array<{ slug: string; name: string; tier: string; birthYear: number | null }>;
  currentSlug?: string;
}) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E3DD",
        borderRadius: 16,
        padding: 24,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "hsl(var(--muted-foreground))",
          marginBottom: 14,
        }}
      >
        {label}
      </div>

      <input
        name={name}
        type="text"
        defaultValue={currentSlug ?? ""}
        placeholder="Søk etter navn eller slug…"
        style={{
          width: "100%",
          border: "1px solid #E5E3DD",
          borderRadius: 10,
          padding: "10px 14px",
          fontSize: 14,
          fontFamily: "var(--font-sans)",
          background: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
          outline: "none",
          boxSizing: "border-box",
        }}
      />

      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#C4C0B8",
          margin: "16px 0 10px",
        }}
      >
        RASKE VALG
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {suggested.slice(0, 6).map((s) => (
          <button
            key={s.slug}
            type="button"
            onClick={() => {
              // Set input value via DOM (works without JS framework for simplicity)
              const input = document.querySelector(
                `input[name="${name}"]`,
              ) as HTMLInputElement | null;
              if (input) input.value = s.slug;
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 10px",
              background: s.slug === currentSlug ? "rgba(0,88,64,0.06)" : "transparent",
              border: "1px solid transparent",
              borderRadius: 8,
              cursor: "pointer",
              textAlign: "left",
              width: "100%",
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "hsl(var(--secondary))",
                display: "grid",
                placeItems: "center",
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                fontWeight: 700,
                color: "hsl(var(--primary))",
                flexShrink: 0,
              }}
            >
              {s.name
                .split(" ")
                .map((n) => n[0] ?? "")
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "hsl(var(--foreground))",
                }}
              >
                {s.name}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "hsl(var(--muted-foreground))",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {s.tier} {s.birthYear ? `· f. ${s.birthYear}` : ""}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
