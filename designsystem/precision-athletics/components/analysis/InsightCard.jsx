import React from "react";
import { Button } from "../core/Button.jsx";
import { StatusPill } from "../display/StatusPill.jsx";
import { SourceBadge } from "./SourceBadge.jsx";
import { DataQualityBadge } from "./DataQualityBadge.jsx";
const K = { haster: ["signal", "Haster"], trend: ["neutral", "Trend"], mal: ["info", "Mål"], datamangel: ["neutral", "Datamangel"], stabil: ["ok", "Stabilt"] };
/** Innsikt → tiltak. Årsak, evidens, anbefaling og minst én handling. */
export function InsightCard({ kind = "trend", title, cause, evidence = [], recommendation, source, quality, actions = [], onEvidence, draft }) {
  const [tone, lbl] = K[kind] || K.trend;
  return <article className="pa-card" style={{ padding: 16, gap: 12, minWidth: 0 }}>
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><StatusPill tone={tone}>{lbl}</StatusPill>{quality && <DataQualityBadge {...quality} />}{draft && <StatusPill tone="neutral">Utkast fra Caddie</StatusPill>}</div>
    <h3 style={{ margin: 0, font: "var(--type-title-s)", color: "var(--text-primary)", textWrap: "pretty" }}>{title}</h3>
    {cause && <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>{cause}</p>}
    {evidence.length > 0 && <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,140px),1fr))", gap: 8 }}>{evidence.map(([l, v]) => <div key={l} style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}><dt style={{ font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-muted)", textTransform: "uppercase" }}>{l}</dt><dd style={{ margin: 0, font: "var(--type-num)", fontVariantNumeric: "tabular-nums", color: "var(--text-primary)" }}>{v == null || v === "" ? "—" : v}</dd></div>)}</dl>}
    {recommendation && <p style={{ margin: 0, font: "500 14px/1.45 var(--font-sans)", color: "var(--text-primary)", textWrap: "pretty" }}>{recommendation}</p>}
    <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 12, marginTop: "auto", borderTop: "1px solid var(--border-hairline)" }}>{source && <SourceBadge {...source} />}
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{actions.map((a, i) => <Button key={a.label} size="sm" variant={a.primary ? "primary" : "secondary"} icon={a.icon} onClick={a.onClick}>{a.label}</Button>)}{onEvidence && <Button size="sm" variant="ghost" icon="list-tree" onClick={onEvidence}>Se grunnlaget</Button>}</div></div>
  </article>;
}
