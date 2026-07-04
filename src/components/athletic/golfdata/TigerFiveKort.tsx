import { DeltaIndikator } from "./DeltaIndikator";
import { Skeleton } from "./Skeleton";

/**
 * AK Golf HQ — TigerFiveKort
 * De fem kjernemetrikkene med status og trend — kompakt tilstandsavlesning.
 * Status: farge aldri eneste bærer (ord + prikk). Trend via DeltaIndikator.
 */

export type TigerFiveMetrikk = {
  navn: string;
  verdi: string | number;
  enhet?: string;
  /** Status — farge + prikk (aldri eneste bærer). */
  status?: "god" | "varsel" | "risiko" | "noytral";
  /** Trend som visningsstreng m/ fortegn → DeltaIndikator. */
  trend?: string;
  /** Snu trend-fargelogikk (der lavere er bedre). */
  invertert?: boolean;
};

export type TigerFiveKortProps = {
  metrikker: TigerFiveMetrikk[];
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

const STATUS = { god: "var(--up)", varsel: "var(--warn, var(--down))", risiko: "var(--down)", noytral: "var(--text-muted)" };

export function TigerFiveKort({ metrikker = [], loading = false, className = "", style }: TigerFiveKortProps) {
  if (loading) return <Skeleton variant="card" width="100%" height={260} className={className} style={style} />;
  if (!metrikker.length) {
    return (
      <div className={`ak-t5 ${className}`} role="status" style={{ padding: 18, ...style }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-11)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>Tiger Five</span>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: "var(--text-13)", color: "var(--text-2)", lineHeight: 1.5, margin: "10px 0 0" }}>Fem kjernemetrikker vises når du har logget nok runder.</p>
      </div>
    );
  }
  return (
    <div className={`ak-t5 ${className}`} style={style} role="table" aria-label="Tiger Five">
      {metrikker.map((m) => (
        <div key={m.navn} className="ak-t5__row" role="row">
          <span className="ak-t5__navn"><span className="ak-t5__dot" style={{ background: (m.status && STATUS[m.status]) || STATUS.noytral }} />{m.navn}</span>
          <span className="ak-t5__val">{m.verdi}{m.enhet && <span className="ak-t5__unit">{m.enhet}</span>}</span>
          {m.trend != null ? <DeltaIndikator verdi={m.trend} size="sm" invertert={m.invertert} srLabel={`${m.navn} trend`} /> : <span />}
        </div>
      ))}
    </div>
  );
}
