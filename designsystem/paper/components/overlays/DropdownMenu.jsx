import React from "react";
import { useOverlayLayer, useRovingKeys } from "./overlay-focus.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-dd{position:relative;display:inline-block;font-family:var(--ui)}
.akhq-dd-trig{display:contents}
.akhq-dd-pop{--pad:6px;--w:232px;position:absolute;z-index:var(--z-toast);top:calc(100% + 6px);left:0;min-width:var(--w);max-width:min(320px,88vw);padding:var(--pad);box-sizing:border-box;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);box-shadow:var(--shadow);display:flex;flex-direction:column;gap:2px}
.akhq-dd-pop:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.akhq-dd-lab{padding:7px 10px 4px;font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
.akhq-dd-sep{height:1px;margin:5px 0;background:var(--border);border:0}
.akhq-dd-item{--hit:32px;--floor:0px;display:flex;align-items:center;gap:var(--s2);width:100%;min-height:max(var(--hit),var(--floor));padding:0 10px;box-sizing:border-box;border:0;border-radius:var(--r-sm);background:transparent;color:var(--fg);font-family:inherit;font-size:13px;text-align:left;cursor:pointer;transition:background var(--dur) var(--ease)}
.akhq-dd-item:hover,.akhq-dd-item[data-state=hover]{background:var(--soft)}
.akhq-dd-item:focus-visible,.akhq-dd-item[data-state=focus]{outline:2px solid var(--focus);outline-offset:-2px}
.akhq-dd-item[aria-disabled=true]{color:var(--mid);cursor:not-allowed}
.akhq-dd-item-note{margin-left:auto;font-family:var(--mono);font-size:11px;color:var(--muted)}
}
@layer akhq-container{
@media(pointer:coarse){.akhq-dd-item{--floor:44px}}
/* Stand-in, samme begrunnelse som Tabs/ThemeToggle/QuickLinkBar (29.07.2026). */
[data-coarse-test] .akhq-dd-item{--floor:44px}
}
@layer akhq-modifier{
.akhq-dd-pop--right{left:auto;right:0}
.akhq-dd-item--dn{color:var(--dn)}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-dd")) { const s = document.createElement("style"); s.id = "akhq-css-dd"; s.textContent = css; document.head.appendChild(s); }
let seq = 0;
export function DropdownMenu({ trigger, items = [], align = "auto", label, defaultOpen = false, dataOdId = "meny", onOpenChange }) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [flip, setFlip] = React.useState(false);
  const popRef = React.useRef(null);
  const trigRef = React.useRef(null);
  const id = React.useMemo(() => "akhq-dd" + (++seq), []);
  const close = React.useCallback(() => setOpen(false), []);
  useOverlayLayer({ open, onClose: close, layerRef: popRef, triggerRef: trigRef });
  useRovingKeys({ open, layerRef: popRef });
  React.useEffect(() => { if (onOpenChange) onOpenChange(open); }, [open, onOpenChange]);
  /* Auto-forankring: en utløser nær høyre kant må få menyen innover, ellers
     klippes den av containeren. Måles etter åpning, ikke gjettes av forfatter. */
  React.useLayoutEffect(() => {
    if (!open || align !== "auto") { setFlip(false); return; }
    const pop = popRef.current;
    if (!pop) return;
    const r = pop.getBoundingClientRect();
    let grense = document.documentElement.clientWidth;
    for (let n = pop.parentElement; n && n !== document.body; n = n.parentElement) {
      if (getComputedStyle(n).overflowX !== "visible") { grense = Math.min(grense, n.getBoundingClientRect().right); break; }
    }
    setFlip(r.right > grense - 4);
  }, [open, align, items]);
  const trig = React.cloneElement(trigger, {
    "aria-haspopup": "menu",
    "aria-expanded": open,
    "aria-controls": open ? id : undefined,
    onClick: (e) => { if (trigger.props.onClick) trigger.props.onClick(e); setOpen((v) => !v); },
    "data-od-id": "cta-" + dataOdId
  });
  return (
    <div className="akhq-dd" data-od-id={dataOdId}>
      <span className="akhq-dd-trig" ref={trigRef}>{trig}</span>
      {open && (
        <div className={"akhq-dd-pop" + (align === "right" || (align === "auto" && flip) ? " akhq-dd-pop--right" : "")} id={id} ref={popRef} role="menu" aria-label={label}>
          {items.map((it, i) => {
            if (it.type === "separator") return <hr className="akhq-dd-sep" key={"s" + i} role="separator" />;
            if (it.type === "label") return <span className="akhq-dd-lab" key={"l" + i}>{it.text}</span>;
            return (
              <button type="button" key={it.id || i} role="menuitem"
                className={"akhq-dd-item" + (it.tone === "dn" ? " akhq-dd-item--dn" : "")}
                aria-disabled={it.disabled ? "true" : undefined}
                onClick={() => { if (it.disabled) return; close(); if (it.onSelect) it.onSelect(); }}
                data-od-id={"cta-" + dataOdId + "-" + (it.id || i)}>
                {it.text}
                {it.note && <span className="akhq-dd-item-note">{it.note}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
