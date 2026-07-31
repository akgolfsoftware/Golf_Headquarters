import React from "react";
import { Icon } from "../navigation/Icon.jsx";
import { Button } from "../actions/Button.jsx";
import { TONES } from "./Callout.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-banner-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-banner{--pad-y:14px;--pad-x:var(--s4);--gap:var(--s3);--cols:18px minmax(0,1fr) auto;--side-dir:row;--side-align:center;--x:28px;--floor:0px;display:grid;grid-template-columns:var(--cols);align-items:start;gap:var(--gap);width:100%;box-sizing:border-box;padding:var(--pad-y) var(--pad-x);border-radius:var(--r);background:var(--soft);border:1px solid var(--border);font-family:var(--ui);color:var(--fg)}
.akhq-banner-ic{display:grid;place-items:center;width:18px;height:18px;margin-top:1px}
.akhq-banner-lab{display:block;font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;line-height:1;margin-bottom:6px}
.akhq-banner-title{margin:0 0 4px;font-family:var(--disp);font-size:13.5px;font-weight:600;line-height:1.35;color:var(--fg);text-wrap:balance}
.akhq-banner-txt{font-size:12.5px;line-height:1.5;color:var(--fg);text-wrap:pretty;max-width:72ch}
.akhq-banner-txt>p{margin:0}
.akhq-banner-side{display:flex;flex-direction:var(--side-dir);align-items:var(--side-align);gap:var(--s2);flex:none}
.akhq-banner-x{display:grid;place-items:center;width:max(var(--x),var(--floor));height:max(var(--x),var(--floor));border:0;border-radius:var(--r-sm);background:transparent;color:var(--muted);cursor:pointer;font-family:inherit;transition:background var(--dur) var(--ease),color var(--dur) var(--ease)}
.akhq-banner-x:hover{background:color-mix(in srgb,var(--soft) 60%,var(--border));color:var(--fg)}
.akhq-banner-x:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.akhq-banner-x svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round}
}
@layer akhq-container{
@container (max-width:460px){.akhq-banner{--cols:18px minmax(0,1fr);--gap:10px;--side-align:flex-start}.akhq-banner-side{grid-column:2}}
@media(pointer:coarse){.akhq-banner{--floor:44px}}
/* Stand-in, samme begrunnelse som Breadcrumbs. Var --x-floor (utenfor
   navnekonvensjonen --floor) — derfor målte den generiske sveipen "tom
   streng" i stedet for en verdi. Omdøpt 29.07.2026, samme mekanikk. */
[data-coarse-test] .akhq-banner{--floor:44px}
}
@layer akhq-modifier{
.akhq-banner--warn{border-color:color-mix(in srgb,var(--dn) 34%,var(--border))}
.akhq-banner--info,.akhq-banner--privacy{border-color:color-mix(in srgb,var(--info) 34%,var(--border))}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-banner")) { const s = document.createElement("style"); s.id = "akhq-css-banner"; s.textContent = css; document.head.appendChild(s); }
export function Banner({ tone = "info", label, title, announce = "none", actionLabel, onAction, onClose, closable = false, dataOdId = "banner", children, ...rest }) {
  const [closed, setClosed] = React.useState(false);
  if (closed) return null;
  const t = TONES[tone] || TONES.info;
  const role = announce === "alert" ? "alert" : announce === "status" ? "status" : undefined;
  const close = () => { setClosed(true); if (onClose) onClose(); };
  const showClose = closable || Boolean(onClose);
  return (
    <div className="akhq-banner-wrap">
    <div className={"akhq-banner akhq-banner--" + tone} role={role} aria-live={announce === "status" ? "polite" : undefined} data-od-id={dataOdId} {...rest}>
      <span className="akhq-banner-ic" style={{ color: t.color }}><Icon name={t.icon} size={18} /></span>
      <div style={{ minWidth: 0 }}>
        {label && <span className="akhq-banner-lab" style={{ color: t.color }}>{label}</span>}
        {title && <p className="akhq-banner-title">{title}</p>}
        <div className="akhq-banner-txt">{children}</div>
      </div>
      {(actionLabel || showClose) && (
        <div className="akhq-banner-side">
          {actionLabel && <Button variant="ghost" size="sm" onClick={onAction} dataOdId={"cta-" + dataOdId}>{actionLabel}</Button>}
          {showClose && (
            <button type="button" className="akhq-banner-x" onClick={close} aria-label="Lukk melding" data-od-id={"cta-" + dataOdId + "-lukk"}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      )}
    </div>
    </div>
  );
}
