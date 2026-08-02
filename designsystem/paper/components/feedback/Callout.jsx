import React from "react";
import { Icon } from "../navigation/Icon.jsx";
export const TONES = {
  neutral: { icon: "notis", color: "var(--muted)" },
  warn: { icon: "varsel", color: "var(--dn)" },
  info: { icon: "info", color: "var(--info)" },
  privacy: { icon: "laas", color: "var(--info)" }
};
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-callout{--pad-y:var(--s3);--pad-x:14px;--gap:10px;--ic:16px;display:grid;grid-template-columns:var(--ic) minmax(0,1fr);gap:var(--gap);padding:var(--pad-y) var(--pad-x);box-sizing:border-box;border-radius:var(--r-sm);background:var(--soft);border:1px solid var(--border);font-family:var(--ui);color:var(--fg)}
.akhq-callout-ic{display:grid;place-items:center;width:var(--ic);height:var(--ic);margin-top:1px}
.akhq-callout-lab{display:block;font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;line-height:1;margin-bottom:6px}
.akhq-callout-txt{font-size:12.5px;line-height:1.5;color:var(--fg);text-wrap:pretty}
.akhq-callout-txt>p{margin:0}
.akhq-callout-txt>p+p{margin-top:var(--s2)}
}
@layer akhq-modifier{
.akhq-callout--warn{border-color:color-mix(in srgb,var(--dn) 28%,var(--border))}
.akhq-callout--info,.akhq-callout--privacy{border-color:color-mix(in srgb,var(--info) 28%,var(--border))}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-callout")) { const s = document.createElement("style"); s.id = "akhq-css-callout"; s.textContent = css; document.head.appendChild(s); }
export function Callout({ tone = "neutral", label, dataOdId = "callout", children, ...rest }) {
  const t = TONES[tone] || TONES.neutral;
  return (
    <div className={"akhq-callout akhq-callout--" + tone} data-od-id={dataOdId} {...rest}>
      <span className="akhq-callout-ic" style={{ color: t.color }}><Icon name={t.icon} size={16} /></span>
      <div>
        {label && <span className="akhq-callout-lab" style={{ color: t.color }}>{label}</span>}
        <div className="akhq-callout-txt">{children}</div>
      </div>
    </div>
  );
}
