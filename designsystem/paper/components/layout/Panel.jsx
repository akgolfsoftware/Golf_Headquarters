import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-panel-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-panel{--pad-t:16px;--pad-x:18px;--pad-b:18px;--head-gap:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);box-shadow:var(--shadow);font-family:var(--ui);color:var(--fg);min-width:0;box-sizing:border-box;display:flex;flex-direction:column;padding:var(--pad-t) var(--pad-x) var(--pad-b)}
.akhq-panel-head{--head-dir:row;--head-align:baseline;display:flex;flex-direction:var(--head-dir);align-items:var(--head-align);justify-content:space-between;gap:var(--head-gap-x,var(--s3));margin-bottom:var(--head-gap)}
.akhq-panel-titles{min-width:0;display:flex;flex-direction:column;gap:6px}
.akhq-panel-label{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.akhq-panel-title{margin:0;font-family:var(--disp);font-size:14.5px;font-weight:600;line-height:1.3;text-wrap:balance;color:var(--fg)}
.akhq-panel-action{flex:none;display:flex;align-items:center;gap:var(--s2);white-space:nowrap}
.akhq-panel-body{min-width:0;flex:1}
.akhq-panel-foot{margin:14px 0 0;padding-top:var(--s3);border-top:1px solid var(--border);font-family:var(--body);font-size:12.5px;line-height:1.5;color:var(--muted);text-wrap:pretty}
}
@layer akhq-container{
@container (max-width:480px){.akhq-panel{--pad-x:16px;--pad-b:16px}.akhq-panel-head{--head-dir:column;--head-align:flex-start;--head-gap-x:10px}}
}
@layer akhq-modifier{
.akhq-panel--sm{--pad-t:var(--s3);--pad-x:var(--s4);--pad-b:var(--s4);--head-gap:var(--s3)}
.akhq-panel--sm .akhq-panel-title{font-size:13.5px}
.akhq-panel--flush{--pad-t:0;--pad-x:0;--pad-b:0}
.akhq-panel--flush .akhq-panel-head{padding:16px 18px 0;margin-bottom:12px}
.akhq-panel--flush .akhq-panel-body{padding:0 18px}
.akhq-panel--flush.akhq-panel--bleed .akhq-panel-body{padding:0}
.akhq-panel--flush .akhq-panel-foot{margin:14px 18px 0;padding-bottom:18px}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-panel")) { const s = document.createElement("style"); s.id = "akhq-css-panel"; s.textContent = css; document.head.appendChild(s); }
let seq = 0;
export function Panel({ title, titleLevel = 2, label, action, footnote, density = "md", flush = false, bleed = false, dataOdId = "panel", children, ...rest }) {
  const id = React.useMemo(() => "akhq-panel-t" + (++seq), []);
  const H = "h" + Math.min(4, Math.max(2, titleLevel));
  const head = (title || label || action) ? (
    <div className="akhq-panel-head">
      <div className="akhq-panel-titles">
        {label && <span className="akhq-panel-label">{label}</span>}
        {title && React.createElement(H, { id, className: "akhq-panel-title" }, title)}
      </div>
      {action && <div className="akhq-panel-action">{action}</div>}
    </div>
  ) : null;
  const Tag = title ? "section" : "div";
  return (
    <div className="akhq-panel-wrap">
    <Tag
      className={"akhq-panel akhq-panel--" + density + (flush ? " akhq-panel--flush" : "") + (bleed ? " akhq-panel--bleed" : "")}
      aria-labelledby={title ? id : undefined}
      data-od-id={dataOdId}
      {...rest}
    >
      {head}
      <div className="akhq-panel-body">{children}</div>
      {footnote && <p className="akhq-panel-foot">{footnote}</p>}
    </Tag>
    </div>
  );
}
