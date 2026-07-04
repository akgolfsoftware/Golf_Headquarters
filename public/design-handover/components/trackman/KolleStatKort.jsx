import React from "react";
import { Skeleton } from "../structure/Skeleton.jsx";

/**
 * AK Golf HQ — KolleStatKort
 * Én kølles nøkkeltall fra en TrackMan-økt: snitt ± konsistens (std-avvik).
 * Konsistens er nøytral (muted mono) — aldri delta-farget; lavere = jevnere,
 * men tolkningen eies av coach/AI, ikke av fargen.
 * CS-nivå-badge kobler club speed til kanon (CS50–CS100).
 */

const CSS = `
.ak-kstat{
  background:var(--surface);border:1px solid var(--border);
  border-radius:var(--radius-card);padding:14px 16px;
  display:flex;flex-direction:column;gap:12px;min-width:0;
}
.ak-kstat__head{display:flex;align-items:baseline;gap:8px;}
.ak-kstat__navn{
  font-family:var(--font-display);font-size:var(--text-16);
  font-weight:var(--weight-semibold);color:var(--text);
  letter-spacing:var(--tracking-display);flex:1;min-width:0;
}
.ak-kstat__antall{
  font-family:var(--font-mono);font-size:10px;color:var(--text-muted);
  font-variant-numeric:tabular-nums;white-space:nowrap;
}
.ak-kstat__cs{
  font-family:var(--font-mono);font-size:9px;font-weight:700;
  letter-spacing:.06em;color:var(--text-2);
  border:1px solid var(--border-strong);border-radius:4px;padding:2px 6px;
}
.ak-kstat__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(96px,1fr));gap:10px 14px;}
.ak-kstat__cell{min-width:0;}
.ak-kstat__lbl{
  font-family:var(--font-mono);font-size:9px;font-weight:600;
  letter-spacing:.08em;text-transform:uppercase;color:var(--text-muted);
  display:block;margin-bottom:3px;white-space:nowrap;
}
.ak-kstat__val{
  font-family:var(--font-mono);font-size:var(--text-16);font-weight:700;
  color:var(--text);font-variant-numeric:tabular-nums;
}
.ak-kstat__enhet{font-size:10px;font-weight:500;color:var(--text-muted);margin-left:2px;}
.ak-kstat__sd{
  font-family:var(--font-mono);font-size:10px;color:var(--text-muted);
  font-variant-numeric:tabular-nums;display:block;margin-top:1px;
}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-kstat-css")) {
  const s = document.createElement("style");
  s.id = "ak-kstat-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function KolleStatKort({ navn, antall, stats = [], csNivaa, loading = false, className = "", style }) {
  if (loading) {
    return <Skeleton variant="card" width="100%" height={120} className={className} style={style} />;
  }
  if (!loading && (!stats || stats.length === 0)) {
    return (
      <div
        className={className}
        role="status"
        style={{
          height: 120, display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 6, padding: 16, boxSizing: "border-box",
          border: "1px dashed var(--border-strong)", borderRadius: "var(--radius-card)",
          background: "var(--surface)", textAlign: "center", ...style,
        }}
      >
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>Ingen målinger ennå</span>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-2)", lineHeight: 1.4 }}>Kortet fylles når TrackMan-slag er registrert (meter, m V/H).</span>
      </div>
    );
  }
  return (
    <div className={`ak-kstat ${className}`} style={style}>
      <div className="ak-kstat__head">
        <span className="ak-kstat__navn">{navn}</span>
        {csNivaa && <span className="ak-kstat__cs">{csNivaa}</span>}
        <span className="ak-kstat__antall">{antall} slag</span>
      </div>
      <div className="ak-kstat__grid">
        {stats.map((s) => (
          <div key={s.label} className="ak-kstat__cell">
            <span className="ak-kstat__lbl">{s.label}</span>
            <span className="ak-kstat__val">
              {s.snitt}
              {s.enhet && <span className="ak-kstat__enhet">{s.enhet}</span>}
            </span>
            {s.konsistens && <span className="ak-kstat__sd">±{s.konsistens}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
