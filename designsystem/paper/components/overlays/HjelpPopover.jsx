import React from "react";
import { useOverlayLayer } from "./overlay-focus.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-hjp{position:relative;display:inline-flex}
.akhq-hjp-trig{--floor:0px;position:relative;appearance:none;display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;padding:0;border:1px solid var(--border);border-radius:50%;background:transparent;color:var(--muted);font-family:var(--mono);font-size:10px;font-weight:600;cursor:pointer;box-sizing:border-box;transition:color var(--dur) var(--ease),border-color var(--dur) var(--ease)}
.akhq-hjp-trig:hover,.akhq-hjp-trig[data-state=hover]{color:var(--fg);border-color:var(--mid)}
.akhq-hjp-trig:focus-visible,.akhq-hjp-trig[data-state=focus]{outline:2px solid var(--focus);outline-offset:2px}
.akhq-hjp-trig::after{content:"";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:max(100%,var(--floor));height:max(100%,var(--floor))}
.akhq-hjp-panel{position:absolute;top:calc(100% + 6px);left:0;z-index:var(--z-sheet);width:260px;box-sizing:border-box;padding:10px 12px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-sm);box-shadow:var(--shadow);font-family:var(--ui);color:var(--fg)}
.akhq-hjp-ttl{margin:0 0 4px;font-size:12px;font-weight:600}
.akhq-hjp-txt{margin:0;font-family:var(--body);font-size:12px;color:var(--muted);line-height:1.55}
}
@layer akhq-container{
@media(pointer:coarse){.akhq-hjp-trig{--floor:44px}}
[data-coarse-test] .akhq-hjp-trig{--floor:44px}
}
@layer akhq-modifier{
.akhq-hjp-panel--hoyre{left:auto;right:0}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-hjp")) { const s = document.createElement("style"); s.id = "akhq-css-hjp"; s.textContent = css; document.head.appendChild(s); }
/* «?»-forklaringen: en 18 px hjelpknapp som åpner et lite ikke-modalt panel
   med tittel + prosa. Bærer v2-hjelpetradisjonen (hjelp.tsx) inn i
   biblioteket. Konsumerer den delte fokuskontrakten (useOverlayLayer) —
   Escape lukker, klikk utenfor lukker, fokus returnerer. Treffsonen
   utvides med ::after til 44 px (gulvregel §2) — den synlige knappen
   forblir 18 px fordi den lever inne i tette panelhoder. Kun for KORT
   forklaring; lange forklaringer hører i dokumentasjon/artefakt. */
export function HjelpPopover({ title, children, align = "venstre", dataOdId = "hjelp", ...rest }) {
  const [open, setOpen] = React.useState(false);
  const layerRef = React.useRef(null);
  const triggerRef = React.useRef(null);
  useOverlayLayer({ open, onClose: () => setOpen(false), layerRef, triggerRef, initialFocus: "layer" });
  return (
    <span className="akhq-hjp" ref={triggerRef} {...rest}>
      <button type="button" className="akhq-hjp-trig"
        aria-expanded={open ? "true" : "false"} aria-haspopup="dialog"
        aria-label={"Hjelp: " + (title || "forklaring")}
        onClick={() => setOpen(!open)} data-od-id={"cta-" + dataOdId}>?</button>
      {open && (
        <span className={"akhq-hjp-panel" + (align === "hoyre" ? " akhq-hjp-panel--hoyre" : "")} role="dialog" aria-label={title} ref={layerRef} data-od-id={"panel-" + dataOdId}>
          {title && <p className="akhq-hjp-ttl">{title}</p>}
          <p className="akhq-hjp-txt">{children}</p>
        </span>
      )}
    </span>
  );
}
