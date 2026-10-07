"use client";

import { WangIkkeKoblet, IKKE_KOBLET_KNAPP_STIL } from './WangIkkeKoblet';
import React, { useState } from "react";
import {
  WANG_ELEVER,
  WANG_OKTER,
  WangElev,
  WangOkt,
} from "./wang-data";

interface WangIdagProps {
  valgtFane?: string;
  aktivFane?: string;
  onFaneEndret?: (fane: string) => void;
  campus?: string;
}

export function WangIdag({
  valgtFane = "fokus",
  aktivFane,
  onFaneEndret: _onFaneEndret,
  campus: _campus = "Fredrikstad",
}: WangIdagProps) {
  const [fane, setFane] = useState(aktivFane || valgtFane);
  const [okter] = useState<WangOkt[]>(WANG_OKTER);
  const [oppfolgingElever] = useState<WangElev[]>(
    WANG_ELEVER.filter((e) => e.trengerOppfolging)
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* 1. Header med tittel */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "16px" }}>
        <div>
          <p className="wg-num" style={{ margin: "0 0 6px", fontSize: "12px", fontWeight: 500, color: "var(--wang-text-muted)" }}>
            WG-01 · Uke 40 · 28.09–02.10.2026
          </p>
          <h1
            style={{
              margin: 0,
              fontFamily: "var(--font-wang-brand, Montserrat, sans-serif)",
              fontWeight: 300,
              fontSize: "36px",
              letterSpacing: "-0.015em",
              color: "var(--wang-blue)",
              lineHeight: 1.1,
            }}
          >
            I dag · WANG Toppidrett
          </h1>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            onClick={() => setFane("fokus")}
            className={`wg-chip ${fane === "fokus" ? "wg-chip-pa" : ""}`}
          >
            Dagsfokus (WG-01)
          </button>
          <button
            type="button"
            onClick={() => setFane("trenger-deg")}
            className={`wg-chip ${fane === "trenger-deg" ? "wg-chip-pa" : ""}`}
          >
            Trenger deg ({oppfolgingElever.length})
          </button>
          <button
            type="button"
            onClick={() => setFane("uke")}
            className={`wg-chip ${fane === "uke" ? "wg-chip-pa" : ""}`}
          >
            Uke og plan (WANG-30)
          </button>
        </div>
      </div>

      {/* 2. Dagsfokus Hero (WG-01) */}
      <section
        style={{
          backgroundColor: "var(--wang-green)",
          borderRadius: "4px",
          padding: "28px",
          color: "#FFFFFF",
          display: "grid",
          gap: "18px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <span
            style={{
              fontFamily: "var(--font-wang-brand, Montserrat, sans-serif)",
              fontSize: "12px",
              fontWeight: 600,
              color: "#FFFFFF",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Dagens fokus fra coach Anders Kristiansen
          </span>
          <span className="wg-num" style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.85)" }}>
            Tirsdag 29.09 · Morgentrening 08:00
          </span>
        </div>

        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-wang-brand, Montserrat, sans-serif)",
            fontWeight: 300,
            fontSize: "26px",
            letterSpacing: "-0.015em",
            lineHeight: 1.25,
            maxWidth: "780px",
          }}
        >
          Driver: svinghastighet og balltreff før høstturneringen.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.35)", paddingTop: "12px" }}>
            <p className="wg-num" style={{ margin: "0 0 4px", fontSize: "24px", fontWeight: 700, color: "#FFFFFF" }}>
              112 mph
            </p>
            <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.4, color: "rgba(255, 255, 255, 0.9)" }}>
              Køllehastighet (mål snitt i gruppa). Måles på TrackMan stasjon 1.
            </p>
          </div>
          <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.35)", paddingTop: "12px" }}>
            <p className="wg-num" style={{ margin: "0 0 4px", fontSize: "24px", fontWeight: 700, color: "#FFFFFF" }}>
              1.48
            </p>
            <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.4, color: "rgba(255, 255, 255, 0.9)" }}>
              Smash Factor: rent balltreff prioriteres foran overdreven svinglengde.
            </p>
          </div>
          <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.35)", paddingTop: "12px" }}>
            <p className="wg-num" style={{ margin: "0 0 4px", fontSize: "24px", fontWeight: 700, color: "#FFFFFF" }}>
              +2.5°
            </p>
            <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.4, color: "rgba(255, 255, 255, 0.9)" }}>
              Attack Angle: oppadgående treff for optimal utgangsvinkel.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Elever som trenger oppfølging (WANG-43) */}
      {(fane === "fokus" || fane === "trenger-deg") && (
        <section className="wg-kort" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div>
              <p className="wg-num" style={{ margin: "0 0 4px", fontSize: "11px", color: "var(--wang-text-muted)" }}>
                WANG-43 · Prioritert oppfølging
              </p>
              <h2
                style={{
                  margin: 0,
                  fontFamily: "var(--font-wang-brand, Montserrat, sans-serif)",
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "var(--wang-blue)",
                }}
              >
                Elever som trenger oppfølging
              </h2>
            </div>
            <span className="wg-num" style={{ fontSize: "12px", color: "var(--wang-text-muted)" }}>
              {oppfolgingElever.length} av {WANG_ELEVER.length} elever
            </span>
          </div>

          <div style={{ display: "grid", gap: "10px" }}>
            {oppfolgingElever.map((elev) => (
              <div
                key={elev.id}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  padding: "12px 16px",
                  backgroundColor: "var(--wang-blue-tint)",
                  borderRadius: "4px",
                  borderLeft: "4px solid var(--wang-pink)",
                }}
              >
                <div style={{ minWidth: "220px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--wang-blue)" }}>
                      {elev.navn}
                    </span>
                    <span className="wg-chip" style={{ minHeight: "24px", padding: "0 8px", fontSize: "11px" }}>
                      {elev.trinn} · HCP {elev.hcp}
                    </span>
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--wang-text-muted)" }}>
                    {elev.oppfolgingAarsak}
                  </p>
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    disabled
                    className="wg-btn wg-btn-secondary"
                    style={{ minHeight: "36px", padding: "0 12px", fontSize: "12px", ...IKKE_KOBLET_KNAPP_STIL }}
                  >
                    Ta oppfølging
                  </button>
                  <button
                    type="button"
                    disabled
                    className="wg-btn wg-btn-primary"
                    style={{ minHeight: "36px", padding: "0 12px", fontSize: "12px", ...IKKE_KOBLET_KNAPP_STIL }}
                  >
                    Løst
                  </button>
                  <WangIkkeKoblet />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Morgentreninger denne uken (WANG-30, WG-01) */}
      {(fane === "fokus" || fane === "uke") && (
        <section className="wg-kort" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "16px" }}>
            <div>
              <p className="wg-num" style={{ margin: "0 0 4px", fontSize: "11px", color: "var(--wang-text-muted)" }}>
                WANG-30 · Ukeoversikt
              </p>
              <h2
                style={{
                  margin: 0,
                  fontFamily: "var(--font-wang-brand, Montserrat, sans-serif)",
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "var(--wang-blue)",
                }}
              >
                Morgentreninger og fellessamlinger
              </h2>
            </div>
            <span className="wg-num" style={{ fontSize: "12px", color: "var(--wang-text-muted)" }}>
              Tirsdag og torsdag · 08:00–10:00
            </span>
          </div>

          <div style={{ display: "grid", gap: "12px" }}>
            {okter.map((okt) => (
              <div
                key={okt.id}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  padding: "14px 18px",
                  border: "1px solid var(--wang-grey-line)",
                  borderRadius: "4px",
                  backgroundColor: "#FFFFFF",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                    <span className="wg-st">
                      <span
                        className={`wg-dot ${
                          okt.status === "Gjennomført"
                            ? "wg-dot-fullfort"
                            : "wg-dot-planlagt"
                        }`}
                      />
                      {okt.status}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: "15px", color: "var(--wang-blue)" }}>
                      {okt.dag} · {okt.tid}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: 500, color: "var(--wang-blue)" }}>
                    {okt.tittel}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "var(--wang-text-muted)" }}>
                    {okt.sted} · Trener: {okt.trener}
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span className="wg-num" style={{ fontSize: "13px", fontWeight: 600, color: "var(--wang-blue)" }}>
                    {okt.antallPameldt} / {okt.totaltElever} elever
                  </span>
                  <button
                    type="button"
                    disabled
                    className="wg-btn wg-btn-secondary"
                    style={{ minHeight: "36px", padding: "0 12px", fontSize: "12px", ...IKKE_KOBLET_KNAPP_STIL }}
                  >
                    Se økt
                  </button>
                  <WangIkkeKoblet />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Ukessammendrag (WANG-12) */}
      <section className="wg-kort" style={{ padding: "20px" }}>
        <p className="wg-num" style={{ margin: "0 0 4px", fontSize: "11px", color: "var(--wang-text-muted)" }}>
          WANG-12 · Nøkkeltall
        </p>
        <h2
          style={{
            margin: "0 0 16px",
            fontFamily: "var(--font-wang-brand, Montserrat, sans-serif)",
            fontSize: "18px",
            fontWeight: 600,
            color: "var(--wang-blue)",
          }}
        >
          Ukessammendrag for gruppa
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
          <div style={{ padding: "14px", backgroundColor: "var(--wang-blue-tint)", borderRadius: "4px" }}>
            <span style={{ fontSize: "12px", color: "var(--wang-text-muted)", display: "block" }}>
              Snitt etterlevelse
            </span>
            <p className="wg-num" style={{ margin: "4px 0 0", fontSize: "28px", fontWeight: 700, color: "var(--wang-blue)" }}>
              —
            </p>
            <span style={{ fontSize: "11px", color: "var(--wang-green)", fontWeight: 600 }}>
              Ikke koblet ennå
            </span>
          </div>

          <div style={{ padding: "14px", backgroundColor: "var(--wang-blue-tint)", borderRadius: "4px" }}>
            <span style={{ fontSize: "12px", color: "var(--wang-text-muted)", display: "block" }}>
              Gjennomsnittlig oppmøte
            </span>
            <p className="wg-num" style={{ margin: "4px 0 0", fontSize: "28px", fontWeight: 700, color: "var(--wang-blue)" }}>
              —
            </p>
            <span style={{ fontSize: "11px", color: "var(--wang-text-muted)" }}>
              Ikke koblet ennå
            </span>
          </div>

          <div style={{ padding: "14px", backgroundColor: "var(--wang-blue-tint)", borderRadius: "4px" }}>
            <span style={{ fontSize: "12px", color: "var(--wang-text-muted)", display: "block" }}>
              Totalt treningsvolum
            </span>
            <p className="wg-num" style={{ margin: "4px 0 0", fontSize: "28px", fontWeight: 700, color: "var(--wang-blue)" }}>
              —
            </p>
            <span style={{ fontSize: "11px", color: "var(--wang-text-muted)" }}>
              Ikke koblet ennå
            </span>
          </div>

          <div style={{ padding: "14px", backgroundColor: "var(--wang-blue-tint)", borderRadius: "4px" }}>
            <span style={{ fontSize: "12px", color: "var(--wang-text-muted)", display: "block" }}>
              Neste turnering
            </span>
            <p className="wg-num" style={{ margin: "4px 0 0", fontSize: "20px", fontWeight: 700, color: "var(--wang-blue)" }}>
              —
            </p>
            <span style={{ fontSize: "11px", color: "var(--wang-pink)", fontWeight: 600 }}>
              Ikke koblet ennå
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
