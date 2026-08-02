import React from "react";
import { useOverlayLayer } from "./overlay-focus.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-pop{position:relative;display:inline-block;font-family:var(--ui)}
.akhq-pop-trig{display:contents}
.akhq-pop-lay{--w:288px;position:absolute;z-index:var(--z-toast);top:calc(100% + 6px);left:0;width:min(var(--w),88vw);box-sizing:border-box;padding:var(--s3);background:var(--surface);border:1px solid var(--border);border-radius:var(--r);box-shadow:var(--shadow);container-type:inline-size}
.akhq-pop-lay:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.akhq-pop-hd{display:flex;align-items:flex-start;gap:var(--s2);margin-bottom:var(--s2)}
.akhq-pop-ttl{margin:0;font-size:13px;font-weight:600;line-height:1.3;color:var(--fg)}
.akhq-pop-lab{display:block;font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:2px}
.akhq-pop-x{--hit:28px;--floor:0px;margin-left:auto;flex:none;position:relative;display:inline-flex;align-items:center;justify-content:center;width:var(--hit);height:var(--hit);border:0;border-radius:var(--r-sm);background:transparent;color:var(--muted);cursor:pointer}
.akhq-pop-x::after{content:"";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:max(var(--hit),var(--floor));height:max(var(--hit),var(--floor))}
.akhq-pop-x:hover{background:var(--soft);color:var(--fg)}
.akhq-pop-x:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.akhq-pop-bd{font-size:13px;line-height:1.5;color:var(--fg)}
.akhq-pop-ft{display:flex;flex-wrap:wrap;gap:var(--s2);margin-top:var(--s3)}
}
@layer akhq-container{
@media(pointer:coarse){.akhq-pop-x{--floor:44px}}
/* Stand-in for grov peker i spesimenkort og rigg — samme mønster som DropdownMenu. */
[data-coarse-test] .akhq-pop-x{--floor:44px}
}
@layer akhq-modifier{
.akhq-pop-lay--right{left:auto;right:0}
.akhq-pop-lay--top{top:auto;bottom:calc(100% + 6px)}
.akhq-pop-lay--wide{--w:360px}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-pop")) { const s = document.createElement("style"); s.id = "akhq-css-pop"; s.textContent = css; document.head.appendChild(s); }
let seq = 0;
/* Popover er det ikke-modale laget med INNHOLD og handlinger: en forklaring
   med lenke, et lite skjema, en filtermeny som ikke er en meny. Tooltip er
   ren tekst uten fokus; DropdownMenu er en liste av valg; Drawer er modal.
   Velg feil, og du får enten et tomt lag med for mye chrome, eller en
   handling ingen når med tastatur. */
export function Popover({ trigger, title, label, footer, align = "auto", side = "bottom", wide = false, open: styrt, defaultOpen = false, onOpenChange, dataOdId = "popover", children }) {
  const [intern, setIntern] = React.useState(defaultOpen);
  const open = styrt === undefined ? intern : styrt;
  const setOpen = React.useCallback((v) => { if (styrt === undefined) setIntern(v); if (onOpenChange) onOpenChange(v); }, [styrt, onOpenChange]);
  const [flip, setFlip] = React.useState(false);
  const layRef = React.useRef(null);
  const trigRef = React.useRef(null);
  const id = React.useMemo(() => "akhq-pop" + (++seq), []);
  const close = React.useCallback(() => setOpen(false), [setOpen]);
  useOverlayLayer({ open, onClose: close, layerRef: layRef, triggerRef: trigRef, initialFocus: title ? "layer" : "first" });
  /* Samme auto-forankring som DropdownMenu: måles etter åpning, ikke gjettes. */
  React.useLayoutEffect(() => {
    if (!open || align !== "auto") { setFlip(false); return; }
    const el = layRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    let grense = document.documentElement.clientWidth;
    for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
      if (getComputedStyle(n).overflowX !== "visible") { grense = Math.min(grense, n.getBoundingClientRect().right); break; }
    }
    setFlip(r.right > grense - 4);
  }, [open, align, children]);
  const trig = React.cloneElement(trigger, {
    "aria-haspopup": "dialog",
    "aria-expanded": open,
    "aria-controls": open ? id : undefined,
    onClick: (e) => { if (trigger.props.onClick) trigger.props.onClick(e); setOpen(!open); },
    "data-od-id": "cta-" + dataOdId
  });
  return (
    <div className="akhq-pop" data-od-id={dataOdId}>
      <span className="akhq-pop-trig" ref={trigRef}>{trig}</span>
      {open && (
        <div ref={layRef} id={id} role="dialog" aria-modal="false" aria-labelledby={title ? id + "-t" : undefined} aria-label={title ? undefined : label}
          className={"akhq-pop-lay" + (align === "right" || (align === "auto" && flip) ? " akhq-pop-lay--right" : "") + (side === "top" ? " akhq-pop-lay--top" : "") + (wide ? " akhq-pop-lay--wide" : "")}>
          {(title || label) && (
            <div className="akhq-pop-hd">
              <div>
                {label && <span className="akhq-pop-lab">{label}</span>}
                {title && <h3 className="akhq-pop-ttl" id={id + "-t"}>{title}</h3>}
              </div>
              <button type="button" className="akhq-pop-x" onClick={close} aria-label="Lukk" data-od-id={"cta-" + dataOdId + "-lukk"}>✕</button>
            </div>
          )}
          <div className="akhq-pop-bd">{children}</div>
          {footer && <div className="akhq-pop-ft">{footer}</div>}
        </div>
      )}
    </div>
  );
}
