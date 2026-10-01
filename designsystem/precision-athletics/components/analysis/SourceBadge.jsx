import React from "react";
import { Icon } from "../core/Icon.jsx";
const ICON = { trackman: "radar", golfbox: "flag", manuell: "pencil", annen_app: "smartphone", okt: "dumbbell", test: "clipboard-check", caddie: "sparkles", coach: "user-round", datagolf: "globe" };
/** Kilde · dato · antall observasjoner i mono. ESTIMAT merkes alltid. */
export function SourceBadge({ source, kind, date, n, unit, est, period }) {
  const parts = [source, period, date, n != null ? n + (unit ? " " + unit : "") : null].filter(Boolean);
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap", font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-muted)", textTransform: "uppercase", minWidth: 0 }}>
    {kind && <Icon name={ICON[kind] || "database"} size={12} />}
    <span>{parts.length ? parts.join(" · ") : "KILDE MANGLER"}</span>
    {est && <span style={{ padding: "1px 6px", border: "1px dashed var(--border-strong)", borderRadius: 4, color: "var(--text-secondary)" }}>ESTIMAT</span>}
  </span>;
}
