"use client";

/**
 * ScoreTilHcpClient — interaktiv kalkulator
 */

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { hcpFromAvgScore, tourEquivalentScore } from "@/lib/stats/sg-estimator";
import { StatsEyebrow } from "@/components/stats/eyebrow";
import { Reveal } from "@/components/stats/reveal";
import { StatsRangeSlider } from "@/components/stats/stats-range-slider";

function hcpNiva(hcp: number): string {
  if (hcp <= 0) return "Scratch / Plus-handicap";
  if (hcp <= 5) return "Elitespiller";
  if (hcp <= 10) return "Single-figure";
  if (hcp <= 18) return "Mellomklasse";
  if (hcp <= 28) return "Rekreasjons";
  return "Nybegynner";
}

function percentilNorge(hcp: number): number {
  if (hcp <= 0) return 99;
  if (hcp <= 5) return 93;
  if (hcp <= 10) return 78;
  if (hcp <= 18) return 52;
  if (hcp <= 28) return 22;
  return 8;
}

export function ScoreTilHcpClient() {
  const [snitt, setSnitt] = useState(78);
  const [beregnet, setBeregnet] = useState(false);

  const hcp = hcpFromAvgScore(snitt);
  const { tourScore } = tourEquivalentScore(snitt);
  const niva = hcpNiva(hcp);
  const pct = percentilNorge(hcp);

  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="stats-hero" style={{ paddingBottom: 40 }}>
        <Reveal>
          <Link
            href="/stats/verktoy"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--s-muted-fg)",
              textDecoration: "none",
              marginBottom: 20,
            }}
          >
            <ArrowLeft size={12} strokeWidth={2} />
            Verktøy
          </Link>
          <StatsEyebrow>Verktøy · Score til HCP</StatsEyebrow>
          <h1 className="font-display">
            Hvilken{" "}
            <em className="stats-italic-accent">HCP</em> har du?
          </h1>
          <p className="stats-hero-sub">
            Skriv inn snittscoren din, så estimerer vi HCP basert på Broadie-data.
          </p>
        </Reveal>
      </section>

      {/* Kalkulator */}
      <section className="stats-section stats-section-divider">
        <Reveal>
          <div
            style={{
              maxWidth: 640,
              margin: "0 auto",
              background: "var(--s-card)",
              border: "1px solid var(--s-border)",
              borderRadius: "var(--s-r-xl)",
              padding: 48,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--s-muted-fg)",
              }}
            >
              Din snittscore (brutto)
            </div>
            <div
              className="font-mono"
              style={{ fontSize: 120, fontWeight: 500, lineHeight: 1, marginTop: 12 }}
            >
              {snitt}
            </div>
            <div style={{ maxWidth: 400, margin: "32px auto 0" }}>
              <StatsRangeSlider
                value={snitt}
                min={60}
                max={140}
                step={0.5}
                onChange={setSnitt}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 8,
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--s-muted-fg)",
                  letterSpacing: "0.08em",
                }}
              >
                <span>60</span>
                <span>Tour-snitt: 70.5</span>
                <span>140</span>
              </div>
            </div>

            <div style={{ marginTop: 32 }}>
              <button
                onClick={() => setBeregnet(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "14px 26px",
                  borderRadius: 999,
                  background: "var(--s-primary)",
                  color: "var(--s-primary-fg)",
                  fontWeight: 500,
                  fontSize: 15,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Beregn HCP
                <ArrowRight size={16} strokeWidth={2} />
              </button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Resultat */}
      {beregnet && (
        <section className="stats-section stats-section-divider">
          <Reveal>
            <div
              style={{
                background: "var(--s-primary)",
                color: "var(--s-bg)",
                borderRadius: "var(--s-r-xl)",
                padding: 48,
                maxWidth: 760,
                margin: "0 auto",
                textAlign: "center",
              }}
            >
              <StatsEyebrow tone="lime">Din estimerte HCP</StatsEyebrow>
              <div
                className="font-mono"
                style={{
                  fontSize: 160,
                  marginTop: 16,
                  color: "var(--s-accent)",
                  lineHeight: 1,
                  fontWeight: 500,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {hcp.toFixed(1)}
              </div>
              <div style={{ fontSize: 18, marginTop: 16, color: "rgba(250,250,247,0.8)" }}>
                HCP-nivå:{" "}
                <strong className="font-mono" style={{ color: "var(--s-accent)" }}>
                  {niva}
                </strong>
              </div>

              <div
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.15)",
                  margin: "32px 0",
                  paddingTop: 24,
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: "rgba(250,250,247,0.85)",
                }}
              >
                <p>Dette tilsvarer:</p>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    marginTop: 12,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    textAlign: "left",
                    maxWidth: 480,
                    margin: "12px auto 0",
                  }}
                >
                  <li>· Bedre enn {pct} % av norske amatører</li>
                  <li>
                    · Tour-ekvivalent:{" "}
                    <strong style={{ color: "var(--s-accent)" }}>{tourScore.toFixed(1)}</strong> på
                    en PGA-bane (slope 145)
                  </li>
                  <li>· Basert på Broadie (2014) «Every Shot Counts» HCP-tabell</li>
                </ul>
              </div>

              <Link href="/stats/verktoy/tour-ekvivalent">
                <button
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 22px",
                    borderRadius: 999,
                    background: "transparent",
                    color: "var(--s-primary-fg)",
                    border: "1px solid var(--s-primary-fg)",
                    fontWeight: 500,
                    fontSize: 14,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Se Tour-ekvivalent
                  <ArrowRight size={14} strokeWidth={2} />
                </button>
              </Link>
            </div>
          </Reveal>
        </section>
      )}
    </div>
  );
}
