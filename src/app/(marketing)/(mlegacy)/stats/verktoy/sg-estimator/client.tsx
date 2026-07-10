"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  estimerSgFordelingFraSnitt,
  hcpFromAvgScore,
} from "@/lib/stats/sg-estimator";
import { StatsBigRadar } from "@/components/stats/stats-big-radar";
import { StatsEyebrow } from "@/components/stats/eyebrow";
import { Reveal } from "@/components/stats/reveal";
import { StatsRangeSlider } from "@/components/stats/stats-range-slider";

const KATEGORI_LABEL: Record<string, string> = {
  ott: "Off the Tee",
  app: "Approach",
  arg: "Around Green",
  putt: "Putting",
};

export function SgEstimatorClient() {
  const [snitt, setSnitt] = useState(78);
  const [beregnet, setBeregnet] = useState(false);

  const sg = estimerSgFordelingFraSnitt(snitt);
  const hcp = hcpFromAvgScore(snitt);

  // Normaliser til 0-1 for radaret (Tour = 0.85, bruker proporsjonal)
  const toNorm = (v: number | null) => Math.max(0, Math.min(1, 0.5 + (v ?? 0) / 10));

  const radarYou = [
    toNorm(sg.sgOtt),
    toNorm(sg.sgApp),
    toNorm(sg.sgArg),
    toNorm(sg.sgPutt),
  ];
  const radarThem = [0.85, 0.85, 0.85, 0.85];

  const kategorier = [
    { key: "ott", verdi: sg.sgOtt },
    { key: "app", verdi: sg.sgApp },
    { key: "arg", verdi: sg.sgArg },
    { key: "putt", verdi: sg.sgPutt },
  ];

  const storsteGap = kategorier.reduce((max, k) =>
    Math.abs(k.verdi ?? 0) > Math.abs(max.verdi ?? 0) ? k : max,
  );

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
          <StatsEyebrow>Verktøy · SG-estimator</StatsEyebrow>
          <h1 className="font-display">
            Din estimerte{" "}
            <em className="stats-italic-accent">SG-fordeling</em>.
          </h1>
          <p className="stats-hero-sub" style={{ maxWidth: 560 }}>
            Oppgi snittscoren din. Vi bruker Broadie-tabellen til å estimere SG fordelt på Off the
            Tee, Approach, Around Green og Putting.
          </p>
        </Reveal>
      </section>

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
              <StatsRangeSlider value={snitt} min={60} max={140} step={0.5} onChange={setSnitt} />
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
                Estimer SG-fordeling
                <ArrowRight size={16} strokeWidth={2} />
              </button>
            </div>
          </div>
        </Reveal>
      </section>

      {beregnet && (
        <>
          {/* KPI-stripe */}
          <section className="stats-section stats-section-divider">
            <Reveal>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  border: "1px solid var(--s-border)",
                  borderRadius: "var(--s-r-lg)",
                  overflow: "hidden",
                  background: "var(--s-card)",
                }}
              >
                {kategorier.map((k, i) => (
                  <div
                    key={k.key}
                    style={{
                      padding: "24px 28px",
                      borderRight: i < 3 ? "1px solid var(--s-border)" : "none",
                      background:
                        k.key === storsteGap.key ? "rgba(0,88,64,0.04)" : "transparent",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "var(--s-muted-fg)",
                        marginBottom: 8,
                      }}
                    >
                      {KATEGORI_LABEL[k.key]}
                      {k.key === storsteGap.key && (
                        <span
                          style={{
                            display: "inline-block",
                            marginLeft: 8,
                            background: "var(--s-accent)",
                            color: "var(--s-accent-fg)",
                            padding: "1px 6px",
                            borderRadius: 3,
                            fontSize: 9,
                          }}
                        >
                          GAP
                        </span>
                      )}
                    </div>
                    <div
                      className="font-mono"
                      style={{
                        fontSize: 36,
                        fontWeight: 500,
                        color: (k.verdi ?? 0) < -5 ? "var(--s-primary)" : "var(--s-fg)",
                      }}
                    >
                      {k.verdi !== null
                        ? (k.verdi >= 0 ? "+" : "") + k.verdi.toFixed(2)
                        : "—"}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--s-muted-fg)", marginTop: 4 }}>
                      strokes/runde vs Tour
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </section>

          {/* Radar + forklaring */}
          <section className="stats-section stats-section-divider">
            <div
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }}
            >
              <Reveal>
                <div
                  style={{
                    background: "var(--s-card)",
                    border: "1px solid var(--s-border)",
                    borderRadius: "var(--s-r-lg)",
                    padding: 32,
                  }}
                >
                  <StatsEyebrow>SG-profil</StatsEyebrow>
                  <StatsBigRadar
                    you={radarYou}
                    them={radarThem}
                    youLabel="Du (estimert)"
                    themLabel="Tour-snitt"
                    youRaw={[sg.sgOtt ?? 0, sg.sgApp ?? 0, sg.sgArg ?? 0, sg.sgPutt ?? 0]}
                    themRaw={[0, 0, 0, 0]}
                  />
                </div>
              </Reveal>
              <Reveal delay={100}>
                <div>
                  <StatsEyebrow>Hva betyr dette?</StatsEyebrow>
                  <h2
                    className="font-display"
                    style={{ fontSize: 28, fontWeight: 600, marginTop: 12, lineHeight: 1.2 }}
                  >
                    Estimert HCP:{" "}
                    <span className="font-mono" style={{ color: "var(--s-primary)" }}>
                      {hcp.toFixed(1)}
                    </span>
                  </h2>
                  <p style={{ marginTop: 16, fontSize: 15, lineHeight: 1.6, color: "var(--s-muted-fg)" }}>
                    Med snittscore <strong>{snitt}</strong> er ditt største utviklingspotensial i{" "}
                    <strong>{KATEGORI_LABEL[storsteGap.key]}</strong> (
                    {storsteGap.verdi !== null
                      ? (storsteGap.verdi >= 0 ? "+" : "") + storsteGap.verdi.toFixed(2)
                      : "—"}{" "}
                    strokes/runde vs Tour).
                  </p>
                  <p style={{ marginTop: 12, fontSize: 13, lineHeight: 1.5, color: "var(--s-muted-fg)" }}>
                    Basert på Broadie (2014) «Every Shot Counts», HCP-stratifiserte gjennomsnitt. Disse er estimater, ikke nøyaktige per-spiller-tall.
                  </p>
                  <div style={{ marginTop: 24 }}>
                    <Link href="/stats/sg-sammenlign">
                      <button
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "12px 22px",
                          borderRadius: 999,
                          background: "var(--s-primary)",
                          color: "var(--s-primary-fg)",
                          fontWeight: 500,
                          fontSize: 14,
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        Sammenlign mot Rory
                        <ArrowRight size={14} strokeWidth={2} />
                      </button>
                    </Link>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
