import React from "react";
import { Region } from "./viz.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-tlj-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-tlj{--dot:8px;--tidw:44px;--radgap:var(--s4);display:flex;flex-direction:column;list-style:none;margin:0;padding:0;min-width:0;box-sizing:border-box;font-family:var(--ui);color:var(--fg)}
.akhq-tlj-rad{position:relative;display:flex;gap:var(--s3);padding:0 0 var(--radgap) 0;min-width:0}
.akhq-tlj-rad:last-child{padding-bottom:0}
.akhq-tlj-tid{flex:none;width:var(--tidw);text-align:right;font-family:var(--mono);font-size:10.5px;color:var(--muted);font-variant-numeric:tabular-nums;padding-top:2px}
.akhq-tlj-marg{flex:none;position:relative;width:var(--dot);display:flex;justify-content:center}
.akhq-tlj-prikk{--tone:var(--mid);width:var(--dot);height:var(--dot);border-radius:999px;background:var(--tone);margin-top:5px;flex:none}
.akhq-tlj-rad:not(:last-child) .akhq-tlj-marg::after{content:"";position:absolute;top:17px;bottom:calc(-1*var(--radgap) + 4px);width:1px;background:var(--border);left:calc(50% - .5px)}
.akhq-tlj-c{min-width:0;flex:1}
.akhq-tlj-ttl{margin:0;font-size:13px;font-weight:500;line-height:1.35;overflow-wrap:anywhere}
.akhq-tlj-txt{margin:2px 0 0;font-family:var(--body);font-size:12.5px;color:var(--muted);line-height:1.5}
.akhq-tlj-verdi{margin:2px 0 0;font-family:var(--mono);font-size:11px;color:var(--fg);font-variant-numeric:tabular-nums}
}
@layer akhq-container{
@container (max-width:360px){.akhq-tlj{--tidw:36px;--radgap:var(--s3)}}
}
@layer akhq-modifier{
.akhq-tlj-rad--up .akhq-tlj-prikk{--tone:var(--up)}
.akhq-tlj-rad--dn .akhq-tlj-prikk{--tone:var(--dn)}
.akhq-tlj-rad--info .akhq-tlj-prikk{--tone:var(--info)}
.akhq-tlj-rad--naa .akhq-tlj-prikk{--tone:var(--fg)}
.akhq-tlj-rad--naa .akhq-tlj-ttl{font-weight:600}
.akhq-tlj--tett{--radgap:var(--s3)}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-tlj")) { const s = document.createElement("style"); s.id = "akhq-css-tlj"; s.textContent = css; document.head.appendChild(s); }
/* Vertikal tidslinje for forløp: øktlogg, testhistorikk, agentkjøringer,
   hendelser i en live-økt. Ren visning — radene er ikke treffmål; skal en rad
   åpne noe, komponeres den som AgendaRow i stedet. Prikken bærer tonen
   (up/dn/info/nå), brødteksten er alltid --fg/--muted. Siste rad har aldri
   strek — sett lukkes ikke (readme, bindende 28.07). */
export function Tidslinje({
  items = [], dense = false,
  state = "content",
  emptyText = "Ingen hendelser logget ennå. De dukker opp her etter hvert som noe skjer.",
  dataOdId = "tidslinje", ...rest
}) {
  return (
    <div className="akhq-tlj-wrap">
      <Region state={state} empty={emptyText}>
        <ol className={"akhq-tlj" + (dense ? " akhq-tlj--tett" : "")} data-od-id={"panel-" + dataOdId} {...rest}>
          {items.map((it, i) => (
            <li className={"akhq-tlj-rad" + (it.tone ? " akhq-tlj-rad--" + it.tone : "")} key={it.id || i}>
              <span className="akhq-tlj-tid">{it.time}</span>
              <span className="akhq-tlj-marg" aria-hidden="true"><span className="akhq-tlj-prikk" /></span>
              <span className="akhq-tlj-c">
                <p className="akhq-tlj-ttl">{it.title}</p>
                {it.body && <p className="akhq-tlj-txt">{it.body}</p>}
                {it.value && <p className="akhq-tlj-verdi">{it.value}</p>}
              </span>
            </li>
          ))}
        </ol>
      </Region>
    </div>
  );
}
