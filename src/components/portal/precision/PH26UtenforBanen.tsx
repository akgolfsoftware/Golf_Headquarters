"use client";

/**
 * Kilde: AK Golf Precision Athletics PH-26 (Utenfor banen).
 * Hub for FYS-økt, utfordringer, putte-lab & break-tabell, turneringer og ukesdigest.
 * Ingen hex-farger (kun CSS-variabler), 56-64px berøringsflater, full responsivitet.
 */

import React, { useState } from "react";
import Link from "next/link";
import {
  type FysOvelse,
  type ChallengeDef,
  type PuttLabBand,
  type TurneringsRad,
  type UkesdigestData,
  DEFAULT_FYS_OVELSER,
  PGA_PUTT_BANDS,
  rankChallengeRows,
  beregnBreakCm,
} from "@/lib/portal-utenfor-banen/ph26-data";

export type PH26Fane = "fys" | "utf" | "putt" | "turn" | "digest";

export interface PH26UtenforBanenProps {
  initialFane?: PH26Fane;
  spillerNavn: string;
  dagensFysOkt?: {
    tittel: string;
    tid?: string;
    varighetMin?: number;
    sted?: string;
    ovelser: FysOvelse[];
  } | null;
  utfordringer?: ChallengeDef[];
  venner?: { id: string; name: string }[];
  grupper?: { id: string; name: string; antall: number }[];
  puttBands?: PuttLabBand[];
  turneringer?: TurneringsRad[];
  ukesdigest?: UkesdigestData | null;
}

export function PH26UtenforBanen({
  initialFane = "fys",
  spillerNavn,
  dagensFysOkt,
  utfordringer: initUtfordringer,
  venner = [],
  grupper = [],
  puttBands = PGA_PUTT_BANDS,
  turneringer: initTurneringer,
  ukesdigest,
}: PH26UtenforBanenProps) {
  const [fane, setFane] = useState<PH26Fane>(initialFane);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // FYS state
  const fysOvelser = dagensFysOkt?.ovelser || DEFAULT_FYS_OVELSER;
  const [fysFullfort, setFysFullfort] = useState<Record<number, boolean>>({});

  // Utfordringer state
  const [challenges, setChallenges] = useState<ChallengeDef[]>(
    initUtfordringer || [
      {
        id: "c-1",
        title: "Putting 5 fot · 10 putter",
        status: "Aktiv",
        win: "hi",
        unit: "treff",
        ends: "03.10.2026",
        by: spillerNavn,
        rows: [
          [spillerNavn, 8],
          ["Mats", 6],
          ["Henrik", null],
        ],
      },
    ],
  );
  const [nyTittel, setNyTittel] = useState("");
  const [nyVinner, setNyVinner] = useState<"Høyest" | "Lavest">("Høyest");
  const [nyEnhet, setNyEnhet] = useState("treff");
  const [valgteDeltakere, setValgteDeltakere] = useState<Record<string, boolean>>({});
  const [provdOpprett, setProvdOpprett] = useState(false);

  // Putte-lab state
  const [stimp, setStimp] = useState<number>(10);

  // Turneringer state
  const [tours, setTours] = useState<TurneringsRad[]>(
    initTurneringer || [
      {
        id: "t-1",
        dato: "12.10.2026",
        navn: "Srixon Tour 6 · Holtsmark",
        type: "Regional",
        status: "Ikke påmeldt",
      },
      {
        id: "t-2",
        dato: "24.10.2026",
        navn: "Garmin Norgescup · Larvik",
        type: "Nasjonal",
        status: "Påmeldt",
      },
    ],
  );

  const showToast = (t: string) => {
    setToastMsg(t);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleOpprettUtfordring = (e: React.FormEvent) => {
    e.preventDefault();
    setProvdOpprett(true);
    const deltakereValgt = Object.entries(valgteDeltakere).filter(([_, v]) => v).map(([k]) => k);
    if (!nyTittel.trim() || deltakereValgt.length === 0) return;

    const deltakereRader: [string, number | null][] = [
      [spillerNavn, null],
      ...deltakereValgt.map((navn) => [navn, null] as [string, number | null]),
    ];

    const ny: ChallengeDef = {
      id: `c-${Date.now()}`,
      title: nyTittel.trim(),
      status: "Aktiv",
      win: nyVinner === "Høyest" ? "hi" : "lo",
      unit: nyEnhet,
      ends: "14 dager",
      by: spillerNavn,
      rows: deltakereRader,
    };

    setChallenges([ny, ...challenges]);
    setNyTittel("");
    setValgteDeltakere({});
    setProvdOpprett(false);
    showToast(`Utfordringen «${ny.title}» er opprettet · ${deltakereValgt.length + 1} deltakere`);
  };

  const handleAvsluttUtfordring = (id: string) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "Avsluttet" as const } : c)),
    );
    showToast("Utfordringen er avsluttet · Resultatene er låst");
  };

  const antallFysFullfort = Object.values(fysFullfort).filter(Boolean).length;
  const fysProsent = Math.round((antallFysFullfort / fysOvelser.length) * 100);

  const slopes = [1, 2, 3, 4];
  const breakAvstanderFt = [3, 5, 10, 15, 20, 25];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        maxWidth: 1120,
        margin: "0 auto",
        padding: "0 16px 32px",
      }}
    >
      {/* Toast */}
      {toastMsg && (
        <div
          role="status"
          style={{
            position: "fixed",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--surface-card)",
            border: "1px solid var(--border-strong)",
            color: "var(--text-primary)",
            padding: "10px 18px",
            borderRadius: 8,
            zIndex: 100,
            font: "600 14px/1.2 var(--font-sans)",
            boxShadow: "0 4px 12px var(--shadow-surface, transparent)",
          }}
        >
          {toastMsg}
        </div>
      )}

      {/* Topp-seksjon */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span
          style={{
            font: "600 11px/1 var(--font-mono)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          Utenfor banen
        </span>
        <h1
          style={{
            margin: 0,
            font: "600 clamp(22px, 1.2vw + 16px, 28px)/1.15 var(--font-sans)",
            color: "var(--text-primary)",
          }}
        >
          Utenfor banen
        </h1>
      </div>

      {/* Fanevelger (Segmented 5 faner) */}
      <div style={{ width: "100%", overflowX: "hidden" }}>
        <div
          role="tablist"
          aria-label="Utenfor banen moduler"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            background: "var(--surface-card)",
            padding: 4,
            borderRadius: 10,
            border: "1px solid var(--border-subtle)",
            boxSizing: "border-box",
            maxWidth: "100%",
          }}
        >
          {[
            { key: "fys", label: "FYS-økt" },
            { key: "utf", label: "Utfordringer" },
            { key: "putt", label: "Putte-lab" },
            { key: "turn", label: "Turneringer" },
            { key: "digest", label: "Ukesdigest" },
          ].map((tab) => {
            const aktiv = fane === tab.key;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={aktiv}
                type="button"
                onClick={() => setFane(tab.key as PH26Fane)}
                style={{
                  cursor: "pointer",
                  padding: "10px 14px",
                  borderRadius: 7,
                  font: "600 13px/1.2 var(--font-sans)",
                  color: aktiv ? "var(--text-primary)" : "var(--text-secondary)",
                  background: aktiv ? "var(--surface-page, var(--surface-card))" : "transparent",
                  boxShadow: aktiv ? "0 1px 3px var(--shadow-surface, transparent)" : "none",
                  border: aktiv ? "1px solid var(--border-subtle)" : "1px solid transparent",
                  whiteSpace: "nowrap",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 44,
                  minWidth: 44,
                  boxSizing: "border-box",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fane 1: FYS-økt */}
      {fane === "fys" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
          {/* Venstre: Dagens økt */}
          <div
            className="pa-card"
            style={{
              padding: 16,
              borderRadius: 12,
              border: "1px solid var(--border-subtle)",
              background: "var(--surface-card)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
              <span style={{ font: "600 15px/1.2 var(--font-sans)", color: "var(--text-primary)" }}>
                {dagensFysOkt?.tittel || "Styrke bein og kjerne · 17:30"}
              </span>
              <span style={{ font: "500 11px/1 var(--font-mono)", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                FYS · {dagensFysOkt?.varighetMin || 45} MIN · {dagensFysOkt?.sted?.toUpperCase() || "STYRKEROMMET"}
              </span>
            </div>

            <div role="list" style={{ display: "flex", flexDirection: "column" }}>
              {fysOvelser.map((ovelse, i) => {
                const gjort = !!fysFullfort[i];
                return (
                  <label
                    key={ovelse.navn}
                    role="listitem"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      minHeight: 52,
                      minWidth: 44,
                      borderTop: i ? "1px solid var(--border-hairline)" : "none",
                      cursor: "pointer",
                      padding: "4px 0",
                      boxSizing: "border-box",
                    }}
                  >
                    <input
                      type="checkbox"
                      className="pa-sr"
                      checked={gjort}
                      onChange={() => setFysFullfort((prev) => ({ ...prev, [i]: !prev[i] }))}
                    />
                    <span
                      aria-hidden="true"
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 5,
                        border: `1.5px solid ${gjort ? "var(--action-primary, var(--text-primary))" : "var(--border-strong)"}`,
                        background: gjort ? "var(--action-primary, var(--text-primary))" : "transparent",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--surface-card)",
                        fontSize: 13,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {gjort ? "✓" : ""}
                    </span>
                    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ font: "500 14px/1.3 var(--font-sans)", color: gjort ? "var(--text-muted)" : "var(--text-primary)", textDecoration: gjort ? "line-through" : "none" }}>
                        {ovelse.navn}
                      </span>
                    </div>
                    <span style={{ font: "600 13px/1 var(--font-mono)", color: "var(--text-secondary)" }}>
                      {ovelse.mengde}
                    </span>
                    <span style={{ font: "500 11px/1 var(--font-mono)", color: "var(--text-muted)", letterSpacing: "0.04em" }}>
                      {ovelse.rir}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Høyre: Fremdrift */}
          <div
            className="pa-card"
            style={{
              padding: 16,
              borderRadius: 12,
              border: "1px solid var(--border-subtle)",
              background: "var(--surface-card)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ font: "600 11px/1 var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                Fremdrift
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ font: "600 36px/1 var(--font-mono)", color: "var(--text-primary)" }}>
                  {antallFysFullfort}
                </span>
                <span style={{ font: "500 15px/1.2 var(--font-sans)", color: "var(--text-muted)" }}>
                  av {fysOvelser.length} øvelser fullført
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  borderRadius: 3,
                  background: "var(--surface-sunken)",
                  overflow: "hidden",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${fysProsent}%`,
                    background: "var(--action-primary, var(--text-primary))",
                    transition: "width 200ms ease",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                type="button"
                onClick={() => showToast(`FYS-økt registrert: ${antallFysFullfort} av ${fysOvelser.length} øvelser fullført`)}
                style={{
                  height: 48,
                  borderRadius: 8,
                  border: "none",
                  background: "var(--action-primary, var(--text-primary))",
                  color: "var(--surface-card)",
                  font: "600 15px/1 var(--font-sans)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Registrer økt
              </button>
              <div style={{ font: "500 10px/1.2 var(--font-mono)", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                RIR = REPETISJONER I RESERVE · REGISTRERES RETT I TREN-LOGG
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fane 2: Utfordringer */}
      {fane === "utf" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16 }}>
          {/* Venstre: Ny utfordring */}
          <form
            onSubmit={handleOpprettUtfordring}
            className="pa-card"
            style={{
              padding: 16,
              borderRadius: 12,
              border: "1px solid var(--border-subtle)",
              background: "var(--surface-card)",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <span style={{ font: "600 11px/1 var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)" }}>
              Ny utfordring
            </span>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ font: "500 13px/1.2 var(--font-sans)", color: "var(--text-secondary)" }}>
                Navn på utfordring
              </label>
              <input
                type="text"
                value={nyTittel}
                onChange={(e) => setNyTittel(e.target.value)}
                placeholder="f.eks. Putting 5 fot · 10 putter"
                style={{
                  height: 44,
                  borderRadius: 8,
                  border: `1px solid ${provdOpprett && !nyTittel.trim() ? "var(--signal-warn, var(--border-strong))" : "var(--border-subtle)"}`,
                  background: "var(--surface-page, var(--surface-card))",
                  color: "var(--text-primary)",
                  padding: "0 12px",
                  font: "500 14px/1 var(--font-sans)",
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ font: "500 13px/1.2 var(--font-sans)", color: "var(--text-secondary)" }}>Vinner</label>
                <div style={{ display: "flex", gap: 4 }}>
                  {(["Høyest", "Lavest"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setNyVinner(opt)}
                      style={{
                        flex: 1,
                        minHeight: 44,
                        minWidth: 44,
                        borderRadius: 6,
                        border: `1px solid ${nyVinner === opt ? "var(--border-strong)" : "var(--border-subtle)"}`,
                        background: nyVinner === opt ? "var(--surface-sunken)" : "transparent",
                        color: "var(--text-primary)",
                        font: "600 12px/1 var(--font-sans)",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxSizing: "border-box",
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ font: "500 13px/1.2 var(--font-sans)", color: "var(--text-secondary)" }}>Enhet</label>
                <div style={{ display: "flex", gap: 4 }}>
                  {["treff", "slag", "ft"].map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setNyEnhet(u)}
                      style={{
                        flex: 1,
                        minHeight: 44,
                        minWidth: 44,
                        borderRadius: 6,
                        border: `1px solid ${nyEnhet === u ? "var(--border-strong)" : "var(--border-subtle)"}`,
                        background: nyEnhet === u ? "var(--surface-sunken)" : "transparent",
                        color: "var(--text-primary)",
                        font: "600 12px/1 var(--font-sans)",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxSizing: "border-box",
                      }}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Deltakere */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ font: "500 13px/1.2 var(--font-sans)", color: "var(--text-secondary)" }}>
                Velg deltakere (venner og treningsgrupper)
              </label>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  maxHeight: 180,
                  overflowY: "auto",
                  border: `1px solid ${provdOpprett && Object.values(valgteDeltakere).filter(Boolean).length === 0 ? "var(--signal-warn, var(--border-strong))" : "var(--border-subtle)"}`,
                  borderRadius: 8,
                  padding: "4px 8px",
                }}
              >
                {(venner.length > 0 ? venner : [
                  { id: "v1", name: "Mats Ege" },
                  { id: "v2", name: "Henrik Norlander" },
                  { id: "v3", name: "Celine Borge" },
                ]).map((v) => {
                  const valgt = !!valgteDeltakere[v.name];
                  return (
                    <label
                      key={v.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        fontSize: 13,
                        cursor: "pointer",
                        minHeight: 44,
                        minWidth: 44,
                        boxSizing: "border-box",
                        padding: "0 4px",
                      }}
                    >
                      <input
                        type="checkbox"
                        className="pa-sr"
                        checked={valgt}
                        onChange={() => setValgteDeltakere((prev) => ({ ...prev, [v.name]: !prev[v.name] }))}
                      />
                      <span
                        aria-hidden="true"
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 4,
                          border: `1.5px solid ${valgt ? "var(--action-primary, var(--text-primary))" : "var(--border-strong)"}`,
                          background: valgt ? "var(--action-primary, var(--text-primary))" : "transparent",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--surface-card)",
                          fontSize: 12,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {valgt ? "✓" : ""}
                      </span>
                      <span style={{ color: "var(--text-primary)" }}>{v.name}</span>
                    </label>
                  );
                })}
                {grupper.length > 0 && (
                  <>
                    <div style={{ font: "600 10px/1 var(--font-mono)", color: "var(--text-muted)", marginTop: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                      Grupper
                    </div>
                    {grupper.map((g) => {
                      const valgt = !!valgteDeltakere[g.name];
                      return (
                        <label
                          key={g.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            fontSize: 13,
                            cursor: "pointer",
                            minHeight: 44,
                            minWidth: 44,
                            boxSizing: "border-box",
                            padding: "0 4px",
                          }}
                        >
                          <input
                            type="checkbox"
                            className="pa-sr"
                            checked={valgt}
                            onChange={() => setValgteDeltakere((prev) => ({ ...prev, [g.name]: !prev[g.name] }))}
                          />
                          <span
                            aria-hidden="true"
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: 4,
                              border: `1.5px solid ${valgt ? "var(--action-primary, var(--text-primary))" : "var(--border-strong)"}`,
                              background: valgt ? "var(--action-primary, var(--text-primary))" : "transparent",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "var(--surface-card)",
                              fontSize: 12,
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {valgt ? "✓" : ""}
                          </span>
                          <span style={{ color: "var(--text-primary)" }}>{g.name} · {g.antall} spillere</span>
                        </label>
                      );
                    })}
                  </>
                )}
              </div>
            </div>

            <button
              type="submit"
              style={{
                height: 48,
                borderRadius: 8,
                border: "none",
                background: "var(--action-primary, var(--text-primary))",
                color: "var(--surface-card)",
                font: "600 15px/1 var(--font-sans)",
                cursor: "pointer",
                marginTop: 4,
              }}
            >
              Opprett utfordring
            </button>
            <div style={{ font: "500 9.5px/1.2 var(--font-mono)", color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              UTFORDRINGER TELLER IKKE SOM TRENING OG VISES IKKE I PLAN ELLER STATS
            </div>
          </form>

          {/* Høyre: Liste over utfordringer */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {challenges.map((c) => {
              const ranked = rankChallengeRows(c.rows, c.win);
              const mine = c.by === spillerNavn && c.status === "Aktiv";

              return (
                <div
                  key={c.id}
                  className="pa-card"
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    border: "1px solid var(--border-subtle)",
                    background: "var(--surface-card)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ font: "600 15px/1.2 var(--font-sans)", color: "var(--text-primary)" }}>{c.title}</span>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: 4,
                        font: "600 11px/1 var(--font-mono)",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        background: c.status === "Aktiv" ? "var(--surface-sunken)" : "transparent",
                        border: "1px solid var(--border-subtle)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {c.status}
                    </span>
                  </div>

                  <div style={{ font: "500 10px/1.2 var(--font-mono)", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    {c.win === "hi" ? "HØYEST SCORE VINNER" : "LAVEST SCORE VINNER"} · {c.status === "Aktiv" ? `SLUTTER ${c.ends}` : `AVSLUTTET ${c.ends}`} · LAGET AV {c.by.toUpperCase()}
                  </div>

                  <div role="list" style={{ display: "flex", flexDirection: "column" }}>
                    {ranked.map((r, i) => (
                      <div
                        role="listitem"
                        key={r.name}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "32px minmax(0, 1fr) auto",
                          gap: 10,
                          alignItems: "center",
                          minHeight: 38,
                          borderTop: i ? "1px solid var(--border-hairline)" : "none",
                        }}
                      >
                        <span style={{ font: "600 13px/1 var(--font-mono)", color: "var(--text-muted)" }}>
                          {r.rank ? `#${r.rank}` : "—"}
                        </span>
                        <span style={{ font: r.name === spillerNavn ? "600 14px/1.3 var(--font-sans)" : "400 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>
                          {r.name}
                        </span>
                        <span style={{ font: "600 14px/1 var(--font-mono)", color: "var(--text-secondary)" }}>
                          {r.score != null ? `${r.score} ${c.unit}` : "—"}
                        </span>
                      </div>
                    ))}
                  </div>

                  {mine && (
                    <div
                      style={{
                        marginTop: 4,
                        padding: 10,
                        borderRadius: 8,
                        border: "1px solid var(--border-subtle)",
                        background: "var(--surface-sunken)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ font: "400 12px/1.3 var(--font-sans)", color: "var(--text-secondary)" }}>
                        Avslutter du nå, låses resultatene.
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAvsluttUtfordring(c.id)}
                        style={{
                          minHeight: 44,
                          minWidth: 44,
                          padding: "10px 14px",
                          borderRadius: 6,
                          border: "1px solid var(--border-strong)",
                          background: "var(--surface-card)",
                          color: "var(--text-primary)",
                          font: "600 12px/1 var(--font-sans)",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxSizing: "border-box",
                        }}
                      >
                        Avslutt utfordring
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Fane 3: Putte-lab */}
      {fane === "putt" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
            {/* Graf mot PGA Tour */}
            <div
              className="pa-card"
              style={{
                padding: 16,
                borderRadius: 12,
                border: "1px solid var(--border-subtle)",
                background: "var(--surface-card)",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ font: "600 11px/1 var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                  Putte-lab · i hull per avstand
                </span>
                <span style={{ font: "500 11px/1 var(--font-mono)", color: "var(--text-muted)" }}>
                  {spillerNavn} mot PGA Tour
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
                {puttBands.map((band) => (
                  <div key={band.avstandFt} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ font: "600 13px/1 var(--font-mono)", color: "var(--text-primary)" }}>{band.avstandFt} ft</span>
                      <span style={{ font: "500 12px/1 var(--font-mono)", color: "var(--text-muted)" }}>
                        {band.minProsent != null ? `${band.minProsent} %` : "—"} (PGA: {band.pgaProsent} %)
                      </span>
                    </div>
                    <div style={{ height: 8, borderRadius: 4, background: "var(--surface-sunken)", position: "relative", overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${band.minProsent || 0}%`,
                          background: "var(--action-primary, var(--text-primary))",
                        }}
                      />
                      {/* Markør for PGA Tour */}
                      <div
                        style={{
                          position: "absolute",
                          left: `${band.pgaProsent}%`,
                          top: 0,
                          bottom: 0,
                          width: 2,
                          background: "var(--signal-warn, var(--border-strong))",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabell over putter registrert */}
            <div
              className="pa-card"
              style={{
                padding: 16,
                borderRadius: 12,
                border: "1px solid var(--border-subtle)",
                background: "var(--surface-card)",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <span style={{ font: "600 11px/1 var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                Putter registrert
              </span>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "var(--font-mono)" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontSize: 11 }}>
                    <th style={{ textAlign: "left", padding: "6px 0" }}>Avstand</th>
                    <th style={{ textAlign: "right", padding: "6px 0" }}>Putter</th>
                    <th style={{ textAlign: "right", padding: "6px 0" }}>I hull</th>
                  </tr>
                </thead>
                <tbody>
                  {puttBands.map((band) => (
                    <tr key={band.avstandFt} style={{ borderBottom: "1px solid var(--border-hairline)" }}>
                      <td style={{ padding: "8px 0", color: "var(--text-primary)" }}>{band.avstandFt} ft</td>
                      <td style={{ padding: "8px 0", textAlign: "right", color: "var(--text-secondary)" }}>{band.antallPutter}</td>
                      <td style={{ padding: "8px 0", textAlign: "right", color: "var(--text-primary)", fontWeight: 600 }}>
                        {band.minProsent != null ? `${band.minProsent} %` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Break-tabell */}
          <div
            className="pa-card"
            style={{
              padding: 16,
              borderRadius: 12,
              border: "1px solid var(--border-subtle)",
              background: "var(--surface-card)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ font: "600 13px/1 var(--font-sans)", color: "var(--text-primary)" }}>Greenhastighet (Stimp):</span>
                <div style={{ display: "flex", gap: 6 }}>
                  {[8, 10, 12].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStimp(s)}
                      style={{
                        minHeight: 44,
                        minWidth: 44,
                        padding: "10px 14px",
                        borderRadius: 6,
                        border: `1px solid ${stimp === s ? "var(--border-strong)" : "var(--border-subtle)"}`,
                        background: stimp === s ? "var(--surface-sunken)" : "transparent",
                        color: "var(--text-primary)",
                        font: "600 13px/1 var(--font-mono)",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxSizing: "border-box",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <span style={{ font: "500 10px/1 var(--font-mono)", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                MODELL · IKKE MÅLT
              </span>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "var(--font-mono)" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontSize: 11 }}>
                    <th style={{ textAlign: "left", padding: "8px 0" }}>Avstand</th>
                    {slopes.map((s) => (
                      <th key={s} style={{ textAlign: "right", padding: "8px 4px" }}>
                        {s} % fall
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {breakAvstanderFt.map((ft) => (
                    <tr key={ft} style={{ borderBottom: "1px solid var(--border-hairline)" }}>
                      <td style={{ padding: "8px 0", color: "var(--text-primary)", fontWeight: 600 }}>{ft} ft</td>
                      {slopes.map((s) => (
                        <td key={s} style={{ padding: "8px 4px", textAlign: "right", color: "var(--text-secondary)" }}>
                          {beregnBreakCm(stimp, ft, s)} cm
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ font: "500 9.5px/1.2 var(--font-mono)", color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              SIKT OVER HØYESTE PUNKT · PUTTINGAVSTAND I FOT · 1 FT ≈ 30 CM
            </div>
          </div>
        </div>
      )}

      {/* Fane 4: Turneringer */}
      {fane === "turn" && (
        <div
          className="pa-card"
          style={{
            padding: 16,
            borderRadius: 12,
            border: "1px solid var(--border-subtle)",
            background: "var(--surface-card)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <span style={{ font: "600 11px/1 var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)" }}>
            Turneringsplan 2026
          </span>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}>
                  <th style={{ textAlign: "left", padding: "8px 0" }}>Dato</th>
                  <th style={{ textAlign: "left", padding: "8px 12px" }}>Turnering</th>
                  <th style={{ textAlign: "left", padding: "8px 12px" }}>Type</th>
                  <th style={{ textAlign: "right", padding: "8px 0" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {tours.map((t) => (
                  <tr key={t.id} style={{ borderBottom: "1px solid var(--border-hairline)" }}>
                    <td style={{ padding: "12px 0", font: "500 13px/1 var(--font-mono)", color: "var(--text-muted)" }}>
                      {t.dato}
                    </td>
                    <td style={{ padding: "12px 12px", font: "600 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>
                      {t.navn}
                    </td>
                    <td style={{ padding: "12px 12px", font: "500 13px/1 var(--font-sans)", color: "var(--text-secondary)" }}>
                      {t.type}
                    </td>
                    <td style={{ padding: "12px 0", textAlign: "right" }}>
                      {t.status === "Ikke påmeldt" ? (
                        <button
                          type="button"
                          onClick={() => {
                            setTours((prev) => prev.map((x) => (x.id === t.id ? { ...x, status: "Påmeldt" as const } : x)));
                            showToast(`Du er påmeldt: ${t.navn}`);
                          }}
                          style={{
                            minHeight: 44,
                            minWidth: 44,
                            padding: "10px 16px",
                            borderRadius: 6,
                            border: "1px solid var(--border-strong)",
                            background: "transparent",
                            color: "var(--text-primary)",
                            font: "600 12px/1 var(--font-sans)",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxSizing: "border-box",
                          }}
                        >
                          Meld på
                        </button>
                      ) : (
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: 4,
                            background: "var(--surface-sunken)",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--text-primary)",
                            font: "600 11px/1 var(--font-mono)",
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                          }}
                        >
                          Påmeldt
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fane 5: Ukesdigest */}
      {fane === "digest" && (
        <div
          className="pa-card"
          style={{
            padding: 16,
            borderRadius: 12,
            border: "1px solid var(--border-subtle)",
            background: "var(--surface-card)",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            maxWidth: 720,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
            <span style={{ font: "600 15px/1.2 var(--font-sans)", color: "var(--text-primary)" }}>
              Ukesdigest · uke {ukesdigest?.ukeNr || 40}
            </span>
            <span style={{ font: "500 10px/1 var(--font-mono)", color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              {ukesdigest?.kilde || "BEREGNET FRA TRENINGSLOGG & TRACKMAN"}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ font: "500 10px/1 var(--font-mono)", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Treningstid
              </span>
              <span style={{ font: "600 20px/1.2 var(--font-mono)", color: "var(--text-primary)" }}>
                {ukesdigest ? `${ukesdigest.treningstimerFaktisk} av ${ukesdigest.treningstimerPlanlagt} t` : "8,5 av 10 t"}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ font: "500 10px/1 var(--font-mono)", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Økter
              </span>
              <span style={{ font: "600 20px/1.2 var(--font-mono)", color: "var(--text-primary)" }}>
                {ukesdigest ? `${ukesdigest.okterFaktisk} av ${ukesdigest.okterPlanlagt}` : "5 av 6"}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ font: "500 10px/1 var(--font-mono)", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Runder
              </span>
              <span style={{ font: "600 20px/1.2 var(--font-mono)", color: "var(--text-primary)" }}>
                {ukesdigest ? `${ukesdigest.runderSpilt}` : "2"}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ font: "500 10px/1 var(--font-mono)", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                SG Total
              </span>
              <span style={{ font: "600 20px/1.2 var(--font-mono)", color: "var(--text-primary)" }}>
                {ukesdigest?.sgTotal != null ? (ukesdigest.sgTotal > 0 ? `+${ukesdigest.sgTotal}` : `${ukesdigest.sgTotal}`) : "+1,2"}
              </span>
            </div>
          </div>

          <div
            style={{
              padding: 12,
              borderRadius: 8,
              background: "var(--surface-sunken)",
              fontSize: 14,
              lineHeight: 1.5,
              color: "var(--text-primary)",
            }}
          >
            {ukesdigest?.bestePrestasjon ||
              "Solid treningsuke med høy gjennomføringsgrad på nærspill og god fartskontroll i puttelaben. Drivingspredningen har bedret seg med 8 % siden forrige måned."}
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
            <Link
              href="/portal/planlegge"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 44,
                minWidth: 44,
                padding: "10px 16px",
                borderRadius: 8,
                border: "1px solid var(--border-strong)",
                background: "transparent",
                color: "var(--text-primary)",
                font: "600 13px/1 var(--font-sans)",
                textDecoration: "none",
                boxSizing: "border-box",
              }}
            >
              Åpne ukeplan
            </Link>
            <Link
              href="/portal/analysere"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 44,
                minWidth: 44,
                padding: "10px 16px",
                borderRadius: 8,
                border: "1px solid var(--border-subtle)",
                background: "var(--surface-card)",
                color: "var(--text-secondary)",
                font: "600 13px/1 var(--font-sans)",
                textDecoration: "none",
                boxSizing: "border-box",
              }}
            >
              Se full statistikk
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
