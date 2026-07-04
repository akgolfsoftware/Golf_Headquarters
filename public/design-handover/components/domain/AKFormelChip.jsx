import React from "react";

/**
 * AK Golf HQ — AKFormelChip
 * Én formelverdi på økt/drill: arena (M0–M5), CS-nivå, læringstrinn.
 * Tolags-språk: kode kun i coach-flaten (visKode); spiller ser klarspråk.
 * Arvet (fra plan/mal) = dempet; overstyrt (satt manuelt) = solid kant + tekst.
 */

const CSS = `
.ak-akchip{
  display:inline-flex;align-items:center;gap:6px;
  height:24px;padding:0 9px;border-radius:var(--radius-tag);
  font-family:var(--font-ui);font-size:var(--text-12);font-weight:500;
  white-space:nowrap;border:1px solid transparent;
}
button.ak-akchip{cursor:pointer;transition:border-color var(--dur-fast) var(--ease-standard),background var(--dur-fast) var(--ease-standard);}
button.ak-akchip:hover{border-color:var(--border-strong);background:var(--surface-hover);}
button.ak-akchip:focus-visible{outline:none;box-shadow:var(--glow-signal);}
.ak-akchip--arvet{background:var(--surface-2);color:var(--text-muted);}
.ak-akchip--arvet .ak-akchip__kode{color:var(--text-muted);}
.ak-akchip--overstyrt{background:var(--surface-2);border-color:var(--border-strong);color:var(--text);}
.ak-akchip--overstyrt .ak-akchip__kode{color:var(--text);}
.ak-akchip__kode{
  font-family:var(--font-mono);font-size:10px;font-weight:700;
  letter-spacing:.04em;font-variant-numeric:tabular-nums;
}
.ak-akchip__skille{width:1px;height:10px;background:var(--border-strong);}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-akchip-css")) {
  const s = document.createElement("style");
  s.id = "ak-akchip-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function AKFormelChip({ kode, navn, tilstand = "arvet", visKode = true, onClick, className = "", style }) {
  const Tag = onClick ? "button" : "span";
  return (
    <Tag
      className={`ak-akchip ak-akchip--${tilstand} ${className}`}
      style={style}
      onClick={onClick}
      type={onClick ? "button" : undefined}
      title={tilstand === "overstyrt" ? "Satt manuelt — avviker fra plan/mal" : "Arvet fra plan"}
    >
      {visKode && (
        <React.Fragment>
          <span className="ak-akchip__kode">{kode}</span>
          <span className="ak-akchip__skille" aria-hidden="true"></span>
        </React.Fragment>
      )}
      <span>{navn}</span>
    </Tag>
  );
}
