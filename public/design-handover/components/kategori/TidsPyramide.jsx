import React from "react";

/**
 * AK Golf HQ — TidsPyramide
 * Anbefalt tidsfordeling (timer/år) over de 5 pyramide-aksene — KANONISK rekkefølge
 * apex→base: TURN øverst, FYS fundament. Klikk et nivå → anbefalingskortet viser
 * timer, % av total, note og turnerings-nedbryting (uker × runder × timer).
 * Akse-etikett står i gutter med --axis-*-text (fargeblind-backup, aldri lime-tekst
 * på lys); selve baren bærer ingen tekst — theme-trygt i begge matriser.
 */
const CSS = `
.ak-tpy{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;align-items:center;}
.ak-tpy__stack{display:flex;flex-direction:column;gap:5px;}
.ak-tpy__rad{display:grid;grid-template-columns:88px 1fr 100px;align-items:center;column-gap:12px;
  width:100%;padding:4px 8px;border-radius:9px;border:none;background:transparent;cursor:pointer;font:inherit;text-align:left;
  transition:background var(--dur-fast) var(--ease-standard);}
.ak-tpy__rad:hover{background:var(--surface-hover);}
.ak-tpy__rad:focus-visible{outline:none;box-shadow:var(--glow-signal);}
.ak-tpy__rad[aria-pressed="true"]{background:var(--surface-hover);}
.ak-tpy__akse{font-family:var(--font-mono);font-size:var(--text-11);font-weight:700;letter-spacing:.05em;}
.ak-tpy__navn{display:block;font-family:var(--font-ui);font-size:var(--text-11);font-weight:400;color:var(--text-muted);margin-top:1px;}
.ak-tpy__spor{display:flex;justify-content:center;}
.ak-tpy__bar{height:24px;border-radius:6px;border:2px solid transparent;
  transition:border-color var(--dur-fast) var(--ease-standard),box-shadow var(--dur-fast) var(--ease-standard);}
.ak-tpy__rad[aria-pressed="true"] .ak-tpy__bar{border-color:var(--text);
  box-shadow:0 0 0 3px color-mix(in srgb, var(--signal) 22%, transparent);}
.ak-tpy__timer{font-family:var(--font-mono);font-size:var(--text-12);font-weight:600;
  font-variant-numeric:tabular-nums;color:var(--text);text-align:right;white-space:nowrap;}
.ak-tpy__pct{color:var(--text-muted);font-weight:400;}
.ak-tpy__kort{border:1.5px solid var(--signal);background:color-mix(in srgb, var(--signal) 9%, transparent);
  border-radius:12px;padding:16px;}
.ak-tpy__eyebrow{font-family:var(--font-mono);font-size:var(--text-11);font-weight:600;
  letter-spacing:var(--tracking-eyebrow);text-transform:uppercase;color:var(--text-muted);}
.ak-tpy__valgt{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-top:8px;}
.ak-tpy__vnavn{font-family:var(--font-display);font-size:var(--text-18);font-weight:700;
  letter-spacing:var(--tracking-display);color:var(--text);}
.ak-tpy__vtimer{font-family:var(--font-mono);font-variant-numeric:tabular-nums;font-weight:700;color:var(--text);white-space:nowrap;}
.ak-tpy__spor2{display:flex;align-items:center;gap:8px;margin-top:10px;}
.ak-tpy__track{flex:1;height:8px;border-radius:var(--radius-pill);background:var(--surface-2);overflow:hidden;}
.ak-tpy__fyll{display:block;height:100%;border-radius:var(--radius-pill);background:var(--signal);}
.ak-tpy__prosent{font-family:var(--font-mono);font-size:var(--text-12);font-weight:600;color:var(--text-muted);}
.ak-tpy__note{font-family:var(--font-ui);font-size:var(--text-13);line-height:1.5;color:var(--text-2);margin:11px 0 0;}
.ak-tpy__turn{margin-top:11px;padding-top:11px;border-top:1px dashed color-mix(in srgb, var(--signal) 55%, transparent);
  font-family:var(--font-mono);font-size:var(--text-11);color:var(--text-2);line-height:1.55;}
.ak-tpy__total{margin-top:11px;font-family:var(--font-mono);font-size:10px;letter-spacing:.06em;
  text-transform:uppercase;color:var(--text-faint);}
.ak-tpy__tom{font-family:var(--font-ui);font-size:var(--text-13);color:var(--text-2);margin:0;}
`;
if (typeof document !== "undefined" && !document.getElementById("ak-tpy-css")) {
  const s = document.createElement("style"); s.id = "ak-tpy-css"; s.textContent = CSS; document.head.appendChild(s);
}

/* KANONISK 5 — apex→base: TURN øverst, FYS fundament. Bredder fra kategorisystem-spec. */
const AKSER = [
  { key: "turn",  kode: "TURN",  navn: "Turnering", w: 64 },
  { key: "spill", kode: "SPILL", navn: "Spill",     w: 73 },
  { key: "slag",  kode: "SLAG",  navn: "Slag",      w: 82 },
  { key: "tek",   kode: "TEK",   navn: "Teknikk",   w: 91 },
  { key: "fys",   kode: "FYS",   navn: "Fysisk",    w: 100 },
];

const NOTAT = {
  fys: "Fysisk kapasitet — styrke, mobilitet, spenst og hurtighet.",
  tek: "Teknikk — svingarbeid på range med video og TrackMan.",
  slag: "Slag i mengde — avstandskontroll og kurveforming.",
  spill: "Spill — treningsrunder, banespill og nærspill i reelle situasjoner.",
  turn: "Turnering — konkurranserunder gjennom sesongen; det største enkeltbidraget i timer.",
};

const fmtT = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

export function TidsPyramide({
  aarsmodell,
  perUke,
  valgt,
  onVelg,
  notat,
  className = "",
  style,
}) {
  const [internSel, setInternSel] = React.useState("turn");
  const sel = valgt ?? internSel;
  const velg = (k) => { setInternSel(k); if (onVelg) onVelg(k); };

  if (!aarsmodell) {
    return <p className={`ak-tpy__tom ${className}`} style={style} role="status">Ingen årsmodell ennå — timefordelingen vises når kategorien har data.</p>;
  }

  const selMeta = AKSER.find((a) => a.key === sel) || AKSER[0];
  const selT = aarsmodell[selMeta.key] ?? 0;
  const pct = Math.round((selT / aarsmodell.total) * 100);
  const maksT = Math.max(...AKSER.map((a) => aarsmodell[a.key] ?? 0), 1);
  const noteTekst = (notat && notat[selMeta.key]) || NOTAT[selMeta.key];
  const tw = aarsmodell.tw, rd = aarsmodell.rd;

  return (
    <div className={`ak-tpy ${className}`} style={style}>
      <div className="ak-tpy__stack">
        {AKSER.map((a) => {
          const t = aarsmodell[a.key] ?? 0;
          return (
            <button key={a.key} type="button" className="ak-tpy__rad" aria-pressed={sel === a.key} onClick={() => velg(a.key)}>
              <span className="ak-tpy__akse" style={{ color: `var(--axis-${a.key}-text)` }}>
                {a.kode}
                <span className="ak-tpy__navn">{a.navn}</span>
              </span>
              <span className="ak-tpy__spor">
                <span className="ak-tpy__bar" style={{ width: `${a.w}%`, background: `var(--axis-${a.key})` }} />
              </span>
              <span className="ak-tpy__timer">{fmtT(t)} t <span className="ak-tpy__pct">{Math.round((t / aarsmodell.total) * 100)} %</span></span>
            </button>
          );
        })}
      </div>

      <div className="ak-tpy__kort">
        <span className="ak-tpy__eyebrow">Valgt nivå</span>
        <div className="ak-tpy__valgt">
          <span className="ak-tpy__vnavn">{selMeta.navn}</span>
          <span className="ak-tpy__vtimer"><span style={{ fontSize: "var(--text-20)" }}>{fmtT(selT)}</span> <span style={{ fontSize: "var(--text-12)", color: "var(--text-muted)" }}>t/år</span></span>
        </div>
        <div className="ak-tpy__spor2">
          <span className="ak-tpy__track"><span className="ak-tpy__fyll" style={{ width: `${Math.round((selT / maksT) * 100)}%` }} /></span>
          <span className="ak-tpy__prosent">{pct} %</span>
        </div>
        {noteTekst && <p className="ak-tpy__note">{noteTekst}</p>}
        {sel === "turn" && tw != null && (
          <div className="ak-tpy__turn">
            {tw} {tw === 1 ? "uke" : "uker"} × {rd} {rd === 1 ? "runde" : "runder"} × {aarsmodell.rh} t = {fmtT(aarsmodell.turn)} t/år
          </div>
        )}
        <div className="ak-tpy__total">Totalt ≈ {fmtT(aarsmodell.total)} t/år{perUke ? ` · ${perUke} t/uke` : ""}</div>
      </div>
    </div>
  );
}
