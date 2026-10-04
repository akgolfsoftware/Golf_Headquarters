"use client";

import { useState } from "react";
import { ArrowLeft, List } from "lucide-react";
import { KnappLenke, Sidehode, Meta } from "@/components/precision/pa";
import {
  formaterDesimal,
  formaterSg,
  STANDARD_PH16_DATA,
  type SgRad,
  type PH16StatsData,
} from "@/lib/portal-analyse/ph16-stats-data";

export interface PH16bSkillMapProps {
  data?: PH16StatsData;
  pgaTour?: boolean;
  onTilbakeHref?: string;
}

// Geometri i viewBox 360 x 548 (1 enhet = 1 px på 390)
const GEOMETRI: Record<string, [x: number, y: number, w: number, h: number]> = {
  p0: [8, 12, 112, 44],
  p3: [124, 12, 112, 44],
  p6: [240, 12, 112, 44],
  p10: [8, 62, 112, 44],
  p20: [124, 62, 112, 44],
  p40: [240, 62, 112, 44],
  chip: [8, 126, 82, 52],
  pitch: [98, 126, 82, 52],
  lob: [188, 126, 82, 52],
  bunker: [278, 126, 74, 52],
  i50: [30, 202, 300, 48],
  i100: [50, 258, 260, 48],
  i150: [70, 314, 220, 48],
  i200: [90, 370, 180, 48],
  tee: [110, 442, 140, 52],
};

const GRUPPE_NAVN: Record<string, string> = {
  tee: "Tee",
  innspill: "Innspill",
  naer: "Nærspill 0–50 m",
  putt: "Putting",
};

function kortNavn(r: SgRad): string {
  if (r.g === "tee") return "Tee";
  if (r.g === "innspill") return r.label.replace(" m", "");
  return r.label.replace(" fot", "");
}

function langtNavn(r: SgRad): string {
  if (r.g === "tee") return "Tee · par 4 og 5";
  if (r.g === "innspill") return `Innspill ${r.label}`;
  if (r.g === "putt") return `Putting ${r.label}`;
  return r.label;
}

export function PH16bSkillMap({
  data = STANDARD_PH16_DATA,
  pgaTour = false,
  onTilbakeHref = "/portal/analysere?del=sg",
}: PH16bSkillMapProps) {
  const alleRader: SgRad[] = data.sg.flatMap((g) => g.rows);
  const [valgtId, setValgtId] = useState<string>("i100");

  const valgtRad = alleRader.find((r) => r.id === valgtId) ?? alleRader[0];
  const verdi = pgaTour ? valgtRad.pga : valgtRad.c;

  // Finn område med lavest SG for fokusmarkering
  const svakeste = [...alleRader].sort((a, b) => (pgaTour ? a.pga - b.pga : a.c - b.c))[0]?.id;

  return (
    <div className="pa-side" style={{ maxWidth: 1000, margin: "0 auto", padding: "16px 20px" }}>
      {/* Toppseksjon med Tilbake og Liste-knapper */}
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
        <div style={{ flex: 1, minWidth: 240 }}>
          <Sidehode
            kicker="Stats · Strokes Gained"
            title="Skill map"
            sub="Skjematisk hullskisse med Strokes Gained per område. Tee nederst, putting øverst."
          />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <KnappLenke
            variant="secondary"
            icon={List}
            iconName="list"
            href={onTilbakeHref}
          >
            Se som liste
          </KnappLenke>
          <KnappLenke
            variant="secondary"
            icon={ArrowLeft}
            iconName="arrow-left"
            href="/portal/analysere"
          >
            Stats
          </KnappLenke>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 20,
          alignItems: "start",
        }}
      >
        {/* Venstre: Skjematisk hullkart i SVG */}
        <div
          className="pa-card"
          style={{
            padding: 16,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minWidth: 0,
          }}
        >
          <svg
            role="group"
            aria-label="Skill map: Strokes Gained per område på en skjematisk hull-skisse"
            viewBox="0 0 360 548"
            style={{
              width: "100%",
              maxWidth: 380,
              height: "auto",
              display: "block",
            }}
          >
            <rect
              x="0.5"
              y="0.5"
              width="359"
              height="547"
              fill="var(--surface-sunken)"
              stroke="var(--border-hairline)"
            />
            {/* Skisse av fairway/hull */}
            <polygon
              points="24,196 336,196 300,424 60,424"
              fill="var(--surface-page)"
              stroke="var(--border-hairline)"
              strokeDasharray="4 4"
            />
            <text
              x="12"
              y="120"
              fontFamily="var(--font-mono)"
              fontSize="10"
              fill="var(--text-muted)"
              letterSpacing=".04em"
            >
              GREEN
            </text>
            <text
              x="348"
              y="196"
              textAnchor="end"
              fontFamily="var(--font-mono)"
              fontSize="10"
              fill="var(--text-muted)"
              letterSpacing=".04em"
            >
              FAIRWAY
            </text>
            <text
              x="180"
              y="536"
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize="10"
              fill="var(--text-muted)"
              letterSpacing=".04em"
            >
              SKISSE · IKKE EN BANE
            </text>

            {alleRader.map((r) => {
              const geom = GEOMETRI[r.id];
              if (!geom) return null;
              const [x, y, w, h] = geom;
              const v = pgaTour ? r.pga : r.c;
              const erValgt = valgtId === r.id;
              const erSvak = r.id === svakeste;

              return (
                <g
                  key={r.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={erValgt}
                  aria-label={`${langtNavn(r)}, SG ${formaterSg(v)} per runde`}
                  style={{ cursor: "pointer" }}
                  onClick={() => setValgtId(r.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setValgtId(r.id);
                    }
                  }}
                >
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    fill={erValgt ? "var(--surface-flat)" : "var(--surface-card)"}
                    stroke={erValgt ? "var(--text-primary)" : "var(--border-strong)"}
                    strokeWidth={erValgt ? 2 : 1}
                  />
                  <text
                    x={x + w / 2}
                    y={y + h / 2 - 3}
                    textAnchor="middle"
                    fontFamily="var(--font-sans)"
                    fontWeight="600"
                    fontSize="12"
                    fill="var(--text-primary)"
                  >
                    {kortNavn(r)}
                  </text>
                  <text
                    x={x + w / 2}
                    y={y + h / 2 + 13}
                    textAnchor="middle"
                    fontFamily="var(--font-mono)"
                    fontSize="12"
                    fill="var(--text-secondary)"
                  >
                    {formaterSg(v)}
                  </text>
                  {erSvak && (
                    <rect
                      x={x + 3}
                      y={y + 3}
                      width="6"
                      height="6"
                      fill="var(--text-primary)"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Høyre: Detaljpanel for valgt område */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            className="pa-card"
            style={{
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <span className="kicker">{GRUPPE_NAVN[valgtRad.g]}</span>
              <Meta>{langtNavn(valgtRad).toUpperCase()}</Meta>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  font: "600 32px/1 var(--font-mono)",
                  color: "var(--text-primary)",
                  letterSpacing: "-0.02em",
                }}
              >
                {formaterSg(verdi)}
              </span>
              <span
                style={{
                  font: "var(--type-body-s)",
                  color: "var(--text-secondary)",
                }}
              >
                slag per runde mot {pgaTour ? "PGA Tour" : "Kategori C (estimat)"}
              </span>
            </div>

            {/* SG-stolpe */}
            <div
              aria-hidden="true"
              style={{
                position: "relative",
                height: 10,
                background: "var(--surface-sunken)",
                borderRadius: 4,
                overflow: "hidden",
                margin: "4px 0",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: "50%",
                  top: 0,
                  bottom: 0,
                  width: 2,
                  background: "var(--text-muted)",
                }}
              />
              {verdi !== 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: verdi < 0 ? `${50 - Math.min(50, Math.abs(verdi) * 40)}%` : "50%",
                    width: `${Math.min(50, Math.abs(verdi) * 40)}%`,
                    background: "var(--primary)",
                  }}
                />
              )}
            </div>

            <dl className="pa-kv">
              <div className="pa-kv__row">
                <dt className="pa-kv__k">Slag i grunnlaget</dt>
                <dd className="pa-kv__v is-mono">{valgtRad.n} slag</dd>
              </div>

              <div className="pa-kv__row">
                <dt className="pa-kv__k">Trend (siste 10 mot 10 før)</dt>
                <dd className="pa-kv__v is-mono">{formaterSg(valgtRad.d)}</dd>
              </div>

              {valgtRad.prox && (
                <div className="pa-kv__row">
                  <dt className="pa-kv__k">Nærhet til hull</dt>
                  <dd className="pa-kv__v is-mono">
                    Du {formaterDesimal(valgtRad.prox[0], 1)} m · PGA {formaterDesimal(valgtRad.prox[1], 1)} m
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div
            className="pa-card"
            style={{
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              minWidth: 0,
            }}
          >
            <span className="kicker">Anbefaling fra Caddie</span>
            <p
              style={{
                margin: 0,
                font: "var(--type-body-s)",
                color: "var(--text-secondary)",
              }}
            >
              {verdi < 0
                ? `${langtNavn(valgtRad)} koster deg ${formaterSg(verdi)} slag per runde. Legg inn målrettede øvelser i treningsplanen.`
                : `${langtNavn(valgtRad)} er en styrke i spillet ditt med ${formaterSg(verdi)} gevinst per runde.`}
            </p>
            <div style={{ marginTop: 8 }}>
              <KnappLenke
                variant="secondary"
                size="sm"
                href="/portal/drills"
              >
                Finn øvelser i øvelsesbanken
              </KnappLenke>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
