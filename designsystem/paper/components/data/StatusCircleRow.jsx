import React from "react";
import { ensureCss, Region } from "./viz.jsx";
ensureCss("akhq-css-statusrow", `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-srow{display:grid;grid-template-columns:36px minmax(0,1fr) auto;gap:var(--s3);align-items:center;padding:var(--s3) 0;border-top:1px solid var(--border);font-family:var(--ui)}
.akhq-srow:first-child{border-top:0}
.akhq-scircle{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;flex:none;box-sizing:border-box}
.akhq-scircle.done{background:var(--up-raw)}
.akhq-scircle.done svg{stroke:var(--on-accent)}
.akhq-scircle.active{border:2px solid var(--fg)}
.akhq-scircle.todo{border:1px solid var(--border)}
.akhq-srow-title{font-size:13.5px;font-weight:600;color:var(--fg);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.akhq-srow-title.done{color:var(--muted);text-decoration:line-through;text-decoration-thickness:1px}
.akhq-srow-meta{font-size:12px;color:var(--muted);margin-top:2px}
.akhq-srow-right{font-family:var(--mono);font-size:11px;color:var(--muted);font-variant-numeric:tabular-nums}
}
`);
const Check = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>;
export function StatusCircleRow({ items = [], state = "content", emptyText = "Ingen drills i \u00f8kten enn\u00e5 \u2014 legg til fra biblioteket.", dataOdId = "panel-status-rows", ...rest }) {
  return (
    <Region state={state} empty={emptyText} height={120}>
      <div data-od-id={dataOdId} {...rest}>
        {items.map((it, i) => (
          <div className="akhq-srow" key={i}>
            <div className={"akhq-scircle " + (it.status || "todo")} aria-label={it.status === "done" ? "Fullf\u00f8rt" : it.status === "active" ? "P\u00e5g\u00e5r" : "Gjenst\u00e5r"}>{it.status === "done" && <Check />}</div>
            <div><div className={"akhq-srow-title" + (it.status === "done" ? " done" : "")}>{it.title}</div>{it.meta && <div className="akhq-srow-meta">{it.meta}</div>}</div>
            {it.right && <div className="akhq-srow-right">{it.right}</div>}
          </div>
        ))}
      </div>
    </Region>
  );
}
