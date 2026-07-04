import React from "react";

/**
 * AK Golf HQ — DiagnoseKort
 * Analytikerkjeden i ett kort: SYMPTOM (dommen i klarspråk) → BEVIS (mini-viz:
 * deg mot navngitt baseline + datagrunnlag ALLTID synlig) → RESEPT (AK-formel-akse
 * + «Planlegg dette»). Kjede-rail binder stegene. Tap = --down (aldri lime);
 * akse-chip bruker --axis-*-soft/-text — lys-trygg (aldri lime-tekst på lys).
 */
const CSS = `
.ak-dgk{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);
  padding:20px;display:flex;flex-direction:column;}
.ak-dgk__eyebrow{font-family:var(--font-mono);font-size:var(--text-11);font-weight:600;
  letter-spacing:var(--tracking-eyebrow);text-transform:uppercase;color:var(--text-muted);margin-bottom:14px;}
.ak-dgk__steg{display:grid;grid-template-columns:14px 1fr;column-gap:12px;}
.ak-dgk__rail{display:flex;flex-direction:column;align-items:center;}
.ak-dgk__dot{width:8px;height:8px;border-radius:50%;border:2px solid var(--text-muted);flex:none;margin-top:3px;box-sizing:border-box;}
.ak-dgk__strek{width:1px;flex:1;background:var(--border-strong);margin-top:4px;}
.ak-dgk__body{padding-bottom:18px;display:flex;flex-direction:column;gap:8px;min-width:0;}
.ak-dgk__steg--siste .ak-dgk__body{padding-bottom:0;}
.ak-dgk__lbl{font-family:var(--font-mono);font-size:var(--text-11);font-weight:600;
  letter-spacing:var(--tracking-eyebrow);text-transform:uppercase;color:var(--text-faint);}
.ak-dgk__symptom{font-family:var(--font-display);font-weight:700;font-size:var(--text-20);
  line-height:1.22;letter-spacing:var(--tracking-display);color:var(--text);margin:0;text-wrap:balance;}
.ak-dgk__bars{display:flex;flex-direction:column;gap:7px;}
.ak-dgk__brad{display:grid;grid-template-columns:minmax(58px,auto) 1fr auto;align-items:center;column-gap:10px;}
.ak-dgk__bnavn{font-family:var(--font-ui);font-size:var(--text-12);color:var(--text-2);}
.ak-dgk__btrack{height:8px;border-radius:4px;background:var(--surface-2);overflow:hidden;}
.ak-dgk__bfyll{height:100%;border-radius:4px;}
.ak-dgk__bverdi{font-family:var(--font-mono);font-size:var(--text-12);font-weight:700;
  font-variant-numeric:tabular-nums;color:var(--text);white-space:nowrap;}
.ak-dgk__grunnlag{font-family:var(--font-mono);font-size:var(--text-11);color:var(--text-muted);}
.ak-dgk__rtekst{font-family:var(--font-ui);font-size:var(--text-13);line-height:1.5;color:var(--text-2);margin:0;}
.ak-dgk__rrad{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:2px;}
.ak-dgk__chip{display:inline-flex;align-items:center;font-family:var(--font-mono);
  font-size:var(--text-11);font-weight:700;letter-spacing:.05em;padding:4px 9px;border-radius:6px;border:1px solid var(--border);}
.ak-dgk__cta{display:inline-flex;align-items:center;justify-content:center;height:44px;padding:0 18px;
  border-radius:var(--radius-pill);background:var(--signal);color:var(--on-signal);border:none;cursor:pointer;
  font-family:var(--font-ui);font-size:var(--text-14);font-weight:700;
  transition:filter var(--dur-fast) var(--ease-standard),transform var(--dur-fast) var(--ease-standard);}
.ak-dgk__cta:hover{filter:brightness(1.05);}
.ak-dgk__cta:active{transform:scale(.98);}
.ak-dgk__cta:focus-visible{outline:none;box-shadow:var(--glow-signal);}
.ak-dgk__tomtekst{font-family:var(--font-ui);font-size:var(--text-13);line-height:1.55;color:var(--text-2);margin:0;}
.ak-dgk__skel{height:16px;border-radius:6px;background:var(--surface-2);}
`;
if (typeof document !== "undefined" && !document.getElementById("ak-dgk-css")) {
  const s = document.createElement("style"); s.id = "ak-dgk-css"; s.textContent = CSS; document.head.appendChild(s);
}

/* Pyramide-aksene (KANONISK 5) → css-var-suffiks */
const AKSER = { FYS: "fys", TEK: "tek", SLAG: "slag", SPILL: "spill", TURN: "turn" };

/* Progressiv dybde — én kodevei (NesteFokusKort-mønsteret). Fagkode kun elite. */
const NIVA = {
  nybegynner: { visBevis: false, visKode: false },
  ovet:       { visBevis: true,  visKode: false },
  elite:      { visBevis: true,  visKode: true  },
};

function fmtV(v) {
  if (v == null) return "—";
  return String(v).replace(".", ",");
}

function Steg({ lbl, siste, children }) {
  return (
    <div className={`ak-dgk__steg${siste ? " ak-dgk__steg--siste" : ""}`}>
      <span className="ak-dgk__rail" aria-hidden="true">
        <span className="ak-dgk__dot" />
        {!siste && <span className="ak-dgk__strek" />}
      </span>
      <div className="ak-dgk__body">
        <span className="ak-dgk__lbl">{lbl}</span>
        {children}
      </div>
    </div>
  );
}

export function DiagnoseKort({
  symptom,
  bevis,
  grunnlag,
  resept,
  ctaTekst = "Planlegg dette",
  onPlanlegg,
  nivaa = "ovet",
  loading = false,
  tomt = false,
  className = "",
  style,
}) {
  if (loading) {
    return (
      <div className={`ak-dgk ${className}`} style={style} aria-busy="true">
        <span className="ak-dgk__eyebrow">Diagnose</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="ak-dgk__skel" style={{ width: "72%" }} />
          <div className="ak-dgk__skel" style={{ width: "100%" }} />
          <div className="ak-dgk__skel" style={{ width: "54%" }} />
        </div>
      </div>
    );
  }
  if (tomt || !symptom) {
    return (
      <div className={`ak-dgk ${className}`} style={style} role="status">
        <span className="ak-dgk__eyebrow">Diagnose</span>
        <h3 className="ak-dgk__symptom" style={{ color: "var(--text-2)" }}>Ingen diagnose ennå</h3>
        <p className="ak-dgk__tomtekst" style={{ marginTop: 8 }}>
          Diagnoser settes når det er nok runder til å skille mønster fra støy — logg 3–5 runder til.
        </p>
      </div>
    );
  }

  const N = NIVA[nivaa] || NIVA.ovet;
  const sp = bevis?.spiller;
  const bl = bevis?.baseline;
  const maksRef = Math.max(Number(sp?.verdi) || 0, Number(bl?.verdi) || 0) * 1.08 || 1;
  const akseKey = AKSER[resept?.akse] || null;

  return (
    <div className={`ak-dgk ${className}`} style={style}>
      <span className="ak-dgk__eyebrow">Diagnose</span>

      <Steg lbl="Symptom">
        <h3 className="ak-dgk__symptom">{symptom}</h3>
      </Steg>

      <Steg lbl="Bevis">
        {N.visBevis && sp && bl && (
          <div className="ak-dgk__bars">
            {[{ d: sp, fyll: "color-mix(in srgb, var(--down) 62%, transparent)" },
              { d: bl, fyll: "var(--border-strong)" }].map(({ d, fyll }, i) => (
              <div key={i} className="ak-dgk__brad">
                <span className="ak-dgk__bnavn">{d.label}</span>
                <span className="ak-dgk__btrack">
                  <span className="ak-dgk__bfyll" style={{ width: `${Math.min(100, (Number(d.verdi) / maksRef) * 100)}%`, background: fyll }} />
                </span>
                <span className="ak-dgk__bverdi">{fmtV(d.verdi)}{bevis.enhet ? ` ${bevis.enhet}` : ""}</span>
              </div>
            ))}
          </div>
        )}
        {/* Datagrunnlag ALLTID synlig — mangler det, sies det ærlig */}
        <span className="ak-dgk__grunnlag">{grunnlag || "Datagrunnlag mangler — diagnosen er usikker"}</span>
      </Steg>

      <Steg lbl="Resept" siste>
        {resept?.tekst && <p className="ak-dgk__rtekst">{resept.tekst}</p>}
        <div className="ak-dgk__rrad">
          {onPlanlegg && <button type="button" className="ak-dgk__cta" onClick={onPlanlegg}>{ctaTekst}</button>}
          {N.visKode && akseKey && (
            <span className="ak-dgk__chip" style={{ background: `var(--axis-${akseKey}-soft)`, color: `var(--axis-${akseKey}-text)` }}>
              {resept.akse}{resept.kode ? ` · ${resept.kode}` : ""}
            </span>
          )}
        </div>
      </Steg>
    </div>
  );
}
