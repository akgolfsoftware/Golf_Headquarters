import React from "react";
import { DeltaIndikator } from "../data/DeltaIndikator.jsx";
import { Skeleton } from "../structure/Skeleton.jsx";

/**
 * AK Golf HQ — NesteFokusKort
 * Dommen, ikke grafen: største SG-lekkasje → anbefalt treningsområde i klarspråk,
 * koblet til AK-formel-akse («Tren SLAG_PUTT»). Verdikten er helten; SG-tapet er
 * bevis UNDER den. Fortellermønster invertert her fordi kortets jobb ER handlingen.
 *
 * Progressiv dybde (én kodevei): NIVA[nivå] gater lag; term() bytter klarspråk↔fagkode.
 * Tomtilstand = onboarding (aldri blank). SG i «slag» mot navngitt baseline, --up/--down (aldri lime).
 */
const CSS = `
.ak-nfk{position:relative;background:var(--surface);border:1px solid var(--border);
  border-radius:var(--radius-card);padding:20px;display:flex;flex-direction:column;gap:14px;}
.ak-nfk__eyebrow{display:inline-flex;align-items:center;gap:6px;font-family:var(--font-mono);
  font-size:var(--text-11);font-weight:600;letter-spacing:var(--tracking-eyebrow);
  text-transform:uppercase;color:var(--signal);}
.ak-nfk__dom{font-family:var(--font-display);font-weight:700;font-size:var(--text-24);
  line-height:1.15;letter-spacing:var(--tracking-display);color:var(--text);margin:0;text-wrap:balance;}
.ak-nfk__evidens{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;}
.ak-nfk__base{font-family:var(--font-mono);font-size:var(--text-11);color:var(--text-muted);}
.ak-nfk__why{font-family:var(--font-ui);font-size:var(--text-13);line-height:1.55;color:var(--text-2);margin:0;}
.ak-nfk__foot{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:2px;}
.ak-nfk__kode{font-family:var(--font-mono);font-size:var(--text-11);font-weight:700;color:var(--text-muted);
  background:var(--surface-2);border:1px solid var(--border);border-radius:6px;padding:3px 8px;letter-spacing:.04em;}
.ak-nfk__cta{display:inline-flex;align-items:center;justify-content:center;gap:7px;height:44px;padding:0 18px;
  border-radius:var(--radius-pill);background:var(--signal);color:var(--on-signal);border:none;cursor:pointer;
  font-family:var(--font-ui);font-size:var(--text-14);font-weight:700;
  transition:filter var(--dur-fast) var(--ease-standard),transform var(--dur-fast) var(--ease-standard);}
.ak-nfk__cta:hover{filter:brightness(1.05);}
.ak-nfk__cta:active{transform:scale(.98);}
.ak-nfk__cta:focus-visible{outline:none;box-shadow:var(--glow-signal);}
`;
if (typeof document !== "undefined" && !document.getElementById("ak-nfk-css")) {
  const s = document.createElement("style"); s.id = "ak-nfk-css"; s.textContent = CSS; document.head.appendChild(s);
}

const NIVA = {
  nybegynner: { visWhy: false, visBenchmark: false, fagkoder: false },
  ovet:       { visWhy: true,  visBenchmark: false, fagkoder: false },
  elite:      { visWhy: true,  visBenchmark: true,  fagkoder: true  },
};
/* SG-akse → klarspråk (spiller) og fagkode (coach/elite) */
const AKSE = {
  OTT:  { klar: "Tee-slag",  fag: "SG-OTT" },
  APP:  { klar: "Innspill",  fag: "SG-APP" },
  ARG:  { klar: "Nærspill",  fag: "SG-ARG" },
  PUTT: { klar: "Putting",   fag: "SG-PUTT" },
};

export function NesteFokusKort({
  omrade,
  akse = "PUTT",
  formelAkse,
  sgTap,
  baseline = "Broadie scratch",
  begrunnelse,
  benchmark,
  nivaa = "ovet",
  handlingTekst = "Legg inn treningsøkt",
  onHandling,
  loading = false,
  tomt = false,
  className = "",
  style,
}) {
  const N = NIVA[nivaa] || NIVA.ovet;
  const a = AKSE[akse] || AKSE.PUTT;

  if (loading) return <Skeleton variant="card" width="100%" height={190} className={className} style={style} />;

  if (tomt) {
    return (
      <div className={`ak-nfk ${className}`} role="status" style={{ alignItems: "flex-start", ...style }}>
        <span className="ak-nfk__eyebrow">Neste fokus</span>
        <h3 className="ak-nfk__dom" style={{ color: "var(--text-2)" }}>Spill din første runde for å se Strokes Gained</h3>
        <p className="ak-nfk__why">Når du har logget en runde, peker vi ut hvor du taper flest slag — og hva du bør trene på.</p>
        {onHandling && <button className="ak-nfk__cta" onClick={onHandling}>Logg en runde</button>}
      </div>
    );
  }

  return (
    <div className={`ak-nfk ${className}`} style={style}>
      <span className="ak-nfk__eyebrow">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/></svg>
        Neste fokus
      </span>

      {/* DOM — helten */}
      <h3 className="ak-nfk__dom">{omrade || `${a.klar} er der du taper flest slag`}</h3>

      {/* EVIDENS — SG-tap mot navngitt baseline, aldri lime */}
      {sgTap != null && (
        <div className="ak-nfk__evidens">
          <DeltaIndikator verdi={`${sgTap} slag`} size="md" srLabel={`${a.klar} mot ${baseline}`} />
          <span className="ak-nfk__base">{a.klar} · mot {baseline}</span>
        </div>
      )}

      {N.visWhy && begrunnelse && <p className="ak-nfk__why">{begrunnelse}</p>}

      <div className="ak-nfk__foot">
        {onHandling && <button className="ak-nfk__cta" onClick={onHandling}>{handlingTekst}</button>}
        {N.fagkoder && formelAkse && <span className="ak-nfk__kode">Tren {formelAkse}</span>}
        {N.visBenchmark && benchmark && <span className="ak-nfk__base">{benchmark}</span>}
      </div>
    </div>
  );
}
