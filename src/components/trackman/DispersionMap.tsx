"use client";

/**
 * DispersionMap — TM-11 hero-komponenten. Topp-syn scatter av TrackMan-slag
 * med 1σ/2σ-ellipse, stiplet mållinje og tre bøtter (68/27/5-mønsteret).
 * Ren visning — all regning kommer ferdig fra
 * `src/lib/trackman/dispersion-map.ts` (computeTrackManDispersionMap).
 *
 * Fasit: designsystem/train-lock/HANDOFF.md §LANSERINGSKJERNE (TM-11) +
 * §TRACKMAN (TM-00 TmDispersionPlot) + TM-08f (slag-ark fra prikk).
 * Tokens: KUN TL.* (train-lock.ts) — aldri T.* (Paper).
 *
 * Prikker er ALLTID #B08968 (TL.viz.dot) uansett bøtte — bøtte-fargene
 * (good/acceptable/disaster) brukes KUN i bøtte-baren under kartet og ALDRI
 * som per-prikk-farge (HANDOFF: «ikke som generell fargekoding»). Valgt slag
 * = hvit ring. Outliers (disaster-bøtta) dempes med TL.opasitet.outlier.
 */

import { useMemo } from "react";
import { TL } from "@/lib/v2/train-lock";
import type { DispersionMapShot } from "@/lib/trackman/dispersion-map";
import type { DispersionEllipse } from "@/lib/gameplan/dispersion";

const VIEW_W = 320;
const VIEW_H = 260;
const PAD = 28;

export type SigmaLevel = 1 | 2;

export interface DispersionMapProps {
  shots: DispersionMapShot[];
  oneSigmaEllipse: DispersionEllipse | null;
  twoSigmaEllipse: DispersionEllipse | null;
  hasEllipse: boolean;
  sigma: SigmaLevel;
  selectedShotId: string | null;
  onSelectShot: (shot: DispersionMapShot) => void;
  /** Vis bias-pil fra senter (0,0) til snitt-punkt. Toggle, AV som standard (HANDOFF). */
  showBiasArrow: boolean;
}

export function DispersionMap({
  shots,
  oneSigmaEllipse,
  twoSigmaEllipse,
  hasEllipse,
  sigma,
  selectedShotId,
  onSelectShot,
  showBiasArrow,
}: DispersionMapProps) {
  const ellipse = sigma === 1 ? oneSigmaEllipse : twoSigmaEllipse;

  const { toX, toY, meanLateral, meanDistance } = useMemo(() => {
    const lateralVals = shots.map((s) => s.point.lateral);
    const distanceVals = shots.map((s) => s.point.distance);
    const ellipseReach = ellipse ? Math.max(ellipse.semiMajor, ellipse.semiMinor) : 0;
    const maxLateral = Math.max(10, ellipseReach, ...lateralVals.map((v) => Math.abs(v)), 0);
    const maxDistance = Math.max(10, ellipseReach, ...distanceVals.map((v) => Math.abs(v)), 0);
    // Kvadratisk skala (samme meter/px begge retninger) — ellipsens form er ekte.
    const scale = Math.min((VIEW_W - PAD * 2) / (maxLateral * 2), (VIEW_H - PAD * 2) / (maxDistance * 2));
    const cx = VIEW_W / 2;
    const cy = VIEW_H / 2;
    return {
      toX: (lateral: number) => cx + lateral * scale,
      // Distance er "carry forbi snitt" — lang = opp på skjermen (mindre y).
      toY: (distance: number) => cy - distance * scale,
      meanLateral: lateralVals.length > 0 ? lateralVals.reduce((a, b) => a + b, 0) / lateralVals.length : 0,
      meanDistance: distanceVals.length > 0 ? distanceVals.reduce((a, b) => a + b, 0) / distanceVals.length : 0,
    };
  }, [shots, ellipse]);

  const lastShotId = shots.length > 0 ? shots[shots.length - 1].id : null;

  return (
    <div
      style={{
        background: TL.elev,
        border: `1px solid ${TL.hair}`,
        borderRadius: TL.radius.card,
        padding: 4,
      }}
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width="100%"
        height={240}
        role="img"
        aria-label="Spredningskart for TrackMan-slag"
      >
        {/* Stiplet mållinje — vertikal, lateral = 0 (sikte-linjen). */}
        <line
          x1={toX(0)}
          y1={PAD / 2}
          x2={toX(0)}
          y2={VIEW_H - PAD / 2}
          stroke={TL.viz.target}
          strokeOpacity={0.35}
          strokeWidth={1}
          strokeDasharray="4 5"
        />

        {/* 1σ/2σ-ellipse — kun når hasEllipse. */}
        {hasEllipse && ellipse && (
          <g
            transform={`translate(${toX(ellipse.centerLateral)} ${toY(ellipse.centerDistance)}) rotate(${(-ellipse.angleRad * 180) / Math.PI})`}
          >
            <ellipse
              cx={0}
              cy={0}
              rx={ellipse.semiMinor * (toX(1) - toX(0))}
              ry={ellipse.semiMajor * (toY(0) - toY(1))}
              fill={TL.viz.ellipseFill}
              stroke={TL.viz.ellipseLine}
              strokeWidth={1}
            />
          </g>
        )}

        {/* Bias-pil (toggle, AV som standard). */}
        {showBiasArrow && hasEllipse && (Math.abs(meanLateral) > 0.5 || Math.abs(meanDistance) > 0.5) && (
          <line
            x1={toX(0)}
            y1={toY(0)}
            x2={toX(meanLateral)}
            y2={toY(meanDistance)}
            stroke={TL.viz.target}
            strokeWidth={1.5}
            markerEnd="url(#dispersion-arrow)"
          />
        )}
        <defs>
          <marker id="dispersion-arrow" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={TL.viz.target} />
          </marker>
        </defs>

        {/* Prikker — #B08968, siste slag hvit ring, valgt slag hvit ring, outliers dempet. */}
        {shots.map((s) => {
          const cx = toX(s.point.lateral);
          const cy = toY(s.point.distance);
          const isSelected = s.id === selectedShotId;
          const isLast = s.id === lastShotId;
          const isOutlier = s.bucket === "disaster";
          const r = isSelected || isLast ? 5 : 4;
          return (
            <g key={s.id}>
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill={TL.viz.dot}
                stroke={isSelected || isLast ? "#FFFFFF" : "none"}
                strokeWidth={isSelected || isLast ? 2 : 0}
                onClick={() => onSelectShot(s)}
                role="button"
                tabIndex={0}
                aria-label={`Slag ${s.shotNumber}`}
                style={{ opacity: isOutlier && !isSelected ? TL.opasitet.outlier : 1, cursor: "pointer" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onSelectShot(s);
                }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** «Tre bøtter 68/27/5» — stablet bar under kartet, HANDOFF §LANSERINGSKJERNE. */
export function DispersionBucketBar({
  good,
  acceptable,
  disaster,
}: {
  good: number;
  acceptable: number;
  disaster: number;
}) {
  const pct = (v: number) => Math.round(v * 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden", background: TL.dim }}>
        <div style={{ width: `${pct(good)}%`, background: TL.viz.good }} />
        <div style={{ width: `${pct(acceptable)}%`, background: TL.viz.acceptable }} />
        <div style={{ width: `${pct(disaster)}%`, background: TL.viz.disaster }} />
      </div>
      <div
        style={{
          display: "flex",
          gap: 12,
          fontFamily: TL.font.mono,
          fontSize: 10.5,
          color: TL.mute,
        }}
      >
        <span>{pct(good)} % innenfor 1σ</span>
        <span>{pct(acceptable)} % 1–2σ</span>
        <span>{pct(disaster)} % utenfor 2σ</span>
      </div>
    </div>
  );
}
