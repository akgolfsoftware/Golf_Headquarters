import React from "react";
const fmt = (v, d = 1) => v == null ? "—" : (v > 0 ? "+" : v < 0 ? "−" : "±") + Math.abs(v).toFixed(d).replace(".", ",");
/** Linje over tid. symmetric=true: lik skala over og under null (SG). null gir brudd, ikke 0. */
export function TrendChart({ series = [], labels = [], symmetric = true, zero = true, min, max, height = 160, format = fmt, goal, caption, unit = "" }) {
  const all = series.flatMap((s) => s.values).filter((v) => v != null);
  if (all.length < 2) return <div style={{ height, display: "grid", placeItems: "center", font: "var(--type-meta)", color: "var(--text-muted)", border: "1px dashed var(--border-strong)", borderRadius: 8 }}>— FOR FÅ MÅLINGER</div>;
  let lo = min ?? Math.min(...all, goal ?? Infinity), hi = max ?? Math.max(...all, goal ?? -Infinity);
  if (symmetric) { const m = Math.max(Math.abs(lo), Math.abs(hi)) || 1; lo = -m; hi = m; }
  const n = Math.max(...series.map((s) => s.values.length)), X = (i) => n < 2 ? 50 : (i / (n - 1)) * 100, Y = (v) => 100 - ((v - lo) / (hi - lo || 1)) * 100;
  const seg = (vals) => { const out = []; let cur = []; vals.forEach((v, i) => { if (v == null) { if (cur.length) out.push(cur); cur = []; } else cur.push([X(i), Y(v)]); }); if (cur.length) out.push(cur); return out; };
  const summary = series.map((s) => s.label + ": " + s.values.map((v, i) => (labels[i] || i + 1) + " " + format(v) + unit).join(", ")).join(". ");
  const stroke = ["var(--text-primary)", "var(--text-muted)"];
  return <figure style={{ margin: 0, display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
    <div style={{ display: "grid", gridTemplateColumns: "44px minmax(0,1fr)", gap: 6 }}>
      <div style={{ position: "relative", height, font: "var(--type-meta)", color: "var(--text-muted)", textAlign: "right" }}><span style={{ position: "absolute", right: 0, top: -6 }}>{format(hi)}</span>{zero && lo < 0 && hi > 0 && <span style={{ position: "absolute", right: 0, top: Y(0) / 100 * height - 6 }}>0</span>}<span style={{ position: "absolute", right: 0, bottom: -6 }}>{format(lo)}</span></div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={summary} style={{ width: "100%", height, display: "block", overflow: "visible" }}>
        <rect x="0" y="0" width="100" height="100" fill="none" stroke="var(--border-hairline)" vectorEffect="non-scaling-stroke" />
        {zero && lo < 0 && hi > 0 && <line x1="0" x2="100" y1={Y(0)} y2={Y(0)} stroke="var(--border-ink)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />}
        {goal != null && <line x1="0" x2="100" y1={Y(goal)} y2={Y(goal)} stroke="var(--text-secondary)" strokeDasharray="4 3" vectorEffect="non-scaling-stroke" />}
        {series.map((s, si) => seg(s.values).map((pts, k) => pts.length === 1 ? <circle key={si + "-" + k} cx={pts[0][0]} cy={pts[0][1]} r="1.2" fill={stroke[si % 2]} /> : <polyline key={si + "-" + k} points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke={stroke[si % 2]} strokeWidth="2" strokeDasharray={si ? "5 4" : undefined} vectorEffect="non-scaling-stroke" />))}
      </svg>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 4, paddingLeft: 50, font: "var(--type-meta)", color: "var(--text-muted)" }}>{labels.length > 0 && [labels[0], labels[Math.floor((labels.length - 1) / 2)], labels[labels.length - 1]].map((l, i) => <span key={i}>{l}</span>)}</div>
    {(caption || series.length > 1) && <figcaption style={{ display: "flex", gap: 12, flexWrap: "wrap", font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-muted)" }}>{series.length > 1 && series.map((s, i) => <span key={s.label} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 16, borderTop: "2px " + (i ? "dashed" : "solid") + " " + stroke[i % 2] }} />{s.label}</span>)}{caption && <span>{caption}</span>}</figcaption>}
  </figure>;
}
