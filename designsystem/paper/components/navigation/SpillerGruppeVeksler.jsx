import React from "react";
import { Avatar } from "../primitives/Avatar.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-sgvx-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-sgvx{--navn:inline;display:flex;gap:var(--s1);min-width:0;overflow-x:auto;padding-bottom:2px;font-family:var(--ui);color:var(--fg)}
.akhq-sgvx-v{--bgc:transparent;--tx:var(--muted);--bc:var(--border);--floor:0px;flex:none;appearance:none;display:inline-flex;align-items:center;gap:6px;min-height:max(36px,var(--floor));padding:4px 12px 4px 6px;border:1px solid var(--bc);border-radius:var(--r-pill);background:var(--bgc);color:var(--tx);font-size:12px;font-weight:500;white-space:nowrap;cursor:pointer;box-sizing:border-box;transition:background var(--dur) var(--ease),color var(--dur) var(--ease)}
.akhq-sgvx-v:hover,.akhq-sgvx-v[data-state=hover]{--bgc:var(--soft)}
.akhq-sgvx-v:focus-visible,.akhq-sgvx-v[data-state=focus]{outline:2px solid var(--focus);outline-offset:2px}
.akhq-sgvx-v[aria-checked=true]{--bgc:var(--cta);--tx:var(--on-cta);--bc:var(--cta)}
.akhq-sgvx-navn{display:var(--navn)}
.akhq-sgvx-alle{padding-left:12px}
.akhq-sgvx-ant{font-family:var(--mono);font-size:9.5px;color:inherit;opacity:.7;font-variant-numeric:tabular-nums}
}
@layer akhq-container{
@container (max-width:420px){.akhq-sgvx{--navn:none}.akhq-sgvx-v{padding:4px 8px 4px 6px}}
@media(pointer:coarse){.akhq-sgvx-v{--floor:44px}}
[data-coarse-test] .akhq-sgvx-v{--floor:44px}
}
@layer akhq-modifier{
.akhq-sgvx--ramme{border:1px solid var(--border);border-radius:var(--r-sm);padding:4px}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-sgvx")) { const s = document.createElement("style"); s.id = "akhq-css-sgvx"; s.textContent = css; document.head.appendChild(s); }
/* Veksleren mellom spillere og grupper i coach-kontekst: «Alle» + grupper
   (med antall) + enkeltspillere (avatar + navn). Radiogroup med roving
   tabindex; valgt er blekkfylt. Under 420 px container kollapser navnene
   til avatarer alene — aldri færre valg, bare tettere. Grensen mot
   FilterPills: pills filtrerer et sett på samme flate; veksleren bytter
   KONTEKST (hvem hele flaten handler om). */
export function SpillerGruppeVeksler({
  items = [], value, onChange, showAll = true, allLabel = "Alle", allCount,
  framed = false, dataOdId = "spillervelger", ...rest
}) {
  const alle = showAll ? [{ key: "__alle", label: allLabel, count: allCount, all: true }, ...items] : items;
  const refs = React.useRef([]);
  const valgtIdx = Math.max(0, alle.findIndex((d) => (d.all ? value == null : d.key === value)));
  const velg = (d) => { if (onChange) onChange(d.all ? null : d.key); };
  const flytt = (fra, delta) => {
    const til = (fra + delta + alle.length) % alle.length;
    velg(alle[til]);
    const n = refs.current[til];
    if (n) n.focus();
  };
  const tast = (idx) => (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); flytt(idx, 1); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); flytt(idx, -1); }
  };
  return (
    <div className="akhq-sgvx-wrap">
      <div className={"akhq-sgvx" + (framed ? " akhq-sgvx--ramme" : "")} role="radiogroup" aria-label="Velg spiller eller gruppe" data-od-id={"nav-" + dataOdId} {...rest}>
        {alle.map((d, i) => {
          const valgt = d.all ? value == null : d.key === value;
          return (
            <button type="button" role="radio" key={d.key}
              ref={(n) => { refs.current[i] = n; }}
              aria-checked={valgt}
              tabIndex={i === valgtIdx ? 0 : -1}
              onKeyDown={tast(i)}
              onClick={() => velg(d)}
              className={"akhq-sgvx-v" + (d.all ? " akhq-sgvx-alle" : "")}
              data-od-id={"cta-" + dataOdId + "-" + (d.all ? "alle" : d.key)}>
              {!d.all && !d.group && <Avatar name={d.label} size="sm" decorative dataOdId={dataOdId + "-av-" + d.key} />}
              <span className={d.all || d.group ? undefined : "akhq-sgvx-navn"}>{d.label}</span>
              {d.count != null && <span className="akhq-sgvx-ant">{d.count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
