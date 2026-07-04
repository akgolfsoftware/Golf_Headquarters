import React from "react";
import { Skeleton } from "../structure/Skeleton.jsx";

/**
 * AK Golf HQ — Scorekort
 * Hull-for-hull med SG per hull + runde-sammendrag. Score farget mot par
 * (aldri eneste bærer — tallet + fortegn bærer også). SG i «slag».
 */
const CSS = `
.ak-sk{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);padding:16px;}
.ak-sk__grid{display:grid;grid-template-columns:repeat(9,1fr);gap:5px;}
.ak-sk__cell{border:1px solid var(--border);border-radius:8px;padding:6px 0;text-align:center;background:var(--surface-2);}
.ak-sk__nr{font-family:var(--font-mono);font-size:8.5px;color:var(--text-muted);}
.ak-sk__sc{font-family:var(--font-mono);font-size:var(--text-14);font-weight:700;line-height:1.2;margin-top:2px;}
.ak-sk__sg{font-family:var(--font-mono);font-size:8px;margin-top:1px;font-variant-numeric:tabular-nums;}
.ak-sk__sum{display:flex;align-items:baseline;gap:14px;margin-bottom:12px;}
.ak-sk__big{font-family:var(--font-mono);font-size:var(--text-30);font-weight:700;color:var(--text);letter-spacing:-0.02em;}
`;
if (typeof document !== "undefined" && !document.getElementById("ak-sk-css")) {
  const s = document.createElement("style"); s.id = "ak-sk-css"; s.textContent = CSS; document.head.appendChild(s);
}
const scoreColor = (d) => d < 0 ? "var(--up)" : d > 1 ? "var(--down)" : d === 1 ? "var(--warn, var(--down))" : "var(--text)";
const rel = (d) => d === 0 ? "E" : d > 0 ? `+${d}` : `${d}`;
const sgFmt = (v) => v == null ? "" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(1).replace(".", ",");

export function Scorekort({ hull = [], sammendrag, baseline = "par", loading = false, className = "", style }) {
  if (loading) return <Skeleton variant="card" width="100%" height={200} className={className} style={style} />;
  if (!hull.length) {
    return (
      <div className={`ak-sk ${className}`} role="status" style={style}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-11)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>Scorekort</span>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: "var(--text-13)", color: "var(--text-2)", lineHeight: 1.5, margin: "10px 0 0" }}>Logg en runde for å se hull-for-hull med Strokes Gained.</p>
      </div>
    );
  }
  const totScore = sammendrag ? sammendrag.score : hull.reduce((s, h) => s + h.score, 0);
  const totPar = sammendrag ? sammendrag.par : hull.reduce((s, h) => s + h.par, 0);
  const totSg = sammendrag ? sammendrag.sg : hull.reduce((s, h) => s + (h.sg || 0), 0);
  return (
    <div className={`ak-sk ${className}`} style={style}>
      <div className="ak-sk__sum">
        <div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-11)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Score</span>
          <span className="ak-sk__big">{totScore} <span style={{ fontSize: "var(--text-14)", color: scoreColor(totScore - totPar) }}>{rel(totScore - totPar)}</span></span>
        </div>
        <div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-11)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: 4 }}>SG runde</span>
          <span className="ak-sk__big" style={{ color: totSg >= 0 ? "var(--up)" : "var(--down)", fontSize: "var(--text-24)" }}>{sgFmt(totSg)} <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-11)", color: "var(--text-muted)" }}>slag</span></span>
        </div>
      </div>
      <div className="ak-sk__grid">
        {hull.map((h) => {
          const d = h.score - h.par;
          return (
            <div key={h.nr} className="ak-sk__cell">
              <div className="ak-sk__nr">{h.nr} · par {h.par}</div>
              <div className="ak-sk__sc" style={{ color: scoreColor(d) }}>{h.score}</div>
              {h.sg != null && <div className="ak-sk__sg" style={{ color: h.sg >= 0 ? "var(--up)" : "var(--down)" }}>{sgFmt(h.sg)}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
