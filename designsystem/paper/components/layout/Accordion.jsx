import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-acc{min-width:0;font-family:var(--ui)}
.akhq-acc-item{border-bottom:1px solid var(--border)}
.akhq-acc-item:last-child{border-bottom:0}
.akhq-acc-sum{--hit:44px;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:var(--s3);min-height:var(--hit);padding:var(--s3) 2px;cursor:pointer;list-style:none;font-size:13.5px;font-weight:500;color:var(--fg)}
.akhq-acc-sum::-webkit-details-marker{display:none}
.akhq-acc-sum:hover{color:var(--fg)}
.akhq-acc-sum:focus-visible{outline:2px solid var(--focus);outline-offset:-2px;border-radius:var(--r-sm)}
.akhq-acc-meta{font-family:var(--mono);font-size:11px;color:var(--muted)}
.akhq-acc-chev{width:14px;height:14px;stroke:var(--muted);fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;transition:transform var(--dur) var(--ease)}
.akhq-acc-item[open] .akhq-acc-chev{transform:rotate(90deg)}
.akhq-acc-body{padding:0 2px var(--s4);font-family:var(--body);font-size:12.5px;line-height:1.55;color:var(--muted);text-wrap:pretty}
.akhq-acc-body>p{margin:0}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-acc")) { const s = document.createElement("style"); s.id = "akhq-css-acc"; s.textContent = css; document.head.appendChild(s); }
export function Accordion({ items = [], name, dataOdId = "accordion", ...rest }) {
  return (
    <div className="akhq-acc" data-od-id={dataOdId} {...rest}>
      {items.map((it, i) => (
        <details className="akhq-acc-item" key={it.id || i} name={name} open={it.defaultOpen}>
          <summary className="akhq-acc-sum" data-od-id={"cta-" + dataOdId + "-" + (it.id || i)}>
            <span style={{ minWidth: 0, display: "flex", alignItems: "center", gap: 8 }}>
              {it.title}
              {it.meta && <span className="akhq-acc-meta">{it.meta}</span>}
            </span>
            <svg className="akhq-acc-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
          </summary>
          <div className="akhq-acc-body">{it.body}</div>
        </details>
      ))}
    </div>
  );
}
