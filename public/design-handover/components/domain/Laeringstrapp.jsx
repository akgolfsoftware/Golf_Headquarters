import React from "react";

/**
 * AK Golf HQ — Laeringstrapp
 * Signaturmotivet (metodikk-geometrien): fem like steg med 1:1-stigning.
 * Aktivt trinn = signal-fylt · passerte = dempet fylt · kommende = kun kontur.
 * Alltid nøyaktig 5 steg — aldri prosent-utjevning (kanon, designsystem.md §6).
 */

const CSS = `
.ak-trapp{display:flex;flex-direction:column;gap:8px;width:100%;min-width:0;}
.ak-trapp__status{
  font-family:var(--font-mono);font-size:var(--text-11);font-weight:600;
  color:var(--text-2);font-variant-numeric:tabular-nums;
}
.ak-trapp__status b{color:var(--text);font-weight:700;}
.ak-trapp__svg{width:100%;display:block;overflow:visible;}
.ak-trapp__etiketter{display:grid;grid-template-columns:repeat(5,1fr);gap:2px;}
.ak-trapp__etikett{
  font-family:var(--font-mono);font-size:9px;font-weight:600;
  letter-spacing:.04em;color:var(--text-muted);text-align:center;
  font-variant-numeric:tabular-nums;
}
.ak-trapp__etikett--aktiv{color:var(--text);}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-trapp-css")) {
  const s = document.createElement("style");
  s.id = "ak-trapp-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export const TRINN = [
  { trinn: 1, navn: "Kropp", klar: "Kroppen lærer bevegelsen" },
  { trinn: 2, navn: "Armer", klar: "Armene kobles på bevegelsen" },
  { trinn: 3, navn: "Kølle", klar: "Svingtrening med kølle — uten ball" },
  { trinn: 4, navn: "Ball",  klar: "Ballkontakt i kontrollert fart" },
  { trinn: 5, navn: "Auto",  klar: "Automatisert under press" },
];

export function Laeringstrapp({
  aktivtTrinn = 1,
  kompakt = false,
  visEtiketter = true,
  visStatus = false,
  className = "",
  style,
}) {
  // 5 steg à bredde W/5; steghøyde = 1:1-stigning mot en fast enhets-skala.
  const W = 300, STEP = W / 5, H = kompakt ? 60 : 90;
  const unit = H / 5;
  const aktiv = TRINN[aktivtTrinn - 1];

  return (
    <div className={`ak-trapp ${className}`} style={style}
      role="img" aria-label={`Læringstrapp: Trinn ${aktivtTrinn} av 5 · ${aktiv.navn} — ${aktiv.klar}`}>
      {visStatus && (
        <span className="ak-trapp__status">
          <b>Trinn {aktivtTrinn} av 5</b> · {aktiv.navn} — {aktiv.klar}
        </span>
      )}
      <svg className="ak-trapp__svg" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        {TRINN.map((t, i) => {
          const x = i * STEP;
          const h = (i + 1) * unit;
          const passert = t.trinn < aktivtTrinn;
          const aktivt = t.trinn === aktivtTrinn;
          return (
            <rect
              key={t.trinn}
              x={x + 1.5}
              y={H - h + 1.5}
              width={STEP - 3}
              height={Math.max(h - 3, 4)}
              rx="3"
              fill={aktivt ? "var(--signal)" : passert ? "var(--surface-hover)" : "none"}
              stroke={aktivt ? "var(--signal)" : passert ? "var(--border-strong)" : "var(--border-strong)"}
              strokeWidth="1.5"
              strokeDasharray={!aktivt && !passert ? "4 3" : undefined}
            />
          );
        })}
      </svg>
      {visEtiketter && (
        <div className="ak-trapp__etiketter">
          {TRINN.map((t) => (
            <span key={t.trinn} className={`ak-trapp__etikett${t.trinn === aktivtTrinn ? " ak-trapp__etikett--aktiv" : ""}`}>
              {kompakt ? t.trinn : `${t.trinn} · ${t.navn}`}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
