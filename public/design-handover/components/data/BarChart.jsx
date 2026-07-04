import React from "react";
import { Skeleton } from "../structure/Skeleton.jsx";
import { DataPreview } from "../core/DataPreview.jsx";

/**
 * AK Golf HQ — BarChart
 * Horizontal bar chart for rankings and distributions.
 * Active item renders in lime; others in a muted token.
 * Compact height (8px track). Use showRank=true for leaderboard style.
 */

const CSS = `
.ak-barchart{display:flex;flex-direction:column;gap:8px;width:100%;}
.ak-bc__row{display:flex;align-items:center;gap:10px;min-height:24px;}
.ak-bc__rank{
  font-family:var(--font-mono);font-size:10px;font-weight:600;
  color:var(--text-muted);width:16px;text-align:right;flex-shrink:0;
}
.ak-bc__label{
  font-family:var(--font-ui);font-size:var(--text-13);font-weight:500;
  color:var(--text-2);flex-shrink:0;text-align:right;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.ak-bc__track{
  flex:1;height:8px;border-radius:9999px;
  background:var(--track);position:relative;overflow:hidden;
}
.ak-bc__fill{height:100%;border-radius:9999px;transition:width var(--dur-base) var(--ease-out);}
.ak-bc__val{
  font-family:var(--font-mono);font-size:var(--text-12);font-weight:600;
  color:var(--text);flex-shrink:0;font-variant-numeric:tabular-nums;
  min-width:36px;text-align:right;
}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-bc-css")) {
  const s = document.createElement("style");
  s.id = "ak-bc-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function BarChart({
  items = [],
  loading = false,
  labelWidth = 80,
  showRank = false,
  color = "var(--graphite-400)",
  maxValue,
  formatValue,
  className = "",
  style,
}) {
  if (loading) {
    return <Skeleton variant="card" width="100%" height={140} className={className} style={style} />;
  }
  if (!items || items.length === 0) {
    return (
      <div
        className={className}
        role="status"
        style={{
          height: 140, display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 6, padding: 16, boxSizing: "border-box",
          border: "1px dashed var(--border-strong)", borderRadius: "var(--radius-card)",
          background: "var(--surface)", textAlign: "center", ...style,
        }}
      >
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>Ingen data ennå</span>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-2)", lineHeight: 1.4 }}>Serien er tom — data vises når de er registrert.</span>
      </div>
    );
  }
  const max = maxValue ?? Math.max(1, ...items.map((it) => it.value));
  const [hover, setHover] = React.useState(null); // {i, x}
  return (
    <div className={`ak-barchart ${className}`} style={style}>
      {items.map((it, i) => (
        <div
          key={i}
          className="ak-bc__row"
          style={{ position: "relative" }}
          onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setHover({ i, x: e.clientX - r.left }); }}
          onMouseLeave={() => setHover((h) => (h && h.i === i ? null : h))}
        >
          {showRank && <span className="ak-bc__rank">{i + 1}</span>}
          <span className="ak-bc__label" style={{ width: labelWidth }}>{it.label}</span>
          <div className="ak-bc__track">
            <div
              className="ak-bc__fill"
              style={{
                width: `${(it.value / max) * 100}%`,
                background: it.active ? "var(--signal)" : (it.color || color),
              }}
            />
          </div>
          <span className="ak-bc__val">
            {formatValue ? formatValue(it.value) : it.value}
          </span>
          {hover && hover.i === i && (
            <DataPreview
              visible
              x={hover.x}
              y={-2}
              placement="top"
              label={it.label}
              value={formatValue ? formatValue(it.value) : it.value}
              delta={it.delta}
              accent={it.active ? "var(--signal)" : undefined}
              note={it.note != null ? it.note : `${Math.round((it.value / max) * 100)} % av høyeste`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
