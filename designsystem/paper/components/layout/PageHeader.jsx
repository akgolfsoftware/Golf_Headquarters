import React from "react";
import { SectionLabel } from "../primitives/SectionLabel.jsx";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-phead-wrap{container-type:inline-size;display:block;width:100%;min-width:0}
.akhq-phead{--gap:20px;--mb:28px;--side-align:flex-end;--side-w:auto;--side-wrap:nowrap;display:flex;align-items:flex-end;justify-content:space-between;gap:var(--gap);flex-wrap:wrap;margin-bottom:var(--mb)}
.akhq-phead-text{min-width:0}
.akhq-phead-kick{margin-bottom:var(--s2)}
.akhq-phead-title{margin:0;font-family:var(--disp);font-size:clamp(26px,4cqi,32px);font-weight:600;line-height:1.15;letter-spacing:-.01em;color:var(--fg);text-wrap:balance}
.akhq-phead-lead{margin:10px 0 0;max-width:52ch;font-family:var(--body);font-size:14.5px;font-weight:400;line-height:1.55;color:var(--muted);text-wrap:pretty}
.akhq-phead-side{display:flex;flex-direction:column;align-items:var(--side-align);width:var(--side-w);gap:var(--s2);flex:none}
.akhq-phead-meta{font-family:var(--mono);font-size:11px;font-weight:500;color:var(--muted);line-height:1.3}
.akhq-phead-actions{display:flex;gap:var(--s2);flex-wrap:var(--side-wrap)}
}
@layer akhq-container{
@container (max-width:640px){.akhq-phead{--gap:var(--s4);--mb:var(--s5);--side-align:flex-start;--side-w:100%;--side-wrap:wrap}}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-phead")) { const s = document.createElement("style"); s.id = "akhq-css-phead"; s.textContent = css; document.head.appendChild(s); }
export function PageHeader({ kicker, title, lead, meta, actions, level = 1, dataOdId = "page-header", ...rest }) {
  const H = "h" + Math.min(3, Math.max(1, level));
  const list = React.Children.toArray(actions);
  if (typeof console !== "undefined" && list.length) {
    if (list.length > 3) console.warn("PageHeader: " + list.length + " handlinger — maks 3. Flytt resten i en DropdownMenu.");
    const primary = list.filter((c) => c && c.props && (c.props.variant === undefined || c.props.variant === "primary")).length;
    if (primary > 1) console.warn("PageHeader: " + primary + " primærknapper — maks 1. Resten skal være variant=\"ghost\".");
  }
  return (
    <div className="akhq-phead-wrap">
    <header className="akhq-phead" data-od-id={dataOdId} {...rest}>
      <div className="akhq-phead-text">
        {kicker && <div className="akhq-phead-kick"><SectionLabel>{kicker}</SectionLabel></div>}
        {React.createElement(H, { className: "akhq-phead-title", "data-od-id": "page-title" }, title)}
        {lead && <p className="akhq-phead-lead">{lead}</p>}
      </div>
      {(meta || list.length) ? (
        <div className="akhq-phead-side">
          {meta && <span className="akhq-phead-meta">{meta}</span>}
          {list.length ? <div className="akhq-phead-actions">{actions}</div> : null}
        </div>
      ) : null}
    </header>
    </div>
  );
}
