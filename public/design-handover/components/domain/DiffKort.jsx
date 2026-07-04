import React from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * AK Golf HQ — DiffKort
 * Før/etter-visning av en plan-endring. Promotert fra workbench-app DiffOverlay.
 * Compound: Fjernes/LeggesTil-kolonner med Rad (akse-kantet), Effekt med Metrikk (fra→til).
 * Kolonne-context styrer Rad-tone; akse-kanten er semantisk (kanon: kant-koding kun akse/tilstand).
 */

const DiffCtx = React.createContext("fjernes");

const CSS = `
.ak-diff{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.ak-diff__kol{min-width:0;}
.ak-diff__kol-head{
  display:flex;align-items:center;gap:6px;margin-bottom:8px;
  font-family:var(--font-mono);font-size:10px;font-weight:600;
  letter-spacing:.1em;text-transform:uppercase;
}
.ak-diff__kol-head--fjernes{color:var(--error);}
.ak-diff__kol-head--legges-til{color:var(--signal);}
.ak-diff__rows{display:flex;flex-direction:column;gap:8px;}
.ak-diff-rad{
  display:flex;gap:9px;padding:9px 11px;border-radius:var(--radius-input);
}
.ak-diff-rad--fjernes{
  background:color-mix(in srgb,var(--error) 7%,transparent);
  border:1px solid color-mix(in srgb,var(--error) 30%,transparent);
}
.ak-diff-rad--legges-til{
  background:color-mix(in srgb,var(--signal) 7%,transparent);
  border:1px solid color-mix(in srgb,var(--signal) 30%,transparent);
}
.ak-diff-rad__akse{width:3px;border-radius:2px;flex:none;align-self:stretch;min-height:26px;}
.ak-diff-rad__tittel{
  font-family:var(--font-ui);font-size:var(--text-13);font-weight:600;color:var(--text);
}
.ak-diff-rad--fjernes .ak-diff-rad__tittel{text-decoration:line-through;opacity:.7;}
.ak-diff-rad__meta{
  font-family:var(--font-mono);font-size:9px;color:var(--text-muted);
  margin-top:2px;font-variant-numeric:tabular-nums;
}
.ak-diff-effekt{
  grid-column:1 / -1;display:flex;
  border-top:1px solid var(--border);padding-top:12px;margin-top:4px;
}
.ak-diff-metrikk{flex:1;min-width:0;}
.ak-diff-metrikk + .ak-diff-metrikk{padding-left:14px;border-left:1px solid var(--border);margin-left:14px;}
.ak-diff-metrikk__lbl{
  font-family:var(--font-mono);font-size:9px;font-weight:600;
  letter-spacing:.08em;text-transform:uppercase;color:var(--text-muted);
  display:block;margin-bottom:4px;
}
.ak-diff-metrikk__vals{
  display:flex;align-items:center;gap:5px;
  font-family:var(--font-mono);font-variant-numeric:tabular-nums;
}
.ak-diff-metrikk__fra{font-size:var(--text-12);color:var(--text-muted);}
.ak-diff-metrikk__til{font-size:var(--text-13);font-weight:700;}
.ak-diff-metrikk__til--positiv{color:var(--signal);}
.ak-diff-metrikk__til--negativ{color:var(--warning);}
@media (max-width:560px){.ak-diff{grid-template-columns:1fr;}}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-diff-css")) {
  const s = document.createElement("style");
  s.id = "ak-diff-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

const AKSE_VAR = {
  FYS: "var(--axis-fys)",
  TEK: "var(--axis-tek)",
  SLAG: "var(--axis-slag)",
  SPILL: "var(--axis-spill)",
  TURN: "var(--axis-turn)",
};

export function DiffKort({ children, className = "", style }) {
  return <div className={`ak-diff ${className}`} style={style}>{children}</div>;
}

function Kolonne({ variant, ikon, tittel, children }) {
  return (
    <DiffCtx.Provider value={variant}>
      <div className="ak-diff__kol">
        <div className={`ak-diff__kol-head ak-diff__kol-head--${variant}`}>
          <Icon name={ikon} size={13} />
          {tittel}
        </div>
        <div className="ak-diff__rows">{children}</div>
      </div>
    </DiffCtx.Provider>
  );
}

function Fjernes({ children }) {
  return <Kolonne variant="fjernes" ikon="minus" tittel="Fjernes" children={children} />;
}

function LeggesTil({ children }) {
  return <Kolonne variant="legges-til" ikon="plus" tittel="Legges til" children={children} />;
}

function Rad({ akse, meta, children }) {
  const variant = React.useContext(DiffCtx);
  return (
    <div className={`ak-diff-rad ak-diff-rad--${variant}`}>
      {akse && <span className="ak-diff-rad__akse" style={{ background: AKSE_VAR[akse] }} aria-hidden="true"></span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="ak-diff-rad__tittel">{children}</div>
        {meta && <div className="ak-diff-rad__meta">{akse ? `${akse} · ${meta}` : meta}</div>}
      </div>
    </div>
  );
}

function Effekt({ children }) {
  return <div className="ak-diff-effekt">{children}</div>;
}

function Metrikk({ label, fra, til, tone = "positiv" }) {
  return (
    <div className="ak-diff-metrikk">
      <span className="ak-diff-metrikk__lbl">{label}</span>
      <span className="ak-diff-metrikk__vals">
        <span className="ak-diff-metrikk__fra">{fra}</span>
        <Icon name="arrow-right" size={11} style={{ color: "var(--text-muted)", flex: "none" }} />
        <span className={`ak-diff-metrikk__til ak-diff-metrikk__til--${tone}`}>{til}</span>
      </span>
    </div>
  );
}

DiffKort.Fjernes = Fjernes;
DiffKort.LeggesTil = LeggesTil;
DiffKort.Rad = Rad;
DiffKort.Effekt = Effekt;
DiffKort.Metrikk = Metrikk;
