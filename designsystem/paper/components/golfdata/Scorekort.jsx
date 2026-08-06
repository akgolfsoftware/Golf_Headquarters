import React from "react";
import { Region } from "./viz.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-scor-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-scor{display:grid;gap:var(--s3);min-width:0;box-sizing:border-box;font-family:var(--mono);color:var(--fg)}
.akhq-scor-ni{display:grid;grid-template-columns:44px repeat(9,1fr) 44px;gap:2px;min-width:0}
.akhq-scor-c{display:flex;align-items:center;justify-content:center;min-width:0;font-size:11px;font-variant-numeric:tabular-nums;padding:3px 0}
.akhq-scor-c--lab{justify-content:flex-start;font-size:9px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.akhq-scor-c--par{color:var(--muted);font-size:10px}
.akhq-scor-c--sum{font-weight:600}
.akhq-scor-s{position:relative;display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;font-weight:600}
.akhq-scor-tot{display:flex;align-items:baseline;gap:var(--s2);border-top:1px solid var(--hairline);padding-top:var(--s2)}
.akhq-scor-tot-lab{font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);flex:1}
.akhq-scor-tot-v{font-size:20px;font-weight:600;font-variant-numeric:tabular-nums}
.akhq-scor-tot-rel{font-size:11px;color:var(--muted)}
}
@layer akhq-container{
@container (max-width:560px){.akhq-scor-c{font-size:10px}.akhq-scor-s{width:18px;height:18px}}
}
@layer akhq-modifier{
.akhq-scor--kompakt .akhq-scor-c--par{display:none}
.akhq-scor-s--birdie{border:1px solid var(--up);border-radius:999px}
.akhq-scor-s--eagle{border:1px solid var(--up);border-radius:999px;box-shadow:0 0 0 2px var(--bg),0 0 0 3px var(--up)}
.akhq-scor-s--bogey{border:1px solid var(--dn);border-radius:3px}
.akhq-scor-s--dobbel{border:1px solid var(--dn);border-radius:3px;box-shadow:0 0 0 2px var(--bg),0 0 0 3px var(--dn)}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-scor")) { const s = document.createElement("style"); s.id = "akhq-css-scor"; s.textContent = css; document.head.appendChild(s); }
const merke = (score, par) => {
  const d = score - par;
  if (d <= -2) return " akhq-scor-s--eagle";
  if (d === -1) return " akhq-scor-s--birdie";
  if (d === 1) return " akhq-scor-s--bogey";
  if (d >= 2) return " akhq-scor-s--dobbel";
  return "";
};
function Ni({ label, holes, fra }) {
  const parSum = holes.reduce((a, h) => a + h.par, 0);
  const scoreSum = holes.reduce((a, h) => a + h.score, 0);
  return (<>
    <div className="akhq-scor-ni" role="row">
      <span className="akhq-scor-c akhq-scor-c--lab">Hull</span>
      {holes.map((h, i) => <span className="akhq-scor-c akhq-scor-c--par" key={i}>{fra + i}</span>)}
      <span className="akhq-scor-c akhq-scor-c--lab">{label}</span>
    </div>
    <div className="akhq-scor-ni" role="row">
      <span className="akhq-scor-c akhq-scor-c--lab">Par</span>
      {holes.map((h, i) => <span className="akhq-scor-c akhq-scor-c--par" key={i}>{h.par}</span>)}
      <span className="akhq-scor-c akhq-scor-c--par">{parSum}</span>
    </div>
    <div className="akhq-scor-ni" role="row">
      <span className="akhq-scor-c akhq-scor-c--lab">Slag</span>
      {holes.map((h, i) => (
        <span className="akhq-scor-c" key={i}><span className={"akhq-scor-s" + merke(h.score, h.par)}>{h.score}</span></span>
      ))}
      <span className="akhq-scor-c akhq-scor-c--sum">{scoreSum}</span>
    </div>
  </>);
}
/* Scorekortet: 18 hull som ut/inn-niere, BRUTTO slag alltid (aldri netto —
   golfdataregelen). Merkene følger golfens konvensjon: sirkel under par,
   firkant over, dobbel ramme for eagle/dobbeltbogey — i --up/--dn toner,
   tallet selv alltid --fg. Ren visning; hull-for-hull-redigering bor i
   FangstSheet. Chromeless: flaten eies av Panel. */
export function Scorekort({
  holes = [], compact = false, courseLabel,
  state = "content",
  emptyText = "Ingen runde registrert ennå. Scorekortet fylles fra FangstSheet eller GolfBox.",
  dataOdId = "scorekort", ...rest
}) {
  const ut = holes.slice(0, 9);
  const inn = holes.slice(9, 18);
  const total = holes.reduce((a, h) => a + h.score, 0);
  const parTot = holes.reduce((a, h) => a + h.par, 0);
  const rel = total - parTot;
  return (
    <div className="akhq-scor-wrap">
      <Region state={state} empty={emptyText}>
        <div className={"akhq-scor" + (compact ? " akhq-scor--kompakt" : "")} role="table" aria-label={"Scorekort" + (courseLabel ? " " + courseLabel : "") + ": " + total + " slag, " + (rel === 0 ? "par" : (rel > 0 ? "+" + rel : rel))} data-od-id={"kpi-" + dataOdId} {...rest}>
          <Ni label="Ut" holes={ut} fra={1} />
          {inn.length > 0 && <Ni label="Inn" holes={inn} fra={10} />}
          <div className="akhq-scor-tot">
            <span className="akhq-scor-tot-lab">{courseLabel || "Totalt"} · brutto</span>
            <span className="akhq-scor-tot-v">{total}</span>
            <span className="akhq-scor-tot-rel">{rel === 0 ? "par" : rel > 0 ? "+" + rel : String(rel)}</span>
          </div>
        </div>
      </Region>
    </div>
  );
}
