"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { tourEquivalentScore } from "@/lib/stats/sg-estimator";
import { StatsEyebrow } from "@/components/stats/eyebrow";
import { Reveal } from "@/components/stats/reveal";
import { StatsRangeSlider } from "@/components/stats/stats-range-slider";

export function TourEkvivalentClient() {
  const [score, setScore] = useState(78);
  const [slope, setSlope] = useState(125);
  const [cr, setCr] = useState(71);
  const [beregnet, setBeregnet] = useState(false);

  const { tourScore, hcp, tourHcp } = tourEquivalentScore(score, {
    norskSlope: slope,
    norskCr: cr,
  });

  return (
    <div className="bg-background text-foreground">
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
          <StatsEyebrow>Verktøy · Tour-ekvivalent</StatsEyebrow>
          <h1 className="font-display">
            Hva tilsvarer scoren din{" "}
            <em className="stats-italic-accent">på Tour</em>?
          </h1>
          <p className="stats-hero-sub" style={{ maxWidth: 560 }}>
            Oppgi score, slope og course rating for banen du spilte på. Vi beregner
            hva det tilsvarer på en PGA Tour-bane (CR 74.5, Slope 145).
          </p>
        </Reveal>
      </section>

      <section className="stats-section stats-section-divider">
        <Reveal>
          <div
            style={{
              maxWidth: 680,
              margin: "0 auto",
              background: "var(--s-card)",
              border: "1px solid var(--s-border)",
              borderRadius: "var(--s-r-xl)",
              padding: 48,
            }}
          >
            {/* Score */}
            <div style={{ marginBottom: 40 }}>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--s-muted-fg)",
                  marginBottom: 12,
                }}
              >
                Din brutto-score
              </div>
              <div
                className="font-mono"
                style={{ fontSize: 80, fontWeight: 500, lineHeight: 1, marginBottom: 16, textAlign: "center" }}
              >
                {score}
              </div>
              <StatsRangeSlider value={score} min={60} max={130} step={1} onChange={setScore} />
            </div>

            {/* Slope og CR side ved side */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--s-muted-fg)",
                    marginBottom: 8,
                  }}
                >
                  Slope ({slope})
                </div>
                <StatsRangeSlider value={slope} min={55} max={155} step={1} onChange={setSlope} />
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--s-muted-fg)",
                    marginBottom: 8,
                  }}
                >
                  Course Rating ({cr})
                </div>
                <StatsRangeSlider
                  value={cr}
                  min={55}
                  max={80}
                  step={0.1}
                  onChange={setCr}
                />
              </div>
            </div>

            <div style={{ marginTop: 40, textAlign: "center" }}>
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
                Beregn Tour-ekvivalent
                <ArrowRight size={16} strokeWidth={2} />
              </button>
            </div>
          </div>
        </Reveal>
      </section>

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
              <StatsEyebrow tone="lime">Din Tour-ekvivalent</StatsEyebrow>
              <div
                className="font-mono"
                style={{
                  fontSize: 140,
                  marginTop: 16,
                  color: "var(--s-accent)",
                  lineHeight: 1,
                  fontWeight: 500,
                }}
              >
                {tourScore.toFixed(1)}
              </div>
              <div style={{ fontSize: 18, marginTop: 16, color: "rgba(250,250,247,0.8)" }}>
                Din score <span className="font-mono">{score}</span> på en bane med Slope{" "}
                <span className="font-mono">{slope}</span> / CR{" "}
                <span className="font-mono">{cr.toFixed(1)}</span> tilsvarer{" "}
                <strong style={{ color: "var(--s-accent)" }}>{tourScore.toFixed(1)}</strong> på en
                PGA Tour-bane.
              </div>

              <div
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.15)",
                  margin: "32px 0",
                  paddingTop: 24,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 24,
                  maxWidth: 400,
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "var(--s-accent)",
                      opacity: 0.7,
                    }}
                  >
                    Estimert HCP
                  </div>
                  <div
                    className="font-mono"
                    style={{ fontSize: 36, color: "var(--s-accent)", marginTop: 8, fontWeight: 500 }}
                  >
                    {hcp.toFixed(1)}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "var(--s-accent)",
                      opacity: 0.7,
                    }}
                  >
                    Tour-HCP
                  </div>
                  <div
                    className="font-mono"
                    style={{ fontSize: 36, color: "var(--s-accent)", marginTop: 8, fontWeight: 500 }}
                  >
                    {tourHcp.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      )}
    </div>
  );
}
