import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-shead{--gap:var(--s3);display:flex;align-items:baseline;justify-content:space-between;gap:var(--gap);min-width:0;margin-bottom:var(--s4)}
.akhq-shead-l{display:flex;align-items:baseline;gap:var(--s2);min-width:0}
.akhq-shead-t{margin:0;font-family:var(--disp);font-size:22px;font-weight:600;line-height:1.25;letter-spacing:-.005em;color:var(--fg);text-wrap:balance}
.akhq-shead-n{font-family:var(--mono);font-size:12px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--muted);flex:none}
.akhq-shead-r{flex:none;display:flex;align-items:center;gap:var(--s2);white-space:nowrap}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-shead")) { const s = document.createElement("style"); s.id = "akhq-css-shead"; s.textContent = css; document.head.appendChild(s); }
let seq = 0;
export function SectionHeader({ title, count, level = 2, action, dataOdId = "section-header", ...rest }) {
  const id = React.useMemo(() => "akhq-shead-t" + (++seq), []);
  const H = "h" + Math.min(4, Math.max(2, level));
  return (
    <div className="akhq-shead" data-od-id={dataOdId} data-heading-id={id} {...rest}>
      <div className="akhq-shead-l">
        {React.createElement(H, { id, className: "akhq-shead-t" }, title)}
        {count !== undefined && count !== null && <span className="akhq-shead-n">{count}</span>}
      </div>
      {action && <div className="akhq-shead-r">{action}</div>}
    </div>
  );
}
