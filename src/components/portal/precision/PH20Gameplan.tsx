"use client";

/**
 * PH-20 Gameplan og banekart — Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/playerhq/screens/PH-20.jsx).
 *
 * Markør: PH20Gameplan
 * Banebibliotek, interaktivt hullvalg (1–18), SVG-banekart, TrackMan-spredning
 * og risikoanalyse per kølle fra tee.
 */

import { useState } from "react";
import { Download, TriangleAlert, MapPin, Check } from "lucide-react";
import { Meta, Tall, TomTilstand, FeilTilstand, StatusPille } from "@/components/precision/pa";
import { SideHode, Side, Stabel, Kort, Nokkelverdi } from "@/components/precision/pa-a4";
import { formaterTall } from "@/lib/format-tall";
import {
  TEE_CLUBS,
  getHoleGeo,
  getClubOptions,
  evaluateClubOptions,
  getRecommendedClub,
  type GameplanCourseItem,
} from "@/lib/portal-gameplan/ph20-data";
import "@/styles/precision-komponenter.css";

export type PH20Props = {
  tilstand?: "data" | "tom" | "feil";
  courses: GameplanCourseItem[];
  defaultCourseId?: string;
};

function HoleSvg({
  i,
  par,
  len,
  club,
  empty,
}: {
  i: number;
  par: number;
  len: number;
  club: string;
  empty?: boolean;
}) {
  const g = getHoleGeo(i, len);
  const k = 640 / len;
  const X = (off: number) => 200 + off * k;
  const Y = (m: number) => 690 - m * k;
  const spec = TEE_CLUBS[club] || { carry: len, hw: 4, ry: 4 };
  const { carry, hw, ry } = spec;
  const land = Math.min(carry, len);
  const fwFrom = par === 3 ? len - 30 : 150;
  const fw =
    "M" +
    X(-15) +
    " " +
    Y(fwFrom) +
    " L" +
    X(-15) +
    " " +
    Y(len - 22) +
    " Q" +
    X(0) +
    " " +
    Y(len - 12) +
    " " +
    X(15) +
    " " +
    Y(len - 22) +
    " L" +
    X(15) +
    " " +
    Y(fwFrom) +
    " Q" +
    X(0) +
    " " +
    Y(fwFrom - 10) +
    " " +
    X(-15) +
    " " +
    Y(fwFrom) +
    "Z";

  return (
    <svg
      viewBox="0 0 400 720"
      preserveAspectRatio="xMidYMid meet"
      style={{ width: "100%", height: "100%", display: "block" }}
      role="img"
      aria-label={`Hull ${i + 1}, par ${par}, ${len} meter${empty ? "" : `, slagvalg ${club} ${carry} meter`}`}
    >
      <rect x="0" y="0" width="400" height="720" fill="var(--sand-200)" />
      <path d={fw} fill="var(--sand-100)" stroke="var(--border-strong)" strokeWidth="1" />
      {g.water && (
        <rect
          x={X(g.water.off - 8)}
          y={Y(g.water.to)}
          width={16 * k}
          height={(g.water.to - g.water.from) * k}
          rx={8 * k}
          fill="var(--surface-sunken)"
          stroke="var(--text-secondary)"
          strokeDasharray="4 3"
        />
      )}
      {g.bunkers.map((b, j) => (
        <ellipse
          key={j}
          cx={X(b.off)}
          cy={Y(b.d)}
          rx={b.r * k}
          ry={b.r * k * 0.75}
          fill="var(--sand-300)"
          stroke="var(--sand-400)"
          strokeWidth="1.5"
        />
      ))}
      <circle
        cx={X(0)}
        cy={Y(len)}
        r={14 * k}
        fill="var(--surface-card)"
        stroke="var(--text-primary)"
        strokeWidth="1.5"
      />
      <line
        x1={X(0)}
        y1={Y(len)}
        x2={X(0)}
        y2={Y(len) - 26}
        stroke="var(--text-primary)"
        strokeWidth="1.5"
      />
      <path
        d={"M" + X(0) + " " + (Y(len) - 26) + " l14 5 l-14 5Z"}
        fill="var(--text-primary)"
      />
      {[100, 150, 200]
        .filter((m) => m < len - 20)
        .map((m) => (
          <g key={m}>
            <line
              x1="24"
              x2="376"
              y1={Y(len - m)}
              y2={Y(len - m)}
              stroke="var(--text-muted)"
              strokeDasharray="2 5"
            />
            <text
              x="28"
              y={Y(len - m) - 4}
              style={{ font: "500 12px var(--font-mono)", fill: "var(--text-secondary)" }}
            >
              {m} M
            </text>
          </g>
        ))}
      {!empty && (
        <>
          <ellipse
            cx={X(0)}
            cy={Y(land)}
            rx={hw * k}
            ry={ry * k}
            fill="var(--text-primary)"
            fillOpacity=".1"
            stroke="var(--text-primary)"
            strokeDasharray="5 4"
            strokeWidth="1.5"
          />
          <polyline
            points={
              X(0) +
              "," +
              Y(4) +
              " " +
              X(0) +
              "," +
              Y(land) +
              (land < len ? " " + X(0) + "," + Y(len) : "")
            }
            fill="none"
            stroke="var(--text-primary)"
            strokeWidth="2"
          />
          <circle cx={X(0)} cy={Y(land)} r="5" fill="var(--text-primary)" />
          <text
            x={X(hw) + 8}
            y={Y(land) + 4}
            style={{ font: "600 13px var(--font-mono)", fill: "var(--text-primary)" }}
          >
            {club} · {carry} M
          </text>
          {land < len && (
            <text
              x={X(0) + 8}
              y={(Y(land) + Y(len)) / 2}
              style={{ font: "500 12px var(--font-mono)", fill: "var(--text-secondary)" }}
            >
              {len - land} M IGJEN
            </text>
          )}
        </>
      )}
      <rect x={X(-6)} y={Y(0) - 8} width={12 * k} height="10" rx="2" fill="var(--graphite-600)" />
      <rect
        x="12"
        y="12"
        width="236"
        height="26"
        rx="4"
        fill="var(--surface-card)"
        stroke="var(--border-strong)"
      />
      <text
        x="22"
        y="30"
        style={{ font: "600 12px var(--font-sans)", fill: "var(--text-primary)" }}
      >
        Eksempeldata — ikke ekte baneguide
      </text>
      <text
        x="376"
        y="708"
        textAnchor="end"
        style={{ font: "500 12px var(--font-mono)", fill: "var(--text-secondary)" }}
      >
        HULL {i + 1} · PAR {par} · {len} M
      </text>
    </svg>
  );
}

export function PH20Gameplan({
  tilstand = "data",
  courses,
  defaultCourseId,
}: PH20Props) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    defaultCourseId || (courses.length > 0 ? courses[0].id : ""),
  );
  const [selectedHoleIdx, setSelectedHoleIdx] = useState<number>(0);
  const [picks, setPicks] = useState<Record<number, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const hasCourse = Boolean(activeCourse && activeCourse.holes && activeCourse.holes.length > 0);
  const isEmpty = tilstand === "tom" || courses.length === 0;

  const currentHole =
    hasCourse && activeCourse.holes[selectedHoleIdx]
      ? activeCourse.holes[selectedHoleIdx]
      : { par: 4, len: 360, avgScoreDiff: 0.5 };

  const par = currentHole.par;
  const len = currentHole.len;
  const geo = getHoleGeo(selectedHoleIdx, len);
  const options = getClubOptions(par, len);
  const { scored, recommended } = evaluateClubOptions(par, len, options, geo);
  const activeClub = picks[selectedHoleIdx] || recommended;
  const activeClubSpec = TEE_CLUBS[activeClub] || { carry: len, hw: 6, ry: 6 };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDownload = () => {
    showToast(`Gameplan lastet ned som PDF for ${activeCourse ? activeCourse.name : "banen"}`);
  };

  const handleStartPlan = () => {
    showToast(`Gameplan opprettet for ${activeCourse ? activeCourse.name : "banen"}`);
  };

  if (tilstand === "feil") {
    return (
      <Side max={1400}>
        <FeilTilstand
          icon={TriangleAlert}
          title="Banekartet kunne ikke lastes"
          text="Banedata hentes fra GolfBox. Gameplanene dine er lagret trygt."
          code="FEIL 502 · GOLFBOX"
        />
      </Side>
    );
  }

  return (
    <Side max={1400}>
      {toastMessage && (
        <div
          role="status"
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "var(--graphite-800)",
            color: "var(--sand-100)",
            padding: "12px 18px",
            borderRadius: 8,
            font: "500 14px var(--font-sans)",
            boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Check size={16} />
          {toastMessage}
        </div>
      )}

      <SideHode
        kicker="Stats · Gameplan"
        title="Gameplan og banekart"
        sub="Velg bane og hull. Slagvalget bygger på TrackMan-spredningen din og hvor hindrene ligger."
        actions={
          hasCourse && (
            <button
              type="button"
              onClick={handleDownload}
              className="pa-knapp pa-knapp--sekundaer"
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <Download size={16} />
              Last ned gameplan
            </button>
          )
        }
      />

      {/* Banevelger-kort */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 220px), 1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {courses.map((c) => {
          const isSelected = c.id === selectedCourseId;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => {
                setSelectedCourseId(c.id);
                setSelectedHoleIdx(0);
              }}
              className="pa-card pa-card--interactive"
              style={{
                padding: 14,
                display: "flex",
                flexDirection: "column",
                gap: 6,
                textAlign: "left",
                font: "inherit",
                cursor: "pointer",
                minWidth: 0,
                borderColor: isSelected ? "var(--border-ink)" : undefined,
                boxShadow: isSelected ? "inset 0 0 0 1px var(--border-ink)" : undefined,
                background: "var(--surface-card)",
              }}
            >
              <span style={{ font: "600 15px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>
                {c.name}
              </span>
              <Meta>
                {c.tee.toUpperCase()} · PAR {c.par} · {formaterTall(c.len, 0, false)} M
              </Meta>
              <span style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 4 }}>
                <Tall>{isEmpty || c.avg == null ? "—" : `${formaterTall(c.avg, 1, true)} slag`}</Tall>
                <Meta>{isEmpty ? "0 RUNDER" : `${c.played} RUNDER`}</Meta>
                <span style={{ flex: 1 }} />
                {!isEmpty && (
                  <StatusPille tone={c.plan === "Gameplan klar" ? "ok" : "neutral"}>
                    {c.plan}
                  </StatusPille>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {isEmpty || !hasCourse ? (
        <TomTilstand
          icon={MapPin}
          title={isEmpty ? "Ingen gameplan ennå" : `Ingen gameplan for ${activeCourse?.name || "denne banen"}`}
          text={
            isEmpty
              ? "Spill en runde eller registrer TrackMan-spredning, så foreslår vi slagvalg per hull."
              : "Banekart for denne banen kommer etter lansering. Du kan lage gameplan med par og lengde nå."
          }
          actions={
            <button
              type="button"
              onClick={handleStartPlan}
              className="pa-knapp pa-knapp--primaer"
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <MapPin size={16} />
              Lag gameplan
            </button>
          }
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 16,
            alignItems: "start",
          }}
        >
          {/* Kolonne 1: Hulliste (tabell for desktop) */}
          <div
            className="pa-card"
            style={{
              padding: 0,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid var(--border-hairline)",
                font: "600 13px var(--font-sans)",
                color: "var(--text-secondary)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {activeCourse.name} · hull-liste
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="pa-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "8px 12px" }}>Hull</th>
                    <th style={{ textAlign: "left", padding: "8px 12px" }}>Par</th>
                    <th style={{ textAlign: "right", padding: "8px 12px" }}>Meter</th>
                    <th style={{ textAlign: "left", padding: "8px 12px" }}>Tee</th>
                  </tr>
                </thead>
                <tbody>
                  {activeCourse.holes.map((h, i) => {
                    const isSelected = i === selectedHoleIdx;
                    const holeRec =
                      picks[i] || getRecommendedClub(i, h.par, h.len);
                    return (
                      <tr
                        key={i}
                        onClick={() => setSelectedHoleIdx(i)}
                        style={{
                          cursor: "pointer",
                          background: isSelected ? "var(--surface-elevated)" : "transparent",
                          fontWeight: isSelected ? 600 : 400,
                        }}
                      >
                        <td style={{ padding: "10px 12px", fontFamily: "var(--font-mono)" }}>
                          {i + 1}
                        </td>
                        <td style={{ padding: "10px 12px", fontFamily: "var(--font-mono)" }}>
                          {h.par}
                        </td>
                        <td
                          style={{
                            padding: "10px 12px",
                            fontFamily: "var(--font-mono)",
                            textAlign: "right",
                          }}
                        >
                          {h.len}
                        </td>
                        <td style={{ padding: "10px 12px", fontFamily: "var(--font-mono)" }}>
                          {holeRec}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Kolonne 2: Mobil hullvelger + SVG Banekart */}
          <Stabel gap={12}>
            {/* Mobil hull-velger pills */}
            <div
              role="group"
              aria-label="Hullvelger"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(48px, 1fr))",
                gap: 4,
              }}
            >
              {activeCourse.holes.map((h, i) => {
                const on = i === selectedHoleIdx;
                return (
                  <button
                    key={i}
                    type="button"
                    aria-pressed={on}
                    aria-label={`Hull ${i + 1}`}
                    onClick={() => setSelectedHoleIdx(i)}
                    style={{
                      height: 48,
                      borderRadius: 6,
                      border: `1px solid ${on ? "var(--border-ink)" : "var(--border-hairline)"}`,
                      background: on ? "var(--primary)" : "var(--surface-card)",
                      color: on ? "var(--text-on-primary)" : "var(--text-primary)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 2,
                      cursor: "pointer",
                      minWidth: 0,
                    }}
                  >
                    <span style={{ font: "600 13px/1 var(--font-mono)" }}>{i + 1}</span>
                    <span style={{ font: "500 9px/1 var(--font-mono)", opacity: 0.75 }}>
                      PAR {h.par}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Banekart kort */}
            <div
              className="pa-card"
              style={{
                padding: 0,
                overflow: "hidden",
                height: 520,
                background: "var(--sand-200)",
              }}
            >
              <HoleSvg
                i={selectedHoleIdx}
                par={par}
                len={len}
                club={activeClub}
                empty={isEmpty}
              />
            </div>

            {/* TruthLayer kilde */}
            <div style={{ marginTop: 2 }}>
              <Meta>
                BANEDATA · GOLFBOX · 01.05.2026 · BUNKER OG VANN ER EKSEMPELDATA · KOMPLETT BANEGUIDE ETTER LANSERING
              </Meta>
            </div>
          </Stabel>

          {/* Kolonne 3: Slagvalg fra tee */}
          <Stabel gap={12}>
            <Kort>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 12,
                }}
              >
                <span className="kicker">Slagvalg fra tee · hull {selectedHoleIdx + 1}</span>
                <Meta>TRACKMAN-SPREDNING · 24.09.2026</Meta>
              </div>

              {/* Køllevalg radiogroup */}
              <div
                role="radiogroup"
                aria-label="Kølle fra tee"
                style={{ display: "flex", flexDirection: "column", gap: 8 }}
              >
                {scored.map((o) => {
                  const on = o.club === activeClub;
                  return (
                    <button
                      key={o.club}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() =>
                        setPicks((x) => ({ ...x, [selectedHoleIdx]: o.club }))
                      }
                      style={{
                        textAlign: "left",
                        display: "grid",
                        gridTemplateColumns: "56px minmax(0, 1fr) auto",
                        gap: 12,
                        alignItems: "center",
                        minHeight: 56,
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: `1px solid ${on ? "var(--border-ink)" : "var(--border-hairline)"}`,
                        boxShadow: on ? "inset 0 0 0 1px var(--border-ink)" : "none",
                        background: "var(--surface-card)",
                        color: "var(--text-primary)",
                        cursor: "pointer",
                        minWidth: 0,
                      }}
                    >
                      <span style={{ font: "600 15px/1 var(--font-mono)" }}>{o.club}</span>
                      <span style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
                        <span style={{ font: "var(--type-num-s)" }}>
                          Carry {o.carry} m ·{" "}
                          {o.remainingMeters ? `${o.remainingMeters} m igjen` : "på green"}
                        </span>
                        <span
                          style={{
                            display: "inline-flex",
                            gap: 4,
                            alignItems: "center",
                            font: "var(--type-meta)",
                            color: o.riskPercent >= 10 ? "var(--warn)" : "var(--text-muted)",
                          }}
                        >
                          {o.riskPercent >= 10 && <TriangleAlert size={12} />}
                          {o.riskPercent
                            ? `BUNKER I SPREDNING · CA. ${o.riskPercent} %`
                            : "INGEN HINDER I SPREDNING"}
                        </span>
                      </span>
                      {o.club === recommended ? (
                        <StatusPille tone="ok">Anbefalt</StatusPille>
                      ) : (
                        <span />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Spredning og Snitt på hullet */}
              <div style={{ marginTop: 16 }}>
                <Nokkelverdi
                  items={[
                    [
                      "Spredning",
                      `± ${activeClubSpec.hw} m side · ± ${activeClubSpec.ry} m lengde`,
                      { hint: "2 SD · ESTIMAT" },
                    ],
                    [
                      "Snitt på hullet",
                      `+${formaterTall(currentHole.avgScoreDiff, 1, true)} til par`,
                      { hint: `${activeCourse.played} RUNDER · 2026` },
                    ],
                  ]}
                />
              </div>
            </Kort>
          </Stabel>
        </div>
      )}
    </Side>
  );
}
