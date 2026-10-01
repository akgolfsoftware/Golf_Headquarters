import React from "react";
const AX = ["fys", "tek", "slag", "spill", "turn"], LB = { fys: "FYS", tek: "TEK", slag: "SLAG", spill: "SPILL", turn: "TURN" };
/** Volum per uke fordelt på aksene, med planlagt nivå som strek. Farge = akse, ingenting annet. */
export function AxisVolumeBars({ rows = [], max, unit = "min", legend = true }) {
  const hi = max || Math.max(1, ...rows.map((r) => Math.max(r.plan || 0, AX.reduce((s, a) => s + (r.parts?.[a] || 0), 0))));
  return <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
    {rows.map((r) => { const tot = r.parts ? AX.reduce((s, a) => s + (r.parts[a] || 0), 0) : null;
      return <div key={r.label} style={{ display: "grid", gridTemplateColumns: "minmax(56px,80px) minmax(0,1fr) minmax(64px,auto)", gap: 8, alignItems: "center" }}>
        <span style={{ font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-secondary)" }}>{r.label}</span>
        <div role="img" aria-label={r.label + ": " + (tot == null ? "ikke registrert" : AX.filter((a) => r.parts[a]).map((a) => LB[a] + " " + r.parts[a] + " " + unit).join(", ")) + (r.plan ? ". Plan " + r.plan + " " + unit : "")} style={{ position: "relative", height: 20, background: "var(--surface-sunken)", borderRadius: "var(--radius-mark)", display: "flex", overflow: "hidden" }}>
          {tot != null && AX.map((a) => r.parts[a] ? <span key={a} style={{ width: (r.parts[a] / hi * 100) + "%", background: "var(--axis-" + a + ")" }} /> : null)}
          {r.plan != null && <span aria-hidden="true" style={{ position: "absolute", top: -2, bottom: -2, left: "calc(" + (r.plan / hi * 100) + "% - 1px)", width: 2, background: "var(--border-ink)" }} />}
        </div>
        <span style={{ font: "var(--type-num-s)", fontVariantNumeric: "tabular-nums", textAlign: "right", color: "var(--text-primary)" }}>{tot == null ? "—" : tot + " " + unit}</span>
      </div>; })}
    {legend && <div style={{ display: "flex", gap: 12, flexWrap: "wrap", font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-muted)" }}>{AX.map((a) => <span key={a} style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--axis-" + a + ")" }} />{LB[a]}</span>)}<span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><span style={{ width: 2, height: 12, background: "var(--border-ink)" }} />PLAN</span></div>}
  </div>;
}
