import { Skeleton } from "./Skeleton";

/**
 * AK Golf HQ — Scorekort
 * Hull-for-hull med SG per hull + runde-sammendrag. Score farget mot par
 * (aldri eneste bærer — tallet + fortegn bærer også). SG i «slag».
 */

export type Hull = {
  nr: number;
  par: number;
  score: number;
  /** SG for hullet i slag (fortegn). */
  sg?: number;
};

export type Scoresammendrag = { score: number; par: number; sg: number };

export type ScorekortProps = {
  hull: Hull[];
  sammendrag?: Scoresammendrag;
  baseline?: string;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

const scoreColor = (d: number) => d < 0 ? "var(--up)" : d > 1 ? "var(--down)" : d === 1 ? "var(--warn, var(--down))" : "var(--text)";
const rel = (d: number) => d === 0 ? "E" : d > 0 ? `+${d}` : `${d}`;
const sgFmt = (v: number | null | undefined) => v == null ? "" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(1).replace(".", ",");

export function Scorekort({ hull = [], sammendrag, loading = false, className = "", style }: ScorekortProps) {
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
