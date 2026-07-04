import React from "react";
import { HeroTall } from "../data/HeroTall.jsx";
import { DeltaIndikator } from "../data/DeltaIndikator.jsx";
import { Skeleton } from "../structure/Skeleton.jsx";

/**
 * AK Golf HQ — SgTotalKort
 * SG total siste N runder mot navngitt baseline, med trend og dybde-styrt forklaring.
 * Fortellermønster: score (HeroTall) → trend (DeltaIndikator) → forklaring (klarspråk).
 * SG i «slag», --up/--down (aldri lime). Tomt = onboarding.
 */
const CSS = `
.ak-sgt{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);
  padding:20px;display:flex;flex-direction:column;gap:13px;}
.ak-sgt__base{font-family:var(--font-mono);font-size:var(--text-11);color:var(--text-muted);}
.ak-sgt__why{font-family:var(--font-ui);font-size:var(--text-13);line-height:1.55;color:var(--text-2);margin:0;}
.ak-sgt__bench{display:inline-flex;align-items:center;gap:6px;font-family:var(--font-mono);
  font-size:var(--text-11);color:var(--text-muted);border-top:1px solid var(--border);padding-top:11px;}
`;
if (typeof document !== "undefined" && !document.getElementById("ak-sgt-css")) {
  const s = document.createElement("style"); s.id = "ak-sgt-css"; s.textContent = CSS; document.head.appendChild(s);
}

const NIVA = {
  nybegynner: { visWhy: false, visBench: false },
  ovet:       { visWhy: true,  visBench: false },
  elite:      { visWhy: true,  visBench: true },
};

export function SgTotalKort({
  verdi,
  enhet = "slag",
  baseline = "Broadie scratch",
  runder = 10,
  trend,
  trendLabel,
  begrunnelse,
  benchmark,
  nivaa = "ovet",
  loading = false,
  tomt = false,
  className = "",
  style,
}) {
  const N = NIVA[nivaa] || NIVA.ovet;
  if (loading) return <Skeleton variant="card" width="100%" height={170} className={className} style={style} />;

  if (tomt || verdi == null) {
    return (
      <div className={`ak-sgt ${className}`} role="status" style={style}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-11)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>SG Total</span>
        <p className="ak-sgt__why">Spill din første runde for å se Strokes Gained mot {baseline}.</p>
      </div>
    );
  }

  return (
    <div className={`ak-sgt ${className}`} style={style}>
      <HeroTall
        label="SG Total"
        verdi={verdi}
        enhet={enhet}
        size="xl"
        delta={trend != null ? <DeltaIndikator verdi={trend} size="md" srLabel={trendLabel || `trend ${runder} runder`} /> : undefined}
      />
      <span className="ak-sgt__base">siste {runder} runder · mot {baseline}</span>
      {N.visWhy && begrunnelse && <p className="ak-sgt__why">{begrunnelse}</p>}
      {N.visBench && benchmark && (
        <span className="ak-sgt__bench">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
          {benchmark}
        </span>
      )}
    </div>
  );
}
