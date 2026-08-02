import React from "react";
import { ensureCss, Region } from "./viz.jsx";
ensureCss("akhq-css-spark", "");
export function Sparkline({ data = [], color = "info", width = 120, height = 32, state = "content", emptyText = "Trenden vises etter tre m\u00e5linger.", dataOdId = "kpi-sparkline", ...rest }) {
  const stroke = color === "up" ? "var(--up-raw)" : "var(--info-raw)";
  if (state !== "content") return <Region state={state} empty={emptyText} height={height} />;
  if (data.length < 2) return <p className="akhq-empty">{emptyText}</p>;
  const min = Math.min(...data), max = Math.max(...data), span = max - min || 1;
  const pts = data.map((v, i) => [i / (data.length - 1) * (width - 6) + 3, height - 4 - (v - min) / span * (height - 8)]);
  const last = pts[pts.length - 1];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Trend" data-od-id={dataOdId} {...rest}>
      <polyline points={pts.map(p => p.join(",")).join(" ")} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={stroke} />
    </svg>
  );
}
