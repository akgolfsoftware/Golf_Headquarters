import React from "react";

/**
 * AK Golf HQ — HeroTall
 * Naken tall-lockup: mono-caps eyebrow + stor tabulær mono + dempet enhet.
 * Primitiven bak «to tall, aldri blandet»-regelen (plan-kvalitet + gjennomføring
 * som to separate HeroTall). Kritisk data → alltid --text (dagslys-porten ≥7:1).
 * Tile-varianten er KpiTile; denne er for topplinjer og hero-soner.
 */

const CSS = `
.ak-hero{display:inline-flex;flex-direction:column;gap:6px;min-width:0;}
.ak-hero__lbl{
  font-family:var(--font-mono);font-size:var(--text-11);font-weight:600;
  letter-spacing:var(--tracking-eyebrow);text-transform:uppercase;
  color:var(--text-muted);line-height:1;
}
.ak-hero__row{display:flex;align-items:baseline;gap:8px;}
.ak-hero__val{
  font-family:var(--font-mono);font-weight:700;line-height:var(--leading-none);
  color:var(--text);font-variant-numeric:tabular-nums;
  letter-spacing:var(--tracking-mono);
}
.ak-hero--md .ak-hero__val{font-size:var(--text-36);}
.ak-hero--lg .ak-hero__val{font-size:var(--text-48);}
.ak-hero--xl .ak-hero__val{font-size:var(--text-60);}
.ak-hero__enhet{
  font-family:var(--font-mono);font-size:var(--text-13);font-weight:500;
  color:var(--text-muted);font-variant-numeric:tabular-nums;white-space:nowrap;
}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-hero-css")) {
  const s = document.createElement("style");
  s.id = "ak-hero-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function HeroTall({ label, verdi, enhet, size = "lg", delta, className = "", style }) {
  return (
    <div className={`ak-hero ak-hero--${size} ${className}`} style={style}>
      <span className="ak-hero__lbl">{label}</span>
      <span className="ak-hero__row">
        <span className="ak-hero__val">{verdi}</span>
        {enhet && <span className="ak-hero__enhet">{enhet}</span>}
        {delta}
      </span>
    </div>
  );
}
