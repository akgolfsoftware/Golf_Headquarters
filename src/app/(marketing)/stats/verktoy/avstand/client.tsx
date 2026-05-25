"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowLeftRight } from "lucide-react";
import { StatsEyebrow } from "@/components/stats/eyebrow";
import { Reveal } from "@/components/stats/reveal";

const YARDS_PR_METER = 1.09361;
const METER_PR_YARDS = 0.9144;

type Retning = "ym" | "my";

const REFERANSER = [
  { label: "Typisk driving (PGA Tour)", yards: 295, kontekst: "Tournivå, optimale betingelser" },
  { label: "Typisk driving (amatør HCP 10)", yards: 220, kontekst: "Norsk amatørsnitt" },
  { label: "Wedge full svingSg (9 jern)", yards: 150, kontekst: "Typisk innspill" },
  { label: "Pitching wedge (pro)", yards: 130, kontekst: "Full svung PGA Tour" },
  { label: "Sand wedge (amatør)", yards: 90, kontekst: "Typisk bunker" },
  { label: "Par 3 gjennomsnitts", yards: 185, kontekst: "PGA Tour par 3 snitt" },
];

export function AvstandClient() {
  const [verdi, setVerdi] = useState<string>("100");
  const [retning, setRetning] = useState<Retning>("ym");

  const tall = parseFloat(verdi) || 0;
  const resultat =
    retning === "ym"
      ? tall * METER_PR_YARDS
      : tall * YARDS_PR_METER;

  const bytteRetning = () => {
    setRetning((r) => (r === "ym" ? "my" : "ym"));
    setVerdi(resultat.toFixed(1));
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
          <StatsEyebrow>Verktøy · Avstand</StatsEyebrow>
          <h1 className="font-display">
            Yards{" "}
            <em className="stats-italic-accent">↔</em>{" "}
            meter.
          </h1>
          <p className="stats-hero-sub" style={{ maxWidth: 520 }}>
            Konverter mellom yards og meter. Med referanse-kolonnen ser du hva de vanligste
            golf-avstandene betyr i praksis.
          </p>
        </Reveal>
      </section>

      <section className="stats-section stats-section-divider">
        <Reveal>
          <div
            style={{
              maxWidth: 600,
              margin: "0 auto",
              background: "var(--s-card)",
              border: "1px solid var(--s-border)",
              borderRadius: "var(--s-r-xl)",
              padding: 48,
            }}
          >
            {/* Input-rad */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                gap: 16,
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--s-muted-fg)",
                    marginBottom: 8,
                    textAlign: "center",
                  }}
                >
                  {retning === "ym" ? "Yards" : "Meter"}
                </div>
                <input
                  type="number"
                  value={verdi}
                  onChange={(e) => setVerdi(e.target.value)}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 48,
                    fontWeight: 500,
                    width: "100%",
                    padding: "8px 16px",
                    border: "1px solid var(--s-border)",
                    borderRadius: "var(--s-r-md)",
                    textAlign: "center",
                    background: "var(--s-bg)",
                    color: "var(--s-fg)",
                  }}
                />
              </div>

              <button
                onClick={bytteRetning}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  border: "1px solid var(--s-border)",
                  background: "var(--s-secondary)",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--s-primary)",
                  marginTop: 28,
                }}
              >
                <ArrowLeftRight size={18} strokeWidth={1.75} />
              </button>

              <div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--s-muted-fg)",
                    marginBottom: 8,
                    textAlign: "center",
                  }}
                >
                  {retning === "ym" ? "Meter" : "Yards"}
                </div>
                <div
                  className="font-mono"
                  style={{
                    fontSize: 48,
                    fontWeight: 500,
                    padding: "8px 16px",
                    border: "2px solid var(--s-primary)",
                    borderRadius: "var(--s-r-md)",
                    textAlign: "center",
                    background: "rgba(0,88,64,0.04)",
                    color: "var(--s-primary)",
                  }}
                >
                  {resultat.toFixed(1)}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 24,
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.08em",
                textAlign: "center",
                color: "var(--s-muted-fg)",
              }}
            >
              1 yard = 0.9144 m · 1 meter = {YARDS_PR_METER.toFixed(4)} yards
            </div>
          </div>
        </Reveal>
      </section>

      {/* Referanse-tabell */}
      <section className="stats-section stats-section-divider">
        <Reveal>
          <div className="stats-section-head">
            <div>
              <StatsEyebrow>Referanser</StatsEyebrow>
              <h2 className="font-display">
                Vanlige{" "}
                <em className="stats-italic-accent">golf-avstander</em>.
              </h2>
            </div>
          </div>
        </Reveal>
        <Reveal delay={60}>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-mono)", fontSize: 13 }}
            >
              <thead>
                <tr style={{ borderBottom: "2px solid var(--s-border)" }}>
                  <th style={{ padding: "10px 16px 10px 0", textAlign: "left", fontWeight: 500, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--s-muted-fg)" }}>
                    Situasjon
                  </th>
                  <th style={{ padding: "10px 16px", textAlign: "right", fontWeight: 500, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--s-muted-fg)" }}>
                    Yards
                  </th>
                  <th style={{ padding: "10px 16px", textAlign: "right", fontWeight: 500, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--s-muted-fg)" }}>
                    Meter
                  </th>
                  <th style={{ padding: "10px 0", textAlign: "left", fontWeight: 500, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--s-muted-fg)" }}>
                    Kontekst
                  </th>
                </tr>
              </thead>
              <tbody>
                {REFERANSER.map((r, i) => (
                  <tr
                    key={i}
                    style={{ borderBottom: "1px dashed var(--s-border)" }}
                  >
                    <td style={{ padding: "12px 16px 12px 0", fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: 14 }}>
                      {r.label}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        textAlign: "right",
                        fontWeight: 500,
                        color: "var(--s-primary)",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setRetning("ym");
                        setVerdi(String(r.yards));
                      }}
                    >
                      {r.yards}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right", color: "var(--s-muted-fg)" }}>
                      {(r.yards * METER_PR_YARDS).toFixed(0)}
                    </td>
                    <td style={{ padding: "12px 0", color: "var(--s-muted-fg)", fontSize: 12 }}>
                      {r.kontekst}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
