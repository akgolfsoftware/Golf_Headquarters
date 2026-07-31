import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-cgrid-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
.akhq-cgrid{--min:280px;--gap:var(--s4);display:grid;grid-template-columns:repeat(auto-fill,minmax(min(var(--min),100%),1fr));gap:var(--gap);min-width:0}
}
@layer akhq-container{
@container (max-width:420px){.akhq-cgrid{--gap:var(--s3)}}
}
@layer akhq-modifier{
.akhq-cgrid--two{grid-template-columns:repeat(2,minmax(0,1fr))}
.akhq-cgrid--three{grid-template-columns:repeat(3,minmax(0,1fr))}
.akhq-cgrid--wide{--min:360px}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-cgrid")) { const s = document.createElement("style"); s.id = "akhq-css-cgrid"; s.textContent = css; document.head.appendChild(s); }
export function CardGrid({ min = "auto", columns, dataOdId = "grid", children, ...rest }) {
  const cls = "akhq-cgrid"
    + (columns === 2 ? " akhq-cgrid--two" : columns === 3 ? " akhq-cgrid--three" : "")
    + (min === "wide" ? " akhq-cgrid--wide" : "");
  return (
    <div className="akhq-cgrid-wrap">
      <div className={cls} data-od-id={dataOdId} {...rest}>{children}</div>
    </div>
  );
}
