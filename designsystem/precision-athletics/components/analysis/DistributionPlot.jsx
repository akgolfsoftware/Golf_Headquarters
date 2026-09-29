import React from "react";
const dec = (v) => v == null ? "—" : (v < 0 ? "−" : "") + Math.abs(v).toFixed(1).replace(".", ",");
/** Spredning rundt mål (TrackMan eller putting). Punkt = ett slag. Tekstsammendrag alltid med. */
export function DistributionPlot({ points = [], range = 20, unitX = "m", unitY = "m", target = true, label = "Spredning", height = 240, xLabel = "Offline", yLabel = "Carry-avvik" }) {
  const n = points.length, mx = n ? points.reduce((s, p) => s + p.x, 0) / n : null, my = n ? points.reduce((s, p) => s + p.y, 0) / n : null;
  const sd = n > 1 ? Math.sqrt(points.reduce((s, p) => s + (p.x - mx) ** 2, 0) / (n - 1)) : null;
  const S = (v) => 50 + (v / range) * 50;
  const text = n ? n + " slag. Snitt " + xLabel.toLowerCase() + " " + dec(mx) + " " + unitX + ", " + yLabel.toLowerCase() + " " + dec(my) + " " + unitY + ". Standardavvik sideveis " + dec(sd) + " " + unitX + "." : "Ingen slag.";
  return <figure style={{ margin: 0, display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
    <svg viewBox="0 0 100 100" role="img" aria-label={label + ": " + text} style={{ width: "100%", maxWidth: height, aspectRatio: "1", alignSelf: "center", display: "block" }}>
      <rect x="0" y="0" width="100" height="100" fill="var(--surface-sunken)" />
      {[0.33, 0.66].map((r) => <circle key={r} cx="50" cy="50" r={r * 50} fill="none" stroke="var(--border-hairline)" />)}
      <line x1="50" x2="50" y1="0" y2="100" stroke="var(--border-strong)" /><line y1="50" y2="50" x1="0" x2="100" stroke="var(--border-strong)" />
      {target && <circle cx="50" cy="50" r="2.2" fill="none" stroke="var(--border-ink)" strokeWidth="1.2" />}
      {points.map((p, i) => <circle key={i} cx={S(p.x)} cy={100 - S(p.y)} r="1.6" fill="var(--text-primary)" opacity=".7" />)}
      {mx != null && <circle cx={S(mx)} cy={100 - S(my)} r="3" fill="none" stroke="var(--text-primary)" strokeWidth="1.2" strokeDasharray="2 1.5" />}
    </svg>
    <figcaption style={{ font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-muted)", textAlign: "center" }}>{text.toUpperCase()}</figcaption>
  </figure>;
}
