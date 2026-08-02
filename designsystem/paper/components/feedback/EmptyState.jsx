import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-estate-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-estate{--pad-y:34px;--pad-x:var(--s5);--gap:8px;--align:center;--just:center;--maxw:44ch;display:flex;flex-direction:column;align-items:var(--align);justify-content:center;text-align:var(--just);gap:var(--gap);padding:var(--pad-y) var(--pad-x);box-sizing:border-box;min-width:0;font-family:var(--ui);color:var(--fg)}
.akhq-estate-ic{display:grid;place-items:center;width:32px;height:32px;border-radius:50%;background:var(--soft);color:var(--muted);margin-bottom:4px}
.akhq-estate-ic svg{width:16px;height:16px}
.akhq-estate-title{margin:0;font-family:var(--disp);font-size:14.5px;font-weight:600;line-height:1.3;color:var(--fg);text-wrap:balance}
.akhq-estate-txt{margin:0;max-width:var(--maxw);font-family:var(--body);font-size:12.5px;line-height:1.55;color:var(--muted);text-wrap:pretty}
.akhq-estate-act{margin-top:10px;display:flex;gap:var(--s2);flex-wrap:wrap;justify-content:center}
}
@layer akhq-container{
@container (max-width:420px){.akhq-estate{--pad-y:26px;--pad-x:var(--s4)}}
}
@layer akhq-modifier{
.akhq-estate--start{--align:flex-start;--just:left}
.akhq-estate--start .akhq-estate-act{justify-content:flex-start}
.akhq-estate--sm{--pad-y:22px;--gap:6px}
.akhq-estate--sm .akhq-estate-title{font-size:13.5px}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-estate")) { const s = document.createElement("style"); s.id = "akhq-css-estate"; s.textContent = css; document.head.appendChild(s); }
export function EmptyState({ title, children, icon, action, align = "center", density = "md", dataOdId = "empty", ...rest }) {
  if (typeof console !== "undefined" && !children) console.warn("EmptyState (" + (title || dataOdId) + ") mangler forklaring. En tittel alene sier ikke hva brukeren kan gjøre — skriv ekte norsk tekst som peker mot neste handling.");
  return (
    <div className="akhq-estate-wrap">
      <div className={"akhq-estate" + (align === "start" ? " akhq-estate--start" : "") + (density === "sm" ? " akhq-estate--sm" : "")} data-od-id={dataOdId} {...rest}>
        {icon && <span className="akhq-estate-ic" aria-hidden="true">{icon}</span>}
        {title && <p className="akhq-estate-title">{title}</p>}
        {children && <p className="akhq-estate-txt">{children}</p>}
        {action && <div className="akhq-estate-act">{action}</div>}
      </div>
    </div>
  );
}
