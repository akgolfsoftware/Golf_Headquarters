import React from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * AK Golf HQ — VisningsVelger
 * Notion-inspirert kalenderhode: flate tekst-tabs med aktiv understrek
 * (ikke boks-tabs), periode-etikett i display-font, forrige/neste/I dag.
 * Kontrollert komponent — eier ingen kalenderdata.
 */

const CSS = `
.ak-visv{display:flex;align-items:center;gap:16px;width:100%;min-width:0;}
.ak-visv__tabs{display:flex;gap:2px;}
.ak-visv__tab{
  position:relative;background:none;border:none;cursor:pointer;
  padding:8px 10px 10px;
  font-family:var(--font-ui);font-size:var(--text-13);font-weight:500;
  color:var(--text-muted);
  transition:color var(--dur-fast) var(--ease-standard);
}
.ak-visv__tab:hover{color:var(--text);}
.ak-visv__tab:focus-visible{outline:none;box-shadow:var(--glow-signal);border-radius:6px;}
.ak-visv__tab--aktiv{color:var(--text);font-weight:600;}
.ak-visv__tab--aktiv::after{
  content:"";position:absolute;left:10px;right:10px;bottom:4px;height:2px;
  border-radius:2px;background:var(--signal);
}
.ak-visv__periode{
  font-family:var(--font-display);font-size:var(--text-16);font-weight:600;
  letter-spacing:var(--tracking-display);color:var(--text);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;flex:1;
}
.ak-visv__nav{display:flex;align-items:center;gap:4px;flex:none;}
.ak-visv__pil{
  display:flex;align-items:center;justify-content:center;
  width:28px;height:28px;border-radius:8px;border:none;background:none;
  color:var(--text-muted);cursor:pointer;
  transition:background var(--dur-fast) var(--ease-standard),color var(--dur-fast) var(--ease-standard);
}
.ak-visv__pil:hover{background:var(--surface-hover);color:var(--text);}
.ak-visv__pil:focus-visible{outline:none;box-shadow:var(--glow-signal);}
.ak-visv__idag{
  height:28px;padding:0 11px;border-radius:8px;cursor:pointer;
  background:none;border:1px solid var(--border-strong);
  font-family:var(--font-ui);font-size:var(--text-12);font-weight:600;color:var(--text-2);
  transition:background var(--dur-fast) var(--ease-standard),color var(--dur-fast) var(--ease-standard);
}
.ak-visv__idag:hover{background:var(--surface-hover);color:var(--text);}
.ak-visv__idag:focus-visible{outline:none;box-shadow:var(--glow-signal);}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-visv-css")) {
  const s = document.createElement("style");
  s.id = "ak-visv-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

const NAVN = { agenda: "Agenda", uke: "Uke", maned: "Måned", tidslinje: "Tidslinje" };

export function VisningsVelger({
  visning,
  onVisning,
  visninger = ["agenda", "uke", "maned", "tidslinje"],
  periode,
  onForrige,
  onNeste,
  onIdag,
  className = "",
  style,
}) {
  return (
    <div className={`ak-visv ${className}`} style={style}>
      <div className="ak-visv__tabs" role="tablist" aria-label="Kalendervisning">
        {visninger.map((v) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={visning === v}
            className={`ak-visv__tab${visning === v ? " ak-visv__tab--aktiv" : ""}`}
            onClick={() => onVisning && onVisning(v)}
          >
            {NAVN[v] || v}
          </button>
        ))}
      </div>
      {periode && <span className="ak-visv__periode">{periode}</span>}
      {(onForrige || onNeste || onIdag) && (
        <div className="ak-visv__nav">
          {onIdag && <button type="button" className="ak-visv__idag" onClick={onIdag}>I dag</button>}
          {onForrige && (
            <button type="button" className="ak-visv__pil" onClick={onForrige} aria-label="Forrige periode">
              <Icon name="chevron-left" size={16} />
            </button>
          )}
          {onNeste && (
            <button type="button" className="ak-visv__pil" onClick={onNeste} aria-label="Neste periode">
              <Icon name="chevron-right" size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
