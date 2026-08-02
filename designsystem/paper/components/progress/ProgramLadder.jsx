import React from "react";
import { nfi, ensureCss, Region } from "./viz.jsx";
ensureCss("akhq-css-ladder", `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-ladder{font-family:var(--ui);display:grid;gap:var(--s2)}
.akhq-lstep{display:grid;grid-template-columns:28px minmax(0,1fr) auto;gap:var(--s3);align-items:center;padding:var(--s3);border-radius:var(--r-sm);border:1px solid transparent}
.akhq-lstep.active{background:var(--surface);border-color:var(--fg);box-shadow:var(--shadow)}
.akhq-lstep.locked{opacity:.55}
.akhq-lmark{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;flex:none;box-sizing:border-box}
.akhq-lmark.done{background:var(--up)}
.akhq-lmark.done svg{stroke:var(--on-accent)}
.akhq-lmark.active{border:2px solid var(--fg)}
.akhq-lmark.active::after{content:"";width:8px;height:8px;border-radius:50%;background:var(--fg)}
.akhq-lmark.locked{border:1px solid var(--border);color:var(--muted)}
.akhq-lstep-title{font-size:13px;font-weight:600;color:var(--fg)}
.akhq-lstep.locked .akhq-lstep-title{color:var(--muted)}
.akhq-lstep-meta{font-size:11.5px;color:var(--muted);margin-top:1px}
.akhq-xp{margin-top:var(--s2)}
.akhq-xp-bar{height:6px;background:var(--soft);border-radius:var(--r-pill);overflow:hidden;margin-top:6px}
.akhq-xp-fill{height:100%;background:var(--fg);border-radius:var(--r-pill)}
.akhq-xp-num{font-family:var(--mono);font-size:11px;color:var(--muted);font-variant-numeric:tabular-nums}
}
`);
const Check = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>;
const Lock = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;
export function ProgramLadder({ steps = [], xp, state = "content", emptyText = "Programmet starter n\u00e5r treneren publiserer f\u00f8rste steg.", dataOdId = "panel-program-ladder", ...rest }) {
  return (
    <Region state={state} empty={emptyText} height={150}>
      <div className="akhq-ladder" data-od-id={dataOdId} {...rest}>
        {xp && (
          <div className="akhq-xp">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span className="akhq-lab">{xp.label}</span>
              <span className="akhq-xp-num">{nfi(xp.current)} / {nfi(xp.max)} XP</span>
            </div>
            <div className="akhq-xp-bar"><div className="akhq-xp-fill" style={{ width: Math.min(100, (xp.current / xp.max) * 100) + "%" }}></div></div>
          </div>
        )}
        {steps.map((s, i) => (
          <div className={"akhq-lstep " + (s.status || "locked")} key={i}>
            <div className={"akhq-lmark " + (s.status || "locked")}>{s.status === "done" ? <Check /> : s.status === "locked" ? <Lock /> : null}</div>
            <div><div className="akhq-lstep-title">{s.title}</div>{s.meta && <div className="akhq-lstep-meta">{s.meta}</div>}</div>
            {s.status === "active" && s.action}
          </div>
        ))}
      </div>
    </Region>
  );
}
