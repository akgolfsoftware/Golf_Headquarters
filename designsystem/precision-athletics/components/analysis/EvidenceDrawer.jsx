import React from "react";
import { Sheet } from "../feedback/Sheet.jsx";
/** Tallene bak en innsikt: verdi, kilde, dato, n, usikkerhet og hva som mangler. */
export function EvidenceDrawer({ open, onClose, title, rows = [], uncertainty, missing = [], method }) {
  const m = { font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-muted)", textTransform: "uppercase" };
  return <Sheet open={open} onClose={onClose} kicker="Grunnlag" title={title}>
    <table style={{ width: "100%", borderCollapse: "collapse", font: "var(--type-body-s)" }}><caption style={{ ...m, textAlign: "left", paddingBottom: 6 }}>Tall og kilder</caption><tbody>{rows.map((r) => <tr key={r.label} style={{ borderTop: "1px solid var(--border-hairline)" }}>
      <th scope="row" style={{ textAlign: "left", fontWeight: 500, padding: "8px 8px 8px 0", verticalAlign: "top" }}>{r.label}<div style={m}>{[r.source, r.date, r.n != null ? "n=" + r.n : null].filter(Boolean).join(" · ") || "KILDE MANGLER"}</div></th>
      <td style={{ textAlign: "right", font: "var(--type-num)", fontVariantNumeric: "tabular-nums", padding: "8px 0", verticalAlign: "top" }}>{r.value == null || r.value === "" ? "—" : r.value}</td></tr>)}</tbody></table>
    {uncertainty && <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}><b>Usikkerhet:</b> {uncertainty}</p>}
    {method && <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}><b>Slik er det regnet:</b> {method}</p>}
    {missing.length > 0 && <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><span style={m}>Mangler</span><ul style={{ margin: 0, paddingLeft: 18, font: "var(--type-body-s)" }}>{missing.map((x) => <li key={x}>{x}</li>)}</ul></div>}
  </Sheet>;
}
