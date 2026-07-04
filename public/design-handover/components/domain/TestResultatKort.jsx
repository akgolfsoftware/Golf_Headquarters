import React from "react";
import { DeltaIndikator } from "../data/DeltaIndikator.jsx";
import { Skeleton } from "../structure/Skeleton.jsx";

/**
 * AK Golf HQ — TestResultatKort
 * Generisk resultatkort for alle testprotokoller: verdi vs krav (bestått/ikke),
 * pyramideområde-farge, trend, valgfri M/PR-badge. Dekker de 20 protokollene.
 */
const CSS = `
.ak-trk{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);overflow:hidden;}
.ak-trk__top{display:flex;align-items:flex-start;gap:11px;padding:15px 16px 13px;}
.ak-trk__edge{width:4px;align-self:stretch;border-radius:3px;flex:none;}
.ak-trk__navn{font-family:var(--font-display);font-weight:600;font-size:var(--text-14);color:var(--text);}
.ak-trk__meta{font-family:var(--font-mono);font-size:var(--text-11);color:var(--text-muted);margin-top:4px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;}
.ak-trk__badge{display:inline-flex;align-items:center;height:18px;padding:0 7px;border-radius:5px;
  font-family:var(--font-mono);font-size:9px;font-weight:700;color:var(--text-2);background:var(--surface-2);border:1px solid var(--border);}
.ak-trk__body{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;padding:0 16px 15px;}
.ak-trk__val{font-family:var(--font-mono);font-size:var(--text-30);font-weight:700;color:var(--text);letter-spacing:-0.02em;line-height:1;}
.ak-trk__unit{font-family:var(--font-mono);font-size:var(--text-12);color:var(--text-muted);margin-left:3px;}
.ak-trk__krav{display:inline-flex;align-items:center;gap:6px;font-family:var(--font-mono);font-size:var(--text-11);font-weight:700;}
`;
if (typeof document !== "undefined" && !document.getElementById("ak-trk-css")) {
  const s = document.createElement("style"); s.id = "ak-trk-css"; s.textContent = CSS; document.head.appendChild(s);
}
const AX = { FYS: "fys", TEK: "tek", SLAG: "slag", SPILL: "spill", TURN: "turn" };

export function TestResultatKort({
  navn, protokoll, omrade = "TEK", verdi, enhet, krav, bestatt, trend, invertert,
  arena, press, dato, loading = false, className = "", style,
}) {
  if (loading) return <Skeleton variant="card" width="100%" height={130} className={className} style={style} />;
  const cvar = `var(--axis-${AX[omrade] || "tek"})`;
  const kravFarge = bestatt == null ? "var(--text-muted)" : bestatt ? "var(--up)" : "var(--down)";
  return (
    <div className={`ak-trk ${className}`} style={style}>
      <div className="ak-trk__top">
        <span className="ak-trk__edge" style={{ background: cvar }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="ak-trk__navn">{navn}</div>
          <div className="ak-trk__meta">
            {protokoll && <span className="ak-trk__badge">{protokoll}</span>}
            <span style={{ color: cvar, fontWeight: 700 }}>{omrade}</span>
            {arena && <span className="ak-trk__badge">{arena}</span>}
            {press && <span className="ak-trk__badge">{press}</span>}
            {dato && <span>{dato}</span>}
          </div>
        </div>
      </div>
      <div className="ak-trk__body">
        <div>
          <span className="ak-trk__val">{verdi}{enhet && <span className="ak-trk__unit">{enhet}</span>}</span>
          {krav != null && (
            <div style={{ marginTop: 6 }}>
              <span className="ak-trk__krav" style={{ color: kravFarge }}>
                {bestatt != null && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={kravFarge} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {bestatt ? <path d="M20 6 9 17l-5-5" /> : <path d="M18 6 6 18M6 6l12 12" />}
                  </svg>
                )}
                {bestatt == null ? "" : bestatt ? "Bestått" : "Ikke bestått"} · krav {krav}
              </span>
            </div>
          )}
        </div>
        {trend != null && <DeltaIndikator verdi={trend} size="md" invertert={invertert} srLabel={`${navn} trend`} />}
      </div>
    </div>
  );
}
