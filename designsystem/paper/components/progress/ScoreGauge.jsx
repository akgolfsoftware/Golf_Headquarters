import React from "react";
import { nf, ensureCss, Region } from "./viz.jsx";
ensureCss("akhq-css-gauge", `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-gauge{font-family:var(--ui);text-align:center}
/* Buen er symmetrisk om sin egen midtakse, så hero-tallet må stå på den aksen.
   Står enheten inline etter tallet, sentreres tallet+enheten som ÉN blokk, og
   tallet skyves ut av aksen med halve enhetsbredden — målt 27,3 px, 13,6 % av
   buebredden, for «82 av 100» [funn 31.07]. Enheten stables derfor under tallet:
   den er en opplysning om skalaen, ikke en del av verdien. */
.akhq-gauge-val{display:flex;flex-direction:column;align-items:center;line-height:1}
/* inline-block + text-align:center på .akhq-gauge, ikke margin:0 auto:
   auto-marger overlever ikke alle DOM-serialiserende gjengivere (buen ble
   liggende venstrestilt i miniatyr- og skjermbildefangst, og figuren leste som
   skjev selv om DOM-en målte sentrert) [funn 31.07]. */
.akhq-gauge-arc{position:relative;display:inline-block;width:200px;text-align:center}
.akhq-gauge-hero{font-family:var(--mono);font-size:44px;font-weight:600;letter-spacing:-.03em;line-height:1;font-variant-numeric:tabular-nums;color:var(--fg)}
/* letter-spacing henger igjen som luft til høyre for siste siffer. Halvparten
   kompenseres tilbake, ellers står tallet ~0,7 px for langt til venstre. */
.akhq-gauge-hero{padding-left:.03em}
.akhq-gauge-unit{font-size:13px;color:var(--muted);font-family:var(--mono);font-weight:400}
.akhq-gauge-val .akhq-gauge-unit{margin-top:5px}
.akhq-gauge-subs{display:grid;grid-template-columns:repeat(3,1fr);gap:var(--s3);margin-top:var(--s4);text-align:left}
.akhq-gauge-sub-val{font-family:var(--mono);font-size:15px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--fg);margin-top:3px}
.akhq-gauge-sub-meta{font-size:11px;color:var(--muted);margin-top:1px}
}
`);
export function ScoreGauge({ value, max = 100, decimals = 0, unit, unitPlacement = "below", label, subs = [], state = "content", emptyText = "Ingen runder logget enn\u00e5 \u2014 scoren kommer etter f\u00f8rste runde.", dataOdId = "kpi-score-gauge", ...rest }) {
  const frac = Math.max(0, Math.min(1, (value ?? 0) / max));
  const R = 80, C = Math.PI * R;
  return (
    <Region state={state} empty={emptyText} height={140}>
      <div className="akhq-gauge" data-od-id={dataOdId} {...rest}>
        {label && <div className="akhq-lab" style={{ marginBottom: 8 }}>{label}</div>}
        <div className="akhq-gauge-arc">
          <svg viewBox="0 0 200 110" width="200" height="110" aria-hidden="true">
            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="var(--soft)" strokeWidth="10" strokeLinecap="round" />
            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="var(--fg)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${C * frac} ${C}`} />
          </svg>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: unitPlacement === "below" ? 0 : 4 }}>
            {unitPlacement === "below" ? (
              <div className="akhq-gauge-val">
                <span className="akhq-gauge-hero">{nf(value ?? 0, decimals)}</span>
                {unit && <span className="akhq-gauge-unit">{unit}</span>}
              </div>
            ) : (
              <>
                <span className="akhq-gauge-hero">{nf(value ?? 0, decimals)}</span>
                {unit && <span className="akhq-gauge-unit"> {unit}</span>}
              </>
            )}
          </div>
        </div>
        {subs.length > 0 && (
          <div className="akhq-gauge-subs">
            {subs.map((s, i) => (
              <div key={i}>
                <div className="akhq-lab">{s.label}</div>
                <div className="akhq-gauge-sub-val">{s.value}{s.unit && <span className="akhq-gauge-unit" style={{ fontSize: 11 }}> {s.unit}</span>}</div>
                {s.window && <div className="akhq-gauge-sub-meta">{s.window}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </Region>
  );
}
