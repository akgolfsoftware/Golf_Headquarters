import React from "react";

/**
 * AK Golf HQ — SlagLekkasjeKart
 * Heatmap over avstandsbånd (tee → innspill i meter → nærspill → putting i fot),
 * farget etter SG per runde mot NAVNGITT baseline. Hvert bånd er trykkbart (≥44px)
 * og åpner analytikerkjeden (→ DiagnoseKort: symptom→bevis→resept). Én kolonne —
 * lesbar og trykkbar på 390px. Tap/gevinst = --down/--up (aldri lime).
 * Datagrunnlag alltid synlig. Tomt = onboarding, aldri blank.
 */
const CSS = `
.ak-slk{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);
  padding:20px;display:flex;flex-direction:column;gap:12px;}
.ak-slk__eyebrow{font-family:var(--font-mono);font-size:var(--text-11);font-weight:600;
  letter-spacing:var(--tracking-eyebrow);text-transform:uppercase;color:var(--text-muted);}
.ak-slk__tittel{font-family:var(--font-display);font-weight:700;font-size:var(--text-18);
  line-height:1.2;letter-spacing:var(--tracking-display);color:var(--text);margin:6px 0 0;text-wrap:balance;}
.ak-slk__base{font-family:var(--font-mono);font-size:var(--text-11);color:var(--text-muted);margin-top:4px;}
.ak-slk__rows{display:flex;flex-direction:column;gap:6px;}
.ak-slk__rad{display:grid;grid-template-columns:1fr auto;align-items:center;column-gap:12px;
  min-height:44px;padding:6px 12px;border-radius:10px;border:1px solid transparent;text-align:left;
  width:100%;font:inherit;cursor:pointer;
  transition:border-color var(--dur-fast) var(--ease-standard),transform var(--dur-fast) var(--ease-standard);}
.ak-slk__rad:hover{border-color:var(--border-strong);}
.ak-slk__rad:active{transform:scale(.99);}
.ak-slk__rad:focus-visible{outline:none;box-shadow:var(--glow-signal);}
.ak-slk__rad[aria-pressed="true"]{border-color:var(--text-muted);}
.ak-slk__rad:disabled{cursor:default;}
.ak-slk__lbl{font-family:var(--font-ui);font-size:var(--text-13);font-weight:600;color:var(--text);line-height:1.25;}
.ak-slk__n{display:block;font-family:var(--font-mono);font-size:var(--text-11);font-weight:400;color:var(--text-muted);margin-top:1px;}
.ak-slk__sg{font-family:var(--font-mono);font-size:var(--text-14);font-weight:700;font-variant-numeric:tabular-nums;}
.ak-slk__foot{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;}
.ak-slk__legend{display:inline-flex;align-items:center;gap:12px;}
.ak-slk__leg{display:inline-flex;align-items:center;gap:6px;font-family:var(--font-mono);font-size:var(--text-11);color:var(--text-muted);}
.ak-slk__sw{width:10px;height:10px;border-radius:3px;border:1px solid var(--border);}
.ak-slk__hint{font-family:var(--font-mono);font-size:var(--text-11);color:var(--text-faint);}
.ak-slk__tomtekst{font-family:var(--font-ui);font-size:var(--text-13);line-height:1.55;color:var(--text-2);margin:0;}
.ak-slk__skel{height:44px;border-radius:10px;background:var(--surface-2);}
`;
if (typeof document !== "undefined" && !document.getElementById("ak-slk-css")) {
  const s = document.createElement("style"); s.id = "ak-slk-css"; s.textContent = CSS; document.head.appendChild(s);
}

function fmtSg(sg) {
  if (sg == null || Number.isNaN(sg)) return "—";
  if (Math.abs(sg) < 0.005) return "0,0";
  return (sg > 0 ? "+" : "−") + Math.abs(sg).toFixed(1).replace(".", ",");
}

/* Progressiv dybde — én kodevei (NesteFokusKort-mønsteret) */
const NIVA = {
  nybegynner: { visAntall: false, visHint: false, visSum: false },
  ovet:       { visAntall: true,  visHint: true,  visSum: false },
  elite:      { visAntall: true,  visHint: true,  visSum: true  },
};

export function SlagLekkasjeKart({
  baand = [],
  baseline = "Broadie scratch",
  grunnlag,
  tittel = "Hvor slagene forsvinner",
  valgtId,
  onVelgBaand,
  nivaa = "ovet",
  loading = false,
  tomt = false,
  className = "",
  style,
}) {
  if (loading) {
    return (
      <div className={`ak-slk ${className}`} style={style} aria-busy="true">
        <span className="ak-slk__eyebrow">Slaglekkasje</span>
        <div className="ak-slk__rows">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="ak-slk__skel" />)}</div>
      </div>
    );
  }
  if (tomt || baand.length === 0) {
    return (
      <div className={`ak-slk ${className}`} style={style} role="status">
        <span className="ak-slk__eyebrow">Slaglekkasje</span>
        <h3 className="ak-slk__tittel" style={{ color: "var(--text-2)" }}>Ingen slagdata ennå</h3>
        <p className="ak-slk__tomtekst">Logg runder med slag-for-slag-data, så viser kartet hvor du taper og vinner slag mot {baseline}.</p>
      </div>
    );
  }
  const N = NIVA[nivaa] || NIVA.ovet;
  const maks = Math.max(0.4, ...baand.map((b) => Math.abs(b.sg ?? 0)));
  const sum = baand.reduce((a, b) => a + (b.sg ?? 0), 0);
  return (
    <div className={`ak-slk ${className}`} style={style}>
      <div>
        <span className="ak-slk__eyebrow">Slaglekkasje</span>
        <h3 className="ak-slk__tittel">{tittel}</h3>
        <div className="ak-slk__base">SG per runde · mot {baseline}{grunnlag ? ` · ${grunnlag}` : ""}</div>
      </div>
      <div className="ak-slk__rows">
        {baand.map((b) => {
          const sg = b.sg ?? 0;
          const t = Math.min(1, Math.abs(sg) / maks);
          const noytral = Math.abs(sg) < 0.05;
          const heat = noytral
            ? "var(--surface-2)"
            : sg < 0
              ? `color-mix(in srgb, var(--down) ${Math.round(8 + t * 26)}%, transparent)`
              : `color-mix(in srgb, var(--up) ${Math.round(6 + t * 16)}%, transparent)`;
          return (
            <button
              key={b.id}
              type="button"
              className="ak-slk__rad"
              style={{ background: heat }}
              aria-pressed={valgtId === b.id}
              disabled={!onVelgBaand}
              onClick={onVelgBaand ? () => onVelgBaand(b) : undefined}
            >
              <span className="ak-slk__lbl">
                {b.label}
                {N.visAntall && b.slag != null && <span className="ak-slk__n">{b.slag} slag</span>}
              </span>
              <span className="ak-slk__sg" style={{ color: noytral ? "var(--text-muted)" : sg < 0 ? "var(--down)" : "var(--up)" }}>
                {fmtSg(sg)}
              </span>
            </button>
          );
        })}
      </div>
      <div className="ak-slk__foot">
        <span className="ak-slk__legend">
          <span className="ak-slk__leg"><span className="ak-slk__sw" style={{ background: "color-mix(in srgb, var(--down) 30%, transparent)" }} />tap</span>
          <span className="ak-slk__leg"><span className="ak-slk__sw" style={{ background: "color-mix(in srgb, var(--up) 20%, transparent)" }} />gevinst</span>
          {N.visSum && (
            <span className="ak-slk__leg" style={{ color: sum < 0 ? "var(--down)" : "var(--up)", fontWeight: 700 }}>
              Sum {fmtSg(sum)} slag/runde
            </span>
          )}
        </span>
        {N.visHint && onVelgBaand && <span className="ak-slk__hint">Trykk et bånd for analyse</span>}
      </div>
    </div>
  );
}
