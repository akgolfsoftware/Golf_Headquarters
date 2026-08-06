import React from "react";
import { Region } from "./viz.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-prail-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-prail{--lab:flex;display:flex;flex-direction:column;gap:var(--s2);min-width:0;box-sizing:border-box;font-family:var(--ui);color:var(--fg);padding-top:6px}
.akhq-prail-spor{position:relative;height:24px;min-width:0}
.akhq-prail-linje{position:absolute;left:0;right:0;top:11px;height:2px;background:var(--hairline);border-radius:999px}
.akhq-prail-vindu{position:absolute;top:9px;height:6px;background:color-mix(in srgb, var(--info-raw) 28%, var(--surface));border-radius:999px;pointer-events:none}
.akhq-prail-stopp{--floor:0px;position:absolute;top:8px;width:8px;height:8px;margin-left:-4px;border-radius:999px;background:var(--surface);border:1px solid var(--mid);padding:0;cursor:default;box-sizing:border-box}
.akhq-prail-stopp[data-kan-velges]{cursor:pointer}
.akhq-prail-stopp[data-kan-velges]::after{content:"";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:max(100%,var(--floor));height:max(100%,var(--floor))}
.akhq-prail-stopp:focus-visible,.akhq-prail-stopp[data-state=focus]{outline:2px solid var(--focus);outline-offset:2px}
.akhq-prail-mark{position:absolute;top:5px;width:14px;height:14px;margin-left:-7px;border-radius:999px;background:var(--fg);border:2px solid var(--bg);box-shadow:0 0 0 1px var(--fg);pointer-events:none;box-sizing:border-box}
.akhq-prail-labrad{display:var(--lab);position:relative;height:14px}
.akhq-prail-plab{position:absolute;transform:translateX(-50%);font-family:var(--mono);font-size:9px;color:var(--muted);white-space:nowrap}
.akhq-prail-plab--aktiv{color:var(--fg);font-weight:600}
.akhq-prail-note{font-family:var(--mono);font-size:10.5px;color:var(--muted)}
.akhq-prail-note-v{color:var(--fg);font-weight:600}
}
@layer akhq-container{
@container (max-width:360px){.akhq-prail-plab{font-size:8px}}
@media(pointer:coarse){.akhq-prail-stopp{--floor:44px}}
[data-coarse-test] .akhq-prail-stopp{--floor:44px}
}
@layer akhq-modifier{
.akhq-prail--uten-labels{--lab:none}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-prail")) { const s = document.createElement("style"); s.id = "akhq-css-prail"; s.textContent = css; document.head.appendChild(s); }
const POS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const x = (p) => ((p - 1) / 9) * 100;
/* MORAD-kjernen: P1.0–P10.0 som horisontal skinne. Markøren er gjeldende
   posisjon (halvposisjoner som P6.5 plasseres proporsjonalt), vinduet er
   øktas fokusområde (f.eks. P5–P7) i analyse-blå tint — aldri oransje;
   oransje tilhører OneThingNow og fokusringen alene. Stoppene kan gjøres
   klikkbare (velg posisjon i økt-editoren); treffsonen utvides med ::after
   til 44 px uten at den synlige prikken vokser (gulvregel §2). */
export function PPositionRail({
  value, window: vindu, onSelect, hideLabels = false, note,
  state = "content",
  emptyText = "Ingen posisjon satt ennå. Velg P-posisjon i økt-editoren.",
  dataOdId = "pposisjon", ...rest
}) {
  const sum = "P-posisjonsskinne." + (value != null ? " Gjeldende: P" + Number(value).toFixed(1) + "." : "") + (vindu ? " Fokusvindu P" + vindu.from + " til P" + vindu.to + "." : "");
  return (
    <div className="akhq-prail-wrap">
      <Region state={state} empty={emptyText}>
        <div className={"akhq-prail" + (hideLabels ? " akhq-prail--uten-labels" : "")} role="img" aria-label={sum} data-od-id={"kpi-" + dataOdId} {...rest}>
          <span className="akhq-prail-spor">
            <span className="akhq-prail-linje" />
            {vindu && <span className="akhq-prail-vindu" style={{ left: x(vindu.from) + "%", width: (x(vindu.to) - x(vindu.from)) + "%" }} />}
            {POS.map((p) => {
              const El = onSelect ? "button" : "span";
              return (
                <El key={p}
                  {...(onSelect ? { type: "button", onClick: () => onSelect(p), "data-kan-velges": "", "aria-label": "Velg P" + p, "data-od-id": "cta-" + dataOdId + "-p" + p } : {})}
                  className="akhq-prail-stopp" style={{ left: x(p) + "%" }} />
              );
            })}
            {value != null && <span className="akhq-prail-mark" style={{ left: x(value) + "%" }} />}
          </span>
          <span className="akhq-prail-labrad" aria-hidden="true">
            {POS.map((p) => (
              <span key={p} className={"akhq-prail-plab" + (value != null && Math.round(value) === p ? " akhq-prail-plab--aktiv" : "")} style={{ left: x(p) + "%" }}>P{p}</span>
            ))}
          </span>
          {note && <p className="akhq-prail-note">{value != null && <span className="akhq-prail-note-v">P{Number(value).toFixed(1)} · </span>}{note}</p>}
        </div>
      </Region>
    </div>
  );
}
