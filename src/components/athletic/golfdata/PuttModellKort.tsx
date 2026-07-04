import { DeltaIndikator } from "./DeltaIndikator";
import { Skeleton } from "./Skeleton";

/**
 * AK Golf HQ — PuttModellKort
 * Innslagsprosent per PUTT-bånd mot Team Norway IUP-baseline. Putting ALLTID i fot (ft).
 * Bånd-rad: avstand → make-% (bar) → vs baseline (DeltaIndikator, prosentpoeng).
 */

export type PuttBand = {
  /** Avstandsbånd i fot, f.eks. "0–3 ft", "3–6 ft" (putting ALLTID ft). */
  band: string;
  /** Innslagsprosent 0–100. */
  pct: number;
  /** Baseline innslag-% (Team Norway IUP) for samme bånd. */
  baseline?: number;
};

export type PuttModellKortProps = {
  band: PuttBand[];
  baseline?: string;
  nivaa?: "nybegynner" | "ovet" | "elite";
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

const pp = (v: number) => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v);

export function PuttModellKort({
  band = [], baseline = "Team Norway IUP", loading = false, className = "", style,
}: PuttModellKortProps) {
  if (loading) return <Skeleton variant="card" width="100%" height={230} className={className} style={style} />;
  if (!band.length) {
    return (
      <div className={`ak-pmk ${className}`} role="status" style={style}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-11)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>Puttemodell</span>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: "var(--text-13)", color: "var(--text-2)", lineHeight: 1.5, margin: "10px 0 0" }}>Logg putter for å se innslagsprosent per avstand mot {baseline}.</p>
      </div>
    );
  }
  return (
    <div className={`ak-pmk ${className}`} style={style} role="img" aria-label={`Innslagsprosent per PUTT-bånd mot ${baseline}`}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-11)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>Puttemodell · innslag-%</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--text-muted)" }}>mot {baseline}</span>
      </div>
      {band.map((b) => {
        const d = b.baseline != null ? Math.round(b.pct - b.baseline) : null;
        return (
          <div key={b.band} className="ak-pmk__row">
            <span className="ak-pmk__band">{b.band}</span>
            <span className="ak-pmk__track"><span className="ak-pmk__fill" style={{ width: `${Math.max(0, Math.min(100, b.pct))}%` }} /></span>
            <span className="ak-pmk__pct">{b.pct} %</span>
            {d != null ? <DeltaIndikator verdi={`${pp(d)} pp`} size="sm" srLabel={`${b.band} mot baseline`} /> : <span />}
          </div>
        );
      })}
    </div>
  );
}
