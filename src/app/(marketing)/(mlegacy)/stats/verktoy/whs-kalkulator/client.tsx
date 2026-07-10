"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";
import { StatsEyebrow } from "@/components/stats/eyebrow";
import { Reveal } from "@/components/stats/reveal";

type Runde = { score: number; slope: number; cr: number };

function beregnScoreDifferential(score: number, slope: number, cr: number): number {
  return (score - cr) * (113 / slope);
}

function beregnWhsHcp(runder: Runde[]): number | null {
  if (runder.length < 3) return null;
  const diffs = runder.map((r) => beregnScoreDifferential(r.score, r.slope, r.cr));
  const sortert = [...diffs].sort((a, b) => a - b);
  const antallBruk = Math.min(8, Math.floor(sortert.length * 0.4 + 1));
  const beste = sortert.slice(0, antallBruk);
  const snitt = beste.reduce((s, v) => s + v, 0) / beste.length;
  return Math.round(snitt * 10) / 10;
}

const TOMME_RUNDER: Runde[] = [
  { score: 80, slope: 125, cr: 71 },
  { score: 78, slope: 120, cr: 70 },
  { score: 82, slope: 130, cr: 72 },
];

export function WhsKalkulatorClient() {
  const [runder, setRunder] = useState<Runde[]>(TOMME_RUNDER);
  const [beregnet, setBeregnet] = useState(false);

  const hcp = beregnWhsHcp(runder);

  const leggTil = () => {
    if (runder.length < 20) {
      setRunder([...runder, { score: 80, slope: 125, cr: 71 }]);
    }
  };

  const fjern = (i: number) => {
    setRunder(runder.filter((_, idx) => idx !== i));
    setBeregnet(false);
  };

  const oppdater = (i: number, felt: keyof Runde, verdi: number) => {
    const ny = [...runder];
    ny[i] = { ...ny[i], [felt]: verdi };
    setRunder(ny);
    setBeregnet(false);
  };

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
          <StatsEyebrow>Verktøy · WHS-kalkulator</StatsEyebrow>
          <h1 className="font-display">
            Beregn ditt{" "}
            <em className="stats-italic-accent">WHS-handicap</em>.
          </h1>
          <p className="stats-hero-sub" style={{ maxWidth: 560 }}>
            Legg inn 3–20 runder med score, slope og course rating. Vi beregner handicap etter offisiell
            NHF/WHS-metode (8 beste score differentials).
          </p>
        </Reveal>
      </section>

      <section className="stats-section stats-section-divider">
        <Reveal>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            {/* Tabell med runder */}
            <div
              style={{
                background: "var(--s-card)",
                border: "1px solid var(--s-border)",
                borderRadius: "var(--s-r-lg)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 100px 100px 40px",
                  gap: 0,
                  padding: "12px 20px",
                  background: "var(--s-secondary)",
                  borderBottom: "1px solid var(--s-border)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--s-muted-fg)",
                }}
              >
                <span>Score</span>
                <span>Slope</span>
                <span>CR</span>
                <span />
              </div>

              {runder.map((r, i) => {
                const diff = beregnScoreDifferential(r.score, r.slope, r.cr);
                return (
                  <div
                    key={i}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 100px 100px 40px",
                      gap: 0,
                      padding: "10px 20px",
                      borderBottom: "1px solid var(--s-border)",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <input
                        type="number"
                        value={r.score}
                        onChange={(e) => oppdater(i, "score", Number(e.target.value))}
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 18,
                          width: 64,
                          padding: "4px 8px",
                          border: "1px solid var(--s-border)",
                          borderRadius: 6,
                          textAlign: "center",
                          background: "var(--s-bg)",
                          color: "var(--s-fg)",
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          color: diff < 0 ? "var(--s-primary)" : "var(--s-muted-fg)",
                        }}
                      >
                        diff: {diff.toFixed(1)}
                      </span>
                    </div>
                    <input
                      type="number"
                      value={r.slope}
                      onChange={(e) => oppdater(i, "slope", Number(e.target.value))}
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 14,
                        width: 64,
                        padding: "4px 8px",
                        border: "1px solid var(--s-border)",
                        borderRadius: 6,
                        textAlign: "center",
                        background: "var(--s-bg)",
                        color: "var(--s-fg)",
                      }}
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={r.cr}
                      onChange={(e) => oppdater(i, "cr", Number(e.target.value))}
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 14,
                        width: 64,
                        padding: "4px 8px",
                        border: "1px solid var(--s-border)",
                        borderRadius: 6,
                        textAlign: "center",
                        background: "var(--s-bg)",
                        color: "var(--s-fg)",
                      }}
                    />
                    <button
                      onClick={() => fjern(i)}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--s-muted-fg)",
                        padding: 4,
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <Trash2 size={14} strokeWidth={1.75} />
                    </button>
                  </div>
                );
              })}

              {runder.length < 20 && (
                <button
                  onClick={leggTil}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "14px 20px",
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--s-primary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                  }}
                >
                  <Plus size={14} strokeWidth={2} />
                  Legg til runde ({runder.length}/20)
                </button>
              )}
            </div>

            <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
              <button
                onClick={() => setBeregnet(true)}
                disabled={runder.length < 3}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "14px 26px",
                  borderRadius: 999,
                  background: runder.length < 3 ? "var(--s-secondary)" : "var(--s-primary)",
                  color: runder.length < 3 ? "var(--s-muted-fg)" : "var(--s-primary-fg)",
                  fontWeight: 500,
                  fontSize: 15,
                  border: "none",
                  cursor: runder.length < 3 ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                Beregn WHS-handicap
                <ArrowRight size={16} strokeWidth={2} />
              </button>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--s-muted-fg)",
                  letterSpacing: "0.08em",
                }}
              >
                Min. 3 runder kreves
              </span>
            </div>
          </div>
        </Reveal>
      </section>

      {beregnet && hcp !== null && (
        <section className="stats-section stats-section-divider">
          <Reveal>
            <div
              style={{
                background: "var(--s-primary)",
                color: "var(--s-bg)",
                borderRadius: "var(--s-r-xl)",
                padding: 48,
                maxWidth: 600,
                margin: "0 auto",
                textAlign: "center",
              }}
            >
              <StatsEyebrow tone="lime">Ditt WHS-handicap</StatsEyebrow>
              <div
                className="font-mono"
                style={{
                  fontSize: 160,
                  marginTop: 16,
                  color: "var(--s-accent)",
                  lineHeight: 1,
                  fontWeight: 500,
                }}
              >
                {hcp.toFixed(1)}
              </div>
              <p
                style={{
                  marginTop: 24,
                  fontSize: 14,
                  color: "rgba(250,250,247,0.75)",
                  lineHeight: 1.6,
                  maxWidth: 420,
                  margin: "24px auto 0",
                }}
              >
                Basert på {runder.length} runder. Bruker {Math.min(8, runder.length)} beste score
                differentials etter WHS-metoden.
              </p>
            </div>
          </Reveal>
        </section>
      )}
    </div>
  );
}
