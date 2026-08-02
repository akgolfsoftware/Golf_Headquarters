import React from "react";
import { useOverlayLayer } from "./overlay-focus.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-sheet-scrim{position:fixed;inset:0;background:var(--scrim);display:flex;align-items:flex-end;justify-content:center;z-index:var(--z-toast)}
.akhq-sheet{background:var(--surface);border:1px solid var(--border);border-bottom:none;border-radius:var(--r) var(--r) 0 0;padding:var(--s3) var(--s4) var(--s5);width:min(430px,100%);display:flex;flex-direction:column;gap:var(--s3);font-family:var(--ui);color:var(--fg);box-sizing:border-box}
/* Dragehåndtaket ER lukkeknappen: fokuskontraktens punkt 2 krever en
   fokuserbar node i laget, og et ark uten den kan verken fokuseres eller
   måles (funn 29.07: 0 fokuserbare noder). Håndtaket er 4px synlig, så
   treffsonen utvides med ::after etter TimeGrid-mønsteret — den synlige
   streken endres ikke. */
.akhq-sheet-handle{--floor:0px;position:relative;width:36px;height:4px;padding:0;border:0;border-radius:var(--r-pill);background:var(--border);margin:0 auto;display:block;cursor:pointer;transition:background var(--dur) var(--ease)}
.akhq-sheet-handle::after{content:"";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:max(72px,var(--floor));height:max(4px,var(--floor))}
.akhq-sheet-handle:hover{background:color-mix(in srgb,var(--fg) 40%,var(--border))}
.akhq-sheet-handle:active{background:var(--mid)}
.akhq-sheet-handle:focus-visible{outline:2px solid var(--focus);outline-offset:6px}
.akhq-sheet-title{font-size:16px;font-weight:500;font-family:var(--disp);margin:0}
.akhq-sheet-body{font-size:14px;color:var(--muted);line-height:1.5}}
@layer akhq-container{
@media(pointer:coarse){.akhq-sheet-handle{--floor:44px}}
[data-coarse-test] .akhq-sheet-handle{--floor:44px}
}
`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-sheet")) { const s = document.createElement("style"); s.id = "akhq-css-sheet"; s.textContent = css; document.head.appendChild(s); }
export function BottomSheet({ open = true, title, children, onClose, triggerRef, dataOdId = "panel-sheet", ...rest }) {
  const layerRef = React.useRef(null);
  const titleId = React.useMemo(() => "akhq-sheet-t" + Math.random().toString(36).slice(2, 8), []);
  /* Samme fokuskontrakt som Modal — arket er modalt på mobil. */
  useOverlayLayer({ open, onClose, layerRef, triggerRef, modal: true });
  if (!open) return null;
  return (
    <div className="akhq-sheet-scrim">
      <div className="akhq-sheet" ref={layerRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={title ? titleId : undefined} aria-label={title ? undefined : "Ark"} data-od-id={dataOdId} {...rest}>
        <button type="button" className="akhq-sheet-handle" aria-label="Lukk arket" onClick={onClose} data-od-id="cta-sheet-close"></button>
        {title && <h2 className="akhq-sheet-title" id={titleId}>{title}</h2>}
        <div className="akhq-sheet-body">{children}</div>
      </div>
    </div>
  );
}
