import React from "react";
import { ensureCss } from "../data/viz.jsx";
import { useOverlayLayer } from "../overlays/overlay-focus.jsx";
import { StatusBadge } from "../primitives/StatusBadge.jsx";
ensureCss("akhq-css-cmdk", `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-cmdk-scrim{position:fixed;inset:0;background:var(--scrim);display:flex;align-items:flex-start;justify-content:center;padding:12vh var(--s4) var(--s4);z-index:var(--z-toast)}
.akhq-cmdk{width:min(560px,100%);max-height:70vh;display:flex;flex-direction:column;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);box-shadow:var(--shadow-lg,var(--shadow));overflow:hidden;font-family:var(--ui);color:var(--fg)}
.akhq-cmdk-top{display:flex;align-items:center;gap:var(--s3);padding:0 var(--s4);border-bottom:1px solid var(--border);flex:none}
.akhq-cmdk-in{--h:52px;--floor:0px;height:max(var(--h),var(--floor));flex:1;min-width:0;border:0;background:transparent;color:var(--fg);font:400 15px/1 var(--ui);outline:none}
.akhq-cmdk-in::placeholder{color:var(--muted);opacity:1}
.akhq-cmdk-list{overflow:auto;padding:var(--s2) 0;margin:0;list-style:none}
.akhq-cmdk-gr{font-family:var(--mono);font-size:9.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);padding:var(--s2) var(--s4) 4px}
.akhq-cmdk-item{--h:38px;--floor:0px;min-height:max(var(--h),var(--floor));width:100%;display:flex;align-items:center;gap:var(--s3);padding:0 var(--s4);border:0;background:transparent;color:var(--fg);font:500 13.5px/1.3 var(--ui);text-align:left;cursor:pointer;transition:background var(--dur) var(--ease)}
.akhq-cmdk-item:hover{background:var(--soft)}
.akhq-cmdk-item:active{background:color-mix(in srgb,var(--fg) 7%,transparent)}
.akhq-cmdk-item:focus-visible{outline:2px solid var(--focus);outline-offset:-2px}
.akhq-cmdk-item[aria-selected=true]{background:var(--soft)}
.akhq-cmdk-t{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.akhq-cmdk-sub{font-size:11.5px;color:var(--muted);white-space:nowrap}
.akhq-cmdk-foot{display:flex;gap:var(--s4);padding:7px var(--s4);border-top:1px solid var(--border);font-family:var(--mono);font-size:9.5px;letter-spacing:.06em;color:var(--muted);flex:none}
.akhq-cmdk-tom{padding:var(--s5) var(--s4);font-size:12.5px;color:var(--muted);line-height:1.5;margin:0}
}
@layer akhq-container{
@container (max-width:420px){.akhq-cmdk-sub{display:none}}
@media(pointer:coarse){.akhq-cmdk-item{--floor:44px}.akhq-cmdk-in{--floor:52px}}
[data-coarse-test] .akhq-cmdk-item{--floor:44px}
}
`);
/* Uten S6 er 100 funksjoner en meny ingen leser. Paletten er indeksen:
   hver rad har niv\u00e5merke, fordi niv\u00e5et sier hva som kommer til \u00e5 skje \u2014
   samtale, artefakt i panel, eller full overtakelse av flaten. */
export function CommandPalette({
  open = false, onClose, items = [], query, onQueryChange, onPick,
  placeholder = "S\u00f8k i alt \u2014 flater, artefakter, handlinger \u2026",
  emptyText = "Ingen treff. Pr\u00f8v et spillernavn, et ukenummer eller et selskap.",
  triggerRef, dataOdId = "cmdk", ...rest
}) {
  const layerRef = React.useRef(null);
  const [intern, setIntern] = React.useState("");
  const styrt = query !== undefined;
  const q = (styrt ? query : intern) || "";
  const [valgt, setValgt] = React.useState(0);
  useOverlayLayer({ open, onClose, layerRef, triggerRef, modal: true, initialFocus: "first" });
  const treff = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((it) => (it.label + " " + (it.group || "") + " " + (it.keywords || "")).toLowerCase().includes(s));
  }, [items, q]);
  React.useEffect(() => { setValgt(0); }, [q, open]);
  if (!open) return null;
  const skriv = (v) => { if (!styrt) setIntern(v); onQueryChange && onQueryChange(v); };
  const velg = (it) => { onPick && onPick(it); onClose && onClose("pick"); };
  const tast = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setValgt((i) => Math.min(i + 1, treff.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setValgt((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (treff[valgt]) velg(treff[valgt]); }
  };
  /* Gruppering bevarer kildens rekkefølge \u2014 relevans, ikke alfabet. */
  const grupper = [];
  for (const it of treff) {
    const g = it.group || "";
    const siste = grupper[grupper.length - 1];
    if (siste && siste.navn === g) siste.rader.push(it); else grupper.push({ navn: g, rader: [it] });
  }
  let n = -1;
  return (
    <div className="akhq-cmdk-scrim">
      <div className="akhq-cmdk" ref={layerRef} role="dialog" aria-modal="true" aria-label="Alt \u2014 s\u00f8k og indeks" data-od-id={dataOdId} {...rest}>
        <div className="akhq-cmdk-top">
          <input className="akhq-cmdk-in" type="text" value={q} placeholder={placeholder} onChange={(e) => skriv(e.target.value)} onKeyDown={tast} aria-label="S\u00f8k i alt" data-od-id="cmdk-input" />
        </div>
        {treff.length === 0 ? <p className="akhq-cmdk-tom">{emptyText}</p> : (
          <ul className="akhq-cmdk-list" role="listbox" aria-label="Treff">
            {grupper.map((g, gi) => (
              <React.Fragment key={gi}>
                {g.navn && <li className="akhq-cmdk-gr" role="presentation">{g.navn}</li>}
                {g.rader.map((it) => {
                  n++;
                  const i = n;
                  return (
                    <li key={it.id || i} role="option" aria-selected={i === valgt}>
                      <button type="button" className="akhq-cmdk-item" aria-selected={i === valgt} onClick={() => velg(it)} onMouseEnter={() => setValgt(i)} data-od-id={"cta-cmdk-" + (it.id || i)}>
                        <span className="akhq-cmdk-t">{it.label}</span>
                        {it.meta && <span className="akhq-cmdk-sub">{it.meta}</span>}
                        {it.level && <StatusBadge kind="tag" dataOdId="badge-level">{"niv\u00e5 " + it.level}</StatusBadge>}
                      </button>
                    </li>
                  );
                })}
              </React.Fragment>
            ))}
          </ul>
        )}
        <div className="akhq-cmdk-foot"><span>{"\u2191\u2193 velg"}</span><span>{"\u21b5 \u00e5pne"}</span><span>esc lukk</span></div>
      </div>
    </div>
  );
}
