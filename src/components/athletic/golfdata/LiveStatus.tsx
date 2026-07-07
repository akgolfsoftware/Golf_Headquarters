import type React from "react";

/**
 * AK Golf HQ — LiveStatus
 * Live-økt-indikator + økt-timer. LIVE = pulserende rød prikk + løpende tid.
 * Puls respekterer prefers-reduced-motion. Status: live/pause/ferdig (ord + farge).
 * Portet 1:1 fra public/design-handover/components/domain/LiveStatus.jsx.
 * CSS: ./golfdata.css (.ak-live).
 */

export type LiveStatusProps = {
  status?: "live" | "pause" | "ferdig";
  /** Økt-timer som visningsstreng, f.eks. "42:18" (kalleren teller). */
  tid?: string;
  /** Antall deltakere (valgfritt). */
  deltakere?: number;
  className?: string;
  style?: React.CSSProperties;
};

const ST = {
  live: { c: "var(--down)", t: "Live" },
  pause: { c: "var(--warn, var(--text-muted))", t: "Pause" },
  ferdig: { c: "var(--up)", t: "Ferdig" },
} as const;

export function LiveStatus({ status = "live", tid, deltakere, className = "", style }: LiveStatusProps) {
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
