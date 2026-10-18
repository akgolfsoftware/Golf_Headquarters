"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Compass,
  Layers,
  TriangleAlert,
  Wrench,
} from "lucide-react";
import {
  KnappLenke,
  Sidehode,
  StatusPille,
  Meta,
  FeilTilstand,
  TomTilstand,
} from "@/components/precision/pa";
import {
  formaterDesimal,
  formaterHeltall,
  type TrackManFane,
  type PH17TrackManData,
} from "@/lib/portal-analyse/ph17-trackman-data";

export interface PH17TrackManProps {
  data?: PH17TrackManData;
  initialData?: PH17TrackManData;
  initialFane?: TrackManFane;
  aktivFane?: TrackManFane;
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

const TOMME_DATA: PH17TrackManData = { sessions: [], shots: {}, clubStats: {}, gapping: [], gear: [], station: { club: "", spillerNavn: "", rows: [] } };

export function PH17TrackMan({
  data,
  initialData = TOMME_DATA,
  initialFane = "okter",
  aktivFane,
}: PH17TrackManProps) {
  const d = data ?? initialData;
  const [fane, setFane] = useState<TrackManFane>(aktivFane ?? initialFane);
  const [valgtSessionId, setValgtSessionId] = useState<string>(
    d.sessions[0]?.id ?? ""
  );
  const [valgtKolle, setValgtKolle] = useState<string>(d.sessions[0]?.clubs[0] ?? "");

  const aktivSession =
    d.sessions.find((s) => s.id === valgtSessionId) ?? d.sessions[0];
  const klubber = aktivSession?.clubs ?? [];

  // Oppdater valgt kølle hvis nåværende ikke er i økta
  const aktivKolle = klubber.includes(valgtKolle) ? valgtKolle : klubber[0] ?? "";
  const measurements = aktivSession ? d.sessionData?.[aktivSession.id] : null;
  const pts = (measurements?.shots ?? d.shots)[aktivKolle] ?? [];
  const stats = (measurements?.clubStats ?? d.clubStats)[aktivKolle];

  const scatterRng = aktivKolle === "Driver" ? 24 : ["6i", "7i", "8i"].includes(aktivKolle) ? 12 : 8;
  const kildeOkt = ["TrackMan", aktivSession?.bay, aktivSession?.date].filter(Boolean).join(" · ");

  if (d.state === "feil") return <div className="pa-side"><Sidehode title="TrackMan" kicker="Stats" /><FeilTilstand icon={TriangleAlert} title="Målingene kunne ikke hentes" text="Ingen målinger er endret. Prøv igjen." code="TRACKMAN · FEIL" retry={<button type="button" className="pa-btn pa-btn--secondary" onClick={() => window.location.reload()}>Prøv igjen</button>} /></div>;

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
            sub="Dine importerte økter og målte slag. Parameterne beholder navnene fra TrackMan."
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
        role="group"
        aria-label="TrackMan analyse"
        style={{
          display: "flex",
          gap: 6,
          borderBottom: "1px solid var(--border-hairline)",
          marginBottom: 20,
          overflowX: "auto",
        }}
      >
        {TABS.map((tab) => {
          const aktiv = fane === tab.id;
          const IkonKomp = tab.ikon;
          return (
            <button
              key={tab.id}

              aria-pressed={aktiv}
              type="button"
              onClick={() => setFane(tab.id)}
              style={{
                border: 0,
                cursor: "pointer",
                padding: "10px 16px",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                font: aktiv
                  ? "600 13px/1.2 var(--font-sans)"
                  : "500 13px/1.2 var(--font-sans)",
                color: aktiv ? "var(--text-on-primary)" : "var(--text-secondary)",
                background: aktiv ? "var(--primary)" : "transparent",
                borderRadius: "var(--radius)",
                minHeight: 44,
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

      <section className="ph16-grunnlag" aria-label="TrackMan datagrunnlag">
        <div><Meta>Registrerte økter</Meta><strong className="ph16-grunnlag__verdi">{d.sessions.length}</strong><p>{d.sessions.reduce((sum, session) => sum + session.shots, 0)} målte slag</p></div>
        <div className="ph16-grunnlag__metadata"><p><strong>Periode:</strong> Siste 10 importerte økter</p><p><strong>Kilde:</strong> TrackMan · {aktivSession ? `valgt økt ${aktivSession.date}` : "ingen økt registrert"}</p></div>
      </section>

      {/* Fane 1: Økter */}
      {fane === "okter" && !d.sessions.length ? <TomTilstand icon={Calendar} title="Ingen TrackMan-økter registrert" text="Importerte målinger vises her når de er knyttet til kontoen din. Manglende data fylles ikke med eksempeltall." /> : fane === "okter" && (
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
                      appearance: "none", border: 0,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      padding: "12px 16px",
                      width: "100%",
                      boxSizing: "border-box",
                      borderTop: i ? "1px solid var(--border-hairline)" : "none",
                      background: aktiv ? "var(--surface-flat)" : "transparent",
                      boxShadow: "none",
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
                    aria-pressed={valgt}
                    style={{
                      appearance: "none",
                      cursor: "pointer",
                      padding: "6px 12px",
                      borderRadius: "var(--radius-pill)",
                      font: "600 12px/1 var(--font-mono)",
                      background: valgt ? "var(--border-ink)" : "var(--surface-sunken)",
                      color: valgt ? "var(--surface-flat)" : "var(--text-primary)",
                      border: "1px solid var(--border-hairline)",
                      minHeight: 44,
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
                <Meta>Face to Path mangler i målingene for denne økten.</Meta>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fane 2: Gapping */}
      {fane === "gap" && !d.gapping.length ? <TomTilstand icon={Layers} title="Ingen gapping-målinger" text="Carry og avstand mellom køller vises når de er målt. En manglende kølle får ikke en beregnet standardlengde." /> : fane === "gap" && (
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
      {fane === "utstyr" && !d.gear.length ? <TomTilstand icon={Wrench} title="Ingen fittingvurdering registrert" text="Se eller oppdater utstyrsbagens faktiske opplysninger. Vi beregner ikke rilleslitasje fra eksempeltall." actions={<KnappLenke href="/portal/meg/utstyr" variant="secondary">Åpne utstyrsbag</KnappLenke>} /> : fane === "utstyr" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p
            style={{
              margin: 0,
              font: "var(--type-body-s)",
              color: "var(--text-secondary)",
              maxWidth: 700,
            }}
          >
            Fitting og utstyrsvurderinger vises når de er registrert. TrackMan-tall alene fastslår ikke slitasje på riller.
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

      {fane === "stasjon" && <section className="pa-card" style={{ padding: 24, gap: 16 }}>
        <Sidehode title="Arbeid med egne målinger" sub="Velg en registrert økt og kølle for å se faktisk resultat, spredning og datagrunnlag." />
        <p>Gjennomfør oppgaven som er avtalt med coachen. Målinger vises når økten er registrert i appen. Denne siden starter eller styrer ikke TrackMan-maskinen.</p>
        <div><button type="button" className="pa-btn pa-btn--primary" onClick={() => setFane("okter")}>Åpne registrerte økter</button></div>
        <KnappLenke variant="secondary" href="/portal/planlegge/workbench">Planlegg økten i Workbench</KnappLenke>
      </section>}
    </div>
  );
}
