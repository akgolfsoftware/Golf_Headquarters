"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Compass,
  Layers,
  Play,
  TriangleAlert,
  Wrench,
} from "lucide-react";
import {
  Knapp,
  KnappLenke,
  Sidehode,
  StatusPille,
  Meta,
} from "@/components/precision/pa";
import {
  formaterDesimal,
  formaterHeltall,
  STANDARD_PH17_DATA,
  type TrackManFane,
  type PH17TrackManData,
} from "@/lib/portal-analyse/ph17-trackman-data";

export interface PH17TrackManProps {
  data?: PH17TrackManData;
  initialData?: PH17TrackManData;
  initialFane?: TrackManFane;
  aktivFane?: TrackManFane;
  /**
   * Stasjon-fanen sammenligner med PGA Tour-tall fra Data Golf, og vises bare
   * for coach og admin (Anders 09.10.2026). Settes av siden med kanSeDataGolf.
   */
  visDataGolf?: boolean;
}

const TABS: ReadonlyArray<{
  id: TrackManFane;
  label: string;
  ikon: typeof Calendar;
  ikonNavn: string;
}> = [
  { id: "okter", label: "Økter", ikon: Calendar, ikonNavn: "calendar" },
  { id: "gap", label: "Gapping", ikon: Layers, ikonNavn: "layers" },
  { id: "utstyr", label: "Utstyr", ikon: Wrench, ikonNavn: "wrench" },
  { id: "stasjon", label: "Stasjon", ikon: Compass, ikonNavn: "compass" },
];

export function PH17TrackMan({
  data,
  initialData = STANDARD_PH17_DATA,
  initialFane = "okter",
  aktivFane,
  visDataGolf = false,
}: PH17TrackManProps) {
  const d = data ?? initialData;
  const faner = visDataGolf ? TABS : TABS.filter((t) => t.id !== "stasjon");
  const onsketFane = aktivFane ?? initialFane;
  const [fane, setFane] = useState<TrackManFane>(
    faner.some((t) => t.id === onsketFane) ? onsketFane : "okter",
  );
  const [valgtSessionId, setValgtSessionId] = useState<string>(
    d.sessions[0]?.id ?? "tm1"
  );
  const [valgtKolle, setValgtKolle] = useState<string>("7i");
  const [stasjonStartet, setStasjonStartet] = useState<boolean>(false);

  const aktivSession =
    d.sessions.find((s) => s.id === valgtSessionId) ?? d.sessions[0];
  const klubber = aktivSession?.clubs ?? ["7i"];

  // Oppdater valgt kølle hvis nåværende ikke er i økta
  const aktivKolle = klubber.includes(valgtKolle) ? valgtKolle : klubber[0] ?? "7i";
  const pts = d.shots[aktivKolle] ?? [];
  const stats = d.clubStats[aktivKolle];

  const scatterRng = aktivKolle === "Driver" ? 24 : ["6i", "7i", "8i"].includes(aktivKolle) ? 12 : 8;
  const kildeOkt = `TRACKMAN · ${aktivSession?.bay.toUpperCase() ?? "BAY 3"} · ${aktivSession?.date ?? "24.09.2026"}`;

  return (
    <div className="pa-side" style={{ maxWidth: 1080, margin: "0 auto", padding: "16px 20px" }}>
      {/* Toppseksjon med tittel og tilbake-knapp */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        <div style={{ flex: 1, minWidth: 260 }}>
          <Sidehode
            kicker="Stats · TrackMan"
            title="TrackMan"
            sub="Økter importeres automatisk fra bay-ene på Fredrikstad GK. Tallene står på engelsk slik TrackMan viser dem."
          />
        </div>
        <KnappLenke
          variant="secondary"
          icon={ArrowLeft}
          iconName="arrow-left"
          href="/portal/analysere"
        >
          Stats
        </KnappLenke>
      </div>

      {/* Fanelinje */}
      <div
        role="tablist"
        aria-label="TrackMan analyse"
        style={{
          display: "flex",
          gap: 6,
          borderBottom: "1px solid var(--border-hairline)",
          marginBottom: 20,
          overflowX: "auto",
        }}
      >
        {faner.map((tab) => {
          const aktiv = fane === tab.id;
          const IkonKomp = tab.ikon;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={aktiv}
              type="button"
              onClick={() => setFane(tab.id)}
              style={{
                all: "unset",
                cursor: "pointer",
                padding: "10px 16px",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                font: aktiv
                  ? "600 13px/1.2 var(--font-sans)"
                  : "500 13px/1.2 var(--font-sans)",
                color: aktiv ? "var(--text-primary)" : "var(--text-secondary)",
                borderBottom: aktiv
                  ? "2px solid var(--border-ink)"
                  : "2px solid transparent",
                marginBottom: -1,
              }}
            >
              <IkonKomp size={15} aria-hidden />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Fane 1: Økter */}
      {fane === "okter" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
            alignItems: "start",
          }}
        >
          {/* Venstre kolonne: Øktliste */}
          <div className="pa-card" style={{ padding: 0, overflow: "hidden" }}>
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid var(--border-hairline)",
                background: "var(--surface-flat)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span className="pa-kicker" style={{ margin: 0 }}>TrackMan-økter</span>
              <Meta>{d.sessions.length} · 30 DAGER</Meta>
            </div>
            <div>
              {d.sessions.map((s, i) => {
                const aktiv = s.id === valgtSessionId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={aktiv}
                    onClick={() => {
                      setValgtSessionId(s.id);
                      if (s.clubs[0]) setValgtKolle(s.clubs[0]);
                    }}
                    style={{
                      all: "unset",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      padding: "12px 16px",
                      width: "100%",
                      boxSizing: "border-box",
                      borderTop: i ? "1px solid var(--border-hairline)" : "none",
                      background: aktiv ? "var(--surface-flat)" : "transparent",
                      boxShadow: aktiv ? "inset 2px 0 0 var(--border-ink)" : "none",
                      minHeight: 56,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          font: "600 14px/1.3 var(--font-sans)",
                          color: "var(--text-primary)",
                        }}
                      >
                        {s.title}
                      </span>
                      <span
                        style={{
                          font: "600 13px/1 var(--font-mono)",
                          color: "var(--text-primary)",
                        }}
                      >
                        {s.shots} slag
                      </span>
                    </div>
                    <Meta>
                      {s.date} · {s.bay.toUpperCase()} · {s.clubs.join(" · ").toUpperCase()}
                    </Meta>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Høyre kolonne: Valgt økt, kølleknapper, spredning og snitt */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Kølle-piller */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {klubber.map((c) => {
                const valgt = c === aktivKolle;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setValgtKolle(c)}
                    style={{
                      all: "unset",
                      cursor: "pointer",
                      padding: "6px 12px",
                      borderRadius: "var(--radius-pill)",
                      font: "600 12px/1 var(--font-mono)",
                      background: valgt ? "var(--border-ink)" : "var(--surface-sunken)",
                      color: valgt ? "var(--surface-flat)" : "var(--text-primary)",
                      border: "1px solid var(--border-hairline)",
                    }}
                  >
                    {c}
                  </button>
                );
              })}
            </div>

            {/* Spredningskart */}
            <div className="pa-card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <span className="pa-kicker" style={{ margin: 0 }}>
                  Spredning · {aktivKolle} · {pts.length} slag
                </span>
                <span
                  style={{
                    font: "600 10px/1 var(--font-mono)",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                  }}
                >
                  {kildeOkt}
                </span>
              </div>

              {/* 2D Scatter i SVG */}
              <div
                style={{
                  width: "100%",
                  height: 280,
                  background: "var(--surface-sunken)",
                  borderRadius: "var(--radius-inner)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <svg
                  viewBox={`-${scatterRng} -${scatterRng} ${scatterRng * 2} ${scatterRng * 2}`}
                  style={{ width: "100%", height: "100%" }}
                  aria-label={`Spredning for ${aktivKolle}`}
                >
                  {/* Bakgrunns-rutenett */}
                  <line
                    x1={`-${scatterRng}`}
                    y1="0"
                    x2={scatterRng}
                    y2="0"
                    stroke="var(--border-hairline)"
                    strokeWidth="0.3"
                  />
                  <line
                    x1="0"
                    y1={`-${scatterRng}`}
                    x2="0"
                    y2={scatterRng}
                    stroke="var(--border-hairline)"
                    strokeWidth="0.3"
                  />
                  {/* Konsentriske sirkler */}
                  <circle
                    cx="0"
                    cy="0"
                    r={scatterRng * 0.33}
                    fill="none"
                    stroke="var(--border-hairline)"
                    strokeWidth="0.3"
                    strokeDasharray="1,1"
                  />
                  <circle
                    cx="0"
                    cy="0"
                    r={scatterRng * 0.66}
                    fill="none"
                    stroke="var(--border-hairline)"
                    strokeWidth="0.3"
                    strokeDasharray="1,1"
                  />
                  {/* Målflagg sentrum */}
                  <circle cx="0" cy="0" r="0.6" fill="var(--signal)" />

                  {/* Slagpunkter */}
                  {pts.map(([x, y], idx) => (
                    <circle
                      key={idx}
                      cx={x}
                      cy={-y}
                      r="0.7"
                      fill="var(--text-primary)"
                      opacity="0.85"
                    />
                  ))}
                </svg>
                {/* Akse-etiketter */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 6,
                    left: 10,
                    font: "500 10px/1 var(--font-mono)",
                    color: "var(--text-muted)",
                  }}
                >
                  ±{scatterRng} m sideveis / lengde
                </div>
              </div>
            </div>

            {/* Snitt-kort */}
            <div className="pa-card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <span className="pa-kicker" style={{ margin: 0 }}>
                  Snitt · {aktivKolle}
                </span>
                <span
                  style={{
                    font: "600 10px/1 var(--font-mono)",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                  }}
                >
                  {kildeOkt}
                </span>
              </div>

              {stats ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Meta>Carry</Meta>
                    <span style={{ font: "600 16px/1 var(--font-mono)", color: "var(--text-primary)" }}>
                      {formaterDesimal(stats.carry)} m
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Meta>Club Speed</Meta>
                    <span style={{ font: "600 16px/1 var(--font-mono)", color: "var(--text-primary)" }}>
                      {formaterDesimal(stats.clubSpeed)} mph
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Meta>Ball Speed</Meta>
                    <span style={{ font: "600 16px/1 var(--font-mono)", color: "var(--text-primary)" }}>
                      {formaterDesimal(stats.ballSpeed)} mph
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Meta>Smash Factor</Meta>
                    <span style={{ font: "600 16px/1 var(--font-mono)", color: "var(--text-primary)" }}>
                      {formaterDesimal(stats.smashFactor, 2)}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Meta>Launch Angle</Meta>
                    <span style={{ font: "600 16px/1 var(--font-mono)", color: "var(--text-primary)" }}>
                      {formaterDesimal(stats.launchAngle)}°
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Meta>Club Path</Meta>
                    <span style={{ font: "600 16px/1 var(--font-mono)", color: "var(--text-primary)" }}>
                      {formaterDesimal(stats.clubPath)}°
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Meta>Face to Path</Meta>
                    <span style={{ font: "600 16px/1 var(--font-mono)", color: "var(--text-primary)" }}>
                      {stats.faceToPath != null ? `${formaterDesimal(stats.faceToPath)}°` : "—"}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Meta>Spin Rate</Meta>
                    <span style={{ font: "600 16px/1 var(--font-mono)", color: "var(--text-primary)" }}>
                      {stats.spinRate != null ? `${formaterHeltall(stats.spinRate)} rpm` : "—"}
                    </span>
                  </div>
                </div>
              ) : (
                <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>
                  Ingen snittmålinger logget for denne køllen.
                </p>
              )}

              {stats && stats.faceToPath == null && (
                <Meta>FACE TO PATH MANGLER · BAY 3 MÅLER IKKE KØLLEBLAD</Meta>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fane 2: Gapping */}
      {fane === "gap" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
            alignItems: "start",
          }}
        >
          {/* Horisontal carry-oversikt */}
          <div className="pa-card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <span className="pa-kicker" style={{ margin: 0 }}>Carry per kølle</span>
              <span
                style={{
                  font: "600 10px/1 var(--font-mono)",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                }}
              >
                TRACKMAN · 3 ØKTER
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {d.gapping.map((r) => {
                const maksMeter = 240;
                const barBredde = Math.min(100, Math.max(0, (r.carry / maksMeter) * 100));
                const spLeft = Math.max(0, ((r.carry - r.spredning) / maksMeter) * 100);
                const spWidth = Math.min(100 - spLeft, ((r.spredning * 2) / maksMeter) * 100);

                return (
                  <div
                    key={r.club}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "52px 1fr 64px",
                      gap: 10,
                      alignItems: "center",
                      minHeight: 28,
                    }}
                  >
                    <span style={{ font: "600 13px/1 var(--font-mono)", color: "var(--text-primary)" }}>
                      {r.club}
                    </span>
                    <div
                      style={{
                        position: "relative",
                        height: 12,
                        background: "var(--surface-sunken)",
                        borderRadius: "var(--radius-inner)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: `${barBredde}%`,
                          background: "var(--text-primary)",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          bottom: 0,
                          left: `${spLeft}%`,
                          width: `${spWidth}%`,
                          borderLeft: "1px solid var(--text-muted)",
                          borderRight: "1px solid var(--text-muted)",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        font: "600 12px/1 var(--font-mono)",
                        color: "var(--text-primary)",
                        textAlign: "right",
                      }}
                    >
                      {formaterDesimal(r.carry)} m
                    </span>
                  </div>
                );
              })}
            </div>
            <Meta>STREK = ± SPREDNING I LENGDE (1 SD)</Meta>
          </div>

          {/* Gapping-tabell */}
          <div className="pa-card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            <span className="pa-kicker" style={{ margin: 0 }}>Gapping mellom køller</span>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", font: "13px var(--font-sans)" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-hairline)", textAlign: "left" }}>
                    <th style={{ padding: "8px 4px", font: "600 11px var(--font-mono)", color: "var(--text-muted)" }}>
                      KØLLE
                    </th>
                    <th style={{ padding: "8px 4px", font: "600 11px var(--font-mono)", color: "var(--text-muted)", textAlign: "right" }}>
                      CARRY
                    </th>
                    <th style={{ padding: "8px 4px", font: "600 11px var(--font-mono)", color: "var(--text-muted)", textAlign: "right" }}>
                      GAP
                    </th>
                    <th style={{ padding: "8px 4px", font: "600 11px var(--font-mono)", color: "var(--text-muted)" }}>
                      VURDERING
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {d.gapping.map((r, i) => (
                    <tr
                      key={r.club}
                      style={{
                        borderTop: i ? "1px solid var(--border-hairline)" : "none",
                      }}
                    >
                      <td style={{ padding: "8px 4px", font: "600 13px/1 var(--font-mono)" }}>
                        {r.club}
                      </td>
                      <td style={{ padding: "8px 4px", textAlign: "right", font: "13px/1 var(--font-mono)" }}>
                        {formaterDesimal(r.carry)} m
                      </td>
                      <td style={{ padding: "8px 4px", textAlign: "right", font: "13px/1 var(--font-mono)" }}>
                        {r.gapTilNeste != null ? `${formaterDesimal(r.gapTilNeste)} m` : "—"}
                      </td>
                      <td style={{ padding: "8px 4px" }}>
                        {r.flag ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              font: "600 11px/1 var(--font-sans)",
                              color: "var(--warn)",
                            }}
                          >
                            <TriangleAlert size={13} aria-hidden />
                            <span>
                              {r.flag}
                              {r.flag === "Overlapp" ? " · under 8 m" : " · over 18 m"}
                            </span>
                          </span>
                        ) : (
                          <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>
                            Jevnt
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Fane 3: Utstyr */}
      {fane === "utstyr" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p
            style={{
              margin: 0,
              font: "var(--type-body-s)",
              color: "var(--text-secondary)",
              maxWidth: 700,
            }}
          >
            Utstyrshelse bygger på siste fitting og endringer i TrackMan-tall over tid. Slitasje på riller er et estimat fra fall i Spin Rate.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
              gap: 16,
            }}
          >
            {d.gear.map((g) => {
              const tone = g.status === "OK" ? "ok" : "warn";
              return (
                <div
                  key={g.club}
                  className="pa-card"
                  style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        font: "600 18px/1 var(--font-mono)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {g.club}
                    </span>
                    <StatusPille tone={tone}>{g.status}</StatusPille>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <Meta>Oppsett</Meta>
                      <span style={{ font: "500 13px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>
                        {g.model}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <Meta>Siste fitting</Meta>
                      <span style={{ font: "500 13px/1.3 var(--font-mono)", color: "var(--text-primary)" }}>
                        {g.check}
                      </span>
                    </div>
                    {g.note && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <Meta>Merknad</Meta>
                        <span style={{ font: "500 12px/1.3 var(--font-sans)", color: "var(--text-secondary)" }}>
                          {g.note}
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: "auto", paddingTop: 8 }}>
                    <Meta>
                      {g.est ? "TRACKMAN · APRIL–SEPTEMBER 2026" : `FITTING · ${g.check}`}
                    </Meta>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Fane 4: Stasjon */}
      {visDataGolf && fane === "stasjon" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="pa-card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <span className="pa-kicker" style={{ margin: 0 }}>
                Stasjonsmodus · {d.station.club} mot proff-referanse
              </span>
              <span
                style={{
                  font: "600 10px/1 var(--font-mono)",
                  padding: "4px 8px",
                  borderRadius: "var(--radius-pill)",
                  background: "var(--surface-sunken)",
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                }}
              >
                POWERED BY DATA GOLF
              </span>
            </div>

            <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>
              Slå 10 slag med samme kølle. Tallene sammenlignes med PGA Tour-snitt fra Data Golf og normen for kategori C.
            </p>

            {/* Tabell */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", font: "13px var(--font-sans)" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-hairline)", textAlign: "left" }}>
                    <th style={{ padding: "8px 6px", font: "600 11px var(--font-mono)", color: "var(--text-muted)" }}>
                      PARAMETER
                    </th>
                    <th style={{ padding: "8px 6px", font: "600 11px var(--font-mono)", color: "var(--text-muted)", textAlign: "right" }}>
                      {d.station.spillerNavn.toUpperCase()}
                    </th>
                    <th style={{ padding: "8px 6px", font: "600 11px var(--font-mono)", color: "var(--text-muted)", textAlign: "right" }}>
                      PGA TOUR
                    </th>
                    <th style={{ padding: "8px 6px", font: "600 11px var(--font-mono)", color: "var(--text-muted)", textAlign: "right" }}>
                      KATEGORI C
                    </th>
                    <th style={{ padding: "8px 6px", font: "600 11px var(--font-mono)", color: "var(--text-muted)", textAlign: "right" }}>
                      AVVIK PGA
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {d.station.rows.map((row, i) => {
                    const des = row.param === "Smash Factor" ? 2 : 1;
                    const formatVal = (v: number) =>
                      row.param === "Spin Rate"
                        ? formaterHeltall(v)
                        : formaterDesimal(v, des);
                    const avvikFortegn = row.avvikPga > 0 ? "+" : "";

                    return (
                      <tr
                        key={row.id}
                        style={{ borderTop: i ? "1px solid var(--border-hairline)" : "none" }}
                      >
                        <td style={{ padding: "8px 6px", font: "500 13px var(--font-sans)" }}>
                          {row.param}
                        </td>
                        <td style={{ padding: "8px 6px", textAlign: "right", font: "600 13px var(--font-mono)" }}>
                          {formatVal(row.spillerVerdi)}{row.enhet ? ` ${row.enhet}` : ""}
                        </td>
                        <td style={{ padding: "8px 6px", textAlign: "right", font: "13px var(--font-mono)", color: "var(--text-secondary)" }}>
                          {formatVal(row.pgaTourVerdi)}{row.enhet ? ` ${row.enhet}` : ""}
                        </td>
                        <td style={{ padding: "8px 6px", textAlign: "right", font: "13px var(--font-mono)", color: "var(--text-secondary)" }}>
                          {formatVal(row.kategoriCVerdi)}{row.enhet ? ` ${row.enhet}` : ""}
                        </td>
                        <td
                          style={{
                            padding: "8px 6px",
                            textAlign: "right",
                            font: "600 13px var(--font-mono)",
                            color: row.avvikPga >= 0 ? "var(--ok)" : "var(--warn)",
                          }}
                        >
                          {avvikFortegn}{formatVal(row.avvikPga)}{row.enhet ? ` ${row.enhet}` : ""}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
              <Meta>{d.station.spillerNavn.toUpperCase()} · TRACKMAN · BAY 3 · 24.09.2026</Meta>
              <Meta>PGA TOUR · DATA GOLF · SESONG 2025</Meta>
              <Meta>KATEGORI C · AK GOLF-NORM · ESTIMAT</Meta>
            </div>
          </div>

          <div>
            <Knapp
              variant="primary"
              icon={stasjonStartet ? CheckCircle2 : Play}
              iconName={stasjonStartet ? "check" : "play"}
              onClick={() => setStasjonStartet(true)}
            >
              {stasjonStartet
                ? "Stasjonsmodus aktiv · 10 slag logges i Bay 3"
                : "Start stasjon · 10 slag"}
            </Knapp>
          </div>
        </div>
      )}
    </div>
  );
}
