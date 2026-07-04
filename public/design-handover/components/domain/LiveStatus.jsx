import React from "react";

/**
 * AK Golf HQ — LiveStatus
 * Live-økt-indikator + økt-timer. LIVE = pulserende rød prikk + løpende tid.
 * Puls respekterer prefers-reduced-motion. Status: live/pause/ferdig (ord + farge).
 */
const CSS = `
.ak-live{display:inline-flex;align-items:center;gap:12px;background:var(--surface);border:1px solid var(--border);
  border-radius:var(--radius-pill);padding:8px 15px;}
.ak-live__dot{width:9px;height:9px;border-radius:9999px;flex:none;position:relative;}
.ak-live__dot--live{background:var(--down);}
.ak-live__dot--live::after{content:"";position:absolute;inset:-4px;border-radius:9999px;border:2px solid var(--down);
  animation:ak-live-pulse 1.6s var(--ease-standard) infinite;}
.ak-live__dot--pause{background:var(--warn,var(--text-muted));}
.ak-live__dot--ferdig{background:var(--up);}
.ak-live__lbl{font-family:var(--font-mono);font-size:var(--text-11);font-weight:700;letter-spacing:.1em;text-transform:uppercase;}
.ak-live__tid{font-family:var(--font-mono);font-size:var(--text-14);font-weight:700;color:var(--text);font-variant-numeric:tabular-nums;}
@keyframes ak-live-pulse{0%{transform:scale(1);opacity:.7}70%{transform:scale(1.8);opacity:0}100%{opacity:0}}
@media (prefers-reduced-motion: reduce){.ak-live__dot--live::after{animation:none;opacity:0;}}
`;
if (typeof document !== "undefined" && !document.getElementById("ak-live-css")) {
  const s = document.createElement("style"); s.id = "ak-live-css"; s.textContent = CSS; document.head.appendChild(s);
}
const ST = { live: { c: "var(--down)", t: "Live" }, pause: { c: "var(--warn, var(--text-muted))", t: "Pause" }, ferdig: { c: "var(--up)", t: "Ferdig" } };

export function LiveStatus({ status = "live", tid, deltakere, className = "", style }) {
  const S = ST[status] || ST.live;
  return (
    <span className={`ak-live ${className}`} style={style} role="status" aria-label={`${S.t}${tid ? " " + tid : ""}`}>
      <span className={`ak-live__dot ak-live__dot--${status}`} />
      <span className="ak-live__lbl" style={{ color: S.c }}>{S.t}</span>
      {tid != null && <span className="ak-live__tid">{tid}</span>}
      {deltakere != null && (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-11)", color: "var(--text-muted)" }}>· {deltakere} spillere</span>
      )}
    </span>
  );
}
