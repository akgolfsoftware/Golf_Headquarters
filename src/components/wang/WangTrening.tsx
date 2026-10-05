"use client";

import React, { useState } from "react";
import { WANG_ELEVER, WangElev } from "./wang-data";

interface WangTreningProps {
  valgtFane?: string;
  aktivFane?: string;
  onFaneEndret?: (fane: string) => void;
  campus?: string;
}

export function WangTrening({
  valgtFane = "oversikt",
  aktivFane,
  onFaneEndret: _onFaneEndret,
  campus: _campus = "Fredrikstad",
}: WangTreningProps) {
  const [fane, setFane] = useState(aktivFane || valgtFane);
  const [elever] = useState<WangElev[]>(WANG_ELEVER);
  const [valgtTrinn, setValgtTrinn] = useState<string>("alle");

  const filtrerteElever = elever.filter((e) =>
    valgtTrinn === "alle" ? true : e.trinn === valgtTrinn
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* 1. Tittel og faner */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "16px" }}>
        <div>
          <p className="wg-num" style={{ margin: "0 0 6px", fontSize: "12px", fontWeight: 500, color: "var(--wang-text-muted)" }}>
            WANG-42 · Trening · Høst 2026
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
            Trening og etterlevelse
          </h1>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          <button
            type="button"
            onClick={() => setFane("oversikt")}
            className={`wg-chip ${fane === "oversikt" ? "wg-chip-pa" : ""}`}
          >
            Oversikt (WANG-42)
          </button>
          <button
            type="button"
            onClick={() => setFane("oppmote")}
            className={`wg-chip ${fane === "oppmote" ? "wg-chip-pa" : ""}`}
          >
            Oppmøte (WANG-38)
          </button>
          <button
            type="button"
            onClick={() => setFane("periode")}
            className={`wg-chip ${fane === "periode" ? "wg-chip-pa" : ""}`}
          >
            Årsplan & periode (WANG-29/16)
          </button>
          <button
            type="button"
            onClick={() => setFane("morgen")}
            className={`wg-chip ${fane === "morgen" ? "wg-chip-pa" : ""}`}
          >
            Morgenøkter (WANG-04)
          </button>
        </div>
      </div>

      {/* 2. Filter på trinn */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--wang-blue)" }}>
          Filtrer trinn:
        </span>
        <button
          type="button"
          onClick={() => setValgtTrinn("alle")}
          className={`wg-chip ${valgtTrinn === "alle" ? "wg-chip-pa" : ""}`}
          style={{ minHeight: "36px", padding: "0 14px", fontSize: "12px" }}
        >
          Alle ({elever.length})
        </button>
        <button
          type="button"
          onClick={() => setValgtTrinn("VG1")}
          className={`wg-chip ${valgtTrinn === "VG1" ? "wg-chip-pa" : ""}`}
          style={{ minHeight: "36px", padding: "0 14px", fontSize: "12px" }}
        >
          VG1 (4)
        </button>
        <button
          type="button"
          onClick={() => setValgtTrinn("VG2")}
          className={`wg-chip ${valgtTrinn === "VG2" ? "wg-chip-pa" : ""}`}
          style={{ minHeight: "36px", padding: "0 14px", fontSize: "12px" }}
        >
          VG2 (4)
        </button>
        <button
          type="button"
          onClick={() => setValgtTrinn("VG3")}
          className={`wg-chip ${valgtTrinn === "VG3" ? "wg-chip-pa" : ""}`}
          style={{ minHeight: "36px", padding: "0 14px", fontSize: "12px" }}
        >
          VG3 (4)
        </button>
      </div>

      {/* 3. WANG-42: Treningsoversikt (Etterlevelse = tid mot plan siste 4 uker) */}
      {(fane === "oversikt" || fane === "oppmote") && (
        <section className="wg-kort">
          <div style={{ padding: "20px", borderBottom: "1px solid var(--wang-grey-line)" }}>
            <p className="wg-num" style={{ margin: "0 0 4px", fontSize: "11px", color: "var(--wang-text-muted)" }}>
              WANG-42 / WANG-38 · Siste 4 uker
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
              Etterlevelse og oppmøte per elev
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--wang-text-muted)" }}>
              Etterlevelse beregnes som faktisk gjennomførte minutter mot planlagte minutter med passert sluttid.
            </p>
          </div>

          <div style={{ overflowX: "auto" }}>
            <div className="wg-trow wg-thead">
              <span>Elev</span>
              <span>Trinn</span>
              <span>HCP</span>
              <span>Etterlevelse (4 uker)</span>
              <span>Tid (gj. / plan)</span>
              <span>Oppmøte</span>
              <span>Status</span>
            </div>

            {filtrerteElever.map((elev) => {
              const erLav = elev.etterlevelseProsent < 80;
              return (
                <div key={elev.id} className="wg-trow">
                  <div>
                    <span style={{ fontWeight: 600, color: "var(--wang-blue)", display: "block" }}>
                      {elev.navn}
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--wang-text-muted)" }}>
                      {elev.klubb}
                    </span>
                  </div>

                  <span className="wg-num" style={{ fontWeight: 500 }}>
                    {elev.trinn}
                  </span>

                  <span className="wg-num" style={{ fontWeight: 600, color: "var(--wang-blue)" }}>
                    {elev.hcp}
                  </span>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span
                        className="wg-num"
                        style={{
                          fontWeight: 700,
                          fontSize: "13px",
                          color: erLav ? "var(--wang-pink)" : "var(--wang-green)",
                        }}
                      >
                        {elev.etterlevelseProsent} %
                      </span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "6px",
                        backgroundColor: "var(--wang-grey-line)",
                        borderRadius: "3px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(elev.etterlevelseProsent, 100)}%`,
                          height: "100%",
                          backgroundColor: erLav ? "var(--wang-pink)" : "var(--wang-green)",
                          borderRadius: "3px",
                        }}
                      />
                    </div>
                  </div>

                  <span className="wg-num" style={{ fontSize: "12px", color: "var(--wang-text-muted)" }}>
                    {Math.round(elev.gjennomfortMinutter / 60)} t / {Math.round(elev.planlagtMinutter / 60)} t
                  </span>

                  <div>
                    <span className="wg-num" style={{ fontWeight: 600, fontSize: "13px" }}>
                      {elev.oppmoteAntall} / 20 økter
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--wang-text-muted)", display: "block" }}>
                      {elev.fravaerProsent} % fravær
                    </span>
                  </div>

                  <div>
                    {elev.trengerOppfolging ? (
                      <span className="wg-st" style={{ borderColor: "var(--wang-pink)", color: "var(--wang-pink)" }}>
                        <span className="wg-dot wg-dot-varsel" />
                        Følg opp
                      </span>
                    ) : (
                      <span className="wg-st" style={{ borderColor: "var(--wang-green)", color: "var(--wang-green)" }}>
                        <span className="wg-dot wg-dot-fullfort" />
                        I rute
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. WANG-29 / WANG-16: Årsplan og Periodisering */}
      {(fane === "oversikt" || fane === "periode") && (
        <section className="wg-kort" style={{ padding: "20px" }}>
          <div style={{ marginBottom: "16px" }}>
            <p className="wg-num" style={{ margin: "0 0 4px", fontSize: "11px", color: "var(--wang-text-muted)" }}>
              WANG-29 / WANG-16 · Periodisering
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
              Gjeldende periode: Spesialperiode Høst (Uke 36–43)
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            <div style={{ padding: "16px", backgroundColor: "var(--wang-blue-tint)", borderRadius: "4px" }}>
              <span className="wg-num" style={{ fontSize: "11px", fontWeight: 600, color: "var(--wang-text-muted)" }}>
                PERIODE 1
              </span>
              <h3 style={{ margin: "4px 0", fontSize: "16px", fontWeight: 600, color: "var(--wang-blue)" }}>
                Grunntrening & sving
              </h3>
              <p style={{ margin: "0 0 8px", fontSize: "12px", color: "var(--wang-text-muted)" }}>
                Uke 33–35 · Fullført
              </p>
              <span className="wg-st" style={{ backgroundColor: "#FFFFFF" }}>
                <span className="wg-dot wg-dot-fullfort" />
                Avsluttet
              </span>
            </div>

            <div style={{ padding: "16px", backgroundColor: "var(--wang-green-tint, #EEF6F5)", borderRadius: "4px", border: "1px solid var(--wang-green)" }}>
              <span className="wg-num" style={{ fontSize: "11px", fontWeight: 600, color: "var(--wang-green)" }}>
                PERIODE 2 (NÅ)
              </span>
              <h3 style={{ margin: "4px 0", fontSize: "16px", fontWeight: 700, color: "var(--wang-blue)" }}>
                Spesialperiode & spissing
              </h3>
              <p style={{ margin: "0 0 8px", fontSize: "12px", color: "var(--wang-text-muted)" }}>
                Uke 36–43 · 4 uker gjenstår
              </p>
              <span className="wg-st" style={{ backgroundColor: "#FFFFFF" }}>
                <span className="wg-dot wg-dot-aktiv" />
                Aktiv periode
              </span>
            </div>

            <div style={{ padding: "16px", backgroundColor: "var(--wang-blue-tint)", borderRadius: "4px" }}>
              <span className="wg-num" style={{ fontSize: "11px", fontWeight: 600, color: "var(--wang-text-muted)" }}>
                PERIODE 3
              </span>
              <h3 style={{ margin: "4px 0", fontSize: "16px", fontWeight: 600, color: "var(--wang-blue)" }}>
                Turneringsavslutning
              </h3>
              <p style={{ margin: "0 0 8px", fontSize: "12px", color: "var(--wang-text-muted)" }}>
                Uke 44–46 · Planlagt
              </p>
              <span className="wg-st" style={{ backgroundColor: "#FFFFFF" }}>
                <span className="wg-dot wg-dot-planlagt" />
                Kommende
              </span>
            </div>

            <div style={{ padding: "16px", backgroundColor: "var(--wang-blue-tint)", borderRadius: "4px" }}>
              <span className="wg-num" style={{ fontSize: "11px", fontWeight: 600, color: "var(--wang-text-muted)" }}>
                PERIODE 4
              </span>
              <h3 style={{ margin: "4px 0", fontSize: "16px", fontWeight: 600, color: "var(--wang-blue)" }}>
                Vinteroppkjøring
              </h3>
              <p style={{ margin: "0 0 8px", fontSize: "12px", color: "var(--wang-text-muted)" }}>
                Uke 47–02 · Planlagt
              </p>
              <span className="wg-st" style={{ backgroundColor: "#FFFFFF" }}>
                <span className="wg-dot wg-dot-planlagt" />
                Kommende
              </span>
            </div>
          </div>
        </section>
      )}

      {/* 5. WANG-04: Morgenøkter */}
      {(fane === "oversikt" || fane === "morgen") && (
        <section className="wg-kort" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "16px" }}>
            <div>
              <p className="wg-num" style={{ margin: "0 0 4px", fontSize: "11px", color: "var(--wang-text-muted)" }}>
                WANG-04 · Morgenøkter
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
                Faste morgenøkter (Tirsdag & Torsdag 08:00)
              </h2>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            <div style={{ padding: "16px", border: "1px solid var(--wang-grey-line)", borderRadius: "4px" }}>
              <span className="wg-num" style={{ fontSize: "12px", fontWeight: 600, color: "var(--wang-blue)" }}>
                Tirsdager 08:00–10:00
              </span>
              <h3 style={{ margin: "4px 0", fontSize: "15px", fontWeight: 600, color: "var(--wang-blue)" }}>
                Teknikk, TrackMan & langslag
              </h3>
              <p style={{ margin: "0 0 10px", fontSize: "13px", color: "var(--wang-text-muted)" }}>
                Gamle Fredrikstad GK simulator / range. Hovedtrener: Anders Kristiansen.
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                <span className="wg-chip" style={{ minHeight: "26px", fontSize: "11px" }}>
                  12 plasser
                </span>
                <span className="wg-chip" style={{ minHeight: "26px", fontSize: "11px" }}>
                  Obligatorisk
                </span>
              </div>
            </div>

            <div style={{ padding: "16px", border: "1px solid var(--wang-grey-line)", borderRadius: "4px" }}>
              <span className="wg-num" style={{ fontSize: "12px", fontWeight: 600, color: "var(--wang-blue)" }}>
                Torsdager 08:00–10:00
              </span>
              <h3 style={{ margin: "4px 0", fontSize: "15px", fontWeight: 600, color: "var(--wang-blue)" }}>
                Nærspill, putting & scoring
              </h3>
              <p style={{ margin: "0 0 10px", fontSize: "13px", color: "var(--wang-text-muted)" }}>
                Onsøy GK treningsgreen. Hovedtrener: Anders Kristiansen.
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                <span className="wg-chip" style={{ minHeight: "26px", fontSize: "11px" }}>
                  12 plasser
                </span>
                <span className="wg-chip" style={{ minHeight: "26px", fontSize: "11px" }}>
                  Obligatorisk
                </span>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
