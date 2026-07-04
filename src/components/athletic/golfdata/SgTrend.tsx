import { Skeleton } from "./Skeleton";

/**
 * AK Golf HQ — SgTrend
 * SG over tid med hendelsesmarkører (tester, periodeskifter). Linje mot nullbaseline;
 * siste punkt uthevet. SG i «slag». Hendelser = vertikale hakk + etikett.
 * Egen tidsserie-viz (dispersion-familiens tidsakse) — komponerer ikke BarChart.
 */

export type SgPunkt = { label?: string; sg: number };

export type SgHendelse = {
  /** Punkt-indeks markøren står ved. */
  idx: number;
  /** Type hendelse (test/periodeskifte) — for evt. styling. */
  type?: "test" | "periode" | "turnering";
  /** Kort etikett vist ved markøren. */
  navn: string;
};

export type SgTrendProps = {
  punkter: SgPunkt[];
  hendelser?: SgHendelse[];
  baseline?: string;
  height?: number;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export function SgTrend({
  punkter = [], hendelser = [], baseline = "Broadie scratch", height = 150, loading = false, className = "", style,
}: SgTrendProps) {
  if (loading) return <Skeleton variant="card" width="100%" height={height + 40} className={className} style={style} />;
  if (punkter.length < 2) {
    return (
      <div className={`ak-sgtr ${className}`} role="status" style={style}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-11)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>SG-trend</span>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: "var(--text-13)", color: "var(--text-2)", lineHeight: 1.5, margin: "10px 0 0" }}>Spill flere runder for å se SG-utviklingen mot {baseline}.</p>
      </div>
    );
  }
  const W = 600, H = height, padL = 30, padR = 12, padY = 16;
  const vals = punkter.map((p) => p.sg);
  const lo = Math.min(-0.5, ...vals), hi = Math.max(0.5, ...vals);
  const x = (i: number) => padL + (i / (punkter.length - 1)) * (W - padL - padR);
  const y = (v: number) => padY + (1 - (v - lo) / (hi - lo)) * (H - padY * 2);
  const line = punkter.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.sg).toFixed(1)}`).join(" ");
  const last = punkter[punkter.length - 1];
  return (
    <div className={`ak-sgtr ${className}`} style={style}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-11)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>SG-trend</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--text-muted)" }}>mot {baseline}</span>
      </div>
      <svg className="ak-sgtr__svg" viewBox={`0 0 ${W} ${H}`} style={{ height }} role="img" aria-label={`SG-trend over ${punkter.length} runder`}>
        {/* nullbaseline */}
        <line x1={padL} y1={y(0)} x2={W - padR} y2={y(0)} stroke="var(--border-strong)" strokeWidth="1" strokeDasharray="3 3" />
        <text x={2} y={y(0) + 3} className="ak-sgtr__ev">0</text>
        {/* hendelsesmarkører */}
        {hendelser.map((e, i) => (
          <g key={i}>
            <line x1={x(e.idx)} y1={padY} x2={x(e.idx)} y2={H - padY} stroke="var(--border)" strokeWidth="1" />
            <text x={x(e.idx) + 3} y={padY + 8} className="ak-sgtr__ev">{e.navn}</text>
          </g>
        ))}
        <path d={line} fill="none" stroke="var(--text-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {punkter.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.sg)} r={i === punkter.length - 1 ? 4 : 2.5}
            fill={i === punkter.length - 1 ? (last.sg >= 0 ? "var(--up)" : "var(--down)") : "var(--text-muted)"}
            stroke="var(--surface)" strokeWidth="1.5" />
        ))}
      </svg>
    </div>
  );
}
