"use client";

import { WangIkkeKoblet, IKKE_KOBLET_KNAPP_STIL } from './WangIkkeKoblet';
import React, { useState } from "react";
import {
  WANG_ELEVER,
  WANG_FYSISKE_TESTER,
  WANG_TEST_RESULTATER,
  WangFysiskTest,
  WangTestResultat,
} from "./wang-data";

interface WangTesterProps {
  valgtFane?: string;
  aktivFane?: string;
  onFaneEndret?: (fane: string) => void;
  campus?: string;
}

export function WangTester({
  valgtFane = "fysisk",
  aktivFane,
  onFaneEndret: _onFaneEndret,
  campus: _campus = "Fredrikstad",
}: WangTesterProps) {
  const [fane, setFane] = useState(aktivFane || valgtFane);
  const [fysiskeTester] = useState<WangFysiskTest[]>(WANG_FYSISKE_TESTER);
  const testKo: WangTestResultat[] = WANG_TEST_RESULTATER;

  // Skjemafelt (ingen lagring er koblet ennå)
  const [valgtElevId, setValgtElevId] = useState(WANG_ELEVER[0]?.id || "");
  const [valgtTestId, setValgtTestId] = useState(WANG_FYSISKE_TESTER[0]?.id || "");
  const [innsendtVerdi, setInnsendtVerdi] = useState("");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* 1. Tittel og faner */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "16px" }}>
        <div>
          <p className="wg-num" style={{ margin: "0 0 6px", fontSize: "12px", fontWeight: 500, color: "var(--wang-text-muted)" }}>
            WANG-48 / WG-03 · Testbatteri & Fysisk
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
            Tester og testbatteri
          </h1>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          <button
            type="button"
            onClick={() => setFane("fysisk")}
            className={`wg-chip ${fane === "fokus" || fane === "fysisk" ? "wg-chip-pa" : ""}`}
          >
            Fysiske tester (WG-03)
          </button>
          <button
            type="button"
            onClick={() => setFane("ko")}
            className={`wg-chip ${fane === "ko" ? "wg-chip-pa" : ""}`}
          >
            Testkø (WANG-37)
          </button>
          <button
            type="button"
            onClick={() => setFane("scorekort")}
            className={`wg-chip ${fane === "scorekort" ? "wg-chip-pa" : ""}`}
          >
            Scorekort (WANG-48B)
          </button>
          <button
            type="button"
            onClick={() => setFane("rangering")}
            className={`wg-chip ${fane === "rangering" ? "wg-chip-pa" : ""}`}
          >
            Rangering (WANG-39)
          </button>
        </div>
      </div>

      {/* 2. WG-03: Fysiske tester (5 nasjonale tester) */}
      {(fane === "fysisk" || fane === "oversikt") && (
        <section className="wg-kort" style={{ padding: "20px" }}>
          <div style={{ marginBottom: "16px" }}>
            <p className="wg-num" style={{ margin: "0 0 4px", fontSize: "11px", color: "var(--wang-text-muted)" }}>
              WG-03 · 5 Nasjonale tester
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
              Nasjonale fysiske tester for WANG Toppidrett
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--wang-text-muted)" }}>
              Standardiserte tester for rotasjonell kraft, maksimal styrke og vertikal spenst.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
            {fysiskeTester.map((t) => (
              <div
                key={t.id}
                style={{
                  padding: "16px",
                  border: "1px solid var(--wang-grey-line)",
                  borderRadius: "4px",
                  backgroundColor: "var(--wang-blue-tint)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--wang-green)", textTransform: "uppercase" }}>
                    {t.kategori}
                  </span>
                  <span className="wg-num" style={{ fontSize: "12px", color: "var(--wang-text-muted)" }}>
                    Enhet: {t.enhet}
                  </span>
                </div>
                <h3 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 700, color: "var(--wang-blue)" }}>
                  {t.navn}
                </h3>
                <p style={{ margin: "0 0 12px", fontSize: "12.5px", color: "var(--wang-text-muted)", lineHeight: 1.4 }}>
                  {t.beskrivelse}
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", borderTop: "1px solid rgba(23, 68, 111, 0.1)", paddingTop: "8px" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--wang-text-muted)", display: "block" }}>
                      Nasj. snitt
                    </span>
                    <span className="wg-num" style={{ fontWeight: 700, fontSize: "16px", color: "var(--wang-blue)" }}>
                      {t.nasjonaltSnitt} {t.enhet}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--wang-text-muted)", display: "block" }}>
                      Nasjonal topp
                    </span>
                    <span className="wg-num" style={{ fontWeight: 700, fontSize: "16px", color: "var(--wang-green)" }}>
                      {t.nasjonalTopp} {t.enhet}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. WANG-37: Testkø (Godkjenn / Kontroller) */}
      {(fane === "ko" || fane === "fysisk") && (
        <section className="wg-kort" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "16px" }}>
            <div>
              <p className="wg-num" style={{ margin: "0 0 4px", fontSize: "11px", color: "var(--wang-text-muted)" }}>
                WANG-37 · Kontroll og godkjenning
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
                Testkø for godkjenning
              </h2>
            </div>
            <span className="wg-num" style={{ fontSize: "12px", color: "var(--wang-text-muted)" }}>
              {testKo.filter((t) => t.status === "Ført").length} venter på kontroll
            </span>
          </div>

          <div style={{ display: "grid", gap: "10px" }}>
            {testKo.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  padding: "14px 16px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid var(--wang-grey-line)",
                  borderRadius: "4px",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                    <span
                      className="wg-st"
                      style={{
                        borderColor:
                          item.status === "Kontrollert"
                            ? "var(--wang-green)"
                            : item.status === "Avvist"
                            ? "var(--wang-pink)"
                            : "var(--wang-orange)",
                      }}
                    >
                      <span
                        className={`wg-dot ${
                          item.status === "Kontrollert"
                            ? "wg-dot-fullfort"
                            : item.status === "Avvist"
                            ? "wg-dot-varsel"
                            : "wg-dot-aktiv"
                        }`}
                      />
                      {item.status}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: "15px", color: "var(--wang-blue)" }}>
                      {item.elevNavn}
                    </span>
                    <span className="wg-num" style={{ fontSize: "13px", fontWeight: 700, color: "var(--wang-blue)" }}>
                      {item.testNavn}: {item.verdi} {item.enhet}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "12.5px", color: "var(--wang-text-muted)" }}>
                    Kilde: {item.protokoll} · Registrert: {item.dato} av {item.registrertAv}
                    {item.notat ? ` · Notat: ${item.notat}` : ""}
                  </p>
                </div>

                {item.status === "Ført" ? (
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      disabled
                      className="wg-btn wg-btn-primary"
                      style={{ minHeight: "36px", padding: "0 12px", fontSize: "12px", ...IKKE_KOBLET_KNAPP_STIL }}
                    >
                      Godkjenn
                    </button>
                    <button
                      type="button"
                      disabled
                      className="wg-btn wg-btn-secondary"
                      style={{ minHeight: "36px", padding: "0 12px", fontSize: "12px", ...IKKE_KOBLET_KNAPP_STIL }}
                    >
                      Avvis
                    </button>
                    <WangIkkeKoblet />
                  </div>
                ) : (
                  <span className="wg-num" style={{ fontSize: "12px", color: "var(--wang-text-muted)", fontWeight: 500 }}>
                    {item.status === "Kontrollert" ? "Flyttet til profil" : "Avslått"}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. WANG-48B: Scorekort / Registrer testresultat */}
      {(fane === "scorekort" || fane === "ko") && (
        <section className="wg-kort" style={{ padding: "20px" }}>
          <p className="wg-num" style={{ margin: "0 0 4px", fontSize: "11px", color: "var(--wang-text-muted)" }}>
            WANG-48B · Scorekort
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
            Registrer nytt testresultat
          </h2>

          <form onSubmit={(e) => e.preventDefault()} style={{ display: "grid", gap: "16px", maxWidth: "600px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="wg-lbl">
                <span>Velg elev</span>
                <select
                  value={valgtElevId}
                  onChange={(e) => setValgtElevId(e.target.value)}
                  className="wg-field"
                >
                  {WANG_ELEVER.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.navn} ({e.trinn})
                    </option>
                  ))}
                </select>
              </div>

              <div className="wg-lbl">
                <span>Velg test</span>
                <select
                  value={valgtTestId}
                  onChange={(e) => setValgtTestId(e.target.value)}
                  className="wg-field"
                >
                  {WANG_FYSISKE_TESTER.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.navn} ({t.enhet})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="wg-lbl">
              <span>Målt resultat</span>
              <input
                type="text"
                value={innsendtVerdi}
                onChange={(e) => setInnsendtVerdi(e.target.value)}
                placeholder="F.eks. 1.85 eller 16.5"
                className="wg-field"
                required
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <button
                type="submit"
                disabled
                className="wg-btn wg-btn-primary"
                style={{ width: "fit-content", ...IKKE_KOBLET_KNAPP_STIL }}
              >
                Lagre og godkjenn resultat
              </button>
              <WangIkkeKoblet />
            </div>
          </form>
        </section>
      )}

      {/* 5. WANG-39: Rangering og persentiler */}
      {(fane === "rangering" || fane === "fysisk") && (
        <section className="wg-kort" style={{ padding: "20px" }}>
          <div style={{ marginBottom: "16px" }}>
            <p className="wg-num" style={{ margin: "0 0 4px", fontSize: "11px", color: "var(--wang-text-muted)" }}>
              WANG-39 · Nasjonal rangering
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
              Toppliste Trapbar Markløft (relativ styrke x KV)
            </h2>
          </div>

          <div style={{ display: "grid", gap: "8px" }}>
            {WANG_ELEVER.slice()
              .sort((a, b) => b.snittscore - a.snittscore)
              .map((elev, idx) => (
                <div
                  key={elev.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 16px",
                    backgroundColor: idx === 0 ? "var(--wang-green-tint, #EEF6F5)" : "var(--wang-blue-tint)",
                    borderRadius: "4px",
                    borderLeft: idx < 3 ? "4px solid var(--wang-green)" : "1px solid var(--wang-grey-line)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span className="wg-num" style={{ fontWeight: 700, fontSize: "14px", width: "24px" }}>
                      #{idx + 1}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--wang-blue)" }}>
                      {elev.navn}
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--wang-text-muted)" }}>
                      {elev.trinn} · {elev.klubb}
                    </span>
                  </div>

                  <span className="wg-num" style={{ fontWeight: 700, fontSize: "15px", color: "var(--wang-blue)" }}>
                    HCP {elev.hcp}
                  </span>
                </div>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
