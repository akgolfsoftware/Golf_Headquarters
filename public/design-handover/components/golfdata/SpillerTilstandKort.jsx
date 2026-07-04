import React from "react";
import { DeltaIndikator } from "../data/DeltaIndikator.jsx";
import { Skeleton } from "../structure/Skeleton.jsx";

/**
 * AK Golf HQ — SpillerTilstandKort
 * Coach-cockpitens 5-sekunderssvar: navn → form → trend → siste aktivitet → ett flagg.
 * Coach-komponent (fagkoder ok). Farge aldri eneste bærer (form-ord + prikk + trend).
 */
const CSS = `
.ak-stk{display:flex;align-items:center;gap:14px;background:var(--surface);border:1px solid var(--border);
  border-radius:var(--radius-card);padding:14px 16px;width:100%;text-align:left;cursor:default;}
button.ak-stk{cursor:pointer;transition:border-color var(--dur-fast) var(--ease-standard),background var(--dur-fast) var(--ease-standard);}
button.ak-stk:hover{border-color:var(--border-strong);background:var(--surface-hover);}
button.ak-stk:focus-visible{outline:none;box-shadow:var(--glow-signal);}
.ak-stk__av{width:40px;height:40px;flex:none;border-radius:9999px;display:flex;align-items:center;justify-content:center;
  font-family:var(--font-mono);font-weight:700;font-size:13px;letter-spacing:.03em;
  background:var(--surface-2);color:var(--text-2);border:1px solid var(--border);}
.ak-stk__navn{font-family:var(--font-display);font-weight:600;font-size:var(--text-14);color:var(--text);}
.ak-stk__meta{font-family:var(--font-mono);font-size:var(--text-11);color:var(--text-muted);margin-top:3px;}
.ak-stk__form{display:inline-flex;align-items:center;gap:6px;font-family:var(--font-mono);font-size:var(--text-11);font-weight:700;}
.ak-stk__dot{width:8px;height:8px;border-radius:9999px;flex:none;}
.ak-stk__flag{display:inline-flex;align-items:center;gap:5px;height:22px;padding:0 8px;border-radius:6px;
  font-family:var(--font-mono);font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;white-space:nowrap;}
`;
if (typeof document !== "undefined" && !document.getElementById("ak-stk-css")) {
  const s = document.createElement("style"); s.id = "ak-stk-css"; s.textContent = CSS; document.head.appendChild(s);
}
const TONE = {
  god:    { c: "var(--up)",    t: "God form" },
  stabil: { c: "var(--text-muted)", t: "Stabil" },
  varsel: { c: "var(--warn, var(--down))", t: "Følg opp" },
  risiko: { c: "var(--down)",  t: "Risiko" },
};

export function SpillerTilstandKort({
  navn, initialer, tilstand = "stabil", formTekst, sgTrend, sgTrendLabel,
  sisteAktivitet, flagg, loading = false, onClick, className = "", style,
}) {
  if (loading) return <Skeleton variant="card" width="100%" height={72} className={className} style={style} />;
  const T = TONE[tilstand] || TONE.stabil;
  const ini = initialer || (navn ? navn.split(" ").map((w) => w[0]).slice(0, 2).join("") : "?");
  const Tag = onClick ? "button" : "div";
  return (
    <Tag className={`ak-stk ${className}`} style={style} onClick={onClick} {...(onClick ? { type: "button" } : {})}>
      <span className="ak-stk__av">{ini}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span className="ak-stk__navn">{navn}</span>
          <span className="ak-stk__form" style={{ color: T.c }}><span className="ak-stk__dot" style={{ background: T.c }} />{formTekst || T.t}</span>
        </div>
        <div className="ak-stk__meta">{sisteAktivitet ? `Sist aktiv ${sisteAktivitet}` : "Ingen aktivitet ennå"}</div>
      </div>
      {sgTrend != null && <DeltaIndikator verdi={sgTrend} size="md" srLabel={sgTrendLabel || "SG-trend"} />}
      {flagg && (
        <span className="ak-stk__flag" style={{ color: "var(--down)", background: "color-mix(in srgb,var(--down) 14%,transparent)", border: "1px solid color-mix(in srgb,var(--down) 36%,transparent)" }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          {flagg}
        </span>
      )}
    </Tag>
  );
}
