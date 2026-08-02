import React from "react";
import { useOverlayLayer } from "./overlay-focus.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-drw-scrim{position:fixed;inset:0;background:var(--scrim);display:flex;justify-content:flex-end;z-index:var(--z-toast)}
.akhq-drw{--w:420px;position:relative;display:flex;flex-direction:column;width:min(var(--w),100%);height:100%;box-sizing:border-box;background:var(--surface);border-left:1px solid var(--border);container-type:inline-size}
.akhq-drw:focus-visible{outline:2px solid var(--focus);outline-offset:-2px}
.akhq-drw-hd{display:flex;align-items:flex-start;gap:var(--s3);padding:var(--s4) var(--s4) var(--s3);border-bottom:1px solid var(--border)}
.akhq-drw-lab{display:block;font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:2px}
.akhq-drw-ttl{margin:0;font-family:var(--disp);font-size:17px;font-weight:500;line-height:1.25;color:var(--fg)}
.akhq-drw-x{--hit:32px;--floor:0px;margin-left:auto;flex:none;position:relative;display:inline-flex;align-items:center;justify-content:center;width:var(--hit);height:var(--hit);border:0;border-radius:var(--r-sm);background:transparent;color:var(--muted);cursor:pointer;font-size:14px}
.akhq-drw-x::after{content:"";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:max(var(--hit),var(--floor));height:max(var(--hit),var(--floor))}
.akhq-drw-x:hover{background:var(--soft);color:var(--fg)}
.akhq-drw-x:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.akhq-drw-bd{flex:1;min-height:0;overflow:auto;padding:var(--s4);font-size:14px;line-height:1.55;color:var(--fg)}
.akhq-drw-ft{display:flex;flex-wrap:wrap;gap:var(--s2);padding:var(--s3) var(--s4);border-top:1px solid var(--border);background:var(--surface)}
}
@layer akhq-container{
@media(pointer:coarse){.akhq-drw-x{--floor:44px}}
[data-coarse-test] .akhq-drw-x{--floor:44px}
/* Under skallets brytpunkt er en skuff fra siden feil innfatning: samme
   artefakt hører i BottomSheet. Skuffen legger seg derfor full bredde her,
   som en ærlig midlertidig løsning, og konsumenten skal bytte komponent. */
@media(max-width:879px){.akhq-drw{--w:100%;border-left:0}}
}
@layer akhq-modifier{
.akhq-drw--venstre{border-left:0;border-right:1px solid var(--border)}
.akhq-drw-scrim--venstre{justify-content:flex-start}
.akhq-drw--bred{--w:560px}
/* Forhåndsvisning i spesimenkort: samme markup, innrammet i kortet i stedet
   for over hele vinduet. Aldri i produkt. */
.akhq-drw-scrim--preview{position:absolute;z-index:1}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-drw")) { const s = document.createElement("style"); s.id = "akhq-css-drw"; s.textContent = css; document.head.appendChild(s); }
let seq = 0;
/* Drawer er det modale sidelaget: en midlertidig arbeidsflate som eier
   oppmerksomheten til den lukkes (filtre med mange felt, en editor du
   åpnet fra en rad). Artefaktpanelet er IKKE en Drawer — det krymper
   hovedkolonnen og er ikke modalt (skallet, avsnitt 3). Velg Panel når
   innholdet skal leses ved siden av flaten, Drawer når det skal lukkes før
   arbeidet fortsetter. */
export function Drawer({ open = true, title, label, footer, side = "right", wide = false, preview = false, onClose, triggerRef, dataOdId = "panel-drawer", children }) {
  const layerRef = React.useRef(null);
  const id = React.useMemo(() => "akhq-drw" + (++seq), []);
  useOverlayLayer({ open, onClose, layerRef, triggerRef, modal: !preview, lockScroll: !preview });
  if (!open) return null;
  return (
    <div className={"akhq-drw-scrim" + (side === "left" ? " akhq-drw-scrim--venstre" : "") + (preview ? " akhq-drw-scrim--preview" : "")}>
      <div ref={layerRef} tabIndex={-1} role="dialog" aria-modal={preview ? "false" : "true"} aria-labelledby={title ? id : undefined} aria-label={title ? undefined : "Skuff"}
        className={"akhq-drw" + (side === "left" ? " akhq-drw--venstre" : "") + (wide ? " akhq-drw--bred" : "")} data-od-id={dataOdId}>
        <div className="akhq-drw-hd">
          <div>
            {label && <span className="akhq-drw-lab">{label}</span>}
            {title && <h2 className="akhq-drw-ttl" id={id}>{title}</h2>}
          </div>
          <button type="button" className="akhq-drw-x" aria-label="Lukk skuffen" onClick={onClose} data-od-id={"cta-" + dataOdId + "-lukk"}>✕</button>
        </div>
        <div className="akhq-drw-bd">{children}</div>
        {footer && <div className="akhq-drw-ft">{footer}</div>}
      </div>
    </div>
  );
}
