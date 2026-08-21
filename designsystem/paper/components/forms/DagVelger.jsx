import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-dv{display:flex;gap:6px;width:100%;font-family:var(--ui)}
.akhq-dv-btn{--floor:0px;flex:1;min-height:max(44px,var(--floor));display:flex;align-items:center;justify-content:center;border:1px solid var(--border);border-radius:var(--r-sm);background:var(--surface);color:var(--fg);font-family:var(--mono);font-size:11px;font-weight:600;letter-spacing:.02em;cursor:pointer;padding:0}
.akhq-dv-btn:hover:not(.akhq-dv-btn--valgt){background:var(--soft)}
.akhq-dv-btn:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.akhq-dv-btn--valgt{border-color:var(--fg);background:var(--fg);color:var(--surface)}
}
@layer akhq-container{
@container (max-width: 340px){.akhq-dv{gap:4px}.akhq-dv-btn{font-size:10px}}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-dv")) { const s = document.createElement("style"); s.id = "akhq-css-dv"; s.textContent = css; document.head.appendChild(s); }
const DAGER = [
  { kode: "MAN", kort: "MA", label: "Mandag" },
  { kode: "TIR", kort: "TI", label: "Tirsdag" },
  { kode: "ONS", kort: "ON", label: "Onsdag" },
  { kode: "TOR", kort: "TO", label: "Torsdag" },
  { kode: "FRE", kort: "FR", label: "Fredag" },
  { kode: "LOR", kort: "LØ", label: "Lørdag" },
  { kode: "SON", kort: "SØ", label: "Søndag" },
];
/* 7-dagers flervalgsrad for foretrukne treningsdager (onboarding-tillegget,
   manifest 20.08.2026). Rene togglebrytere — 44 px er GULV, ikke et
   pointer:coarse-unntak, i motsetning til de andre komponentene her: en
   ukerad med sju kolonner er alltid trykket med tommelen. */
export function DagVelger({ valgt = [], onChange, dataOdId = "dagvelger" }) {
  const veksle = (kode) => {
    if (!onChange) return;
    onChange(valgt.includes(kode) ? valgt.filter((k) => k !== kode) : [...valgt, kode]);
  };
  return (
    <div className="akhq-dv" role="group" aria-label="Foretrukne treningsdager" data-od-id={dataOdId}>
      {DAGER.map((d) => {
        const erValgt = valgt.includes(d.kode);
        return (
          <button type="button" key={d.kode} className={"akhq-dv-btn" + (erValgt ? " akhq-dv-btn--valgt" : "")}
            aria-pressed={erValgt} aria-label={d.label} onClick={() => veksle(d.kode)} data-od-id={dataOdId + "-" + d.kode.toLowerCase()}>
            {d.kort}
          </button>
        );
      })}
    </div>
  );
}
