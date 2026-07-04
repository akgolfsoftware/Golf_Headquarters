import React from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * AK Golf HQ — AnbefalingsKort
 * Anbefalingskontrakten (kanon): HVORFOR / HVA / FORVENTET EFFEKT / HVORFOR NÅ —
 * alltid i denne rekkefølgen, alltid alle fire. «Bruk forslag» er primær.
 * Kompakt-variant for innbygging i overstyringsdialog og fleks-flyt.
 */

const CSS = `
.ak-anbf{
  background:var(--surface);border:1px solid var(--border-strong);
  border-radius:var(--radius-card);overflow:hidden;
  display:flex;flex-direction:column;
}
.ak-anbf__head{
  display:flex;align-items:center;gap:8px;
  padding:12px 16px;border-bottom:1px solid var(--border);
}
.ak-anbf--kompakt .ak-anbf__head{padding:10px 13px;}
.ak-anbf__merke{
  display:inline-flex;align-items:center;gap:6px;
  font-family:var(--font-mono);font-size:9px;font-weight:700;
  letter-spacing:.1em;text-transform:uppercase;color:var(--text-muted);
}
.ak-anbf__merke svg{color:var(--signal);}
.ak-anbf__kontekst{
  margin-left:auto;font-family:var(--font-mono);font-size:9px;color:var(--text-muted);
  border:1px solid var(--border);border-radius:9999px;padding:2px 8px;
  font-variant-numeric:tabular-nums;white-space:nowrap;
}
.ak-anbf__body{display:flex;flex-direction:column;gap:12px;padding:14px 16px;}
.ak-anbf--kompakt .ak-anbf__body{gap:9px;padding:11px 13px;}
.ak-anbf__felt-lbl{
  font-family:var(--font-mono);font-size:9px;font-weight:600;
  letter-spacing:.1em;text-transform:uppercase;color:var(--text-muted);
  display:block;margin-bottom:3px;
}
.ak-anbf__felt-txt{
  font-family:var(--font-ui);font-size:var(--text-13);color:var(--text);
  line-height:var(--leading-body);
}
.ak-anbf--kompakt .ak-anbf__felt-txt{font-size:var(--text-12);}
.ak-anbf__foot{
  display:flex;align-items:center;gap:8px;
  padding:12px 16px;border-top:1px solid var(--border);
}
.ak-anbf--kompakt .ak-anbf__foot{padding:10px 13px;}
.ak-anbf__bruk{
  display:inline-flex;align-items:center;gap:6px;
  height:32px;padding:0 14px;border-radius:var(--radius-input);border:none;
  background:var(--signal);color:var(--on-signal);
  font-family:var(--font-ui);font-size:var(--text-12);font-weight:700;cursor:pointer;
  transition:background var(--dur-fast) var(--ease-standard);
}
.ak-anbf__bruk:hover{background:var(--signal-press);}
.ak-anbf__bruk:focus-visible{outline:none;box-shadow:var(--glow-signal);}
.ak-anbf__avvis{
  height:32px;padding:0 12px;border-radius:var(--radius-input);
  background:transparent;border:1px solid var(--border-strong);color:var(--text-muted);
  font-family:var(--font-ui);font-size:var(--text-12);font-weight:500;cursor:pointer;
  transition:background var(--dur-fast) var(--ease-standard),color var(--dur-fast) var(--ease-standard);
}
.ak-anbf__avvis:hover{background:var(--surface-hover);color:var(--text);}
.ak-anbf__avvis:focus-visible{outline:none;box-shadow:var(--glow-signal);}
.ak-anbf__juster{
  margin-left:auto;background:none;border:none;cursor:pointer;
  font-family:var(--font-ui);font-size:var(--text-12);color:var(--text-muted);
  text-decoration:underline;text-underline-offset:3px;
}
.ak-anbf__juster:hover{color:var(--text);}
.ak-anbf__juster:focus-visible{outline:2px solid var(--signal);outline-offset:2px;border-radius:2px;}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-anbf-css")) {
  const s = document.createElement("style");
  s.id = "ak-anbf-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

function Felt({ lbl, children }) {
  return (
    <div>
      <span className="ak-anbf__felt-lbl">{lbl}</span>
      <div className="ak-anbf__felt-txt">{children}</div>
    </div>
  );
}

export function AnbefalingsKort({
  hvorfor,
  hva,
  effekt,
  hvorforNaa,
  onBruk,
  onAvvis,
  onJuster,
  kontekst,
  kompakt = false,
  className = "",
  style,
}) {
  return (
    <div className={`ak-anbf${kompakt ? " ak-anbf--kompakt" : ""} ${className}`} style={style}>
      <div className="ak-anbf__head">
        <span className="ak-anbf__merke"><Icon name="sparkles" size={13} />AI-forslag</span>
        {kontekst && <span className="ak-anbf__kontekst">{kontekst}</span>}
      </div>
      <div className="ak-anbf__body">
        <Felt lbl="Hvorfor">{hvorfor}</Felt>
        <Felt lbl="Hva">{hva}</Felt>
        <Felt lbl="Forventet effekt">{effekt}</Felt>
        <Felt lbl="Hvorfor nå">{hvorforNaa}</Felt>
      </div>
      {(onBruk || onAvvis || onJuster) && (
        <div className="ak-anbf__foot">
          {onBruk && (
            <button type="button" className="ak-anbf__bruk" onClick={onBruk}>
              <Icon name="check" size={14} />Bruk forslag
            </button>
          )}
          {onAvvis && <button type="button" className="ak-anbf__avvis" onClick={onAvvis}>Avvis</button>}
          {onJuster && <button type="button" className="ak-anbf__juster" onClick={onJuster}>Juster</button>}
        </div>
      )}
    </div>
  );
}
