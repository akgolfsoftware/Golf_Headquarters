"use client";

import React from "react";

/**
 * AK Golf HQ — AkseFordelingsBar
 * Kompakt stablet 1-bar: treningsfordelingen over FYS/TEK/SLAG/SPILL/TURN.
 * IKKE en pyramide og IKKE per-akse-rader. Skille fra naboer: Pyramid =
 * per-akse rader (magnitude), SgKategoriBar = SG per SG-kategori (divergerende).
 * Portet 1:1 fra Claude Design-prosjektets components/data/AkseFordelingsBar.jsx
 * (DesignSync 2026-07-08). CSS: ./golfdata.css (.ak-afb).
 */

export type AkseFordeling = {
  fys: number;
  tek: number;
  slag: number;
  spill: number;
  turn: number;
};

const AXES: { key: keyof AkseFordeling; label: string; token: string }[] = [
  { key: "fys", label: "FYS", token: "--axis-fys" },
  { key: "tek", label: "TEK", token: "--axis-tek" },
  { key: "slag", label: "SLAG", token: "--axis-slag" },
  { key: "spill", label: "SPILL", token: "--axis-spill" },
  { key: "turn", label: "TURN", token: "--axis-turn" },
];

export type AkseFordelingsBarProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Fordeling per akse (~100 til sammen; normaliseres uansett). */
  dist: AkseFordeling;
  /** Vis fem mono-caps-etiketter med fargeprikk + %. */
  showLegend?: boolean;
  /** Barhøyde i px. Default 8. */
  height?: number;
};

export function AkseFordelingsBar({
  dist,
  showLegend = false,
  height = 8,
  className = "",
  style,
  ...rest
}: AkseFordelingsBarProps) {
  const [drawn, setDrawn] = React.useState(false);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const total = AXES.reduce((s, a) => s + (Number(dist[a.key]) || 0), 0) || 1;
  const parts = AXES.map((a) => ({ ...a, pct: ((Number(dist[a.key]) || 0) / total) * 100 }));
  const aria = parts.map((p) => `${p.label} ${Math.round(p.pct)} %`).join(", ");

  return (
    <div className={`ak-afb ${className}`} style={style} {...rest}>
      <div className="ak-afb__bar" style={{ height }} role="img" aria-label={`Treningsfordeling: ${aria}`}>
        {parts.map((p) => (
          <div
            key={p.key}
            className="ak-afb__seg"
            style={{ flexBasis: drawn ? `${p.pct}%` : "0%", background: `var(${p.token})` }}
          />
        ))}
      </div>
      {showLegend && (
        <div className="ak-afb__legend" aria-hidden="true">
          {parts.map((p) => (
            <span key={p.key} className="ak-afb__item">
              <span className="ak-afb__dot" style={{ background: `var(${p.token})` }} />
              {p.label}
              <span className="ak-afb__pct">{Math.round(p.pct)} %</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
