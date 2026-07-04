import { DeltaIndikator } from "./DeltaIndikator";
import { Skeleton } from "./Skeleton";

/**
 * AK Golf HQ — SpillerTilstandKort
 * Coach-cockpitens 5-sekunderssvar: navn → form → trend → siste aktivitet → ett flagg.
 * Coach-komponent (fagkoder ok). Farge aldri eneste bærer (form-ord + prikk + trend).
 */

export type SpillerTilstandKortProps = {
  navn: string;
  initialer?: string;
  /** Form-tilstand — farge + standardord. */
  tilstand?: "god" | "stabil" | "varsel" | "risiko";
  /** Overstyr form-teksten (ellers standardord per tilstand). */
  formTekst?: string;
  /** SG-trend som visningsstreng m/ fortegn → DeltaIndikator. */
  sgTrend?: string;
  sgTrendLabel?: string;
  /** Siste aktivitet, f.eks. "2t siden" / "i går". */
  sisteAktivitet?: string;
  /** Ett flagg (det viktigste), f.eks. "ACWR 1,46". */
  flagg?: string;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
};

const TONE = {
  god:    { c: "var(--up)",    t: "God form" },
  stabil: { c: "var(--text-muted)", t: "Stabil" },
  varsel: { c: "var(--warn, var(--down))", t: "Følg opp" },
  risiko: { c: "var(--down)",  t: "Risiko" },
};

export function SpillerTilstandKort({
  navn, initialer, tilstand = "stabil", formTekst, sgTrend, sgTrendLabel,
  sisteAktivitet, flagg, loading = false, onClick, className = "", style,
}: SpillerTilstandKortProps) {
  if (loading) return <Skeleton variant="card" width="100%" height={72} className={className} style={style} />;
  const T = TONE[tilstand] || TONE.stabil;
  const ini = initialer || (navn ? navn.split(" ").map((w) => w[0]).slice(0, 2).join("") : "?");
  const Tag = (onClick ? "button" : "div") as React.ElementType;
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
