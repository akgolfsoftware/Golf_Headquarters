import React from "react";
import { useOverlayLayer } from "../overlays/overlay-focus.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-dp{position:relative;display:block;width:100%;min-width:0;font-family:var(--ui)}
.akhq-dp-trig{--h:36px;--floor:0px;display:flex;align-items:center;gap:var(--s2);height:max(var(--h),var(--floor));width:100%;box-sizing:border-box;padding:0 var(--s3);border-radius:var(--r-sm);border:1px solid var(--border);background:var(--surface);color:var(--fg);font-family:var(--ui);font-size:13px;text-align:left;cursor:pointer}
.akhq-dp-trig:hover:not(:disabled){border-color:var(--muted)}
.akhq-dp-trig:focus-visible{outline:2px solid var(--focus);outline-offset:1px}
.akhq-dp-trig:disabled{opacity:.4;cursor:not-allowed;background:var(--soft)}
.akhq-dp-trig[aria-invalid=true]{border-color:var(--dn)}
.akhq-dp-tom{color:var(--muted)}
.akhq-dp-uke{margin-left:auto;font-family:var(--mono);font-size:11px;color:var(--muted)}
.akhq-dp-lay{position:absolute;z-index:var(--z-toast);top:calc(100% + 4px);left:0;width:288px;max-width:88vw;box-sizing:border-box;padding:var(--s3);background:var(--surface);border:1px solid var(--border);border-radius:var(--r);box-shadow:var(--shadow)}
.akhq-dp-lay:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.akhq-dp-hd{display:flex;align-items:center;gap:var(--s2);margin-bottom:var(--s2)}
.akhq-dp-mnd{font-family:var(--mono);font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--fg)}
.akhq-dp-nav{--hit:28px;--floor:0px;position:relative;margin-left:auto;display:inline-flex;align-items:center;justify-content:center;width:var(--hit);height:var(--hit);border:1px solid var(--border);border-radius:var(--r-sm);background:transparent;color:var(--fg);cursor:pointer;font-size:12px}
.akhq-dp-nav+.akhq-dp-nav{margin-left:4px}
.akhq-dp-nav::after{content:"";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:max(var(--hit),var(--floor));height:max(var(--hit),var(--floor))}
.akhq-dp-nav:hover{background:var(--soft)}
.akhq-dp-nav:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.akhq-dp-uketopp,.akhq-dp-rutenett{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}
.akhq-dp-uketopp{margin-bottom:4px}
.akhq-dp-ukedag{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);text-align:center}
.akhq-dp-dag{--hit:34px;--floor:0px;position:relative;display:flex;align-items:center;justify-content:center;height:var(--hit);border:0;border-radius:var(--r-sm);background:transparent;color:var(--fg);font-family:var(--ui);font-size:13px;font-variant-numeric:tabular-nums;cursor:pointer}
.akhq-dp-dag::after{content:"";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:100%;height:max(var(--hit),var(--floor))}
.akhq-dp-dag:hover:not(:disabled){background:var(--soft)}
.akhq-dp-dag:focus-visible{outline:2px solid var(--focus);outline-offset:-2px}
.akhq-dp-dag:disabled{color:var(--mid);cursor:not-allowed}
.akhq-dp-dag[aria-selected=true]{background:var(--fg);color:var(--bg)}
.akhq-dp-dag[data-idag=true]{box-shadow:inset 0 0 0 1px var(--border)}
.akhq-dp-ut{color:var(--mid)}
.akhq-dp-ft{display:flex;align-items:center;gap:var(--s2);margin-top:var(--s2);padding-top:var(--s2);border-top:1px solid var(--border)}
.akhq-dp-snar{--hit:28px;--floor:0px;position:relative;padding:0 8px;height:var(--hit);border:1px solid var(--border);border-radius:var(--r-pill);background:transparent;color:var(--fg);font-family:var(--mono);font-size:11px;cursor:pointer}
.akhq-dp-snar::after{content:"";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:100%;height:max(var(--hit),var(--floor))}
.akhq-dp-snar:hover{background:var(--soft)}
.akhq-dp-snar:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
}
@layer akhq-container{
@media(pointer:coarse){.akhq-dp-trig{--floor:44px}.akhq-dp-nav{--floor:44px}.akhq-dp-dag{--floor:44px}.akhq-dp-snar{--floor:44px}}
[data-coarse-test] .akhq-dp-trig{--floor:44px}
[data-coarse-test] .akhq-dp-nav{--floor:44px}
[data-coarse-test] .akhq-dp-dag{--floor:44px}
[data-coarse-test] .akhq-dp-snar{--floor:44px}
}
@layer akhq-modifier{
.akhq-dp-lay--right{left:auto;right:0}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-dp")) { const s = document.createElement("style"); s.id = "akhq-css-dp"; s.textContent = css; document.head.appendChild(s); }
const MND = ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"];
const UKEDAG = ["ma", "ti", "on", "to", "fr", "lø", "sø"];
const iso = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const parse = (s) => { if (!s) return null; const [a, b, c] = s.split("-").map(Number); return a ? new Date(a, b - 1, c) : null; };
/* ISO-8601 ukenummer. Norsk kalender teller uker, og planleggingen i
   AK-systemet er ukebasert hele veien — et datovalg uten uke er ubrukelig
   for en periodeplan. */
export function ukenummer(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dag = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dag);
  const start = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t - start) / 86400000 + 1) / 7);
}
const norsk = (d) => d.getDate() + ". " + MND[d.getMonth()] + " " + d.getFullYear();
let seq = 0;
/* Datovelger med ukenummer, mandag først og tastaturnavigasjon i rutenettet.
   Underlaget for hele kalenderfamilien (bølge P4) og for snooze-tidsvalget
   i køen — begge venter på denne. */
export function DatePicker({ value, onChange, min, max, placeholder = "Velg dato", shortcuts = true, disabled, invalid, defaultOpen = false, dataOdId = "felt-dato" }) {
  /* defaultOpen finnes for spesimenkortet: den åpne tilstanden må kunne
     rendres og måles. I produkt styres den av brukeren. */
  const [open, setOpen] = React.useState(defaultOpen);
  const valgt = parse(value);
  const idag = new Date(); idag.setHours(0, 0, 0, 0);
  const [vis, setVis] = React.useState(() => { const d = valgt || idag; return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [fokusDato, setFokusDato] = React.useState(() => valgt || idag);
  const layRef = React.useRef(null);
  const trigRef = React.useRef(null);
  const id = React.useMemo(() => "akhq-dp" + (++seq), []);
  const close = React.useCallback(() => setOpen(false), []);
  useOverlayLayer({ open, onClose: close, layerRef: layRef, triggerRef: trigRef, initialFocus: "layer" });
  const minD = parse(min), maxD = parse(max);
  const sperret = (d) => (minD && d < minD) || (maxD && d > maxD);
  const forste = new Date(vis.getFullYear(), vis.getMonth(), 1);
  const skift = (forste.getDay() + 6) % 7;
  const dager = [];
  for (let i = 0; i < 42; i++) dager.push(new Date(vis.getFullYear(), vis.getMonth(), 1 - skift + i));
  const velg = (d) => { if (sperret(d)) return; setOpen(false); if (onChange) onChange(iso(d)); };
  const flytt = (dager2) => {
    const n = new Date(fokusDato.getFullYear(), fokusDato.getMonth(), fokusDato.getDate() + dager2);
    setFokusDato(n);
    setVis(new Date(n.getFullYear(), n.getMonth(), 1));
    requestAnimationFrame(() => { const el = layRef.current && layRef.current.querySelector('[data-dato="' + iso(n) + '"]'); if (el) el.focus(); });
  };
  const tast = (e) => {
    const k = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7, PageUp: -28, PageDown: 28 }[e.key];
    if (k !== undefined) { e.preventDefault(); flytt(k); return; }
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); velg(fokusDato); }
  };
  return (
    <div className="akhq-dp" data-od-id={dataOdId}>
      <button type="button" className="akhq-dp-trig" ref={trigRef} disabled={disabled} aria-invalid={invalid ? "true" : undefined}
        aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((v) => !v)} data-od-id={"cta-" + dataOdId}>
        <span className={valgt ? "" : "akhq-dp-tom"}>{valgt ? norsk(valgt) : placeholder}</span>
        {valgt && <span className="akhq-dp-uke">uke {ukenummer(valgt)}</span>}
      </button>
      {open && (
        <div className="akhq-dp-lay" ref={layRef} tabIndex={-1} role="dialog" aria-label="Velg dato" id={id} onKeyDown={tast}>
          <div className="akhq-dp-hd">
            <span className="akhq-dp-mnd">{MND[vis.getMonth()]} {vis.getFullYear()}</span>
            <button type="button" className="akhq-dp-nav" aria-label="Forrige måned" onClick={() => setVis(new Date(vis.getFullYear(), vis.getMonth() - 1, 1))} data-od-id={"cta-" + dataOdId + "-forrige"}>‹</button>
            <button type="button" className="akhq-dp-nav" aria-label="Neste måned" onClick={() => setVis(new Date(vis.getFullYear(), vis.getMonth() + 1, 1))} data-od-id={"cta-" + dataOdId + "-neste"}>›</button>
          </div>
          <div className="akhq-dp-uketopp" aria-hidden="true">{UKEDAG.map((u) => <span className="akhq-dp-ukedag" key={u}>{u}</span>)}</div>
          <div className="akhq-dp-rutenett" role="grid" aria-label={MND[vis.getMonth()] + " " + vis.getFullYear()}>
            {dager.map((d) => {
              const ute = d.getMonth() !== vis.getMonth();
              const er = valgt && iso(d) === iso(valgt);
              return (
                <button type="button" key={iso(d)} data-dato={iso(d)} role="gridcell"
                  className={"akhq-dp-dag" + (ute ? " akhq-dp-ut" : "")}
                  aria-selected={er ? "true" : "false"} data-idag={iso(d) === iso(idag) ? "true" : undefined}
                  tabIndex={iso(d) === iso(fokusDato) ? 0 : -1}
                  disabled={sperret(d)} onClick={() => velg(d)}
                  aria-label={norsk(d)} data-od-id={"cta-" + dataOdId + "-" + iso(d)}>{d.getDate()}</button>
              );
            })}
          </div>
          {shortcuts && (
            <div className="akhq-dp-ft">
              <button type="button" className="akhq-dp-snar" onClick={() => velg(idag)} data-od-id={"cta-" + dataOdId + "-idag"}>I dag</button>
              <button type="button" className="akhq-dp-snar" onClick={() => velg(new Date(idag.getFullYear(), idag.getMonth(), idag.getDate() + ((8 - (idag.getDay() || 7)) % 7 || 7)))} data-od-id={"cta-" + dataOdId + "-mandag"}>Neste mandag</button>
              <span className="akhq-dp-uke">uke {ukenummer(vis)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
